-- ==============================================================================
-- RENT RIDES — PHASE 3.1: FINAL TARGETED CORRECTIONS MIGRATION
-- Migration: 20260920020000_phase_3_1_final_corrections.sql
-- Description: Final targeted hardening pass before Phase 4 Authentication:
--              1. Fix admin booking vehicle reassignment:
--                 - When an admin changes car_id, verify new car exists and is active
--                 - Take an authoritative new price_per_day snapshot from the new car
--                 - Recalculate total_days and total_price using inclusive dates
--              2. Strictly preserve historical price snapshots when car_id is NOT changed
--                 (even if the car's rate in public.cars changes in the future)
--              3. Reject assigning any booking to an inactive/unlisted vehicle
--              4. Preserve GiST double-booking exclusion constraint
--              5. Preserve inclusive date calculation: (end_date - start_date) + 1
--              6. Safely scope storage policies on storage.objects for 'car-images'
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDEN validate_and_price_booking() FOR ADMIN VEHICLE REASSIGNMENT
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
    -- B. UPDATE FLOW: Booking modification, vehicle reassignment, or cancellation
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
            -- ------------------------------------------------------------------
            -- Admin updates:
            -- ------------------------------------------------------------------
            -- 1. If admin changed the vehicle (car_id):
            IF NEW.car_id IS DISTINCT FROM OLD.car_id THEN
                -- Verify the new car exists and is active/bookable
                SELECT price_per_day, is_available INTO v_car_price, v_is_available
                FROM public.cars
                WHERE id = NEW.car_id;

                IF v_car_price IS NULL THEN
                    RAISE EXCEPTION 'Selected vehicle (id: %) was not found.', NEW.car_id;
                END IF;

                IF NOT v_is_available THEN
                    RAISE EXCEPTION 'Vehicle % is currently inactive/unlisted and cannot be assigned to bookings.', NEW.car_id;
                END IF;

                -- Explicit car change takes a fresh price snapshot from the newly assigned vehicle
                NEW.price_per_day := v_car_price;
            ELSE
                -- CRITICAL: Retain historical price_per_day snapshot even if car price in cars table changed!
                NEW.price_per_day := OLD.price_per_day;
            END IF;

            -- 2. Validate date ordering
            IF NEW.end_date < NEW.start_date THEN
                RAISE EXCEPTION 'Booking end_date (%) must be greater than or equal to start_date (%)', NEW.end_date, NEW.start_date;
            END IF;

            -- 3. Calculate total inclusive rental duration: (end_date - start_date) + 1
            NEW.total_days := (NEW.end_date - NEW.start_date) + 1;

            -- 4. Authoritative total price calculation: total_days * price_per_day
            NEW.total_price := NEW.total_days * NEW.price_per_day;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Ensure trigger is active on all booking inserts and updates
DROP TRIGGER IF EXISTS trg_validate_and_price_booking ON public.bookings;
CREATE TRIGGER trg_validate_and_price_booking
    BEFORE INSERT OR UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_and_price_booking();


-- ------------------------------------------------------------------------------
-- 2. VERIFY STORAGE POLICIES ARE SAFELY SCOPED ONLY TO 'car-images'
-- ------------------------------------------------------------------------------

-- Ensure car-images bucket exists with proper constraints (JPEG, PNG, WebP only)
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

-- Drop only the explicitly named Rent Rides storage policies if existing
DROP POLICY IF EXISTS "car_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "car_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "car_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "car_images_admin_delete" ON storage.objects;

-- Re-create Rent Rides storage policies strictly scoped to bucket_id = 'car-images'
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
