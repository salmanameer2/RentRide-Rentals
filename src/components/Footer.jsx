import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import Container from './Container';

/**
 * Reusable Footer component
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080b0d] border-t border-slate-900 text-slate-400 pt-16 pb-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-[#1c242b] border border-slate-700/80 flex items-center justify-center text-[#bef264]">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Rent<span className="text-[#bef264]">Rides</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm mb-6">
              Experience the pinnacle of automotive freedom. Curated premium, luxury, and sport vehicles for discerning travelers and daily road enthusiasts.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-[#12181d] px-3 py-1.5 rounded-full border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-[#bef264]" />
                <span>Inspected Fleet</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#12181d] px-3 py-1.5 rounded-full border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-[#bef264]" />
                <span>24/7 Roadside Concierge</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#bef264] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/fleet" className="hover:text-[#bef264] transition-colors">
                  Fleet Collection
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#bef264] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[#bef264] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#bef264] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Vehicle Types */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/fleet?cat=sports" className="hover:text-[#bef264] transition-colors">
                  Sports Cars
                </Link>
              </li>
              <li>
                <Link to="/fleet?cat=suv" className="hover:text-[#bef264] transition-colors">
                  Luxury SUVs
                </Link>
              </li>
              <li>
                <Link to="/fleet?cat=luxury" className="hover:text-[#bef264] transition-colors">
                  Executive Sedans
                </Link>
              </li>
              <li>
                <Link to="/fleet?cat=electric" className="hover:text-[#bef264] transition-colors">
                  Electric Vehicles
                </Link>
              </li>
              <li>
                <Link to="/fleet?cat=vans" className="hover:text-[#bef264] transition-colors">
                  Vans & MPVs
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#bef264] shrink-0 mt-0.5" />
                <span>+1 (800) 736-8743</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#bef264] shrink-0 mt-0.5" />
                <span className="break-all">support@rentrides.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#bef264] shrink-0 mt-0.5" />
                <span>450 Grand Avenue, Beverly Hills, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Rent Rides Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Rental Agreement</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
