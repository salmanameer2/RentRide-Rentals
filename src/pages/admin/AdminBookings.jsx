import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  User,
  Car,
  MapPin,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as bookingService from '../../services/bookingService';
import AdminBadge from '../../components/admin/AdminBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

export default function AdminBookings() {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);

  async function loadBookings() {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('[AdminBookings] Load error:', err);
      setError('System failure: Unable to retrieve fleet dispatch records. Please verify database connectivity.');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadBookings();
  }, []);

  // Status Tabs
  const statusTabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'];

  // Filter & Search Logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customer?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.car?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setStatusUpdateError(null);
    setIsDetailsModalOpen(true);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setActionLoading(true);
      setStatusUpdateError(null);
      await bookingService.updateBookingStatus(bookingId, newStatus);
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus.toLowerCase() }));
      }
      await loadBookings();
    } catch (err) {
      console.error('[AdminBookings] Status update error:', err);
      setStatusUpdateError(err.message || 'Status transition could not be processed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="py-24">
        <Loader message="Fetching fleet dispatch records..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-[#11171d] border border-red-500/20 rounded-3xl p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Protocol Error</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
        <Button variant="primary" onClick={loadBookings} className="px-8">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Booking Operations & Dispatch
          </h2>
          <p className="text-xs text-slate-400">
            Audit, confirm, and update customer rental reservations across the entire fleet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono bg-[#11171d] px-3 py-1.5 rounded-xl border border-slate-800">
            Total Records: <strong className="text-white">{bookings.length}</strong>
          </span>
        </div>
      </div>

      {/* Control Bar: Search & Status Tabs */}
      <div className="bg-[#11171d] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, customer name, car..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#bef264]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#bef264] text-black font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#161f26]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="bg-[#11171d] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#161f26] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Reserved Vehicle</th>
                <th className="py-3.5 px-4">Schedule</th>
                <th className="py-3.5 px-4">Rate & Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No booking records match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#151c22] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {b.id}
                      <div className="text-[10px] text-slate-500 font-sans">
                        Req: {b.createdAt}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{b.customer?.fullName || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {b.customer?.email || 'N/A'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={b.car?.image}
                          alt={b.car?.name}
                          className="w-10 h-7 object-cover rounded-md bg-slate-800"
                        />
                        <div>
                          <div className="font-semibold text-white">{b.car?.name}</div>
                          <div className="text-[10px] text-slate-400">{b.car?.brand}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-white">
                        {b.startDate} → {b.endDate}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {b.totalDays} days ({b.pickupLocation})
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-[#bef264] text-sm">
                        ${b.totalPrice}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ${b.pricePerDay}/day
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <AdminBadge status={b.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status.toLowerCase() === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(b.id, 'Confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#bef264] border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Authorize & Confirm"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(b.id, 'Rejected')}
                              className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Reject Booking"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {b.status.toLowerCase() === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(b.id, 'Completed')}
                            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenDetails(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#1a232b] hover:bg-[#222e38] border border-slate-700/80 cursor-pointer"
                          title="View Full Booking Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Booking Dossier — ${selectedBooking.id}`}
          size="md"
        >
          <div className="space-y-5 text-xs">
            {/* Status Strip */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#161f26] border border-slate-800">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Current Operational State
              </span>
              <AdminBadge status={selectedBooking.status} />
            </div>

            {/* Vehicle Card */}
            <div className="p-4 rounded-2xl bg-[#161f26] border border-slate-800 flex items-center gap-4">
              <img
                src={selectedBooking.car?.image}
                alt={selectedBooking.car?.name}
                className="w-24 h-16 object-cover rounded-xl bg-slate-800"
              />
              <div>
                <div className="text-[11px] text-slate-400">
                  {selectedBooking.car?.brand}
                </div>
                <div className="text-base font-bold text-white">
                  {selectedBooking.car?.name}
                </div>
                <div className="text-xs text-[#bef264] font-semibold mt-0.5">
                  Daily Rate: ${selectedBooking.pricePerDay} / day
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#161f26] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Customer
                </span>
                <div className="font-bold text-white text-sm">
                  {selectedBooking.customer?.fullName || 'N/A'}
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {selectedBooking.customer?.email || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161f26] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Pickup Location
                </span>
                <div className="font-bold text-white text-sm">
                  {selectedBooking.pickupLocation}
                </div>
                <div className="text-slate-400 text-[11px]">Handover station</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161f26] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Schedule Range
                </span>
                <div className="font-bold text-white">
                  {selectedBooking.startDate} to {selectedBooking.endDate}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Duration: {selectedBooking.totalDays} rental days
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161f26] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Financial Settlement
                </span>
                <div className="font-black text-[#bef264] text-base">
                  ${selectedBooking.totalPrice} USD
                </div>
                <div className="text-slate-400 text-[11px]">
                  Payment method: Standard billing
                </div>
              </div>
            </div>

            {/* Quick Status Control Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <span className="text-slate-400 text-[11px] uppercase font-bold tracking-widest">
                Operational Dispatch Control:
              </span>

              {statusUpdateError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{statusUpdateError}</span>
                </div>
              )}

              {['cancelled', 'rejected', 'completed'].includes(selectedBooking.status?.toLowerCase()) ? (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-slate-200 font-semibold block">Finalized Reservation</span>
                    This reservation is in a terminal state (<span className="text-[#bef264] font-medium capitalize">{selectedBooking.status}</span>) and its operational status cannot be altered.
                  </div>
                </div>
              ) : selectedBooking.status?.toLowerCase() === 'pending' ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedBooking.id, 'Confirmed')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-[#bef264] border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedBooking.id, 'Rejected')}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedBooking.id, 'Cancelled')}
                    className="px-3 py-1.5 rounded-xl bg-slate-500/20 text-slate-300 border border-slate-500/40 text-xs font-bold hover:bg-slate-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Cancel'}
                  </button>
                </div>
              ) : selectedBooking.status?.toLowerCase() === 'confirmed' ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedBooking.id, 'Completed')}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold hover:bg-sky-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Mark Completed'}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedBooking.id, 'Cancelled')}
                    className="px-3 py-1.5 rounded-xl bg-slate-500/20 text-slate-300 border border-slate-500/40 text-xs font-bold hover:bg-slate-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Cancel'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
