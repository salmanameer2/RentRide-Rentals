import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Car,
  Clock,
  CheckCircle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as bookingService from '../../services/bookingService';
import Container from '../../components/Container';
import Button from '../../components/Button';
import Loader from '../../components/Loader';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const data = await bookingService.getMyBookings();
        setBookings(data);
      } catch (err) {
        console.error('[CustomerDashboard] Load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const recentBookings = bookings.slice(0, 3);
  const activeBooking = bookings.find(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  if (loading) {
    return (
      <div className="py-24 bg-[#0b0f12] min-h-screen">
        <Loader message="Synchronizing your reservation history..." />
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 bg-[#0b0f12] text-white min-h-[calc(100vh-140px)]">
      <Container>
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-[#12181d] border border-slate-800 p-6 sm:p-8 rounded-3xl">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#bef264] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Customer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome Back, {user?.fullName || 'Driver'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your reservations, review trip receipts, and update driver credentials.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" to="/bookings">
              My Bookings ({bookings.length})
            </Button>
            <Button variant="primary" size="sm" to="/fleet" className="font-bold">
              Rent Another Car →
            </Button>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-10">
          <div className="bg-[#12181d] border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total</div>
            <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-[#12181d] border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] text-amber-500/80 uppercase font-black tracking-widest">Pending</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-[#12181d] border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] text-[#bef264]/80 uppercase font-black tracking-widest">Confirmed</div>
            <div className="text-2xl font-black text-[#bef264] mt-1">{stats.confirmed}</div>
          </div>
          <div className="bg-[#12181d] border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] text-sky-500/80 uppercase font-black tracking-widest">Completed</div>
            <div className="text-2xl font-black text-sky-500 mt-1">{stats.completed}</div>
          </div>
          <div className="bg-[#12181d] border border-slate-800 p-4 rounded-2xl col-span-2 sm:col-span-1">
            <div className="text-[10px] text-red-500/80 uppercase font-black tracking-widest">Cancelled</div>
            <div className="text-2xl font-black text-red-500 mt-1">{stats.cancelled}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area: Active Trip & Recent Activity */}
          <div className="lg:col-span-8 space-y-8">
            {/* Active Booking Banner */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#bef264]" />
                  Active / Upcoming Trip
                </h2>
              </div>

              {activeBooking ? (
                <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] border border-slate-800">
                      <img
                        src={activeBooking.car?.image}
                        alt={activeBooking.car?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Ref: #{activeBooking.id.slice(0, 8)}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-white">
                            {activeBooking.car?.brand} {activeBooking.car?.name}
                          </h3>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          activeBooking.status === 'confirmed' 
                            ? 'bg-emerald-500/10 text-[#bef264] border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {activeBooking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-[#182128] border border-slate-800">
                          <span className="text-slate-500 block mb-1">Pick Up</span>
                          <span className="font-bold text-white">{activeBooking.startDate}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#182128] border border-slate-800">
                          <span className="text-slate-500 block mb-1">Return</span>
                          <span className="font-bold text-white">{activeBooking.endDate}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#182128] border border-slate-800 col-span-2 sm:col-span-1">
                          <span className="text-slate-500 block mb-1">Station</span>
                          <span className="font-bold text-white truncate block">{activeBooking.pickupLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <div className="text-lg font-black text-[#bef264]">
                          ${activeBooking.totalPrice}
                        </div>
                        <Button variant="outline" size="sm" to={`/bookings/${activeBooking.id}`} className="text-[11px] font-bold">
                          Manage Booking
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                    <Car className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No Active Reservations</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Ready for your next journey? Browse our curated collection of sports, luxury, and electric vehicles.
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" size="md" to="/fleet" className="font-bold">
                      Browse Fleet Catalog
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Bookings History List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <Link to="/bookings" className="text-xs text-[#bef264] hover:underline font-bold">
                  View Full History
                </Link>
              </div>

              <div className="bg-[#12181d] border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800">
                {recentBookings.length > 0 ? (
                  recentBookings.map((b) => (
                    <Link 
                      key={b.id} 
                      to={`/bookings/${b.id}`}
                      className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                          <img src={b.car?.image} alt={b.car?.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{b.car?.brand} {b.car?.name}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                            {b.startDate} • {b.totalDays} Days
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-black text-white">${b.totalPrice}</div>
                          <div className={`text-[9px] font-black uppercase tracking-widest ${
                            b.status === 'confirmed' ? 'text-[#bef264]' : 
                            b.status === 'cancelled' ? 'text-red-500' : 
                            b.status === 'completed' ? 'text-sky-500' : 'text-amber-500'
                          }`}>
                            {b.status}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#bef264] transition-colors" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-10 text-center text-xs text-slate-500 italic">
                    Your recent booking activity will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Account & Profile Quick Access */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#bef264]" />
                Driver Profile
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#bef264]/20 to-[#bef264]/5 border border-[#bef264]/20 flex items-center justify-center text-[#bef264] text-xl font-black">
                  {user?.fullName?.charAt(0) || 'D'}
                </div>
                <div>
                  <div className="text-base font-black text-white leading-tight">{user?.fullName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{user?.email}</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">License</span>
                  <span className="text-[10px] font-black text-[#bef264] uppercase flex items-center gap-1">
                    Verified <ShieldCheck className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">User ID</span>
                  <span className="text-[10px] font-mono text-slate-300">{user?.id?.slice(0, 8)}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" to="/profile" className="w-full text-xs font-bold border-slate-700">
                Update Driver Details
              </Button>
            </div>

            {/* Quick Support Card */}
            <div className="bg-gradient-to-br from-[#bef264]/10 to-transparent border border-[#bef264]/10 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-2">Need Assistance?</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Our concierge team is available 24/7 for booking modifications or emergency roadside support.
              </p>
              <Button variant="outline" size="sm" to="/contact" className="w-full text-[11px] border-slate-800 text-slate-300">
                Contact 24/7 Concierge
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
