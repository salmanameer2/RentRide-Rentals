import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Car, ArrowRight } from 'lucide-react';
import { carCategories } from '../assets/assets';

/**
 * Reusable BookingSearch widget
 * UI-only rental search component matching the Rent Rides design system
 * Navigates to /fleet with selected parameters
 */
export default function BookingSearch({
  className = '',
  initialCategory = 'all',
  initialLocation = 'Los Angeles Airport (LAX)',
}) {
  const navigate = useNavigate();

  const [pickUpLocation, setPickUpLocation] = useState(initialLocation);
  const [pickUpDate, setPickUpDate] = useState('2026-10-01');
  const [returnDate, setReturnDate] = useState('2026-10-05');
  const [carType, setCarType] = useState(initialCategory);

  const locations = [
    'Los Angeles Airport (LAX)',
    'Downtown Beverly Hills, CA',
    'Miami International Airport (MIA)',
    'Miami South Beach Concierge',
    'San Francisco Airport (SFO)',
    'New York JFK Terminal',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickUpLocation) params.set('location', pickUpLocation);
    if (carType && carType !== 'all') params.set('cat', carType);
    if (pickUpDate) params.set('from', pickUpDate);
    if (returnDate) params.set('to', returnDate);

    navigate(`/fleet?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white text-slate-900 rounded-3xl sm:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-3 sm:p-3.5 border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${className}`}
    >
      {/* Pick-up Location */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-1 sm:border-r border-slate-200">
        <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pick-Up Location
          </label>
          <select
            value={pickUpLocation}
            onChange={(e) => setPickUpLocation(e.target.value)}
            className="w-full bg-transparent font-semibold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer truncate"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pick-up Date */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-1 sm:border-r border-slate-200">
        <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pick-Up Date
          </label>
          <input
            type="date"
            value={pickUpDate}
            onChange={(e) => setPickUpDate(e.target.value)}
            className="w-full bg-transparent font-semibold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Return Date */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-1 sm:border-r border-slate-200">
        <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Return Date
          </label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full bg-transparent font-semibold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Car Type */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-1">
        <Car className="w-5 h-5 text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Car Type
          </label>
          <select
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
            className="w-full bg-transparent font-semibold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer truncate capitalize"
          >
            <option value="all">All Vehicle Types</option>
            {carCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Submit Button */}
      <button
        type="submit"
        className="bg-[#0b0f12] text-white hover:bg-black font-semibold text-sm px-6 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-md shrink-0 active:scale-[0.98] cursor-pointer"
      >
        <span>Search Cars</span>
        <ArrowRight className="w-4 h-4 text-[#bef264]" />
      </button>
    </form>
  );
}
