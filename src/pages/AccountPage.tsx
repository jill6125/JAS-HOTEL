import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, useToast } from '../hooks';
import { ordersApi } from '../lib/api/orders';
import { roomsApi } from '../lib/api/rooms';
import type { Order, RoomBooking } from '../types';
import { formatCurrency, formatDate, getStatusStyle } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs, type TabItem } from '../components/ui/Tabs';
import {
  User,
  LogOut,
  Bell,
  UtensilsCrossed,
  Clock,
  ArrowRight,
  RefreshCw,
  Calendar,
  Building2,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'rooms' | 'dining'>('rooms');
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Cancellation states
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<RoomBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.warn('Failed to fetch user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const data = await roomsApi.getUserBookings();
      setBookings(data);
    } catch (err) {
      console.warn('Failed to fetch user bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      let ignore = false;
      ordersApi.getOrders().then((data) => {
        if (!ignore) {
          setOrders(data);
          setLoadingOrders(false);
        }
      }).catch(() => {
        if (!ignore) setLoadingOrders(false);
      });

      roomsApi.getUserBookings().then((data) => {
        if (!ignore) {
          setBookings(data);
          setLoadingBookings(false);
        }
      }).catch(() => {
        if (!ignore) setLoadingBookings(false);
      });

      return () => {
        ignore = true;
      };
    }
  }, [user, authLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have safely concluded your guest session.',
        type: 'info',
      });
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      setIsCancelling(true);
      const updated = await ordersApi.cancelOrder(orderToCancel.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, status: 'Cancelled' } : o))
      );
      toast({
        title: 'Order Cancelled',
        description: `Order #${orderToCancel.id} has been cancelled.`,
        type: 'info',
      });
      setOrderToCancel(null);
    } catch (err: any) {
      toast({
        title: 'Cancellation Failed',
        description: err.message || 'Unable to cancel this order.',
        type: 'error',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      setIsCancelling(true);
      const updated = await roomsApi.cancelBooking(bookingToCancel.id);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? { ...b, status: 'Cancelled' } : b))
      );
      toast({
        title: 'Reservation Cancelled',
        description: `Booking #${bookingToCancel.id} has been cancelled.`,
        type: 'info',
      });
      setBookingToCancel(null);
    } catch (err: any) {
      toast({
        title: 'Cancellation Failed',
        description: err.message || 'Unable to cancel reservation.',
        type: 'error',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[#FAF7F0] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="w-48 h-6 mx-auto" />
        </div>
      </div>
    );
  }

  // Protected View fallback if accessed directly without auth
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[#FAF7F0] flex items-center justify-center text-left">
        <div className="max-w-md w-full mx-4 bg-[#FDFCF9] border border-[#E6DBCA] rounded-2xl shadow-xl p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F3ECE0] border border-[#E6DBCA] flex items-center justify-center text-[#886E4B] mx-auto">
            <User className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#886E4B] font-semibold">
              Guest Concierge Portal
            </span>
            <h1 className="font-serif text-3xl font-light text-[#121211]">
              Guest Authentication Required
            </h1>
            <p className="text-xs text-[#7A766C] font-sans leading-relaxed">
              Please sign in with your JAS Hotel guest profile to view your room reservations, in-room dining orders, and stay preferences.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Sign In to Account
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="w-full">
                Register New Stay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const accountTabs: TabItem[] = [
    { id: 'rooms', label: 'Suite Reservations', count: bookings.length },
    { id: 'dining', label: 'In-Room Dining', count: orders.length },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#FAF7F0] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Banner */}
        <div className="bg-[#FDFCF9] rounded-2xl border border-[#E6DBCA] p-6 sm:p-8 mb-10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#F3ECE0] border border-[#E6DBCA] flex items-center justify-center text-[#886E4B] font-serif text-2xl font-light">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#886E4B] font-semibold">
                  Distinguished Guest
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#121211]">
                {user.name}
              </h1>
              <p className="text-xs text-[#7A766C] font-sans mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchOrders();
                fetchBookings();
              }}
              aria-label="Refresh account data"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${(loadingOrders || loadingBookings) ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-[#7A766C]" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Tabs
            tabs={accountTabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'rooms' | 'dining')}
            className="w-full sm:w-auto"
          />

          {activeTab === 'rooms' ? (
            <Link to="/rooms">
              <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Reserve Another Suite
              </Button>
            </Link>
          ) : (
            <Link to="/menu">
              <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Order In-Room Dining
              </Button>
            </Link>
          )}
        </div>

        {/* TAB 1: ROOM RESERVATIONS */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#121211]">
                Sanctuary Reservations
              </h2>
              <p className="text-xs text-[#7A766C] font-sans mt-1">
                Your booked suites, check-in dates, and royal concierge privileges on Marine Drive.
              </p>
            </div>

            {loadingBookings ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-[#FDFCF9] border border-[#E6DBCA] space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={<Building2 className="w-8 h-8 stroke-[1.5]" />}
                title="No Suite Reservations"
                description="You have not reserved any suites or chambers yet with JAS Hotel."
                actionLabel="Explore Suites & Chambers"
                onAction={() => navigate('/rooms')}
              />
            ) : (
              <div className="space-y-5">
                <AnimatePresence>
                  {bookings.map((booking) => {
                    const canCancel = booking.status === 'Confirmed';
                    const isCancelled = booking.status === 'Cancelled';

                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 sm:p-7 rounded-2xl border bg-[#FDFCF9] shadow-xs space-y-5 ${
                          isCancelled ? 'border-[#E6DBCA] opacity-60' : 'border-[#E6DBCA]'
                        }`}
                      >
                        {/* Booking Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3ECE0]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-bold text-[#121211]">
                                #{booking.id}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                  isCancelled
                                    ? 'bg-stone-500/10 text-stone-500 border-stone-300'
                                    : 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-stone-400' : 'bg-emerald-500'}`} />
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#7A766C] font-sans flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Booked on {formatDate(booking.created_at)}
                            </p>
                          </div>

                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBookingToCancel(booking)}
                              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Cancel Reservation
                            </Button>
                          )}
                        </div>

                        {/* Suite Info Banner */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-[#FAF7F0] border border-[#E6DBCA]">
                          <img
                            src={booking.room_image}
                            alt={booking.room_name}
                            className="w-24 h-20 rounded-lg object-cover border border-[#E6DBCA] shrink-0"
                          />
                          <div className="flex-1 space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-[#886E4B] font-semibold">
                              {booking.room_category}
                            </span>
                            <h3 className="font-serif text-xl font-normal text-[#121211]">
                              {booking.room_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A766C] font-sans pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#886E4B]" />
                                <strong>Check-In:</strong> {booking.check_in}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#886E4B]" />
                                <strong>Check-Out:</strong> {booking.check_out}
                              </span>
                              <span>
                                <strong>Duration:</strong> {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                              </span>
                              <span>
                                <strong>Guests:</strong> {booking.guests_adults} Adults{booking.guests_children > 0 ? `, ${booking.guests_children} Children` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {booking.special_requests && (
                          <div className="text-xs text-[#7A766C] bg-[#F8F5EE] p-3 rounded-xl border border-[#E6DBCA]/60 font-sans">
                            <span className="font-medium text-[#121211]">Concierge Requests: </span>
                            <span>{booking.special_requests}</span>
                          </div>
                        )}

                        {/* Totals & Payment Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F3ECE0] text-xs font-sans">
                          <div className="flex flex-wrap items-center gap-3 text-[#7A766C]">
                            <span>Tariff: {formatCurrency(booking.price_per_night)}/night</span>
                            <span>GST (18%): {formatCurrency(booking.tax)}</span>
                            {booking.payment_status === 'Paid' ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
                                Paid via {booking.payment_method || 'Razorpay'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/30 text-[10px] font-semibold uppercase tracking-wider">
                                Settle at Check-In
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-[#121211] font-mono">
                            Total Reservation: <span className="text-[#886E4B]">{formatCurrency(booking.total)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: IN-ROOM DINING ORDERS */}
        {activeTab === 'dining' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#121211]">
                In-Room Dining History
              </h2>
              <p className="text-xs text-[#7A766C] font-sans mt-1">
                Real-time tracking of active suite room service orders and past culinary orders.
              </p>
            </div>

            {loadingOrders ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-[#FDFCF9] border border-[#E6DBCA] space-y-3">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={<UtensilsCrossed className="w-8 h-8 stroke-[1.5]" />}
                title="No Dining Orders Placed"
                description="You have not requested any room service or dining orders yet during this stay."
                actionLabel="Explore Culinary Menu"
                onAction={() => navigate('/menu')}
              />
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {orders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    const canCancel = order.status === 'Pending';

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 sm:p-7 rounded-2xl bg-[#FDFCF9] border border-[#E6DBCA] shadow-xs space-y-5"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3ECE0]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-bold text-[#121211]">
                                #{order.id}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#7A766C] font-sans flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDate(order.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-[#7A766C] block">
                                Service Type
                              </span>
                              <span className="text-xs font-semibold text-[#121211] capitalize flex items-center gap-1.5 justify-end">
                                {order.order_type === 'room_service' ? (
                                  <>
                                    <Bell className="w-3.5 h-3.5 text-[#886E4B]" />
                                    Room Service {order.room_number ? `(${order.room_number})` : ''}
                                  </>
                                ) : (
                                  <>
                                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#886E4B]" />
                                    Hotel Pickup
                                  </>
                                )}
                              </span>
                            </div>

                            {canCancel && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrderToCancel(order)}
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Cancel Order
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Items Listing */}
                        <div className="space-y-2.5">
                          <p className="text-[11px] uppercase tracking-widest text-[#7A766C] font-medium">
                            Dishes Prepared
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E6DBCA]/70"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono font-bold text-[#886E4B]">
                                    {item.quantity}×
                                  </span>
                                  <div>
                                    <p className="font-medium text-[#121211]">{item.name}</p>
                                    {item.notes && (
                                      <p className="text-[10px] text-[#7A766C] italic font-sans">
                                        Note: {item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="font-mono text-[#4A4740]">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.special_instructions && (
                          <div className="text-xs text-[#7A766C] bg-[#F8F5EE] p-3 rounded-xl border border-[#E6DBCA]/60">
                            <span className="font-medium text-[#121211]">Special Instructions: </span>
                            <span>{order.special_instructions}</span>
                          </div>
                        )}

                        {/* Order Footer Totals & Payment Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F3ECE0] text-xs font-sans">
                          <div className="flex flex-wrap items-center gap-3 text-[#7A766C]">
                            <span>Subtotal: {formatCurrency(order.subtotal)}</span>
                            <span>Tax: {formatCurrency(order.tax)}</span>
                            {order.payment_status === 'Paid' ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
                                Paid via {order.payment_method || 'Razorpay'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/30 text-[10px] font-semibold uppercase tracking-wider">
                                Pay on Delivery / Room Bill
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-[#121211] font-mono">
                            Total: <span className="text-[#886E4B]">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Order Cancellation */}
      <Modal
        isOpen={Boolean(orderToCancel)}
        onClose={() => setOrderToCancel(null)}
        title="Cancel Order Confirmation"
        description="Are you sure you wish to cancel this dining order?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#7A766C] leading-relaxed">
            Order <strong className="text-[#121211]">#{orderToCancel?.id}</strong> is currently pending. Cancelling this order will alert the kitchen to halt food preparation.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrderToCancel(null)}
              disabled={isCancelling}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancelOrder}
              isLoading={isCancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Room Booking Cancellation */}
      <Modal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        title="Cancel Suite Reservation"
        description="Are you sure you wish to release this reservation?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#7A766C] leading-relaxed">
            Reservation <strong className="text-[#121211]">#{bookingToCancel?.id}</strong> for{' '}
            <strong className="text-[#121211]">{bookingToCancel?.room_name}</strong> will be cancelled and the suite released back to our inventory.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBookingToCancel(null)}
              disabled={isCancelling}
            >
              Keep Reservation
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancelBooking}
              isLoading={isCancelling}
            >
              Cancel Reservation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
