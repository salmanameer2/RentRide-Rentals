-- ==============================================================================
-- RENT RIDES — PHASE 3.1: DATABASE SECURITY AUDIT & HARDENING MIGRATION
-- Migration: 20260920010000_phase_3_1_database_hardening.sql
-- Description: Hardens and corrects the Phase 3 schema:
--              1. Prevents booking inactive/unlisted cars (is_available check)
--              2. Prevents creating customer bookings with past start dates
--              3. Prevents admins from using customer booking INSERT workflow
--              4. Freezes price snapshot forever on UPDATE (avoids recalculating
--                 historical rates if cars table price changes)
--              5. Locks immutable fields on UPDATE (car_id, user_id, dates, price)
--              6. Enforces formal booking status state machine (pending -> confirmed/
--                 rejected/cancelled; confirmed -> completed/cancelled; terminal states)
--              7. Hardens is_admin() against NULL comparisons (COALESCE)
--              8. Hardens profile role protection on both INSERT and UPDATE
--              9. Hardens get_available_cars with date order validation
--             10. Removes SVG from car-images storage bucket (XSS prevention)
--             11. Uses scoped storage policy names (car_images_public_read, etc.)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDEN is_admin() UTILITY FUNCTION
-- ------------------------------------------------------------------------------

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

    -- Use COALESCE to ensure a strict boolean true/false is always returned
    RETURN COALESCE(v_role = 'admin', false);
END;
$$;


-- ------------------------------------------------------------------------------
-- 2. HARDEN PROFILE ROLE PROTECTION TRIGGER (INSERT & UPDATE)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Non-admins cannot insert a profile with 'admin' role
        IF NOT public.is_admin() THEN
            NEW.role := 'customer';
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Preserve immutable profile ID and created_at
        NEW.id := OLD.id;
        NEW.created_at := OLD.created_at;

        -- If role is being changed, require admin privileges
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            IF NOT public.is_admin() THEN
                RAISE EXCEPTION 'Unauthorized: Only platform administrators can change user roles.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_role();


-- ------------------------------------------------------------------------------
-- 3. HARDEN BOOKING VALIDATION, INCLUSIVE PRICING & IMMUTABILITY
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_and_price_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_car_price numeric(12,2);
    v_is_available boolean;
    v_calculated_days integer;
BEGIN
    -- --------------------------------------------------------------------------
    -- A. INSERT FLOW: Customer creates a new booking
    -- --------------------------------------------------------------------------
    IF TG_OP = 'INSERT' THEN
        -- 1. Date order check
        IF NEW.end_date < NEW.start_date THEN
            RAISE EXCEPTION 'Booking end_date (%) must be greater than or equal to start_date (%)', NEW.end_date, NEW.start_date;
        END IF;

        -- 2. Past dates check: Non-admins cannot book starting in the past
        IF NOT public.is_admin() AND NEW.start_date < CURRENT_DATE THEN
            RAISE EXCEPTION 'Booking start date (%) cannot be in the past.', NEW.start_date;
        END IF;

        -- 3. Vehicle existence and active availability check
        SELECT price_per_day, is_available INTO v_car_price, v_is_available
        FROM public.cars
        WHERE id = NEW.car_id;

        IF v_car_price IS NULL THEN
            RAISE EXCEPTION 'Selected vehicle (id: %) was not found.', NEW.car_id;
        END IF;

        IF NOT v_is_available AND NOT public.is_admin() THEN
            RAISE EXCEPTION 'Vehicle % is currently unlisted and not available for rental.', NEW.car_id;
        END IF;

        -- 4. Calculate total inclusive rental duration: (end_date - start_date) + 1
        v_calculated_days := (NEW.end_date - NEW.start_date) + 1;
        NEW.total_days := v_calculated_days;

        -- 5. Freeze authoritative price snapshot from cars table
        NEW.price_per_day := v_car_price;

        -- 6. Authoritative total price calculation
        NEW.total_price := NEW.total_days * NEW.price_per_day;

        -- 7. Default status for customers is strictly pending
        IF NOT public.is_admin() THEN
            NEW.status := 'pending';
        END IF;

    -- --------------------------------------------------------------------------
    -- B. UPDATE FLOW: Booking modification or cancellation
    -- --------------------------------------------------------------------------
    ELSIF TG_OP = 'UPDATE' THEN
        -- Preserve immutable system identity and created timestamp
        NEW.id := OLD.id;
        NEW.created_at := OLD.created_at;

        -- Non-admin customers cannot modify core booking terms
        IF NOT public.is_admin() THEN
            -- Check for illegal field alteration attempts
            IF NEW.user_id IS DISTINCT FROM OLD.user_id OR
               NEW.car_id IS DISTINCT FROM OLD.car_id OR
               NEW.start_date IS DISTINCT FROM OLD.start_date OR
               NEW.end_date IS DISTINCT FROM OLD.end_date OR
               NEW.total_days IS DISTINCT FROM OLD.total_days OR
               NEW.price_per_day IS DISTINCT FROM OLD.price_per_day OR
               NEW.total_price IS DISTINCT FROM OLD.total_price THEN
                RAISE EXCEPTION 'Unauthorized: Booking vehicle, dates, and pricing are immutable for customers.';
            END IF;

            -- Prevent updating a terminal booking (cancelled/rejected/completed)
            IF OLD.status IN ('cancelled', 'rejected', 'completed') AND NEW.status = OLD.status THEN
                RAISE EXCEPTION 'Cannot modify a % booking.', OLD.status;
            END IF;

            -- Revert any attempted tampering with immutable values
            NEW.user_id := OLD.user_id;
            NEW.car_id := OLD.car_id;
            NEW.start_date := OLD.start_date;
            NEW.end_date := OLD.end_date;
            NEW.total_days := OLD.total_days;
            NEW.price_per_day := OLD.price_per_day;
            NEW.total_price := OLD.total_price;

        ELSE
            -- Admin updates: If admin modified dates, recalculate duration & price
            IF NEW.start_date IS DISTINCT FROM OLD.start_date OR NEW.end_date IS DISTINCT FROM OLD.end_date THEN
                IF NEW.end_date < NEW.start_date THEN
                    RAISE EXCEPTION 'Booking end_date (%) must be greater than or equal to start_date (%)', NEW.end_date, NEW.start_date;
                END IF;

                NEW.total_days := (NEW.end_date - NEW.start_date) + 1;

                -- CRITICAL: Retain historical price_per_day snapshot even if car price in cars table changed!
                NEW.price_per_day := OLD.price_per_day;
                NEW.total_price := NEW.total_days * NEW.price_per_day;
            ELSE
                -- Always enforce authoritative total_price calculation: total_days * price_per_day
                NEW.total_days := OLD.total_days;
                NEW.price_per_day := OLD.price_per_day;
                NEW.total_price := NEW.total_days * NEW.price_per_day;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Fire on ALL inserts and updates to prevent partial update bypass
