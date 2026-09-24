import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Clock, ShieldCheck, Headphones, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as bookingService from '../services/bookingService';
import Button from './Button';
import Loader from './Loader';

/**
 * BookingForm Component
 * Handles the complete booking flow for a specific vehicle
 */
export default function BookingForm({ car }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Form State
  const [pickupLocation, setPickupLocation] = useState('Los Angeles Airport (LAX)');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Status State
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const locations = [
    'Los Angeles Airport (LAX)',
    'Downtown Beverly Hills, CA',
    'Miami International Airport (MIA)',
    'Miami South Beach Concierge',
    'San Francisco Airport (SFO)',
    'New York JFK Terminal',
  ];

  // Initialize dates with safe defaults (today and tomorrow)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];
    
    setStartDate(formatDate(today));
    setEndDate(formatDate(tomorrow));
  }, []);

  // Calculate Duration and Price
  const { totalDays, totalPrice } = useMemo(() => {
    if (!startDate || !endDate) return { totalDays: 0, totalPrice: 0 };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set both to midnight to avoid TZ issues with diff
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive dates
    
    const validDays = diffDays > 0 ? diffDays : 0;
    return {
      totalDays: validDays,
      totalPrice: validDays * car.pricePerDay
    };
  }, [startDate, endDate, car.pricePerDay]);

  // Check Availability when dates change
  useEffect(() => {
    if (!startDate || !endDate || totalDays <= 0) {
      setIsAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setIsChecking(true);
      setError(null);
      try {
        const available = await bookingService.checkCarAvailability(car.id, startDate, endDate);
        setIsAvailable(available);
      } catch (err) {
        console.error('[BookingForm] Availability check failed:', err);
      } finally {
        setIsChecking(false);
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [startDate, endDate, car.id, totalDays]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Preserve booking intent via URL params
      const params = new URLSearchParams();
      params.set('redirect', location.pathname);
      params.set('pickup', pickupLocation);
      params.set('start', startDate);
      params.set('end', endDate);
      navigate(`/login?${params.toString()}`);
      return;
    }

    if (isAdmin) {
      setError('Administrators cannot create customer bookings. Please use a customer account.');
      return;
    }

    if (totalDays <= 0) {
      setError('Return date must be equal to or after pickup date.');
      return;
    }

    // Double check availability one last time (the server will still enforce this)
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await bookingService.createBooking({
        userId: user.id,
        carId: car.id,
        pickupLocation,
        startDate,
        endDate,
        notes
      });

      setBookingResult(result);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && bookingResult) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-[#bef264]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Booking Request Received!</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your reservation for the <strong>{car.brand} {car.name}</strong> has been submitted for review. 
              Our dispatch team will audit the schedule and update your status shortly.
            </p>
          </div>
        </div>

        <div className="bg-[#182128] border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-slate-800 pb-2">
            Reservation Dossier
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block mb-1">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase text-[9px]">
                {bookingResult.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Booking ID</span>
              <span className="font-mono text-white text-[10px] truncate block">#{bookingResult.id.slice(0, 8)}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Pick-up</span>
              <span className="font-bold text-white">{bookingResult.startDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Return</span>
              <span className="font-bold text-white">{bookingResult.endDate}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block mb-1">Pickup Location</span>
              <span className="font-bold text-white">{bookingResult.pickupLocation}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 flex justify-between items-end">
            <div>
              <span className="text-slate-500 block mb-1">Total Rental ({bookingResult.totalDays} days)</span>
              <span className="text-xl font-black text-[#bef264]">${bookingResult.totalPrice}</span>
            </div>
            <div className="text-right text-[10px] text-slate-500 italic">
              Price snapshot at creation
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="primary" size="md" to="/bookings" className="w-full font-bold justify-center">
            View My Bookings
          </Button>
          <Button variant="outline" size="md" to="/fleet" className="w-full justify-center">
            Browse More Cars
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleBooking} className="space-y-6">
      <div className="flex items-baseline justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-3xl font-black text-white">${car.pricePerDay}</span>
          <span className="text-xs text-slate-400 font-medium"> / day</span>
        </div>
        <span className="text-xs text-[#bef264] font-semibold bg-[#bef264]/10 px-2.5 py-1 rounded-full border border-[#bef264]/20">
          Inclusive Dates
        </span>
      </div>

      <div className="space-y-4 text-xs">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Pick-up Date
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#bef264] transition-colors" />
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#bef264] transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Return Date
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#bef264] transition-colors" />
              <input
                type="date"
                required
                min={startDate || new Date().toISOString().split('T')[0]}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#bef264] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Pickup Hub
          </label>
          <div className="relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#bef264] transition-colors" />
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#bef264] transition-all cursor-pointer appearance-none"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Special Requests (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g. Child seat, airport pickup terminal..."
            className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#bef264] transition-all min-h-[80px] resize-none"
          />
        </div>

        {/* Availability & Price Summary */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Availability Status</span>
            {isChecking ? (
              <span className="flex items-center gap-1.5 text-slate-500 italic">
                <Loader size="xs" /> Checking...
              </span>
            ) : isAvailable === true ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Available
              </span>
            ) : isAvailable === false ? (
              <span className="flex items-center gap-1.5 text-red-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Already Booked
              </span>
            ) : (
              <span className="text-slate-600">Select dates</span>
            )}
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Duration</span>
            <span className="font-bold text-white">{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
          </div>

          <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
            <span>Estimated Total</span>
            <span className="text-2xl font-black text-[#bef264]">${totalPrice}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-[11px] text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        type="submit"
        disabled={isSubmitting || isChecking || isAvailable === false || totalDays <= 0}
        className="w-full font-bold justify-center text-sm shadow-xl disabled:opacity-50"
      >
        {isSubmitting ? 'Securing Reservation...' : isAuthenticated ? 'Reserve Now' : 'Sign In to Book'}
      </Button>

      {/* Trust Elements */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-[#bef264] shrink-0" />
          <span>No-Risk: Payment processed at pickup station</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#bef264] shrink-0" />
          <span>Double-booking protection enabled</span>
        </div>
      </div>
    </form>
  );
}
