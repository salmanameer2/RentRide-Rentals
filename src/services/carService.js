import { supabase, isConfigured } from '../lib/supabase';
import { cars as sampleCars } from '../assets/assets';

/**
 * Car Service for Rent Rides
 * Handles all Supabase operations for the cars table with graceful fallbacks
 */

/**
 * Normalizes database car record to camelCase used by frontend components
 */
const normalizeCar = (car) => {
  if (!car) return null;

  // Extract horsepower if stored in features or directly on car record
  let horsepower = car.horsepower || '';
  if (!horsepower && Array.isArray(car.features)) {
    const hpItem = car.features.find((f) => 
      typeof f === 'string' && (f.toLowerCase().startsWith('horsepower:') || f.includes('HP'))
    );
    if (hpItem) {
      horsepower = hpItem.replace(/^horsepower:\s*/i, '').trim();
    }
  }

  return {
    ...car,
    id: String(car.id),
    horsepower: horsepower || '300 HP',
    image: car.image || car.image_url,
    image_url: car.image_url || car.image,
    pricePerDay: parseFloat(car.pricePerDay || car.price_per_day || 150),
    price_per_day: car.price_per_day || car.pricePerDay || 150,
    fuel: car.fuel || car.fuel_type || 'Petrol',
    fuel_type: car.fuel_type || car.fuel || 'Petrol',
    available: car.available !== undefined ? car.available : (car.is_available !== undefined ? car.is_available : true),
    is_available: car.is_available !== undefined ? car.is_available : (car.available !== undefined ? car.available : true),
    rating: car.rating || (4.8 + (Math.random() * 0.2)),
    reviewsCount: car.reviewsCount || (Math.floor(Math.random() * 200) + 20),
    location: car.location || 'Lahore Hub',
    doors: car.doors || 4,
    seats: car.seats || 5,
    features: Array.isArray(car.features) ? car.features : [],
  };
};

// Normalized fallback fleet to guarantee 100% uptime even if client network/adblocker blocks Supabase
const fallbackCars = sampleCars.map(normalizeCar);

/**
 * Denormalizes frontend car data back to database snake_case.
 * Note: 'horsepower' is NOT a column on public.cars table in Supabase.
 * It is preserved in the features array to prevent PGRST204 schema cache errors.
 */
const denormalizeCar = (carData) => {
  let features = Array.isArray(carData.features) ? [...carData.features] : [];

  // If horsepower is provided, store it into features
  if (carData.horsepower && typeof carData.horsepower === 'string' && carData.horsepower.trim()) {
    const cleanHp = carData.horsepower.trim();
    const hpTag = cleanHp.toLowerCase().endsWith('hp') ? cleanHp : `${cleanHp} HP`;
    // Filter out previous horsepower feature tags to prevent duplicates
    features = features.filter(
      (f) => typeof f === 'string' && !f.toLowerCase().startsWith('horsepower:') && !f.includes(' HP')
    );
    features.push(hpTag);
  }

  return {
    name: carData.name,
    brand: carData.brand,
    model: carData.model || carData.name, // Ensure model is present
    year: parseInt(carData.year),
    category: carData.category,
    description: carData.description,
    image_url: carData.image || carData.image_url,
    price_per_day: carData.pricePerDay || carData.price_per_day,
    seats: parseInt(carData.seats),
    doors: parseInt(carData.doors || 4),
    transmission: carData.transmission,
    fuel_type: carData.fuel || carData.fuel_type,
    location: carData.location || 'Lahore Hub',
    features,
    is_available: carData.available !== undefined ? carData.available : carData.is_available,
  };
};

/**
 * ADMIN: Upload car image to Supabase Storage
 */
export async function uploadCarImage(file) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('[carService] Image upload error:', err);
    throw err;
  }
}

/**
 * ADMIN: Delete car image from Supabase Storage
 */
export async function deleteCarImage(url) {
  try {
    if (!url || !url.includes('car-images')) return;

    // Extract path from public URL
    // Format: https://.../storage/v1/object/public/car-images/filename.jpg
    const parts = url.split('car-images/');
    if (parts.length < 2) return;
    const filePath = parts[1];

    const { error } = await supabase.storage
      .from('car-images')
      .remove([filePath]);

    if (error) {
      console.warn('[carService] Image deletion failed:', error);
    }
  } catch (err) {
    console.warn('[carService] Image deletion error:', err);
  }
}

/**
 * CUSTOMER: Get all listed/active cars
 */
export async function getActiveCars() {
  if (!isConfigured) return fallbackCars;

  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[carService] Supabase active cars query failed, using fallback fleet:', error.message || error);
      return fallbackCars;
    }

    if (data && data.length > 0) {
      return data.map(normalizeCar);
    }

    return fallbackCars;
  } catch (err) {
    console.warn('[carService] Network error fetching active cars, using fallback fleet:', err.message || err);
    return fallbackCars;
  }
}

/**
 * CUSTOMER: Get a single active car by ID
 */
export async function getActiveCarById(id) {
  const localMatch = fallbackCars.find((c) => String(c.id) === String(id));
  if (!isConfigured) return localMatch || null;

  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .eq('is_available', true)
      .maybeSingle();

    if (error) {
      console.warn('[carService] Error fetching car by ID, using fallback match:', error.message || error);
      return localMatch || null;
    }

    if (!data) {
      return localMatch || null;
    }

    return normalizeCar(data);
  } catch (err) {
    console.warn('[carService] Network error fetching car by ID, using fallback match:', err.message || err);
    return localMatch || null;
  }
}

/**
 * ADMIN: Get ALL cars (including unlisted)
 */
export async function getAllCars() {
  if (!isConfigured) return fallbackCars;

  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[carService] Error fetching all cars, using fallback fleet:', error.message || error);
      return fallbackCars;
    }

    if (data && data.length > 0) {
      return data.map(normalizeCar);
    }

    return fallbackCars;
  } catch (err) {
    console.warn('[carService] Network error in getAllCars, using fallback fleet:', err.message || err);
    return fallbackCars;
  }
}

/**
 * ADMIN: Create a new car
 */
export async function createCar(carData) {
  if (!isConfigured) throw new Error('Supabase not configured');
  const payload = denormalizeCar(carData);
  
  const { data, error } = await supabase
    .from('cars')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[carService] Error creating car:', error);
    throw error;
  }

  return normalizeCar(data);
}

/**
 * ADMIN: Update an existing car
 */
export async function updateCar(id, carData) {
  if (!isConfigured) throw new Error('Supabase not configured');
  const payload = denormalizeCar(carData);
  
  const { data, error } = await supabase
    .from('cars')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[carService] Error updating car:', error);
    throw error;
  }

  return normalizeCar(data);
}

/**
 * ADMIN: Delete a car
 */
export async function deleteCar(id) {
  if (!isConfigured) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[carService] Error deleting car:', error);
    throw error;
  }

  return true;
}
