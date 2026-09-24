import React, { useState, useEffect, useMemo } from 'react';
import { Search, Shield, Calendar, Mail, Phone, Eye, Filter, ArrowUpDown, User, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as bookingService from '../../services/bookingService';
import * as authService from '../../services/authService';
import AdminBadge from '../../components/admin/AdminBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Loader from '../../components/Loader';

export default function AdminUsers() {
  const { user: currentAdmin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all, customer, admin
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name_asc, name_desc, bookings_desc
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profilesData, bookingsData] = await Promise.all([
        authService.getAllProfiles(),
        bookingService.getAllBookings()
      ]);

      // Normalize profile keys for frontend consistency if needed
      // (authService.getAllProfiles already returns data as is from DB)
      setProfiles(profilesData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('[AdminUsers] Load error:', err);
      setError('Failed to load user and booking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group bookings by user for efficient lookup
  const bookingsByUser = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const uid = b.userId;
      if (!map[uid]) map[uid] = [];
      map[uid].push(b);
    });
    return map;
  }, [bookings]);

  // Derived stats for each user
  const userStats = useMemo(() => {
    const stats = {};
    profiles.forEach(p => {
      const uBookings = bookingsByUser[p.id] || [];
      stats[p.id] = {
        total: uBookings.length,
        pending: uBookings.filter(b => b.status === 'pending').length,
        confirmed: uBookings.filter(b => b.status === 'confirmed').length,
        completed: uBookings.filter(b => b.status === 'completed').length,
        cancelled: uBookings.filter(b => b.status === 'cancelled').length,
        rejected: uBookings.filter(b => b.status === 'rejected').length,
      };
    });
    return stats;
  }, [profiles, bookingsByUser]);

  // Filtering & Searching
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      // Role Filter
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;

      // Search Term
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        p.full_name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        (p.phone && p.phone.includes(term));
      
      return matchesSearch;
    });
  }, [profiles, roleFilter, searchTerm]);

  // Sorting
  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name_asc':
          return a.full_name.localeCompare(b.full_name);
        case 'name_desc':
          return b.full_name.localeCompare(a.full_name);
        case 'bookings_desc':
          return (userStats[b.id]?.total || 0) - (userStats[a.id]?.total || 0);
        case 'bookings_asc':
          return (userStats[a.id]?.total || 0) - (userStats[b.id]?.total || 0);
        default:
          return 0;
      }
    });
  }, [filteredProfiles, sortBy, userStats]);

  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader message="Synthesizing customer database..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl inline-block max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Access Error</h3>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Button onClick={loadData} className="flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            User Management <Shield className="w-5 h-5 text-[#bef264]" />
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Manage customers and audit administrative privileges
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#11171d] border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Profiles</p>
              <p className="text-sm font-black text-white">{profiles.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Active Customers</p>
              <p className="text-sm font-black text-[#bef264]">
                {profiles.filter(p => p.role === 'customer').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#11171d] border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#bef264] transition-all"
          />
        </div>

        <div className="lg:col-span-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 bg-[#11171d] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#bef264] appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div className="lg:col-span-4 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-[#11171d] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#bef264] appearance-none cursor-pointer"
          >
            <option value="newest">Sort by: Newest First</option>
            <option value="oldest">Sort by: Oldest First</option>
            <option value="name_asc">Sort by: Name (A-Z)</option>
            <option value="name_desc">Sort by: Name (Z-A)</option>
            <option value="bookings_desc">Sort by: Most Bookings</option>
            <option value="bookings_asc">Sort by: Fewest Bookings</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#11171d] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161f26]/50 border-b border-slate-800">
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Customer</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Role</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Bookings</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Joined</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[2px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sortedProfiles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">
                        {searchTerm ? `No users match "${searchTerm}"` : "No customers found in database."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-[#151c22] transition-colors group">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            p.full_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-[#bef264] transition-colors">{p.full_name}</p>
                          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {p.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        p.role === 'admin' 
                          ? 'bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {p.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {p.role}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-slate-800 rounded-md text-[11px] font-bold text-white min-w-[32px] text-center">
                          {userStats[p.id]?.total || 0}
                        </div>
                        {userStats[p.id]?.total > 0 && (
                          <div className="flex -space-x-1.5">
                            {[...Array(Math.min(userStats[p.id]?.total, 3))].map((_, i) => (
                              <div key={i} className="w-4 h-1.5 rounded-full bg-[#bef264]/40 border border-black" />
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(p.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => handleOpenDetails(p)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a232b] border border-slate-700 rounded-xl text-xs font-bold text-white hover:bg-white hover:text-black transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Customer Profile & History"
          size="lg"
        >
          <div className="space-y-8">
            {/* User Profile Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover rounded-[22px]" />
                ) : (
                  <span className="text-4xl font-black text-white">{selectedUser.full_name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-white leading-none">{selectedUser.full_name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      selectedUser.role === 'admin' ? 'bg-[#bef264] text-black' : 'bg-blue-500 text-white'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-500" /> {selectedUser.email}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#bef264]" /> 
                      {selectedUser.phone || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Created</p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#bef264]" /> 
                      {new Date(selectedUser.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total', count: userStats[selectedUser.id]?.total, color: 'text-white', icon: ArrowUpDown },
                { label: 'Pending', count: userStats[selectedUser.id]?.pending, color: 'text-amber-400', icon: Clock },
                { label: 'Confirmed', count: userStats[selectedUser.id]?.confirmed, color: 'text-blue-400', icon: CheckCircle },
                { label: 'Completed', count: userStats[selectedUser.id]?.completed, color: 'text-[#bef264]', icon: CheckCircle },
                { label: 'Cancelled', count: userStats[selectedUser.id]?.cancelled, color: 'text-slate-400', icon: XCircle },
                { label: 'Rejected', count: userStats[selectedUser.id]?.rejected, color: 'text-red-400', icon: AlertCircle },
              ].map((stat, i) => (
                <div key={i} className="bg-[#11171d] border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{stat.label}</p>
                  <p className={`text-xl font-black ${stat.color}`}>{stat.count || 0}</p>
                </div>
              ))}
            </div>

            {/* Booking History Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Recent Booking Activity</h4>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  Showing last 10 records
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {(bookingsByUser[selectedUser.id] || []).length === 0 ? (
                  <div className="py-12 text-center text-slate-500 italic text-sm">
                    This user has not initiated any rental reservations yet.
                  </div>
                ) : (
                  [...(bookingsByUser[selectedUser.id] || [])]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map((b) => (
                      <div key={b.id} className="bg-[#11171d] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 group">
                        <div className="w-full sm:w-20 h-14 bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-700">
                          {b.car?.image ? (
                            <img src={b.car.image} alt={b.car.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 uppercase font-black">No Image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <p className="font-bold text-white group-hover:text-[#bef264] transition-colors truncate">{b.car?.name || 'Vehicle Record Missing'}</p>
                          <p className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-center sm:text-right shrink-0">
                          <p className="font-black text-[#bef264]">${b.totalPrice.toLocaleString()}</p>
                          <AdminBadge status={b.status} />
                        </div>
                        <div className="w-px h-8 bg-slate-800 hidden sm:block mx-2" />
                        <div className="shrink-0">
                           <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center sm:text-right">Reference ID</p>
                           <p className="text-[10px] font-mono text-slate-400 font-bold">{b.id}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <p className="text-[10px] text-slate-500 italic max-w-[280px]">
                Authentication and role security are managed by Supabase. Profile editing is restricted to verified users.
              </p>
              <Button onClick={() => setIsDetailsModalOpen(false)}>
                Close Dashboard
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
