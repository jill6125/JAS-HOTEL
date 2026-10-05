import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useCart } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../lib/utils';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Bell, UtensilsCrossed, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
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
    isCartOpen,
    closeCart,
  } = useCart();

  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/order');
  };

  const isRoomService = orderType === 'room_service';
  const hasItems = items.length > 0;
  const isReadyForCheckout = hasItems && (!isRoomService || roomNumber.trim().length > 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Dining order cart">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#0A0A09]/60 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative w-full max-w-md h-full bg-[#FAF7F0] border-l border-[#E6DBCA] shadow-2xl flex flex-col z-10 text-left"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E6DBCA] flex items-center justify-between bg-[#FDFCF9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3ECE0] flex items-center justify-center text-[#886E4B] border border-[#E6DBCA]">
                  <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-[#121211] font-normal tracking-wide">
                    Your Dining Order
                  </h2>
                  <p className="text-xs text-[#7A766C] tracking-widest uppercase">
                    {items.length} {items.length === 1 ? 'Selection' : 'Selections'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                id="cart-drawer-close"
                className="p-2 text-[#7A766C] hover:text-[#121211] rounded-lg hover:bg-[#F3ECE0] transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Type Toggle */}
            <div className="px-6 py-4 bg-[#F8F4EC] border-b border-[#E6DBCA]">
              <p className="text-[11px] uppercase tracking-widest text-[#7A766C] font-medium mb-2.5">
                Service Delivery Preference
              </p>
              <div className="grid grid-cols-2 gap-2 bg-[#EFE9DC] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrderType('room_service')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs tracking-wider uppercase font-medium rounded-lg transition-all duration-200 ${
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
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs tracking-wider uppercase font-medium rounded-lg transition-all duration-200 ${
                    orderType === 'pickup'
                      ? 'bg-[#121211] text-[#FAF7F0] shadow-sm'
                      : 'text-[#4A4740] hover:text-[#121211]'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  Hotel Pickup
                </button>
              </div>

              {/* Room Number prompt if Room Service is selected */}
              {isRoomService && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <label htmlFor="cart-room-number" className="block text-[11px] uppercase tracking-wider text-[#7A766C] mb-1">
                    Suite / Room Number <span className="text-[#886E4B]">*</span>
                  </label>
                  <input
                    id="cart-room-number"
                    type="text"
                    placeholder="e.g. Maharaja Suite 501"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full text-xs bg-[#FDFCF9] border border-[#E6DBCA] rounded-lg px-3 py-2 text-[#121211] placeholder:text-[#A9A497] focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none"
                  />
                </motion.div>
              )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!hasItems ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#F3ECE0] flex items-center justify-center text-[#886E4B] border border-[#E6DBCA]">
                    <Sparkles className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-[#121211]">
                    Your dining tray is empty
                  </h3>
                  <p className="text-xs text-[#7A766C] max-w-xs font-sans leading-relaxed">
                    Explore our curated seasonal menu and discover artisanal culinary creations prepared to order.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      closeCart();
                      navigate('/menu');
                    }}
                  >
                    Explore Menu
                  </Button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((cartItem) => (
                    <motion.div
                      key={cartItem.menuItem.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className="p-4 rounded-xl bg-[#FDFCF9] border border-[#E6DBCA] flex flex-col gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={cartItem.menuItem.image_url}
                          alt={cartItem.menuItem.name}
                          className="w-16 h-16 rounded-lg object-cover border border-[#E6DBCA] shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-base text-[#121211] font-medium leading-snug truncate">
                              {cartItem.menuItem.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(cartItem.menuItem.id)}
                              className="text-[#A9A497] hover:text-red-600 transition-colors p-1"
                              aria-label={`Remove ${cartItem.menuItem.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-[#886E4B] font-semibold mt-0.5">
                            {formatCurrency(cartItem.menuItem.price)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Notes */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#F3ECE0]">
                        <div className="flex items-center border border-[#E6DBCA] rounded-lg bg-[#FAF7F0] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                            className="p-1.5 text-[#4A4740] hover:text-[#121211] hover:bg-[#E6DBCA]/40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-medium text-[#121211]">
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

                        <span className="font-mono text-xs font-medium text-[#121211]">
                          {formatCurrency(cartItem.menuItem.price * cartItem.quantity)}
                        </span>
                      </div>

                      {/* Optional Item Specific Notes */}
                      <input
                        type="text"
                        placeholder="Add special preparation notes..."
                        value={cartItem.notes || ''}
                        onChange={(e) => updateNotes(cartItem.menuItem.id, e.target.value)}
                        className="text-[11px] bg-transparent border-b border-[#E6DBCA] focus:border-[#C5A880] pb-1 outline-none text-[#4A4740] placeholder:text-[#A9A497]"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {hasItems && (
              <div className="p-6 bg-[#FDFCF9] border-t border-[#E6DBCA] space-y-4">
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-[#7A766C]">
                    <span>Culinary Subtotal</span>
                    <span className="font-mono text-[#121211]">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#7A766C]">
                    <span>Hospitality Service & Tax (10%)</span>
                    <span className="font-mono text-[#121211]">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-[#121211] pt-2 border-t border-[#E6DBCA]">
                    <span className="font-serif text-base tracking-wide">Estimated Total</span>
                    <span className="font-mono text-base font-semibold text-[#886E4B]">{formatCurrency(total)}</span>
                  </div>
                </div>

                {isRoomService && !roomNumber.trim() && (
                  <p className="text-[11px] text-amber-700 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-md">
                    Please provide your room/suite number above to proceed with room service.
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="shrink-0 text-xs text-[#7A766C] hover:text-red-700"
                  >
                    Clear Tray
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={!isReadyForCheckout}
                    onClick={handleCheckoutClick}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Review & Complete Order
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
