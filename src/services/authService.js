import { supabase, isConfigured } from '../lib/supabase';

/**
 * Authentication service for Rent Rides
 * Interacts directly with Supabase Auth and public.profiles
 */

/**
 * Sign up a new customer with email and password
 * Note: NEVER send role from frontend. The DB trigger automatically sets role = 'customer'.
 */
export async function signUp({ email, password, fullName, phone }) {
  if (!isConfigured) {
    throw new Error('Supabase client is not configured. Please add your API keys in Settings.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || '',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in with email and password
 */
export async function signIn({ email, password }) {
  if (!isConfigured) {
    throw new Error('Supabase client is not configured. Please add your API keys in Settings.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out of current session
 */
export async function signOut() {
  if (!isConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Get active session
 */
export async function getSession() {
  if (!isConfigured) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

/**
 * Fetch profile for a specific user ID from public.profiles
 */
export async function getProfile(userId) {
  if (!isConfigured || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error(`[authService] Supabase error fetching profile for user ${userId}:`, error.message, error.details || '');
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[authService] Exception in getProfile for user ${userId}:`, err);
    throw err;
  }
}

/**
 * Ensures a profile exists for the user.
 * If missing, it creates a minimal one using Auth metadata.
 */
export async function ensureProfile(user) {
  if (!isConfigured || !user) return null;

  const profile = await getProfile(user.id);
  if (profile) return profile;

  // Profile is missing - create it
  console.info(`[authService] Profile missing for user ${user.id}. Attempting to create...`);
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
      role: 'customer' // Default role for auto-created profiles
    }])
    .select()
    .single();

  if (error) {
    console.error('[authService] Failed to auto-create missing profile:', error);
    return null;
  }

  return data;
}

/**
 * ADMIN: Fetch all profiles for user management
 */
export async function getAllProfiles() {
  if (!isConfigured) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, avatar_url, role, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[authService] Error fetching all profiles:', error);
    throw error;
  }

  return data;
}

/**
 * Update safe profile fields for authenticated customer
 * (id and role are immutable)
 */
export async function updateProfile(userId, updates) {
  if (!isConfigured || !userId) return null;

  // Safe subset only
  const safePayload = {};
  if (updates.full_name !== undefined) safePayload.full_name = updates.full_name;
  if (updates.phone !== undefined) safePayload.phone = updates.phone;
  if (updates.avatar_url !== undefined) safePayload.avatar_url = updates.avatar_url;

  const { data, error } = await supabase
    .from('profiles')
    .update(safePayload)
    .eq('id', userId)
    .select('id, full_name, email, phone, avatar_url, role, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