DROP TRIGGER IF EXISTS trg_validate_and_price_booking ON public.bookings;
CREATE TRIGGER trg_validate_and_price_booking
    BEFORE INSERT OR UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_and_price_booking();


-- ------------------------------------------------------------------------------
-- 4. HARDEN BOOKING STATUS STATE MACHINE TRIGGER
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_booking_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NOT public.is_admin() THEN
            NEW.status := 'pending';
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            -- 1. Terminal state check: completed, rejected, cancelled are terminal for all users
            IF OLD.status IN ('completed', 'rejected', 'cancelled') THEN
                RAISE EXCEPTION 'Booking status cannot be changed from terminal state "%".', OLD.status;
            END IF;

            -- 2. State transition rules from pending
            IF OLD.status = 'pending' AND NEW.status NOT IN ('confirmed', 'rejected', 'cancelled') THEN
                RAISE EXCEPTION 'Invalid status transition from "pending" to "%".', NEW.status;
            END IF;

            -- 3. State transition rules from confirmed
            IF OLD.status = 'confirmed' AND NEW.status NOT IN ('completed', 'cancelled') THEN
                RAISE EXCEPTION 'Invalid status transition from "confirmed" to "%".', NEW.status;
            END IF;

            -- 4. Customer authorization check: customers can ONLY transition to 'cancelled'
            IF NOT public.is_admin() THEN
                IF NEW.status <> 'cancelled' THEN
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
-- 5. HARDEN AVAILABILITY HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

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
    -- Validate date range ordering
    IF p_end_date < p_start_date THEN
        RETURN;
    END IF;

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
-- 6. HARDEN BOOKING RLS POLICIES (ADMIN / CUSTOMER SEPARATION)
-- ------------------------------------------------------------------------------

-- Ensure admins cannot use the customer booking INSERT path
DROP POLICY IF EXISTS "Customers can create own bookings" ON public.bookings;
CREATE POLICY "Customers can create own bookings"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        AND NOT public.is_admin()
    );

-- Customer update policy explicit role boundary
DROP POLICY IF EXISTS "Customers can update own bookings" ON public.bookings;
CREATE POLICY "Customers can update own bookings"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id 
        AND NOT public.is_admin()
    )
    WITH CHECK (
        auth.uid() = user_id 
        AND NOT public.is_admin()
    );


-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKET HARDENING (REMOVE SVG & APPLY SCOPED POLICIES)
-- ------------------------------------------------------------------------------

-- Update bucket to exclude SVG (XSS vector prevention)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'car-images',
    'car-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Drop old generic storage policy names to prevent collisions
DROP POLICY IF EXISTS "Public can view car images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update car images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete car images" ON storage.objects;

-- Drop newly scoped policy names if previously created
DROP POLICY IF EXISTS "car_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "car_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "car_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "car_images_admin_delete" ON storage.objects;

-- Create uniquely scoped storage policies
CREATE POLICY "car_images_public_read"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'car-images');

CREATE POLICY "car_images_admin_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'car-images' AND public.is_admin());

CREATE POLICY "car_images_admin_update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'car-images' AND public.is_admin())
    WITH CHECK (bucket_id = 'car-images' AND public.is_admin());

CREATE POLICY "car_images_admin_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'car-images' AND public.is_admin());
