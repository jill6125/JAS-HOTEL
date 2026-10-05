import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { Room } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import {
  Maximize2,
  Users,
  Eye,
  Check,
  Sparkles,
  ArrowRight,
  BedDouble,
  Compass,
} from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
  onViewDetails?: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onBook,
  onViewDetails,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#FDFCF9] border border-[#E6DBCA] overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#C5A880]/50 text-left"
    >
      <div>
        {/* Main Image Banner with Gallery Switcher */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F3ECE0]">
          <img
            src={room.images[activeImageIndex] || room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

          {/* Top Category Badge & Featured */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-semibold bg-[#FAF7F0]/90 backdrop-blur-md text-[#121211] border border-[#E6DBCA]">
              {room.category}
            </span>

            {room.featured && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-semibold bg-[#C5A880] text-[#121211] shadow-xs">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>

          {/* Thumbnail dots if multiple images */}
          {room.images.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5 z-10">
              {room.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeImageIndex === i ? 'bg-[#C5A880] w-5' : 'bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Bottom Overlay specs */}
          <div className="absolute bottom-3 right-3 text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-[#C5A880]" />
            <span className="truncate max-w-[180px]">{room.view}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl text-[#121211] font-normal leading-snug tracking-wide">
              {room.name}
            </h3>
            <p className="text-xs text-[#886E4B] italic font-serif">
              {room.tagline}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#7A766C] leading-relaxed font-sans line-clamp-3">
            {room.description}
          </p>

          {/* Room Specs Badges (Sqft, Guests, Bed) */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#F3ECE0] text-xs text-[#4A4740]">
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#886E4B]" />
              <span className="font-mono text-[11px]">{room.size_sqft} sq ft</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#886E4B]" />
              <span className="text-[11px]">{room.max_adults} Adults</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-[#886E4B]" />
              <span className="text-[11px] truncate">King Bed</span>
            </div>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] uppercase tracking-widest text-[#7A766C] font-medium">
              Sanctuary Inclusions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {room.amenities.slice(0, 4).map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-[#4A4740]">
                  <Check className="w-3 h-3 text-[#886E4B] shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Booking Action Footer */}
      <div className="p-6 pt-0 mt-auto">
        <div className="flex items-baseline justify-between pt-4 border-t border-[#F3ECE0] mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#7A766C] block">
              Tariff per night
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#886E4B]">
              {formatCurrency(room.price_per_night)}
            </span>
          </div>
          <span className="text-[11px] text-[#7A766C] italic font-sans">
            + 18% Luxury GST
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(room)}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
          )}
          <Button
            variant="gold"
            size="sm"
            onClick={() => onBook(room)}
            className={onViewDetails ? '' : 'col-span-2'}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Reserve Suite
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
