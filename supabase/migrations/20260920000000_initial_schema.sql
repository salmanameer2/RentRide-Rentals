-- ==============================================================================
-- RENT RIDES — PHASE 3: DATABASE SCHEMA & SECURITY FOUNDATION
-- Migration: 20260920000000_initial_schema.sql
-- Description: Establishes the complete PostgreSQL schema for Rent Rides on
--              Supabase, including profiles, cars, bookings, contact submissions,
--              Row Level Security (RLS) policies, overlap exclusion constraints,
--              automated triggers, and car images storage bucket configuration.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & PREREQUISITES
-- ------------------------------------------------------------------------------

-- Ensure UUID generation functions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable btree_gist extension for atomic booking date-range exclusion constraints
CREATE EXTENSION IF NOT EXISTS "btree_gist";


-- ------------------------------------------------------------------------------
-- 2. CORE UTILITY FUNCTIONS
-- ------------------------------------------------------------------------------

-- Generic updated_at timestamp refresher trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


-- ------------------------------------------------------------------------------
-- 3. PROFILES TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text NOT NULL,
    phone text,
    avatar_url text,
    role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger for updated_at on profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ------------------------------------------------------------------------------
-- 4. ROLE SECURITY & ADMIN DETERMINATION FUNCTION
-- ------------------------------------------------------------------------------

-- Secure function to check whether the currently authenticated user is an admin.
-- Uses SECURITY DEFINER and explicit search_path to prevent recursion and injection.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
    v_role text;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN (v_role = 'admin');
END;
$$;

-- Function and trigger to prevent role escalation by non-admins
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- If role is modified, enforce that the actor is already an admin
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Unauthorized: Only platform administrators can change user roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_role();


-- ------------------------------------------------------------------------------
-- 5. AUTOMATIC PROFILE CREATION TRIGGER (auth.users -> profiles)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        'customer' -- New accounts always default strictly to customer
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = CASE 
            WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
            THEN EXCLUDED.full_name 
            ELSE public.profiles.full_name 
        END;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------------------------
-- 6. CARS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cars (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM now()) + 2),
    category text NOT NULL CHECK (category IN ('Sedan', 'SUV', 'Hatchback', 'Luxury', 'Van', 'Sports', 'Electric')),
    description text,
    image_url text,
    price_per_day numeric(12,2) NOT NULL CHECK (price_per_day > 0),
    seats integer NOT NULL DEFAULT 5 CHECK (seats > 0 AND seats <= 50),
    doors integer NOT NULL DEFAULT 4 CHECK (doors > 0 AND doors <= 10),
    transmission text NOT NULL DEFAULT 'Automatic' CHECK (transmission IN ('Automatic', 'Manual', 'Dual-Clutch')),
    fuel_type text NOT NULL DEFAULT 'Petrol' CHECK (fuel_type IN ('Petrol', 'Diesel', 'Hybrid', 'Electric')),
    location text NOT NULL DEFAULT 'Lahore Hub',
    features text[] NOT NULL DEFAULT '{}',
    is_available boolean NOT NULL DEFAULT true, -- Overall catalog active/listed flag
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_cars_updated_at ON public.cars;
CREATE TRIGGER trg_cars_updated_at
    BEFORE UPDATE ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ------------------------------------------------------------------------------
-- 7. BOOKINGS TABLE & OVERLAP PROTECTION
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE RESTRICT,
    pickup_location text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL CHECK (total_days > 0),
    price_per_day numeric(12,2) NOT NULL CHECK (price_per_day > 0),
    total_price numeric(12,2) NOT NULL CHECK (total_price > 0),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Basic date ordering constraint
    CONSTRAINT chk_booking_dates_order CHECK (end_date >= start_date)
);

-- ATOMIC OVERLAP EXCLUSION CONSTRAINT
-- Prevents two active bookings ('pending' or 'confirmed') for the same car from
-- overlapping date ranges. Uses PostgreSQL GiST index on daterange.
ALTER TABLE public.bookings
    DROP CONSTRAINT IF EXISTS no_overlapping_active_bookings;

