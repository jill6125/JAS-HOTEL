import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Room } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import {
  X,
  Maximize2,
  Users,
  BedDouble,
  Compass,
  Check,
  ArrowRight,
} from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  isOpen,
  onClose,
  onBook,
}) => {
  if (!room) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A0A09]/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl bg-[#FAF7F0] border border-[#E6DBCA] rounded-2xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E6DBCA]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#886E4B] font-semibold block">
                  {room.category}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#121211] font-light mt-0.5">
                  {room.name}
                </h2>
                <p className="text-xs text-[#886E4B] italic font-serif mt-1">
                  {room.tagline}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#7A766C] hover:text-[#121211] rounded-lg hover:bg-[#F3ECE0] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${room.name} view ${idx + 1}`}
                  className="w-full h-56 object-cover rounded-xl border border-[#E6DBCA]"
                  loading="lazy"
                />
              ))}
            </div>

            {/* Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#FDFCF9] border border-[#E6DBCA] text-xs text-[#4A4740]">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#886E4B]" />
                <div>
                  <p className="text-[10px] uppercase text-[#7A766C]">Living Space</p>
                  <p className="font-semibold text-[#121211]">{room.size_sqft} sq ft</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#886E4B]" />
                <div>
                  <p className="text-[10px] uppercase text-[#7A766C]">Capacity</p>
                  <p className="font-semibold text-[#121211]">{room.max_adults} Adults, {room.max_children} Kids</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-[#886E4B]" />
                <div>
                  <p className="text-[10px] uppercase text-[#7A766C]">Bedding</p>
                  <p className="font-semibold text-[#121211]">{room.bed_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#886E4B]" />
                <div>
                  <p className="text-[10px] uppercase text-[#7A766C]">Vista</p>
                  <p className="font-semibold text-[#121211] truncate">{room.view}</p>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#121211]">
                Sanctuary Overview
              </h4>
              <p className="text-sm text-[#7A766C] leading-relaxed font-sans font-light">
                {room.description}
              </p>
            </div>

            {/* Full Amenities */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#121211]">
                Royal Privileges & Amenities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {room.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F8F5EE] border border-[#E6DBCA]/70 text-xs text-[#4A4740]">
                    <Check className="w-4 h-4 text-[#886E4B] shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-[#E6DBCA] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#7A766C] block">
                  Nightly Sanctuary Tariff
                </span>
                <span className="font-mono text-2xl font-bold text-[#886E4B]">
                  {formatCurrency(room.price_per_night)}
                </span>
                <span className="text-xs text-[#7A766C] ml-2 font-sans font-light">+ 18% Luxury GST</span>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" onClick={onClose} className="w-1/2 sm:w-auto">
                  Close
                </Button>
                <Button
                  variant="gold"
                  onClick={() => {
                    onClose();
                    onBook(room);
                  }}
                  className="w-1/2 sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Reserve Suite
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
