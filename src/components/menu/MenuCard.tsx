import React from 'react';
import { motion } from 'motion/react';
import type { MenuItem } from '../../types';
import { useCart, useToast } from '../../hooks';
import { formatCurrency } from '../../lib/utils';
import { Plus, Check, Clock, Sparkles } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { items, addItem, updateQuantity, openCart } = useCart();
  const { toast } = useToast();

  const cartItem = items.find((ci) => ci.menuItem.id === item.id);
  const isInCart = Boolean(cartItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.available) return;

    addItem(item, 1);
    toast({
      title: `${item.name} added to tray`,
      description: 'Your selection has been added to in-room dining.',
      type: 'success',
    });
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(item.id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(item.id, cartItem.quantity - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#FDFCF9] border border-[#E6DBCA] overflow-hidden transition-all duration-300 text-left ${
        item.available
          ? 'hover:shadow-xl hover:border-[#C5A880]/50 hover:-translate-y-1'
          : 'opacity-70 bg-[#F8F5EE]'
      }`}
    >
      {/* Top Image & Badges */}
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F3ECE0]">
          <img
            src={item.image_url}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              item.available ? 'group-hover:scale-105' : 'grayscale-[40%]'
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-semibold bg-[#FAF7F0]/90 backdrop-blur-md text-[#121211] border border-[#E6DBCA]">
              {item.category}
            </span>

            <div className="flex items-center gap-1.5">
              {item.featured && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-semibold bg-[#C5A880] text-[#121211] shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
              {!item.available && (
                <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-semibold bg-red-800/90 text-white backdrop-blur-xs">
                  Sold Out
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl sm:text-2xl text-[#121211] font-normal leading-snug tracking-wide">
              {item.name}
            </h3>
            <span className="font-mono text-base sm:text-lg font-semibold text-[#886E4B] shrink-0">
              {formatCurrency(item.price)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#7A766C] leading-relaxed font-sans line-clamp-2">
            {item.description}
          </p>

          {/* Details (Dietary, Preparation Time) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {item.dietary?.map((diet) => (
              <span
                key={diet}
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#F3ECE0] text-[#4A4740] border border-[#E6DBCA]"
              >
                {diet}
              </span>
            ))}
            {item.preparation_time_minutes && (
              <span className="flex items-center gap-1 text-[11px] text-[#A9A497] ml-auto">
                <Clock className="w-3 h-3" />
                {item.preparation_time_minutes} min
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 sm:p-6 pt-0 mt-auto">
        {!item.available ? (
          <div className="w-full py-2.5 text-center text-xs uppercase tracking-widest font-medium text-[#7A766C] bg-[#EFE9DC]/60 rounded-xl border border-[#E6DBCA]">
            Temporarily Unavailable
          </div>
        ) : isInCart && cartItem ? (
          <div className="flex items-center justify-between gap-3 bg-[#F3ECE0] p-1.5 rounded-xl border border-[#E6DBCA]">
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleDecrease}
                className="w-8 h-8 rounded-lg bg-[#FDFCF9] flex items-center justify-center text-[#121211] hover:bg-[#E6DBCA] transition-colors border border-[#E6DBCA]"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-10 text-center font-mono text-xs font-semibold text-[#121211]">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                className="w-8 h-8 rounded-lg bg-[#FDFCF9] flex items-center justify-center text-[#121211] hover:bg-[#E6DBCA] transition-colors border border-[#E6DBCA]"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={openCart}
              className="text-xs uppercase tracking-wider font-semibold text-[#886E4B] hover:text-[#121211] pr-2 transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              In Tray
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest font-medium bg-[#121211] text-[#FAF7F0] hover:bg-[#292825] active:bg-[#0A0A09] transition-all flex items-center justify-center gap-2 group-hover:bg-[#C5A880] group-hover:text-[#121211] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Order</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