ALTER TABLE public.bookings
    ADD CONSTRAINT no_overlapping_active_bookings
    EXCLUDE USING gist (
        car_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    )
    WHERE (status IN ('pending', 'confirmed'));

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ------------------------------------------------------------------------------
-- 8. BOOKING PRICING, DURATION & STATUS INTEGRITY TRIGGERS
-- ------------------------------------------------------------------------------

-- Authoritatively calculates total_days and total_price and snapshots price_per_day
-- Rental day calculation convention: inclusive calendar days (end_date - start_date + 1)
-- Example: 2026-10-01 to 2026-10-01 = 1 day; 2026-10-01 to 2026-10-03 = 3 days.
CREATE OR REPLACE FUNCTION public.validate_and_price_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_car_price numeric(12,2);
    v_calculated_days integer;
BEGIN
    -- Validate date range
    IF NEW.end_date < NEW.start_date THEN
        RAISE EXCEPTION 'Booking end_date (%) must be greater than or equal to start_date (%)', NEW.end_date, NEW.start_date;
    END IF;

    -- Calculate total duration using standard inclusive convention
    v_calculated_days := (NEW.end_date - NEW.start_date) + 1;
    NEW.total_days := v_calculated_days;

    -- Fetch current authoritative car daily rate
    SELECT price_per_day INTO v_car_price
    FROM public.cars
    WHERE id = NEW.car_id;

    IF v_car_price IS NULL THEN
        RAISE EXCEPTION 'Selected vehicle (id: %) was not found.', NEW.car_id;
    END IF;

    -- Freeze price snapshot for historical record integrity
    NEW.price_per_day := v_car_price;

    -- Authoritatively compute total price: total_days * price_per_day
    NEW.total_price := NEW.total_days * NEW.price_per_day;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_and_price_booking ON public.bookings;
CREATE TRIGGER trg_validate_and_price_booking
    BEFORE INSERT OR UPDATE OF start_date, end_date, car_id ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_and_price_booking();

-- Prevents customers from self-approving bookings or manipulating statuses
CREATE OR REPLACE FUNCTION public.protect_booking_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- On INSERT: customers can ONLY create bookings in 'pending' status
    IF TG_OP = 'INSERT' THEN
        IF NOT public.is_admin() THEN
            NEW.status := 'pending';
        END IF;

    -- On UPDATE: customers can only cancel their own pending or confirmed booking
    ELSIF TG_OP = 'UPDATE' THEN
        IF NOT public.is_admin() THEN
            IF NEW.status <> OLD.status THEN
                IF NEW.status = 'cancelled' AND OLD.status IN ('pending', 'confirmed') THEN
                    -- Permitted customer cancellation
                    NULL;
                ELSE
                    RAISE EXCEPTION 'Unauthorized: Customers can only cancel their own active bookings.';
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_booking_status ON public.bookings;
CREATE TRIGGER trg_protect_booking_status
    BEFORE INSERT OR UPDATE OF status ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_booking_status();


-- ------------------------------------------------------------------------------
-- 9. AVAILABILITY HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

