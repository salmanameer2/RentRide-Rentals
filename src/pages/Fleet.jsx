import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  MapPin,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import * as carService from '../services/carService';
import Container from '../components/Container';
import CarCard from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ScrollReveal from '../components/ScrollReveal';

export default function Fleet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';
  const initialLocation = searchParams.get('location') || '';

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // popular, price-low, price-high, rating
  const [priceRange, setPriceRange] = useState('all'); // all, under-150, 150-250, 250-400, 400-plus
  const [transmission, setTransmission] = useState('all'); // all, automatic, manual
  const [fuelType, setFuelType] = useState('all'); // all, petrol, diesel, hybrid, electric
  const [seats, setSeats] = useState('all'); // all, 2, 4-5, 7-plus
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    async function loadCars() {
      try {
        setLoading(true);
        const data = await carService.getActiveCars();
        setCars(data);
        setError(null);
      } catch (err) {
        setError('Failed to load fleet catalog. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }
    loadCars();
  }, []);

  const categories = [
    { id: 'all', label: 'All Fleet' },
    { id: 'Sports', label: 'Sports' },
    { id: 'SUV', label: 'SUVs' },
    { id: 'Luxury', label: 'Luxury Sedans' },
    { id: 'Electric', label: 'Electric' },
    { id: 'Van', label: 'Vans & MPVs' },
  ];

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', catId);
    }
    setSearchParams(searchParams);
  };

  const handleResetAll = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popular');
    setPriceRange('all');
    setTransmission('all');
    setFuelType('all');
    setSeats('all');
    setOnlyAvailable(false);
    searchParams.delete('cat');
    searchParams.delete('location');
    setSearchParams(searchParams);
  };

  // Count active secondary filters
  const activeFilterCount =
    (priceRange !== 'all' ? 1 : 0) +
    (transmission !== 'all' ? 1 : 0) +
    (fuelType !== 'all' ? 1 : 0) +
    (seats !== 'all' ? 1 : 0) +
    (onlyAvailable ? 1 : 0);

  const filteredCars = useMemo(() => {
    let result = cars.filter((car) => {
      // Category filter - robust case-insensitive matching
      const matchesCategory =
        selectedCategory === 'all' || 
        (car.category && car.category.toLowerCase() === selectedCategory.toLowerCase()) ||
        (car.categoryId && car.categoryId.toLowerCase() === selectedCategory.toLowerCase());

      // Keyword query
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (car.name && car.name.toLowerCase().includes(q)) ||
        (car.brand && car.brand.toLowerCase().includes(q)) ||
        (car.category && car.category.toLowerCase().includes(q)) ||
        (car.description && car.description.toLowerCase().includes(q));

      // Price range
      let matchesPrice = true;
      if (priceRange === 'under-150') matchesPrice = car.pricePerDay < 150;
      else if (priceRange === '150-250')
        matchesPrice = car.pricePerDay >= 150 && car.pricePerDay <= 250;
      else if (priceRange === '250-400')
        matchesPrice = car.pricePerDay > 250 && car.pricePerDay <= 400;
      else if (priceRange === '400-plus') matchesPrice = car.pricePerDay > 400;

      // Transmission
      let matchesTransmission = true;
      if (transmission === 'automatic') {
        matchesTransmission =
          car.transmission && (
            car.transmission.toLowerCase().includes('auto') ||
            car.transmission.toLowerCase().includes('dual-clutch')
          );
      } else if (transmission === 'manual') {
        matchesTransmission = car.transmission && car.transmission.toLowerCase().includes('manual');
      }

      // Fuel type
      let matchesFuel = true;
      if (fuelType === 'petrol') {
        matchesFuel = car.fuel && car.fuel.toLowerCase().includes('petrol');
      } else if (fuelType === 'diesel') {
        matchesFuel = car.fuel && car.fuel.toLowerCase().includes('diesel');
      } else if (fuelType === 'hybrid') {
        matchesFuel = car.fuel && car.fuel.toLowerCase().includes('hybrid');
      } else if (fuelType === 'electric') {
        matchesFuel = car.fuel && car.fuel.toLowerCase().includes('electric');
      }

      // Seats
      let matchesSeats = true;
      if (seats === '2') matchesSeats = car.seats === 2;
      else if (seats === '4-5') matchesSeats = car.seats >= 4 && car.seats <= 5;
      else if (seats === '7-plus') matchesSeats = car.seats >= 7;

      // Availability
      let matchesAvailability = true;
      if (onlyAvailable) {
        matchesAvailability = car.available !== false;
      }

      return (
        matchesCategory &&
        matchesQuery &&
        matchesPrice &&
        matchesTransmission &&
        matchesFuel &&
        matchesSeats &&
        matchesAvailability
      );
    });

    // Sorting
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'popular') {
      result = [...result].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return result;
  }, [
    cars,
    selectedCategory,
    searchQuery,
    priceRange,
    transmission,
    fuelType,
    seats,
    onlyAvailable,
    sortBy,
  ]);

  return (
    <div className="py-12 sm:py-16 bg-[#0b0f12]">
      <Container>
        {/* Page Header */}
        <ScrollReveal direction="up">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#bef264] mb-2 inline-block">
              Fleet Catalog
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Our Fleet
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Explore our curated fleet of prestige sports cars, executive luxury sedans, and versatile family SUVs with transparent daily pricing.
            </p>

            {initialLocation && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-4 rounded-full bg-[#182128] border border-slate-700 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#bef264]" />
                <span>Browsing vehicles near: <strong className="text-white">{initialLocation}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    searchParams.delete('location');
                    setSearchParams(searchParams);
                  }}
                  className="ml-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Filter and Search Controls Bar */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-4 sm:p-5 mb-8 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by make, model, or feature (e.g. Porsche, V10, Sunroof)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#182128] border border-slate-700/80 rounded-full pl-11 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#bef264]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button & Sort Dropdown */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    showFiltersPanel || activeFilterCount > 0
                      ? 'bg-[#1e2a34] text-[#bef264] border-[#bef264]/40 shadow-sm'
                      : 'bg-[#182128] text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#bef264] text-black font-bold text-[11px] flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#182128] border border-slate-700/80 rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200 focus:outline-none focus:border-[#bef264] cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#bef264] text-black shadow-md font-bold'
                        : 'bg-[#182128] text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Expandable Advanced Filters Panel */}
            {showFiltersPanel && (
              <div className="pt-4 mt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in duration-200">
                {/* Price Range */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bef264]"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-150">Under $150 / day</option>
                    <option value="150-250">$150 – $250 / day</option>
                    <option value="250-400">$250 – $400 / day</option>
                    <option value="400-plus">$400+ / day</option>
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Transmission
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bef264]"
                  >
                    <option value="all">All Transmissions</option>
                    <option value="automatic">Automatic / Dual-Clutch</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bef264]"
                  >
                    <option value="all">All Fuels</option>
                    <option value="petrol">Petrol / Super</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">100% Electric</option>
                  </select>
                </div>

                {/* Seats */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Seating Capacity
                  </label>
                  <select
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bef264]"
                  >
                    <option value="all">Any Seats</option>
                    <option value="2">2 Seats (Coupe/Supercar)</option>
                    <option value="4-5">4–5 Seats (Sedan/SUV)</option>
                    <option value="7-plus">7+ Seats (MPV/Van)</option>
                  </select>
                </div>

                {/* Availability Toggle */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 bg-[#182128] border border-slate-700/80 hover:border-slate-600 rounded-xl px-3 py-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="accent-[#bef264] rounded cursor-pointer"
                    />
                    <span>Available Now Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

      {/* Results Info & Active Filter Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-xs text-slate-400">
        <div>
          Showing <span className="font-bold text-white">{filteredCars.length}</span> of{' '}
          <span>{cars.length}</span> vehicles
        </div>

        {(selectedCategory !== 'all' ||
          searchQuery ||
          activeFilterCount > 0 ||
          initialLocation) && (
          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 text-[#bef264] hover:underline font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Fleet Grid / Loading / Error */}
      {loading ? (
        <div className="py-24">
          <Loader message="Fetching the latest fleet arrivals..." />
        </div>
      ) : error ? (
        <div className="py-12">
          <ErrorMessage
            message={error}
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        </div>
      ) : filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No vehicles match your filters"
          description="Try adjusting your keywords, price range, or category criteria to see more available cars."
          actionLabel="View All Fleet"
          onAction={handleResetAll}
        />
      )}
      </Container>
    </div>
  );
}
