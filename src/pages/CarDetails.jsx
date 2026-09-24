import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Fuel,
  Gauge,
  Zap,
  CheckCircle,
  Star,
  Share2,
} from 'lucide-react';
import * as carService from '../services/carService';
import Container from '../components/Container';
import EmptyState from '../components/EmptyState';
import CarCard from '../components/CarCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import BookingForm from '../components/BookingForm';

export default function CarDetails() {
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [recommendedCars, setRecommendedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    async function loadCarData() {
      try {
        setLoading(true);
        const [targetCar, allActive] = await Promise.all([
          carService.getActiveCarById(id),
          carService.getActiveCars(),
        ]);

        if (!targetCar) {
          throw new Error('Vehicle Not Found');
        }

        setCar(targetCar);
        setActiveImage(targetCar.image);
        
        // Recommendations
        const filtered = allActive
          .filter(c => c.id !== targetCar.id && (c.category === targetCar.category))
          .slice(0, 3);
        setRecommendedCars(filtered.length >= 3 ? filtered : allActive.filter(c => c.id !== targetCar.id).slice(0, 3));
        
        setError(null);
      } catch (err) {
        console.warn('[CarDetails] Load notice:', err.message || err);
        setError(err.message || 'We could not retrieve the details for this vehicle.');
      } finally {
        setLoading(false);
      }
    }
    loadCarData();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-32">
        <Loader message="Fetching vehicle specifications and availability..." />
      </Container>
    );
  }

  if (error || !car) {
    return (
      <Container className="py-20 text-center">
        <EmptyState
          title={error || "Vehicle Not Found"}
          description="The car ID specified in the URL does not exist or is currently unlisted from our fleet."
          actionLabel="Browse Fleet Catalog"
          actionTo="/fleet"
        />
      </Container>
    );
  }

  const galleryImages = car.gallery && car.gallery.length > 0 ? car.gallery : [car.image];

  return (
    <div className="py-10 sm:py-14 bg-[#0b0f12]">
      <Container>
        {/* Top Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/fleet"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Fleet</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              Fleet ID: {car.id}
            </span>
          </div>
        </div>

        {/* Main Grid: Left Vehicle Details & Right Booking Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Visuals & Specifications */}
          <div className="lg:col-span-8 space-y-8">
            {/* Main Feature Image */}
            <div className="space-y-3">
              <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative">
                <img
                  src={activeImage || car.image}
                  alt={`${car.brand} ${car.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#bef264] border border-[#bef264]/20">
                    {car.category}
                  </span>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`relative w-24 aspect-[16/10] rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        (activeImage || car.image) === img
                          ? 'border-[#bef264] ring-2 ring-[#bef264]/40'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Header Info */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {car.brand}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                {car.name}
              </h1>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{car.rating || '5.0'}</span>
                </div>
                <span>•</span>
                <span>{car.reviewsCount || '0'} verified reviews</span>
                <span>•</span>
                <span className="text-[#bef264]">Active in fleet</span>
              </div>
            </div>

            {/* Core Specifications Bento */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Vehicle Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#12181d] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <Users className="w-5 h-5 text-[#bef264] mb-2" />
                  <div>
                    <div className="text-slate-400">Seating</div>
                    <div className="text-base font-bold text-white mt-0.5">{car.seats} Passengers</div>
                  </div>
                </div>

                <div className="bg-[#12181d] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <Gauge className="w-5 h-5 text-[#bef264] mb-2" />
                  <div>
                    <div className="text-slate-400">Transmission</div>
                    <div className="text-base font-bold text-white mt-0.5">{car.transmission}</div>
                  </div>
                </div>

                <div className="bg-[#12181d] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <Fuel className="w-5 h-5 text-[#bef264] mb-2" />
                  <div>
                    <div className="text-slate-400">Fuel Engine</div>
                    <div className="text-base font-bold text-white mt-0.5">{car.fuel}</div>
                  </div>
                </div>

                <div className="bg-[#12181d] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <Zap className="w-5 h-5 text-[#bef264] mb-2" />
                  <div>
                    <div className="text-slate-400">Horsepower</div>
                    <div className="text-base font-bold text-white mt-0.5">{car.horsepower || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#12181d] p-6 sm:p-8 rounded-3xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-3">About this Vehicle</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {car.description || 'No description available for this vehicle.'}
              </p>
            </div>

            {/* Included Premium Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-[#12181d] p-6 sm:p-8 rounded-3xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-4">Included Features & Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-[#bef264] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Widget Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl bg-[#12181d] border border-slate-800 p-6 sm:p-7 shadow-2xl">
               <BookingForm car={car} />
            </div>
          </div>
        </div>

        {/* Similar Cars Recommendation Section */}
        {recommendedCars.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-800/80">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#bef264] block mb-1">
                  You Might Also Like
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Similar Vehicles in Our Fleet
                </h2>
              </div>
              <Link
                to="/fleet"
                className="text-xs font-bold text-[#bef264] hover:underline hidden sm:inline-block"
              >
                View Full Fleet →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {recommendedCars.map((similarCar) => (
                <CarCard key={similarCar.id} car={similarCar} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