-- Returns true if a specific car has no conflicting active bookings for the given date range
CREATE OR REPLACE FUNCTION public.is_car_available(
    p_car_id uuid,
    p_start_date date,
    p_end_date date
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
    v_conflict_count integer;
    v_is_listed boolean;
BEGIN
    -- Validate date range
    IF p_end_date < p_start_date THEN
        RETURN false;
    END IF;

    -- Check if car exists and is listed
    SELECT is_available INTO v_is_listed
    FROM public.cars
    WHERE id = p_car_id;

    IF v_is_listed IS NOT TRUE THEN
        RETURN false;
    END IF;

    -- Check for overlapping active bookings
    SELECT count(*) INTO v_conflict_count
    FROM public.bookings
    WHERE car_id = p_car_id
      AND status IN ('pending', 'confirmed')
      AND daterange(start_date, end_date, '[]') && daterange(p_start_date, p_end_date, '[]');

    RETURN (v_conflict_count = 0);
END;
$$;

-- Returns available cars for a date range and optional category
CREATE OR REPLACE FUNCTION public.get_available_cars(
    p_start_date date,
    p_end_date date,
    p_category text DEFAULT NULL
)
RETURNS SETOF public.cars
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT c.*
    FROM public.cars c
    WHERE c.is_available = true
      AND (p_category IS NULL OR c.category = p_category)
      AND NOT EXISTS (
          SELECT 1
          FROM public.bookings b
          WHERE b.car_id = c.id
            AND b.status IN ('pending', 'confirmed')
            AND daterange(b.start_date, b.end_date, '[]') && daterange(p_start_date, p_end_date, '[]')
      );
END;
$$;


-- ------------------------------------------------------------------------------
-- 10. CONTACT SUBMISSIONS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER trg_contact_submissions_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ------------------------------------------------------------------------------
-- 11. INDEXES FOR QUERY OPTIMIZATION
-- ------------------------------------------------------------------------------

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- Cars indexes
CREATE INDEX IF NOT EXISTS idx_cars_category ON public.cars (category);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON public.cars (brand);
CREATE INDEX IF NOT EXISTS idx_cars_is_available ON public.cars (is_available);
CREATE INDEX IF NOT EXISTS idx_cars_price_per_day ON public.cars (price_per_day);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON public.bookings (car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON public.bookings (user_id, status);

-- Contact submissions indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions (status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON public.contact_submissions (created_at DESC);


-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) & POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- ---------------------
-- PROFILES POLICIES
-- ---------------------
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Customers can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Customers can update their own profile (trigger protects the 'role' column)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile (including promoting roles)
CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ---------------------
-- CARS POLICIES
-- ---------------------
DROP POLICY IF EXISTS "Public can view active cars" ON public.cars;
DROP POLICY IF EXISTS "Admins can view all cars" ON public.cars;
DROP POLICY IF EXISTS "Admins can insert cars" ON public.cars;
DROP POLICY IF EXISTS "Admins can update cars" ON public.cars;
DROP POLICY IF EXISTS "Admins can delete cars" ON public.cars;

-- Public and customer users can read active, listed cars
CREATE POLICY "Public can view active cars"
    ON public.cars FOR SELECT
    TO anon, authenticated
    USING (is_available = true);

-- Admins can read all cars (including unlisted/archived ones)
CREATE POLICY "Admins can view all cars"
    ON public.cars FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Only admins can insert cars
CREATE POLICY "Admins can insert cars"
    ON public.cars FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Only admins can update cars
CREATE POLICY "Admins can update cars"
    ON public.cars FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only admins can delete cars
CREATE POLICY "Admins can delete cars"
    ON public.cars FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ---------------------
-- BOOKINGS POLICIES
-- ---------------------
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

-- Customers can read only their own bookings
CREATE POLICY "Customers can view own bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can view all bookings across the platform
CREATE POLICY "Admins can view all bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Customers can create bookings only for themselves
CREATE POLICY "Customers can create own bookings"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Customers can update their own bookings (e.g. to cancel; status trigger enforces boundaries)
CREATE POLICY "Customers can update own bookings"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can update any booking (e.g. confirm, reject, complete)
CREATE POLICY "Admins can update all bookings"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Admins can delete bookings if necessary (restricted by foreign keys on historical records)
CREATE POLICY "Admins can delete bookings"
    ON public.bookings FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ---------------------
-- CONTACT SUBMISSIONS POLICIES
-- ---------------------
DROP POLICY IF EXISTS "Anyone can submit contact requests" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions;

-- Any visitor (anonymous or authenticated) can submit a contact request
CREATE POLICY "Anyone can submit contact requests"
    ON public.contact_submissions FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only admins can read contact submissions
CREATE POLICY "Admins can view contact submissions"
    ON public.contact_submissions FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Only admins can update submission status (e.g. read, resolved)
CREATE POLICY "Admins can update contact submissions"
    ON public.contact_submissions FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only admins can delete contact submissions
CREATE POLICY "Admins can delete contact submissions"
    ON public.contact_submissions FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ------------------------------------------------------------------------------
-- 13. SUPABASE STORAGE SETUP (car-images BUCKET)
-- ------------------------------------------------------------------------------

-- Create public storage bucket for car images if not already existing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'car-images',
    'car-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Storage policies for the car-images bucket
DROP POLICY IF EXISTS "Public can view car images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update car images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete car images" ON storage.objects;

-- Public read access to car images
CREATE POLICY "Public can view car images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'car-images');

-- Only admins can upload new vehicle images
CREATE POLICY "Admins can upload car images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'car-images' AND public.is_admin());

-- Only admins can replace/update car images
CREATE POLICY "Admins can update car images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'car-images' AND public.is_admin())
    WITH CHECK (bucket_id = 'car-images' AND public.is_admin());

-- Only admins can remove car images
CREATE POLICY "Admins can delete car images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'car-images' AND public.is_admin());


-- ------------------------------------------------------------------------------
-- 14. REALISTIC DEVELOPMENT SEED DATA (CARS ONLY)
-- ------------------------------------------------------------------------------
-- Curated Pakistani rental market fleet with realistic PKR daily rates.
-- Notice: NO customer or admin accounts are seeded.

INSERT INTO public.cars (
    id,
    name,
    brand,
    model,
    year,
    category,
    description,
    image_url,
    price_per_day,
    seats,
    doors,
    transmission,
    fuel_type,
    location,
    features,
    is_available
) VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Toyota Corolla Altis Grande',
    'Toyota',
    'Corolla Altis Grande 1.8',
    2024,
    'Sedan',
    'Pakistan’s favorite executive sedan, offering exceptional fuel efficiency, spacious legroom, and effortless highway cruising for business and leisure travel.',
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
    7500.00,
    5,
    4,
    'Automatic',
    'Petrol',
    'Lahore Airport Hub',
    ARRAY['Automatic Climate Control', 'Push Start', 'Sunroof', 'Touchscreen Infotainment', 'Reverse Camera', 'Cruise Control'],
    true
),
(
    '11111111-1111-1111-1111-111111111102',
    'Honda Civic Oriel',
    'Honda',
    'Civic Oriel 1.5 Turbo',
    2024,
    'Sedan',
    'Sleek sporty aerodynamics, turbocharged acceleration, and modern luxury interior styling designed for dynamic city drives and long-distance comfort.',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
    9500.00,
    5,
    4,
    'Automatic',
    'Petrol',
    'Islamabad Blue Area Hub',
    ARRAY['1.5L Turbo Engine', 'Digital Cockpit', 'LaneWatch Camera', 'Leather Seats', 'Sunroof', 'Apple CarPlay & Android Auto'],
    true
),
(
    '11111111-1111-1111-1111-111111111103',
    'Toyota Fortuner Legender',
    'Toyota',
    'Fortuner Legender 2.8 4x4',
    2023,
    'SUV',
    'Imposing 7-seater luxury SUV with formidable 4x4 capability, dual-tone leather upholstery, and superior ground clearance for northern journeys or VIP protocol.',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    24000.00,
    7,
    5,
    'Automatic',
    'Diesel',
    'Lahore Hub',
    ARRAY['4x4 Drive System', '7 Passenger Seating', 'Dual-Zone Climate Control', 'Power Tailgate', 'Ambient Lighting', 'Premium JBL Audio'],
    true
),
(
    '11111111-1111-1111-1111-111111111104',
    'Kia Sportage AWD',
    'Kia',
    'Sportage Alpha / AWD',
    2023,
    'SUV',
    'Premium compact crossover SUV blending urban refinement, panoramic glass roof, and smooth suspension ideal for executive family travel.',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    14000.00,
    5,
    5,
    'Automatic',
    'Petrol',
    'Karachi Clifton Hub',
    ARRAY['Panoramic Sunroof', 'All-Wheel Drive', 'Electronic Parking Brake', 'Dual Airbags', 'Roof Rails', 'Wireless Charging'],
    true
),
(
    '11111111-1111-1111-1111-111111111105',
    'Hyundai Tucson GLS',
    'Hyundai',
    'Tucson 2.0 AWD',
    2023,
    'SUV',
    'Bold parametric jewel styling with spacious cabin ergonomics, whisper-quiet highway ride, and advanced safety features for peace of mind.',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    15000.00,
    5,
    5,
    'Automatic',
    'Petrol',
    'Islamabad Blue Area Hub',
    ARRAY['Panoramic Glass Roof', 'Power Driver Seat', 'LED Headlamps', 'Drive Mode Select', 'Rear AC Vents'],
    true
),
(
    '11111111-1111-1111-1111-111111111106',
    'Honda City Aspire',
    'Honda',
    'City Aspire 1.5 CVT',
    2024,
    'Sedan',
    'Economical and agile city sedan with generous trunk storage, responsive CVT transmission, and comfortable seating for budget-conscious executive rentals.',
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
    6500.00,
    5,
    4,
    'Automatic',
    'Petrol',
    'Lahore Airport Hub',
    ARRAY['Keyless Smart Entry', 'Retractable Mirrors', 'Rear Parking Sensors', 'Touchscreen Audio', 'ABS with EBD'],
    true
),
(
    '11111111-1111-1111-1111-111111111107',
    'Toyota Camry Hybrid',
    'Toyota',
    'Camry Hybrid 2.5',
    2023,
    'Luxury',
    'Prestige executive hybrid sedan delivering serene acoustic insulation, VIP rear-seat controls, and ultra-smooth regenerative hybrid electric power.',
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
    28000.00,
    5,
    4,
    'Automatic',
    'Hybrid',
    'Lahore Hub',
    ARRAY['Hybrid Synergy Drive', 'Leather Reclining Rear Seats', 'Heads-Up Display', 'Acoustic Glass', 'Dual-Zone Air Purification'],
    true
),
(
    '11111111-1111-1111-1111-111111111108',
    'Toyota Land Cruiser ZX',
    'Toyota',
    'Land Cruiser 300 ZX',
    2024,
    'Luxury',
    'The undisputed pinnacle of luxury off-road authority and VIP protocol in Pakistan. Twin-turbo V6 power, adaptive suspension, and chilled center console.',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    55000.00,
    7,
    5,
    'Automatic',
    'Petrol',
    'Islamabad Blue Area Hub',
    ARRAY['Twin Turbo V6', 'Multi-Terrain Select', 'Cool Box', 'Rear Seat Entertainment Screens', '360 Birdview Camera', 'Ventilated Seats'],
    true
),
(
    '11111111-1111-1111-1111-111111111109',
    'Toyota Hiace Grand Cabin',
    'Toyota',
    'Hiace Executive 14-Seater',
    2023,
    'Van',
    'Spacious high-roof executive transporter designed for corporate delegations, wedding entourage travel, and northern group tours in complete comfort.',
    'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=1200&q=80',
    18000.00,
    14,
    4,
    'Manual',
    'Diesel',
    'Lahore Hub',
    ARRAY['14 Passenger High-Roof Capacity', 'Dual Front & Rear AC', 'Curved Headrests', 'Luggage Overhead Compartments', 'Tinted Privacy Glass'],
    true
),
(
    '11111111-1111-1111-1111-111111111110',
    'Audi A6 Matrix S-Line',
    'Audi',
    'A6 2.0 TFSI S-Line',
    2023,
    'Luxury',
    'German engineering excellence featuring Matrix LED lighting, dual MMI touch response screens, and Quattro handling for red-carpet VIP arrivals.',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    38000.00,
    5,
    4,
    'Automatic',
    'Petrol',
    'Karachi Clifton Hub',
    ARRAY['Audi Virtual Cockpit', 'Matrix Beam LEDs', 'Bang & Olufsen 3D Sound', 'Quattro AWD', 'Panoramic Sunroof', 'Ambient Contour Lighting'],
    true
)
ON CONFLICT (id) DO NOTHING;
