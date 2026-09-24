import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Shield,
  Clock,
  Sparkles,
  Award,
  Users,
  Fuel,
  Gauge,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
} from 'lucide-react';
import {
  assets,
  carCategories,
  features,
  howItWorksSteps,
  testimonials,
} from '../assets/assets';
import cinematicHeroBg from '../assets/images/cinematic_car_hero_1790272402871.jpg';
import * as carService from '../services/carService';
import Container from '../components/Container';
import Button from '../components/Button';
import SectionTitle from '../components/SectionTitle';
import CarCard from '../components/CarCard';
import Modal from '../components/Modal';
import BookingSearch from '../components/BookingSearch';
import TrustBenefits from '../components/TrustBenefits';
import Loader from '../components/Loader';
import ScrollReveal from '../components/ScrollReveal';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Featured vehicle showcase slider
  const [selectedFeaturedIndex, setSelectedFeaturedIndex] = useState(0);

  // Active category selection in Collection section
  const [activeCategory, setActiveCategory] = useState('sports');

  // Testimonials slider state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Video preview modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    async function loadFleet() {
      try {
        const data = await carService.getActiveCars();
        setCars(data || []);
      } catch (err) {
        console.warn('[Home] Fleet fetch notice:', err.message || err);
      } finally {
        setLoading(false);
      }
    }
    loadFleet();
  }, []);

  const popularCars = cars.slice(0, 4); // Just pick first 4 for home showcase
  const activeFeaturedCar = popularCars[selectedFeaturedIndex] || popularCars[0];

  const categoryCars = cars.filter((c) => c.category?.toLowerCase() === activeCategory.toLowerCase());

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="space-y-0">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center overflow-hidden pt-6 pb-24 sm:pb-32 bg-[#0b0f12]">
        {/* Cinematic Car Image Hero Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          <img
            src={cinematicHeroBg}
            alt="Cinematic luxury car background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 opacity-40 filter brightness-90 contrast-110"
          />
          {/* Subtle cinematic gradient overlays for depth, contrast, and high readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f12] via-[#0b0f12]/85 to-[#0b0f12]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f12] via-transparent to-[#0b0f12]/80" />
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#bef264]/10 rounded-full blur-[140px] pointer-events-none z-0" />

        <Container className="relative z-10">
          <ScrollReveal direction="up" distance={40}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Content Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#bef264]" />
                  Premium Car Rental
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                  Find the Right Ride for <br />
                  <span className="text-[#bef264]">Every Journey</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300/90 max-w-lg leading-relaxed font-normal">
                  Luxury cars. Flexible rentals. Convenient booking. Experience
                  the freedom of the open road with Rent Rides.
                </p>

                {/* Three Mini Feature Badges */}
                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#bef264]/15 text-[#bef264] flex items-center justify-center">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span>Wide Vehicle Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#bef264]/15 text-[#bef264] flex items-center justify-center">
                      <Clock className="w-3 h-3" />
                    </div>
                    <span>24/7 Roadside Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#bef264]/15 text-[#bef264] flex items-center justify-center">
                      <Shield className="w-3 h-3" />
                    </div>
                    <span>Easy & Secure Booking</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    to="/fleet"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="font-bold text-sm tracking-wide shadow-lg"
                  >
                    Book Now
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    to="/contact"
                    className="font-semibold text-sm border-slate-700 text-slate-200 hover:text-white hover:border-[#bef264]"
                  >
                    Contact Us
                  </Button>

                  <Link
                    to="/how-it-works"
                    className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-slate-300 hover:text-white transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bef264]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1c242b] border border-slate-700/80 flex items-center justify-center text-[#bef264] group-hover:scale-105 group-hover:border-[#bef264]/70 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">How It Works</span>
                  </Link>
                </div>
              </div>

              {/* Right Hero Car Presentation */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-xl lg:max-w-none">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/60">
                    <img
                      src={assets.heroCar}
                      alt="Lamborghini Huracán luxury rental car"
                      className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-700"
                    />
                    {/* Subtle vignette gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f12]/80 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Floating spec pill */}
                  <div className="absolute -bottom-4 right-4 sm:right-8 bg-[#12181d]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#bef264]/10 text-[#bef264] flex items-center justify-center font-bold text-base">
                      V10
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Featured Supercar</div>
                      <div className="text-sm font-bold text-white">640 HP • 0-100 in 2.9s</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>

        {/* ===================== FLOATING SEARCH PREVIEW BAR ===================== */}
        <div className="relative -mb-16 sm:-mb-20 mt-12 z-20">
          <Container>
            <BookingSearch />
          </Container>
        </div>
      </section>

      {/* ===================== TRUST & BENEFITS SECTION ===================== */}
      <TrustBenefits className="pt-24 sm:pt-28" />

      {/* ===================== OUR COLLECTION (LIGHT SECTION) ===================== */}
      <section className="bg-[#f8fafc] text-slate-900 pt-28 sm:pt-32 pb-20 border-b border-slate-200">
        <Container>
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-700 mb-2">
                  Our Collection
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Find Your Perfect Ride
                </h2>
              </div>
              <p className="text-sm text-slate-600 max-w-md">
                From spirited sporty coupes to spacious family SUVs, we have the ideal vehicle for every journey, occasion, and lifestyle.
              </p>
            </div>

            {/* Category Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {carCategories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-left p-4 rounded-3xl transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] ring-2 ring-emerald-500/80 -translate-y-1'
                        : 'bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100 mb-4">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {cat.name}
                        </h3>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#bef264] text-black'
                              : 'bg-slate-100 text-slate-400 group-hover:text-slate-700'
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{cat.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Filtered Mini Fleet Preview Grid */}
          <div className="mt-12 pt-8 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-slate-700">
                Showing {categoryCars.length} vehicles in{' '}
                <span className="text-emerald-700 font-bold capitalize">
                  {activeCategory}
                </span>
              </span>
              <Link
                to={`/fleet?cat=${activeCategory}`}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group"
              >
                View full fleet <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12">
                <Loader message="Fetching collection..." />
              </div>
            ) : categoryCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCars
                  .slice(0, 3)
                  .map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm italic">
                No vehicles currently available in this category.
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ===================== FEATURED VEHICLES (DARK SHOWCASE SECTION) ===================== */}
      <section className="bg-[#0b0f12] text-white py-24 border-b border-slate-800/80">
        <Container>
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#bef264] mb-2">
                  Featured Vehicles
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Popular Picks Right Now
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl">
                  Explore our most rented vehicles, loved by our customers for their performance, comfort, and uncompromising prestige.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                to="/fleet"
                icon={ArrowRight}
                iconPosition="right"
                className="font-bold self-start md:self-end"
              >
                View All Vehicles
              </Button>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="py-24">
              <Loader message="Loading featured vehicles..." />
            </div>
          ) : popularCars.length > 0 ? (
            /* Large Hero Showcase Slider / Display */
            <ScrollReveal delay={0.2}>
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#12181d] p-6 sm:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Image & Price Overlay */}
                  <div className="lg:col-span-7 relative">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 relative shadow-2xl">
                      <img
                        src={activeFeaturedCar.image}
                        alt={activeFeaturedCar.name}
                        className="w-full h-full object-cover transform hover:scale-103 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                      {/* Floating Price Tag */}
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 text-right">
                        <div className="text-xs text-slate-300 font-medium">Daily Rental</div>
                        <div className="text-2xl font-black text-[#bef264]">
                          ${activeFeaturedCar.pricePerDay}
                          <span className="text-xs text-slate-300 font-normal"> /day</span>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail Switcher */}
                    <div className="flex items-center gap-3 mt-4">
                      {popularCars.map((car, idx) => (
                        <button
                          key={car.id}
                          type="button"
                          onClick={() => setSelectedFeaturedIndex(idx)}
                          className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden border transition-all cursor-pointer ${
                            selectedFeaturedIndex === idx
                              ? 'border-[#bef264] ring-2 ring-[#bef264]/40 scale-105'
                              : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={car.image}
                            alt={car.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specs & Description */}
                  <div className="lg:col-span-5 space-y-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20 mb-3">
                        <Star className="w-3.5 h-3.5 fill-[#bef264]" />
                        <span>{activeFeaturedCar.rating} ({activeFeaturedCar.reviewsCount} verified reviews)</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {activeFeaturedCar.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                        {activeFeaturedCar.description || 'Experience ultimate comfort and performance with this premium vehicle selection.'}
                      </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#182128] p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                        <Gauge className="w-4 h-4 text-[#bef264]" />
                        <div>
                          <div className="text-slate-400">Transmission</div>
                          <div className="font-bold text-white">{activeFeaturedCar.transmission}</div>
                        </div>
                      </div>
                      <div className="bg-[#182128] p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-[#bef264]" />
                        <div>
                          <div className="text-slate-400">Capacity</div>
                          <div className="font-bold text-white">{activeFeaturedCar.seats} Persons</div>
                        </div>
                      </div>
                      <div className="bg-[#182128] p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                        <Fuel className="w-4 h-4 text-[#bef264]" />
                        <div>
                          <div className="text-slate-400">Fuel</div>
                          <div className="font-bold text-white">{activeFeaturedCar.fuel}</div>
                        </div>
                      </div>
                      <div className="bg-[#182128] p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-[#bef264]" />
                        <div>
                          <div className="text-slate-400">Manufacturer</div>
                          <div className="font-bold text-white">{activeFeaturedCar.brand}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        to={`/fleet/${activeFeaturedCar.id}`}
                        className="font-bold flex-1"
                      >
                        Book This Car
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        to={`/fleet/${activeFeaturedCar.id}`}
                      >
                        Full Specs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <div className="py-24 text-center">
              <EmptyState title="Our fleet is empty" description="Check back later for new arrivals." actionLabel="Browse Fleet" actionTo="/fleet" />
            </div>
          )}
        </Container>
      </section>

      {/* ===================== WHY CHOOSE RENT RIDES ===================== */}
      <section className="bg-white text-slate-900 py-24 border-b border-slate-200">
        <Container>
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Angled Interior Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                  <img
                    src={assets.heroInterior}
                    alt="Luxury vehicle leather interior"
                    className="w-full h-[420px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        ★ 4.9
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Customer Trust Score</div>
                        <div className="text-sm font-bold text-slate-900">Over 10,000+ Journeys Delivered</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Feature Badges */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-700 mb-2">
                    Why Choose Rent Rides
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    More Than Just Car Rental
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                    We blend white-glove concierge standards with seamless digital simplicity. Enjoy pristine vehicles delivered to your doorstep with transparent pricing.
                  </p>
                </div>

                {/* 4 Feature Badges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {features.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/40 hover:bg-emerald-50/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                      <span className="inline-block mt-3 text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how-it-works" className="bg-[#0b0f12] text-white py-24 border-b border-slate-800/80">
        <Container>
          <ScrollReveal direction="up">
            <SectionTitle
              eyebrow="Seamless Process"
              title="How It Works"
              subtitle="Renting your dream car takes under two minutes from browsing to road readiness."
              align="center"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
            {howItWorksSteps.map((step, index) => (
              <ScrollReveal key={step.step} delay={index * 0.1}>
                <div
                  className="relative rounded-3xl bg-[#12181d] border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors group h-full"
                >
                  <div>
                    <div className="text-3xl font-black text-[#bef264]/40 group-hover:text-[#bef264] transition-colors mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="w-6 h-1 rounded-full bg-[#bef264]/30 group-hover:bg-[#bef264] transition-colors mt-6" />
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4} className="mt-12 text-center">
            <Button variant="outline" size="lg" to="/how-it-works" className="font-bold border-slate-700 text-slate-300 hover:text-white hover:border-[#bef264]">
              View Full Detailed Guide
            </Button>
          </ScrollReveal>
        </Container>
      </section>

      {/* ===================== CUSTOMER REVIEWS / TESTIMONIALS ===================== */}
      <section className="bg-[#080b0e] text-white py-24 border-b border-slate-900">
        <Container>
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#bef264] mb-2">
                  Testimonials
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  What Our Customers Say
                </h2>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={prevTestimonial}
                  aria-label="Previous testimonial"
                  className="w-10 h-10 rounded-full bg-[#161e24] border border-slate-700 text-slate-300 hover:text-white hover:border-[#bef264] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextTestimonial}
                  aria-label="Next testimonial"
                  className="w-10 h-10 rounded-full bg-[#161e24] border border-slate-700 text-slate-300 hover:text-white hover:border-[#bef264] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Testimonial Showcase Card */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#11171d]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Sunset Car Image */}
                <div className="lg:col-span-5 h-64 lg:h-96 relative overflow-hidden">
                  <img
                    src={assets.ctaCarSunset}
                    alt="Sports car at sunset"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#11171d] hidden lg:block" />
                </div>

                {/* Review Text */}
                <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(testimonials[currentTestimonialIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <blockquote className="text-lg sm:text-xl font-medium text-slate-200 leading-relaxed italic">
                    "{testimonials[currentTestimonialIndex].review}"
                  </blockquote>

                  <div className="flex items-center gap-4 pt-2">
                    <img
                      src={testimonials[currentTestimonialIndex].avatar}
                      alt={testimonials[currentTestimonialIndex].name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#bef264]"
                    />
                    <div>
                      <div className="font-bold text-white text-base">
                        {testimonials[currentTestimonialIndex].name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {testimonials[currentTestimonialIndex].role} • {testimonials[currentTestimonialIndex].location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ===================== FLOATING BOTTOM CTA BANNER ===================== */}
      <section className="bg-[#0b0f12] py-16">
        <Container>
          <ScrollReveal direction="up">
            <div className="relative rounded-3xl sm:rounded-full bg-white text-slate-900 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0b0f12] text-[#bef264] flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Ready to Hit the Road?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Book your dream car today and make every journey special.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                to="/fleet"
                icon={ArrowRight}
                iconPosition="right"
                className="font-bold text-sm w-full sm:w-auto"
              >
                Book Now
              </Button>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* How It Works / Video Preview Modal */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title="Experience Rent Rides"
        size="lg"
      >
        <div className="space-y-4">
          <div className="aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center relative">
            <img
              src={assets.heroCar}
              alt="Video preview"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40">
              <div className="w-16 h-16 rounded-full bg-[#bef264] text-black flex items-center justify-center shadow-lg mb-3">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
              <p className="text-sm font-semibold text-white">
                Rent Rides Video Overview (Phase 1 Preview)
              </p>
              <p className="text-xs text-slate-300 max-w-sm mt-1">
                Discover our digital keyless pickup, concierge vehicle detailing, and insurance protection.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVideoModalOpen(false)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
