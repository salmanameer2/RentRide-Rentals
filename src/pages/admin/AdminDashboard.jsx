import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  CalendarCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  UserCheck,
  Filter,
  BarChart3,
  Users,
  ChevronRight,
  XCircle,
  Activity,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as carService from '../../services/carService';
import * as bookingService from '../../services/bookingService';
import * as authService from '../../services/authService';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import AdminBadge from '../../components/admin/AdminBadge';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

const DATE_FILTERS = {
  ALL: 'all',
  TODAY: 'today',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
};

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.ALL);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [carsData, bookingsData, profilesData] = await Promise.all([
          carService.getAllCars(),
          bookingService.getAllBookings(),
          authService.getAllProfiles()
        ]);
        setCars(carsData);
        setBookings(bookingsData);
        setProfiles(profilesData);
        setError(null);
      } catch (err) {
        console.error('[AdminDashboard] Load error:', err);
        setError('Failed to load mission-critical metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Filter Bookings by Date Range
  const filteredBookings = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return bookings.filter(b => {
      const bDate = new Date(b.createdAt); // We'll use createdAt for activity trends
      
      switch (dateFilter) {
        case DATE_FILTERS.TODAY:
          return bDate >= startOfToday;
        case DATE_FILTERS.LAST_7_DAYS:
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return bDate >= sevenDaysAgo;
        case DATE_FILTERS.LAST_30_DAYS:
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return bDate >= thirtyDaysAgo;
        case DATE_FILTERS.THIS_MONTH:
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return bDate >= startOfMonth;
        default:
          return true;
      }
    });
  }, [bookings, dateFilter]);

  // Operational Metrics (Global Context)
  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.available).length;
  const unavailableCars = totalCars - availableCars;
  
  const totalProfiles = profiles.length;
  const adminCount = profiles.filter(p => p.role === 'admin').length;
  const customerCount = totalProfiles - adminCount;

  // Analytics Metrics (Affected by Date Filter)
  const stats = useMemo(() => {
    const data = filteredBookings;
    const totals = {
      all: data.length,
      pending: data.filter(b => b.status === 'pending').length,
      confirmed: data.filter(b => b.status === 'confirmed').length,
      completed: data.filter(b => b.status === 'completed').length,
      cancelled: data.filter(b => b.status === 'cancelled').length,
      rejected: data.filter(b => b.status === 'rejected').length,
      value: {
        total: data.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        confirmed: data.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        completed: data.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        pending: data.filter(b => b.status === 'pending').reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      }
    };
    return totals;
  }, [filteredBookings]);

  // Most Booked Vehicles
  const mostBooked = useMemo(() => {
    const counts = {};
    bookings.forEach(b => {
      if (!b.carId) return;
      if (!counts[b.carId]) {
        counts[b.carId] = { 
          id: b.carId, 
          count: 0, 
          value: 0,
          name: b.car?.name || 'Unknown',
          brand: b.car?.brand || ''
        };
      }
      counts[b.carId].count += 1;
      counts[b.carId].value += (b.totalPrice || 0);
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [bookings]);

  // Recent Items
  const recentBookings = useMemo(() => 
    [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)
  , [bookings]);

  const recentCustomers = useMemo(() => 
    profiles.filter(p => p.role === 'customer')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  , [profiles]);

  const recentlyAddedCars = useMemo(() => 
    [...cars].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4)
  , [cars]);

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const cats = {};
    cars.forEach(c => {
      if (!c.category) return;
      cats[c.category] = (cats[c.category] || 0) + 1;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [cars]);

  if (loading) {
    return (
      <div className="py-24">
        <Loader message="Synchronizing business intelligence data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage message={error} actionLabel="Retry Dashboard Sync" onAction={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Business Insights <BarChart3 className="w-7 h-7 text-[#bef264]" />
          </h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">
            Real-time operational monitoring & analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#11171d] border border-slate-800 p-1 rounded-2xl flex items-center">
            {Object.entries(DATE_FILTERS).map(([key, value]) => (
              <button
                key={value}
                onClick={() => setDateFilter(value)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  dateFilter === value
                    ? 'bg-[#bef264] text-black shadow-lg shadow-[#bef264]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {key.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <div className="h-10 w-px bg-slate-800 hidden sm:block" />
          <Button to="/admin/bookings" variant="primary" size="sm" className="font-bold text-xs h-10">
            Dispatch Queue
          </Button>
        </div>
      </div>

      {/* KPI Overviews - Row 1: Global Context */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Customers"
          value={customerCount}
          subtitle={`${adminCount} Admins registered`}
          icon={Users}
          accent="sky"
        />
        <AdminStatsCard
          title="Fleet Size"
          value={totalCars}
          subtitle={`${availableCars} Available / ${unavailableCars} Unlisted`}
          icon={Car}
          accent="lime"
        />
        <AdminStatsCard
          title="Gross Value"
          value={`$${stats.value.total.toLocaleString()}`}
          subtitle="All-time booked value"
          icon={DollarSign}
          accent="emerald"
        />
        <AdminStatsCard
          title="Dispatch Rate"
          value={`${totalCars > 0 ? Math.round((stats.confirmed / (stats.all || 1)) * 100) : 0}%`}
          subtitle="Booking conversion"
          icon={TrendingUp}
          accent="amber"
        />
      </div>

      {/* KPI Overviews - Row 2: Status & Revenue (Filtered) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="col-span-2 lg:col-span-2 bg-gradient-to-br from-[#bef264]/10 to-transparent border border-[#bef264]/20 p-5 rounded-3xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confirmed Value</p>
            <h4 className="text-3xl font-black text-white tracking-tighter">${stats.value.confirmed.toLocaleString()}</h4>
            <p className="text-[10px] text-[#bef264] font-bold mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Guaranteed revenue stream
            </p>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-[#bef264]/5" />
        </div>

        <AdminStatsCard
          title="Pending"
          value={stats.pending}
          subtitle={`$${stats.value.pending.toLocaleString()} Potential`}
          icon={Clock}
          accent="amber"
          trend={stats.pending > 0 ? 'Requires Action' : 'All Clear'}
          trendPositive={stats.pending === 0}
        />
        <AdminStatsCard
          title="Confirmed"
          value={stats.confirmed}
          subtitle="Active reservations"
          icon={CheckCircle}
          accent="emerald"
        />
        <AdminStatsCard
          title="Completed"
          value={stats.completed}
          subtitle={`$${stats.value.completed.toLocaleString()} Realized`}
          icon={ShieldCheck}
          accent="sky"
        />
        <AdminStatsCard
          title="Failed/Cancelled"
          value={stats.cancelled + stats.rejected}
          subtitle="Bounced reservations"
          icon={XCircle}
          accent="rose"
        />
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Booking Status Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-[#11171d] border border-slate-800 rounded-[32px] p-8 space-y-8">
          <div>
            <h3 className="text-lg font-black text-white">Status Breakdown</h3>
            <p className="text-xs text-slate-500 font-medium">Distribution of reservation states</p>
          </div>

          <div className="space-y-5">
            {[
              { label: 'Confirmed', count: stats.confirmed, color: 'bg-[#bef264]', text: 'text-[#bef264]' },
              { label: 'Pending', count: stats.pending, color: 'bg-amber-400', text: 'text-amber-400' },
              { label: 'Completed', count: stats.completed, color: 'bg-sky-400', text: 'text-sky-400' },
              { label: 'Cancelled', count: stats.cancelled, color: 'bg-slate-600', text: 'text-slate-400' },
              { label: 'Rejected', count: stats.rejected, color: 'bg-red-500', text: 'text-red-400' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                  <span className={item.text}>{item.label}</span>
                  <span className="text-white">{item.count} ({stats.all > 0 ? Math.round((item.count / stats.all) * 100) : 0}%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${stats.all > 0 ? (item.count / stats.all) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
             <p className="text-[10px] text-slate-500 italic">
               * Data reflects the selected period: {dateFilter.replace(/_/g, ' ')}
             </p>
          </div>
        </div>

        {/* Booking Activity Trend (8 cols) */}
        <div className="lg:col-span-8 bg-[#11171d] border border-slate-800 rounded-[32px] p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Booking Activity Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Daily volume of reservation requests</p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#bef264]" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Flow</span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-1 sm:gap-2">
            {(() => {
              // Simple daily grouping for the trend
              const now = new Date();
              let days = 14; // Default
              
              if (dateFilter === DATE_FILTERS.LAST_7_DAYS) days = 7;
              else if (dateFilter === DATE_FILTERS.LAST_30_DAYS) days = 30;
              else if (dateFilter === DATE_FILTERS.TODAY) days = 1;
              else if (dateFilter === DATE_FILTERS.THIS_MONTH) {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                days = Math.floor((now - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;
              }
              
              const trendData = [];
              for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(now.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const count = filteredBookings.filter(b => b.createdAt && b.createdAt.startsWith(dateStr)).length;
                trendData.push({ label: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), count });
              }

              const maxCount = Math.max(...trendData.map(d => d.count), 5);

              return trendData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div 
                    className="w-full bg-slate-800 rounded-t-lg transition-all duration-500 group-hover:bg-[#bef264]/50 relative"
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
                  >
                    {d.count > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#bef264] text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg transition-opacity pointer-events-none">
                        {d.count}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Categories (8 cols) moved below or merged */}
      </div>

      {/* Analytics Visualization Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Most Booked Vehicles (6 cols) */}
        <div className="lg:col-span-6 bg-[#11171d] border border-slate-800 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Top Performers</h3>
            <Link to="/admin/cars" className="text-[10px] font-black text-[#bef264] uppercase tracking-widest hover:underline">Full Fleet →</Link>
          </div>
          
          <div className="space-y-4">
            {mostBooked.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs italic">No booking activity recorded yet.</div>
            ) : (
              mostBooked.map((car, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-[#bef264] font-black border border-slate-700 group-hover:border-[#bef264]/50 transition-all shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{car.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{car.brand} • {car.count} Bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#bef264]">${car.value.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-600 font-bold">Total Value</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-[#11171d] border border-slate-800 rounded-[32px] p-8 space-y-6">
          <h3 className="text-lg font-black text-white">Fleet Composition</h3>
          <div className="space-y-4">
            {categoryStats.map(([cat, count], i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                    <span>{cat}</span>
                    <span className="text-white">{count} Units</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full">
                    <div 
                      className="h-full bg-sky-500 rounded-full" 
                      style={{ width: `${(count / totalCars) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {categoryStats.length === 0 && (
             <div className="py-12 text-center text-slate-600 text-xs italic">No vehicles categorized in fleet.</div>
          )}
        </div>
      </div>

      {/* Operational Activity Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Recent Bookings (8 cols) */}
        <div className="xl:col-span-8 bg-[#11171d] border border-slate-800 rounded-[32px] p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Operational Activity</h3>
              <p className="text-xs text-slate-500 font-medium tracking-tight">Latest system-wide reservation traffic</p>
            </div>
            <Link to="/admin/bookings" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
              Audit All Bookings
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-4">
                  <th className="pb-4 px-2">Customer</th>
                  <th className="pb-4 px-2">Vehicle</th>
                  <th className="pb-4 px-2">Duration</th>
                  <th className="pb-4 px-2">Total</th>
                  <th className="pb-4 px-2">Status</th>
                  <th className="pb-4 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#151c22]/50 transition-colors group">
                    <td className="py-4 px-2">
                      <p className="font-bold text-white group-hover:text-[#bef264] transition-colors">{b.customer?.fullName || 'Anonymous'}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{b.customer?.email}</p>
                    </td>
                    <td className="py-4 px-2">
                      <p className="font-bold text-slate-300">{b.car?.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{b.car?.brand}</p>
                    </td>
                    <td className="py-4 px-2">
                      <p className="text-xs text-slate-400 font-bold">{b.totalDays} Days</p>
                      <p className="text-[10px] text-slate-600">{b.startDate}</p>
                    </td>
                    <td className="py-4 px-2">
                      <p className="font-black text-white">${b.totalPrice.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-2">
                      <AdminBadge status={b.status} />
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Link to="/admin/bookings" className="p-2 hover:bg-[#bef264] hover:text-black rounded-lg transition-all inline-block">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Context (4 cols) */}
        <div className="xl:col-span-4 space-y-8">
          {/* Recent Customers */}
          <div className="bg-[#11171d] border border-slate-800 rounded-[32px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">New Customers</h3>
              <Link to="/admin/users" className="text-[10px] font-black text-[#bef264] uppercase tracking-widest hover:underline">Directory →</Link>
            </div>
            <div className="space-y-5">
              {recentCustomers.map((p, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-white">
                    {p.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.full_name}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{p.email}</p>
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase">
                    {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Added Cars */}
          <div className="bg-[#11171d] border border-slate-800 rounded-[32px] p-8 space-y-6">
            <h3 className="text-lg font-black text-white">Fleet Expansion</h3>
            <div className="grid grid-cols-2 gap-3">
              {recentlyAddedCars.map((car, i) => (
                <div key={i} className="bg-[#161f26] border border-slate-800 p-3 rounded-2xl space-y-2">
                  <div className="aspect-video w-full bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                    {car.image ? (
                      <img src={car.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-600 uppercase">No Image</div>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white truncate">{car.name}</p>
                    <p className="text-[9px] text-[#bef264] font-black uppercase tracking-tighter">${car.pricePerDay}/Day</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
