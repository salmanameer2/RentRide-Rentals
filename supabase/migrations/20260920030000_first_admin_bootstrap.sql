-- ==============================================================================
-- RENT RIDES — PHASE 3.2: SECURE FIRST ADMINISTRATOR BOOTSTRAP
-- Migration: 20260920030000_first_admin_bootstrap.sql
-- Description: Provides a one-time mechanism to promote the first platform
--              administrator. This operation is disabled as soon as one 
--              administrator exists.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIRST ADMIN BOOTSTRAP FUNCTION
-- ------------------------------------------------------------------------------

/**
 * Promotes the very first administrator of the platform.
 * 
 * SECURITY:
 * - SECURITY DEFINER: Runs with privileges of the function creator (postgres).
 * - search_path: Hardcoded to public, pg_temp to prevent hijacking.
 * - CONCURRENCY: Uses a transaction-level advisory lock to prevent race conditions.
 * - ONE-TIME: Fails if any user already has the 'admin' role.
 * - RESTRICTED: EXECUTE privilege is revoked from public, anon, and authenticated.
 * - VALIDATION: Resolves email to a specific UUID and ensures exactly one customer profile is updated.
 * 
 * @param p_email The email address of the existing user to promote.
 */
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_admin_count integer;
    v_target_user_id uuid;
    v_current_role text;
    -- Unique lock ID for First Admin Bootstrap (Migration timestamp based)
    v_lock_id bigint := 20260920030000;
BEGIN
    -- 1. CONCURRENCY PROTECTION
    -- Acquire a transaction-level advisory lock. This prevents multiple 
    -- concurrent bootstrap attempts from creating more than one admin.
    -- The lock is released automatically at the end of the transaction.
    PERFORM pg_advisory_xact_lock(v_lock_id);

    -- 2. ONE-TIME CHECK
    -- Only allow if ZERO administrators currently exist.
    SELECT COUNT(*) INTO v_admin_count FROM public.profiles WHERE role = 'admin';
    
    IF v_admin_count > 0 THEN
        RAISE EXCEPTION 'First admin already exists. Bootstrap operation is disabled.';
    END IF;

    -- 3. RESOLVE TARGET USER
    -- We look up the specific UUID associated with the email in the auth schema.
    -- Since the search_path is restricted to public, we must schema-qualify auth.users.
    SELECT id INTO v_target_user_id 
    FROM auth.users 
    WHERE email = p_email;

    IF v_target_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found in auth.users with email %. Please ensure the user has signed up.', p_email;
    END IF;

    -- 4. VALIDATE PROFILE & ROLE
    -- Ensure a profile exists for this UUID and that it is currently a 'customer'.
    SELECT role INTO v_current_role 
    FROM public.profiles 
    WHERE id = v_target_user_id;

    IF v_current_role IS NULL THEN
        RAISE EXCEPTION 'User % exists in auth.users but has no entry in public.profiles.', p_email;
    ELSIF v_current_role = 'admin' THEN
        -- This should logically not be reached due to v_admin_count check, 
        -- but added for defense-in-depth.
        RAISE EXCEPTION 'User % is already an administrator.', p_email;
    ELSIF v_current_role != 'customer' THEN
        RAISE EXCEPTION 'User % has an unexpected role: %. Only customers can be promoted.', p_email, v_current_role;
    END IF;

    -- 5. PERFORM PROMOTION
    -- We temporarily disable the role protection trigger to allow this one-time 
    -- administrative override. PostgreSQL ensures this DDL is transactional.
    ALTER TABLE public.profiles DISABLE TRIGGER tr_protect_profile_role;
    
    UPDATE public.profiles
    SET role = 'admin',
        updated_at = now()
    WHERE id = v_target_user_id;

    -- Re-enable the trigger immediately.
    ALTER TABLE public.profiles ENABLE TRIGGER trg_protect_profile_role;

    RAISE NOTICE 'User % (ID: %) has been successfully promoted to the first platform administrator.', p_email, v_target_user_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. ACCESS CONTROL & HARDENING
-- ------------------------------------------------------------------------------

-- CRITICAL: Revoke all default execution privileges. 
-- Normal application users (anon/authenticated) must NEVER be able to call this.
REVOKE ALL ON FUNCTION public.bootstrap_first_admin(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin(text) FROM anon;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin(text) FROM authenticated;

-- Only the database owner (postgres/superuser) can execute this function.
-- This ensures the function can only be invoked via the Supabase SQL Editor
-- or by a direct connection with superuser credentials.
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(text) TO postgres;

-- ------------------------------------------------------------------------------
-- 3. MIGRATION COMMENTS
-- ------------------------------------------------------------------------------
COMMENT ON FUNCTION public.bootstrap_first_admin(text) IS 'Secure one-time bootstrap mechanism for the first platform administrator. Fails if any admin already exists and is strictly restricted to the database owner.';
