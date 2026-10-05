import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { Room, RoomBooking, CreateRoomBookingPayload } from '../../types';
import { useAuth, useToast } from '../../hooks';
import { roomsApi } from '../../lib/api/rooms';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import {
  X,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  CreditCard,
  Wallet,
} from 'lucide-react';

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: RoomBooking) => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getDefaultCheckIn = () => new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0];
const getDefaultCheckOut = () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0];

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { user, setIntendedDestination } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [minDate] = useState<string>(getTodayDateString);
  const [checkIn, setCheckIn] = useState<string>(getDefaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(getDefaultCheckOut);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<RoomBooking | null>(null);
  const [paymentOption, setPaymentOption] = useState<'razorpay' | 'pay_at_hotel'>('razorpay');

  if (!room) return null;

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    if (new Date(checkOut) <= new Date(val)) {
      const nextDay = new Date(new Date(val).getTime() + 1000 * 60 * 60 * 24)
        .toISOString()
        .split('T')[0];
      setCheckOut(nextDay);
    }
  };

  // Calculate nights
  const checkInTime = new Date(checkIn).getTime();
  const checkOutTime = new Date(checkOut).getTime();
  const nights = Math.max(1, Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)) || 1);

  const subtotal = room.price_per_night * nights;
  const tax = Math.round(subtotal * 0.18); // 18% luxury hospitality GST
  const total = subtotal + tax;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Authentication Guard: require login to actually place the booking
    if (!user) {
      setIntendedDestination(`/rooms?book=${room.id}`);
      toast({
        title: 'Sign In Required',
        description: 'Please sign into your JAS Hotel guest profile to confirm this reservation.',
        type: 'info',
      });
      onClose();
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateRoomBookingPayload = {
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        guests_adults: adults,
        guests_children: children,
        special_requests: specialRequests.trim() || undefined,
      };

      const booking = await roomsApi.createBooking(payload);

      if (paymentOption === 'razorpay') {
        const { initiateRazorpayPayment } = await import('../../lib/razorpay');
        await initiateRazorpayPayment({
          referenceId: booking.id,
          type: 'room_booking',
          title: room.name,
          description: `${booking.nights} Nights Sanctuary Stay`,
          amount: booking.total,
          user,
          onSuccess: (paymentResult) => {
            const updatedBooking = {
              ...booking,
              payment_status: 'Paid' as const,
              payment_method: 'Razorpay',
              razorpay_payment_id: paymentResult.transaction_id,
            };
            setConfirmedBooking(updatedBooking);
            if (onBookingSuccess) {
              onBookingSuccess(updatedBooking);
            }
            toast({
              title: 'Sanctuary Reserved & Paid',
              description: `Payment settled via Razorpay. Reservation #${booking.id} confirmed.`,
              type: 'success',
            });
            setIsSubmitting(false);
          },
          onError: (payErr) => {
            setConfirmedBooking(booking);
            if (onBookingSuccess) {
              onBookingSuccess(booking);
            }
            toast({
              title: 'Reservation Held (Payment Pending)',
              description: payErr?.message || 'Razorpay checkout closed. You can settle upon check-in.',
              type: 'info',
            });
            setIsSubmitting(false);
          },
        });
      } else {
        setConfirmedBooking(booking);
        if (onBookingSuccess) {
          onBookingSuccess(booking);
        }
        toast({
          title: 'Reservation Confirmed',
          description: `Booking #${booking.id} confirmed for ${room.name}. Payment due upon check-in.`,
          type: 'success',
        });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast({
        title: 'Booking Error',
        description: err.message || 'Unable to finalize reservation.',
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-[#0A0A09]/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#FAF7F0] border border-[#E6DBCA] rounded-2xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E6DBCA]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#886E4B] font-semibold block">
                  JAS Hotel Sanctuary Reservation
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#121211] font-light mt-0.5">
                  {confirmedBooking ? 'Reservation Confirmed' : room.name}
                </h2>
              </div>
              <button
                onClick={handleResetAndClose}
                className="p-1.5 text-[#7A766C] hover:text-[#121211] rounded-lg hover:bg-[#F3ECE0] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Receipt View */}
            {confirmedBooking ? (
              <div className="py-6 space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#886E4B] mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-3xl font-light text-[#121211]">
                    Your suite is reserved.
                  </h3>
                  <p className="text-xs text-[#7A766C] font-sans max-w-md mx-auto leading-relaxed">
                    We look forward to welcoming you to JAS Hotel on Marine Drive, Mumbai. An official confirmation email has been logged to your guest profile.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#FDFCF9] border border-[#E6DBCA] text-left space-y-3 text-xs font-sans">
                  <div className="flex justify-between pb-2 border-b border-[#F3ECE0]">
                    <span className="text-[#7A766C]">Reservation Number</span>
                    <span className="font-mono font-bold text-[#121211]">{confirmedBooking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A766C]">Dates</span>
                    <span className="font-medium text-[#121211]">
                      {confirmedBooking.check_in} → {confirmedBooking.check_out} ({confirmedBooking.nights} Nights)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A766C]">Occupancy</span>
                    <span className="font-medium text-[#121211]">
                      {confirmedBooking.guests_adults} Adults, {confirmedBooking.guests_children} Children
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#F3ECE0]">
                    <span className="font-serif text-base text-[#121211]">Total Charged (Incl. 18% GST)</span>
                    <span className="font-mono text-base font-bold text-[#886E4B]">
                      {formatCurrency(confirmedBooking.total)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleResetAndClose();
                      navigate('/account');
                    }}
                  >
                    View in Account
                  </Button>
                  <Button variant="outline" onClick={handleResetAndClose}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleConfirmBooking} className="mt-5 space-y-6">
                {/* Room summary banner */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FDFCF9] border border-[#E6DBCA]">
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="w-20 h-16 rounded-lg object-cover border border-[#E6DBCA] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider text-[#886E4B] font-medium">
                      {room.category} • {room.size_sqft} sq ft
                    </p>
                    <p className="text-sm font-medium text-[#121211] truncate">{room.view}</p>
                    <p className="font-mono text-xs font-semibold text-[#886E4B] mt-0.5">
                      {formatCurrency(room.price_per_night)} <span className="text-[#7A766C] font-normal">/ night</span>
                    </p>
                  </div>
                </div>

                {/* Dates Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-checkin" className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-1.5">
                      Check-In Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9A497]" />
                      <input
                        id="modal-checkin"
                        type="date"
                        required
                        min={minDate}
                        value={checkIn}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                        className="w-full text-xs bg-[#FDFCF9] border border-[#E6DBCA] rounded-xl pl-9 pr-3 py-2.5 text-[#121211] focus:border-[#C5A880] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="modal-checkout" className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-1.5">
                      Check-Out Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9A497]" />
                      <input
                        id="modal-checkout"
                        type="date"
                        required
                        min={checkIn}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-xs bg-[#FDFCF9] border border-[#E6DBCA] rounded-xl pl-9 pr-3 py-2.5 text-[#121211] focus:border-[#C5A880] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-adults" className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-1.5">
                      Adults
                    </label>
                    <select
                      id="modal-adults"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full text-xs bg-[#FDFCF9] border border-[#E6DBCA] rounded-xl px-3 py-2.5 text-[#121211] focus:border-[#C5A880] outline-none"
                    >
                      {Array.from({ length: room.max_adults }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? 'Adult' : 'Adults'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modal-children" className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-1.5">
                      Children
                    </label>
                    <select
                      id="modal-children"
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full text-xs bg-[#FDFCF9] border border-[#E6DBCA] rounded-xl px-3 py-2.5 text-[#121211] focus:border-[#C5A880] outline-none"
                    >
                      {Array.from({ length: room.max_children + 1 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i} {i === 1 ? 'Child' : 'Children'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label htmlFor="modal-requests" className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-1.5">
                    Concierge & Special Requests
                  </label>
                  <textarea
                    id="modal-requests"
                    rows={2}
                    placeholder="e.g. Airport Rolls-Royce pickup, feather pillows, sea-facing high floor..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full text-xs bg-[#FDFCF9] border border-[#E6DBCA] rounded-xl px-3.5 py-2 text-[#121211] placeholder:text-[#A9A497] focus:border-[#C5A880] outline-none resize-none"
                  />
                </div>

                {/* Payment Option Selector */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-1.5">
                    Reservation Deposit & Settlement
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('razorpay')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        paymentOption === 'razorpay'
                          ? 'border-[#C5A880] bg-[#F8F5EE] ring-2 ring-[#C5A880]/20'
                          : 'border-[#E6DBCA] bg-[#FDFCF9] hover:bg-[#F8F5EE]'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-[#C5A880]/20 text-[#886E4B] shrink-0 mt-0.5">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-[#121211]">Razorpay Test GW</span>
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-900 font-bold">
                            Instant
                          </span>
                        </div>
                        <p className="text-[10px] text-[#7A766C] mt-0.5">
                          Cards, UPI, NetBanking online settlement.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentOption('pay_at_hotel')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        paymentOption === 'pay_at_hotel'
                          ? 'border-[#C5A880] bg-[#F8F5EE] ring-2 ring-[#C5A880]/20'
                          : 'border-[#E6DBCA] bg-[#FDFCF9] hover:bg-[#F8F5EE]'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-[#E6DBCA]/40 text-[#7A766C] shrink-0 mt-0.5">
                        <Wallet className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#121211]">Pay at Check-In</span>
                        <p className="text-[10px] text-[#7A766C] mt-0.5">
                          Guarantee suite reservation, settle tariff at reception.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="p-4 rounded-xl bg-[#F8F5EE] border border-[#E6DBCA] space-y-2 text-xs font-sans text-[#7A766C]">
                  <div className="flex justify-between">
                    <span>{formatCurrency(room.price_per_night)} × {nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                    <span className="font-mono text-[#121211]">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Luxury Hospitality GST (18%)</span>
                    <span className="font-mono text-[#121211]">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#121211] pt-2 border-t border-[#E6DBCA]">
                    <span className="font-serif text-base">Total Estimated Stay</span>
                    <span className="font-mono text-base text-[#886E4B]">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Authentication Notice if Guest is Not Logged In */}
                {!user ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-900 text-xs">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Authentication Required to Book</p>
                      <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                        You can configure dates and explore this suite freely. To place the actual reservation, you will be prompted to sign into your stay profile.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-emerald-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Booking as <strong>{user.name}</strong> ({user.email})</span>
                  </div>
                )}

                {/* Submit Action */}
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full text-xs uppercase tracking-widest font-semibold"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {user ? 'Confirm & Book Reservation' : 'Sign In & Book Suite'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
