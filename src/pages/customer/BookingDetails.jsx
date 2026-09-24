import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Car, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
import * as bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/Container';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        const data = await bookingService.getBookingById(id);
        
        // Ownership protection: Check if this booking belongs to the current user
        // Note: Supabase RLS should also handle this, but frontend check adds clarity
        if (data && data.userId !== user?.id) {
          setError('Access Denied: You do not have permission to view this booking.');
          setBooking(null);
        } else {
          setBooking(data);
          setError(null);
        }
      } catch (err) {
        console.error('[BookingDetails] Load error:', err);
        setError('We couldn\'t load this booking record. It may not exist or you might not have permission to view it.');
      } finally {
        setLoading(false);
      }
    }

    if (id && user) {
      loadBooking();
    }
  }, [id, user]);

  const handleConfirmCancel = async () => {
    if (booking) {
      setIsCancelling(true);
      try {
        await bookingService.cancelBooking(booking.id);
        // Reload booking data to show updated status
        const updated = await bookingService.getBookingById(booking.id);
        setBooking(updated);
        setIsCancelModalOpen(false);
      } catch (err) {
        console.error('[BookingDetails] Cancellation error:', err);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const isCancelable = booking && (booking.status === 'pending' || booking.status === 'confirmed');

  if (loading) {
    return (
      <div className="py-24 bg-[#0b0f12] min-h-screen">
        <Loader message="Accessing secure reservation records..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <Container className="py-24 text-center">
        <EmptyState
          title={error ? "Access Restricted" : "Booking Not Found"}
          description={error || "The booking you are looking for could not be located in your history."}
          actionLabel="Back to My Bookings"
          actionTo="/bookings"
        />
      </Container>
    );
  }

  return (
    <div className="py-10 sm:py-14 bg-[#0b0f12] text-white min-h-[calc(100vh-140px)]">
      <Container className="max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/dashboard" className="hover:text-[#bef264] transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/bookings" className="hover:text-[#bef264] transition-colors">My Bookings</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">#{booking.id.slice(0, 8)}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/bookings')}
              className="w-10 h-10 rounded-2xl bg-[#12181d] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Reservation Details
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-mono text-slate-500">ID: {booking.id}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    booking.status === 'confirmed'
                      ? 'bg-emerald-500/10 text-[#bef264] border-emerald-500/30'
                      : booking.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : booking.status === 'completed'
                      ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
          
          {isCancelable && (
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => setIsCancelModalOpen(true)}
              className="font-bold sm:self-center"
            >
              Cancel Reservation
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Vehicle & Rental Info */}
          <div className="lg:col-span-8 space-y-6">
            {/* Vehicle Card */}
            <div className="bg-[#12181d] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-[#bef264] shrink-0">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Selected Vehicle</div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {booking.car?.brand} {booking.car?.name}
                      </h2>
                    </div>
                  </div>
                  <Link 
                    to={`/fleet/${booking.carId}`} 
                    className="text-xs font-bold text-[#bef264] hover:underline"
                  >
                    View Specs
                  </Link>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-[16/8]">
                  <img
                    src={booking.car?.image}
                    alt={booking.car?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Rental & Location Card */}
            <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#bef264]" />
                Rental Schedule & Location
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pick Up Date</div>
                      <div className="text-base font-bold text-white">{new Date(booking.startDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Available for handover after 09:00 AM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Station / Location</div>
                      <div className="text-base font-bold text-white">{booking.pickupLocation}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Premium terminal delivery included</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Return Date</div>
                      <div className="text-base font-bold text-white">{new Date(booking.endDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Must be returned before 06:00 PM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-[#bef264] shrink-0">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duration</div>
                      <div className="text-base font-bold text-white">{booking.totalDays} Total Rental Days</div>
                      <div className="text-xs text-slate-500 mt-0.5">Full insurance coverage applied</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {booking.notes && (
                <div className="mt-8 pt-6 border-t border-slate-800/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Driver Notes / Requirements</div>
                  <p className="text-xs text-slate-400 bg-[#182128] p-4 rounded-2xl border border-slate-800 italic">
                    "{booking.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Price Snapshot Card */}
            <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#bef264]" />
                Price Breakdown
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Daily Rental Rate</span>
                  <span className="font-bold text-white">${booking.pricePerDay}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-bold text-white">{booking.totalDays} Days</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Insurance & Protection</span>
                  <span className="font-bold text-emerald-500">Included</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Premium Handover</span>
                  <span className="font-bold text-emerald-500">Free</span>
                </div>
                
                <div className="pt-4 border-t border-slate-800 flex items-end justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Amount Paid</div>
                  <div className="text-3xl font-black text-[#bef264] leading-none">
                    ${booking.totalPrice}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="md" 
                  className="w-full text-xs font-bold border-slate-700"
                  onClick={() => window.print()}
                >
                  Download Receipt (PDF)
                </Button>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] text-slate-400 leading-relaxed">
                  Price snapshot captured at the time of reservation. Standard cancellation policy applies based on your status tier.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel This Reservation?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 text-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-xs leading-relaxed">
              Are you sure you want to cancel your reservation for the <strong>{booking.car?.brand} {booking.car?.name}</strong>? This action is immediate and the vehicle will be released to the general fleet.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmCancel}
              loading={isCancelling}
              disabled={isCancelling}
              className="font-bold"
            >
              {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isCancelling}
            >
              Keep My Reservation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
