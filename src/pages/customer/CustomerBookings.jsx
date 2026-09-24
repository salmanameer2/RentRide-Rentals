import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Car,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as bookingService from '../../services/bookingService';
import Container from '../../components/Container';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

export default function CustomerBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('[CustomerBookings] Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const handleOpenCancel = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedBooking) {
      setIsCancelling(true);
      try {
        await bookingService.cancelBooking(selectedBooking.id);
        setIsCancelModalOpen(false);
        await loadBookings();
      } catch (err) {
        console.error('[CustomerBookings] Cancellation error:', err);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="py-24 bg-[#0b0f12] min-h-screen">
        <Loader message="Fetching your reservation dossier..." />
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 bg-[#0b0f12] text-white min-h-[calc(100vh-140px)]">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Rental Reservations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review active booking schedules, handover locations, and past rental receipts.
            </p>
          </div>
          <Button variant="primary" size="sm" to="/fleet" className="font-bold">
            Explore More Cars
          </Button>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              You haven't reserved any vehicles yet. Explore our premier fleet to book your next ride.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="sm" to="/fleet" className="font-bold">
                Browse Fleet
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 transition-all hover:border-slate-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Car image */}
                  <div className="md:col-span-3 rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] border border-slate-800">
                    <img
                      src={b.car?.image}
                      alt={b.car?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Main Info */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        #{b.id.slice(0, 8)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-[#bef264] border-emerald-500/30'
                            : b.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : b.status === 'completed'
                            ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{b.car?.brand} {b.car?.name}</h3>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#bef264]" />
                        <span>{b.startDate} → {b.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#bef264]" />
                        <span className="truncate">{b.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reserved on {new Date(b.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Actions */}
                  <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-3">
                    <div>
                      <div className="text-xs text-slate-400 md:text-right">Total Price</div>
                      <div className="text-2xl font-black text-[#bef264] md:text-right">
                        ${b.totalPrice}
                      </div>
                      <div className="text-[10px] text-slate-500 md:text-right italic">
                        ${b.pricePerDay}/day for {b.totalDays} days
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancel(b)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <Link
                        to={`/bookings/${b.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#182128] hover:bg-[#202b33] border border-slate-700 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {selectedBooking && (
          <Modal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            title={`Cancel Reservation`}
            size="sm"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold block text-amber-300 mb-1">
                    Are you sure you want to cancel?
                  </span>
                  Your reservation for the <strong className="text-white">{selectedBooking.car?.brand} {selectedBooking.car?.name}</strong> will be marked cancelled and the vehicle will be returned to the available fleet.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isCancelling}
                >
                  Keep Reservation
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmCancel}
                  className="font-bold"
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </Container>
    </div>
  );
}
