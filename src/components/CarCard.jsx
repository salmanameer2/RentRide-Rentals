import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Gauge, Star, ArrowUpRight } from 'lucide-react';
import Button from './Button';

/**
 * Reusable CarCard component
 * Displays vehicle preview, specs, pricing, and action buttons
 */
export default function CarCard({ car, className = '', onBookClick }) {
  if (!car) return null;

  return (
    <div
      className={`group relative rounded-3xl bg-[#12181d] border border-slate-800/90 hover:border-slate-700 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ${className}`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={car.image}
          alt={`${car.brand} ${car.name}`}
          loading="lazy"
          className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category & Rating Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-[#bef264] border border-[#bef264]/20">
            {car.category}
          </span>
          {car.rating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-amber-300 border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{car.rating}</span>
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {car.brand}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#bef264] transition-colors leading-snug">
            {car.name}
          </h3>

          {/* Quick Specifications */}
          <div className="grid grid-cols-3 gap-2 py-4 my-3 border-y border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-1.5" title="Seating Capacity">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{car.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5" title="Transmission">
              <Gauge className="w-4 h-4 text-slate-400" />
              <span className="truncate">{car.transmission.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Fuel Type">
              <Fuel className="w-4 h-4 text-slate-400" />
              <span className="truncate">{car.fuel.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-2xl font-black text-white">${car.pricePerDay}</span>
              <span className="text-xs text-slate-400 font-medium"> / day</span>
            </div>
            <span className="text-xs text-[#bef264] font-medium">Instant Confirmation</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              to={`/fleet/${car.id}`}
              className="w-full text-xs font-medium"
            >
              View Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              to={`/fleet/${car.id}`}
              icon={ArrowUpRight}
              iconPosition="right"
              className="w-full text-xs font-bold"
              onClick={onBookClick}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
