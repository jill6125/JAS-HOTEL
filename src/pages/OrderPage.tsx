import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart, useAuth, useToast } from '../hooks';
import { ordersApi } from '../lib/api/orders';
import type { Order, CreateOrderPayload } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  ShoppingBag,
  Bell,
  UtensilsCrossed,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const OrderPage: React.FC = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    subtotal,
    tax,
    total,
    orderType,
    setOrderType,
    roomNumber,
    setRoomNumber,
    specialInstructions,
    setSpecialInstructions,
  } = useCart();

  const { user, setIntendedDestination } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentOption, setPaymentOption] = useState<'razorpay' | 'room_bill'>('razorpay');

  const isRoomService = orderType === 'room_service';
  const hasItems = items.length > 0;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!hasItems) {
      setFormError('Your dining tray is empty. Please add menu items before ordering.');
      return;
    }

    if (isRoomService && !roomNumber.trim()) {
      setFormError('Suite or Room number is required for Room Service delivery.');
      return;
    }

    // Authentication Guard
    if (!user) {
      setIntendedDestination('/order');
      toast({
        title: 'Authentication Required',
        description: 'Please sign in or create an account to finalize your luxury dining order.',
        type: 'info',
      });
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateOrderPayload = {
        order_type: orderType,
        room_number: isRoomService ? roomNumber.trim() : undefined,
        special_instructions: specialInstructions.trim() || undefined,
        items: items.map((it) => ({
          menu_item_id: it.menuItem.id,
          quantity: it.quantity,
          notes: it.notes?.trim() || undefined,
        })),
      };

      const resultOrder = await ordersApi.createOrder(payload);

      if (paymentOption === 'razorpay') {
        // Trigger Razorpay Checkout
        const { initiateRazorpayPayment } = await import('../lib/razorpay');
        await initiateRazorpayPayment({
          referenceId: resultOrder.id,
          type: 'dining_order',
          title: 'Fine Dining Order',
          description: `Order #${resultOrder.id}`,
          amount: resultOrder.total,
          user,
          onSuccess: (paymentResult) => {
            const updated = {
              ...resultOrder,
              payment_status: 'Paid' as const,
              payment_method: 'Razorpay',
              razorpay_payment_id: paymentResult.transaction_id,
            };
            setPlacedOrder(updated);
            clearCart();
            toast({
              title: 'Payment Confirmed',
              description: `Paid via Razorpay. Order #${resultOrder.id} is being prepared.`,
              type: 'success',
            });
            setSubmitting(false);
          },
          onError: (payErr) => {
            setPlacedOrder(resultOrder);
            clearCart();
            toast({
              title: 'Order Placed (Payment Pending)',
              description: payErr?.message || 'Razorpay checkout closed. You may pay at delivery.',
              type: 'info',
            });
            setSubmitting(false);
          },
        });
      } else {
        // Post to Room Bill / Pay on Delivery
        setPlacedOrder(resultOrder);
        clearCart();
        toast({
          title: 'Order Placed Successfully',
          description: `Order #${resultOrder.id} charged to Room Bill / Pay on Delivery.`,
          type: 'success',
        });
        setSubmitting(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'We could not place your order. Your cart has been kept intact.');
      setSubmitting(false);
    }
  };

  // If order was successfully placed, display the luxurious confirmation view
  if (placedOrder) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[#FAF7F0] flex items-center justify-center text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl w-full mx-4 bg-[#FDFCF9] border border-[#E6DBCA] rounded-2xl shadow-xl p-8 sm:p-12 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#886E4B] mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#886E4B] font-semibold">
              Dining Order Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#121211] tracking-tight">
              Your order has been received.
            </h1>
            <p className="text-sm text-[#7A766C] font-sans font-light max-w-md mx-auto leading-relaxed">
              Our culinary brigade has commenced preparation. Your silver service tray will be delivered shortly.
            </p>
          </div>

          {/* Order Details Receipt Card */}
          <div className="p-6 bg-[#FAF7F0] rounded-xl border border-[#E6DBCA] text-left space-y-4 font-sans text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#E6DBCA]">
              <div>
                <p className="text-[#7A766C] uppercase tracking-wider text-[10px]">Order Reference</p>
                <p className="font-mono text-sm font-semibold text-[#121211]">{placedOrder.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[#7A766C] uppercase tracking-wider text-[10px]">Service Type</p>
                <p className="font-medium text-[#121211] capitalize">
                  {placedOrder.order_type === 'room_service' ? 'Room Service' : 'Hotel Pickup'}
                </p>
              </div>
            </div>

            {placedOrder.room_number && (
              <div className="flex justify-between items-center">
                <span className="text-[#7A766C]">Delivering to:</span>
                <span className="font-medium text-[#121211]">{placedOrder.room_number}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-[#7A766C]">Status:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30 uppercase tracking-widest text-[10px] font-semibold">
                {placedOrder.status}
              </span>
            </div>

            <div className="pt-3 border-t border-[#E6DBCA] flex justify-between items-center text-sm">
              <span className="font-serif text-base text-[#121211]">Authoritative Total</span>
              <span className="font-mono font-semibold text-base text-[#886E4B]">
                {formatCurrency(placedOrder.total)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/account" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                View in Account History
              </Button>
            </Link>
            <Link to="/menu" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                Browse More Menu
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#FAF7F0] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A766C] hover:text-[#121211] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Menu</span>
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-2xl mb-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#886E4B] font-semibold mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Fine Dining Checkout</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#121211] tracking-tight">
            Review Your Order
          </h1>
          <p className="mt-2 text-sm text-[#7A766C] font-sans font-light leading-relaxed">
            Please verify your selections, delivery preferences, and special dietary preparations before placing your in-room dining order.
          </p>
        </div>

        {/* Empty State if no items */}
        {!hasItems ? (
          <div className="bg-[#FDFCF9] rounded-2xl border border-[#E6DBCA] p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F3ECE0] flex items-center justify-center text-[#886E4B] mx-auto mb-4 border border-[#E6DBCA]">
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl text-[#121211] font-light">
              Your dining tray is empty
            </h2>
            <p className="text-xs text-[#7A766C] mt-2 mb-6 font-sans leading-relaxed">
              Explore our chef's seasonal dishes, breakfast specialties, and cellar selections to begin your in-suite order.
            </p>
            <Link to="/menu">
              <Button variant="primary">
                Explore The Menu
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Tray Items */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E6DBCA]">
                <h2 className="font-serif text-2xl text-[#121211] font-normal">
                  Tray Selections ({items.length})
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs uppercase tracking-wider text-[#7A766C] hover:text-red-700 transition-colors"
                >
                  Clear Tray
                </button>
              </div>

              <div className="space-y-4">
                {items.map((cartItem) => (
                  <div
                    key={cartItem.menuItem.id}
                    className="p-5 rounded-2xl bg-[#FDFCF9] border border-[#E6DBCA] flex flex-col gap-4 shadow-xs"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={cartItem.menuItem.image_url}
                        alt={cartItem.menuItem.name}
                        className="w-20 h-20 rounded-xl object-cover border border-[#E6DBCA] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-lg text-[#121211] font-normal leading-snug truncate">
                            {cartItem.menuItem.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeItem(cartItem.menuItem.id)}
                            className="text-[#A9A497] hover:text-red-600 transition-colors p-1"
                            aria-label={`Remove ${cartItem.menuItem.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#7A766C] line-clamp-1 mt-0.5 font-sans">
                          {cartItem.menuItem.description}
                        </p>
                        <p className="font-mono text-sm font-semibold text-[#886E4B] mt-2">
                          {formatCurrency(cartItem.menuItem.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#F3ECE0]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#7A766C] font-sans">Quantity:</span>
                        <div className="flex items-center border border-[#E6DBCA] rounded-lg bg-[#FAF7F0] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                            className="p-1.5 text-[#4A4740] hover:text-[#121211] hover:bg-[#E6DBCA]/40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-mono font-medium text-[#121211]">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                            className="p-1.5 text-[#4A4740] hover:text-[#121211] hover:bg-[#E6DBCA]/40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="font-mono text-sm font-semibold text-[#121211]">
                        Item Total: {formatCurrency(cartItem.menuItem.price * cartItem.quantity)}
                      </div>
                    </div>

                    {/* Specific Dish Notes */}
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Dietary requests or preparation notes for this dish..."
                        value={cartItem.notes || ''}
                        onChange={(e) => updateNotes(cartItem.menuItem.id, e.target.value)}
                        className="w-full text-xs bg-[#FAF7F0] border border-[#E6DBCA] rounded-lg px-3 py-2 text-[#121211] placeholder:text-[#A9A497] focus:border-[#C5A880] outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Service Preference & Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Delivery Details Card */}
              <div className="p-6 sm:p-7 rounded-2xl bg-[#FDFCF9] border border-[#E6DBCA] shadow-sm space-y-5">
                <h3 className="font-serif text-2xl text-[#121211] font-normal">
                  Delivery Details
                </h3>

                {/* Order Type Toggle */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-2">
                    Service Delivery Option
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-[#F3ECE0] p-1.5 rounded-xl border border-[#E6DBCA]">
                    <button
                      type="button"
                      onClick={() => setOrderType('room_service')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs tracking-wider uppercase font-medium rounded-lg transition-all ${
                        orderType === 'room_service'
                          ? 'bg-[#121211] text-[#FAF7F0] shadow-sm'
                          : 'text-[#4A4740] hover:text-[#121211]'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Room Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs tracking-wider uppercase font-medium rounded-lg transition-all ${
                        orderType === 'pickup'
                          ? 'bg-[#121211] text-[#FAF7F0] shadow-sm'
                          : 'text-[#4A4740] hover:text-[#121211]'
                      }`}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      Hotel Pickup
                    </button>
                  </div>
                </div>

                {/* Suite / Room Number */}
                <div>
                  <label
                    htmlFor="order-room-number"
                    className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-1.5"
                  >
                    Suite / Room Number {isRoomService && <span className="text-[#886E4B]">*</span>}
                  </label>
                  <input
                    id="order-room-number"
                    type="text"
                    required={isRoomService}
                    placeholder={isRoomService ? 'e.g. Maharaja Suite 501' : 'Optional room identifier'}
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full text-sm bg-[#FAF7F0] border border-[#E6DBCA] rounded-xl px-4 py-2.5 text-[#121211] placeholder:text-[#A9A497] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 outline-none"
                  />
                  {isRoomService && (
                    <span className="text-[11px] text-[#7A766C] mt-1 block font-sans">
                      Required for private in-room delivery.
                    </span>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <label
                    htmlFor="order-special-instructions"
                    className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-1.5"
                  >
                    Special Concierge Instructions
                  </label>
                  <textarea
                    id="order-special-instructions"
                    rows={3}
                    placeholder="e.g. Please ring discreetly. Serve with warm silver cloches, sliced sirka onions, and brass cutlery."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full text-sm bg-[#FAF7F0] border border-[#E6DBCA] rounded-xl px-4 py-2.5 text-[#121211] placeholder:text-[#A9A497] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 outline-none resize-none"
                  />
                </div>

                {/* Payment Gateway Options */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7A766C] font-medium mb-2">
                    Payment Settlement Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('razorpay')}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        paymentOption === 'razorpay'
                          ? 'border-[#C5A880] bg-[#FAF7F0] ring-2 ring-[#C5A880]/20 shadow-xs'
                          : 'border-[#E6DBCA] bg-[#FDFCF9] hover:bg-[#FAF7F0]'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-[#C5A880]/15 text-[#886E4B] shrink-0 mt-0.5">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#121211]">Razorpay Gateway</span>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 font-bold">
                            UPI / Cards / NetBanking
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A766C] mt-0.5 leading-snug">
                          Instant online settlement via Razorpay Test Gateway.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentOption('room_bill')}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        paymentOption === 'room_bill'
                          ? 'border-[#C5A880] bg-[#FAF7F0] ring-2 ring-[#C5A880]/20 shadow-xs'
                          : 'border-[#E6DBCA] bg-[#FDFCF9] hover:bg-[#FAF7F0]'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-[#E6DBCA]/40 text-[#7A766C] shrink-0 mt-0.5">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#121211]">Room Bill / On Delivery</span>
                        <p className="text-[11px] text-[#7A766C] mt-0.5 leading-snug">
                          Post charge to your Suite Folio or pay by card on tray delivery.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Pricing Summary */}
              <div className="p-6 sm:p-7 rounded-2xl bg-[#FDFCF9] border border-[#E6DBCA] shadow-sm space-y-4">
                <h3 className="font-serif text-2xl text-[#121211] font-normal">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs font-sans text-[#7A766C]">
                  <div className="flex justify-between">
                    <span>Culinary Subtotal</span>
                    <span className="font-mono text-sm text-[#121211]">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hospitality & Service Tax (10%)</span>
                    <span className="font-mono text-sm text-[#121211]">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In-Suite Presentation Service</span>
                    <span className="text-emerald-700 font-medium uppercase tracking-wider text-[11px]">
                      Complimentary
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E6DBCA] flex justify-between items-baseline">
                    <span className="font-serif text-xl text-[#121211] font-normal">
                      Total Due
                    </span>
                    <span className="font-mono text-2xl font-bold text-[#886E4B]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A9A497] italic font-sans">
                    The backend remains authoritative for pricing and taxation upon dispatch.
                  </p>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Authentication Note */}
                {!user && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs space-y-1">
                    <p className="font-semibold uppercase tracking-wider text-[10px]">
                      Guest Authentication
                    </p>
                    <p className="text-[11px]">
                      You may review this order freely. Placing the order requires signing in to link your hotel stay account.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full text-sm font-semibold tracking-widest uppercase mt-4"
                  isLoading={submitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {user ? 'Place In-Room Order' : 'Sign In & Place Order'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
