import { supabase, isConfigured } from '../lib/supabase';
import * as authService from './authService';

/**
 * Booking Service for Rent Rides
 * Handles all Supabase operations for the bookings table
 */

/**
 * Normalizes database booking record to camelCase
 */
const normalizeBooking = (booking) => {
  if (!booking) return null;
  return {
    id: booking.id,
    userId: booking.user_id,
    carId: booking.car_id,
    pickupLocation: booking.pickup_location,
    startDate: booking.start_date,
    endDate: booking.end_date,
    totalDays: booking.total_days,
    pricePerDay: parseFloat(booking.price_per_day),
    totalPrice: parseFloat(booking.total_price),
    status: booking.status,
    notes: booking.notes,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
    // Joined data if present
    car: booking.cars ? {
      name: booking.cars.name,
      brand: booking.cars.brand,
      image: booking.cars.image_url,
    } : null,
    customer: booking.profiles ? {
      fullName: booking.profiles.full_name,
      email: booking.profiles.email,
    } : null,
  };
};

/**
 * Check if a car is available for the given dates
 */
export async function checkCarAvailability(carId, startDate, endDate) {
  if (!isConfigured) return true;
  const { data, error } = await supabase.rpc('is_car_available', {
    p_car_id: carId,
    p_start_date: startDate,
    p_end_date: endDate
  });

  if (error) {
    console.error('[bookingService] Error checking availability:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new booking
 */
export async function createBooking(bookingData) {
  if (!isConfigured) throw new Error('Supabase not configured');
  // Final safety check: Ensure the user profile exists in public.profiles
  // to avoid foreign key violations (Error 23503)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === bookingData.userId) {
      await authService.ensureProfile(user);
    }
  } catch (err) {
    console.warn('[bookingService] Could not verify/ensure profile existence:', err);
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      user_id: bookingData.userId,
      car_id: bookingData.carId,
      pickup_location: bookingData.pickupLocation,
      start_date: bookingData.startDate,
      end_date: bookingData.endDate,
      notes: bookingData.notes
    }])
    .select()
    .single();

  if (error) {
    // Check if it's a conflict error (Postgres EXCLUSION constraint violation)
    if (error.code === '23P01') {
      throw new Error('This car is no longer available for the selected dates. Please choose different dates or another car.');
    }
    
    console.error('[bookingService] Error creating booking:', error);
    throw error;
  }

  return normalizeBooking(data);
}

/**
 * Get all bookings (for Admin use)
 */
export async function getAllBookings() {
  if (!isConfigured) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(name, brand, image_url), profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[bookingService] Error fetching all bookings:', error);
    throw error;
  }

  return data.map(normalizeBooking);
}
/**
 * Get all bookings for the authenticated user
 */
export async function getMyBookings() {
  if (!isConfigured) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(name, brand, image_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[bookingService] Error fetching bookings:', error);
    throw error;
  }

  return data.map(normalizeBooking);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id) {
  if (!isConfigured) throw new Error('Supabase not configured');

  // Check current status before issuing update to prevent terminal state errors
  const { data: current, error: fetchError } = await supabase
    .from('bookings')
    .select('*, cars(name, brand, image_url)')
    .eq('id', id)
    .single();

  if (!fetchError && current) {
    const currentStatus = current.status?.toLowerCase();
    if (currentStatus === 'cancelled') {
      return normalizeBooking(current);
    }
    if (['rejected', 'completed'].includes(currentStatus)) {
      const err = new Error(`Booking status cannot be changed from terminal state "${currentStatus}".`);
      err.code = 'P0001';
      throw err;
    }
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select('*, cars(name, brand, image_url)')
    .single();

  if (error) {
    console.error('[bookingService] Error cancelling booking:', error);
    throw error;
  }

  return normalizeBooking(data);
}

/**
 * Update a booking status
 */
export async function updateBookingStatus(id, status) {
  if (!isConfigured) throw new Error('Supabase not configured');
  const targetStatus = status.toLowerCase();

  // Retrieve current booking to validate status transition
  const { data: current, error: fetchError } = await supabase
    .from('bookings')
    .select('*, cars(name, brand, image_url), profiles(full_name, email)')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('[bookingService] Error checking booking status:', fetchError);
    throw fetchError;
  }

  const currentStatus = current.status?.toLowerCase();

  // If already in target status, return normalized record directly
  if (currentStatus === targetStatus) {
    return normalizeBooking(current);
  }

  // Guard against terminal states (cancelled, rejected, completed)
  const terminalStates = ['cancelled', 'rejected', 'completed'];
  if (terminalStates.includes(currentStatus)) {
    const errorMsg = `Booking status cannot be changed from terminal state "${currentStatus}".`;
    console.warn(`[bookingService] Invalid status change on terminal booking (${id}): ${currentStatus} -> ${targetStatus}`);
    const err = new Error(errorMsg);
    err.code = 'P0001';
    throw err;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: targetStatus })
    .eq('id', id)
    .select('*, cars(name, brand, image_url), profiles(full_name, email)')
    .single();

  if (error) {
    console.error('[bookingService] Error updating booking status:', error);
    throw error;
  }

  return normalizeBooking(data);
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(id) {
  if (!isConfigured) return null;
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(name, brand, image_url)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[bookingService] Error fetching booking by ID:', error);
    throw error;
  }

  return normalizeBooking(data);
}
