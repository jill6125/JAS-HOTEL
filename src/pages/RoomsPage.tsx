import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Room } from '../types';
import { roomsApi } from '../lib/api/rooms';
import { RoomCard } from '../components/rooms/RoomCard';
import { BookingModal } from '../components/rooms/BookingModal';
import { RoomDetailModal } from '../components/rooms/RoomDetailModal';
import { Tabs, type TabItem } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, RefreshCw, KeyRound, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const CATEGORIES = [
  'All',
  'Maharaja Presidential Suite',
  'Royal Pavilion',
  'Executive Bay Suite',
  'Deluxe Heritage',
];

export const RoomsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookParam = searchParams.get('book');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getRooms();
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'Unable to reach JAS Hotel reservations concierge.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    roomsApi.getRooms().then((data) => {
      if (!ignore) {
        setRooms(data);
        setLoading(false);
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message || 'Unable to reach reservation service.');
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const matchedRoom = useMemo(() => {
    if (!bookParam || rooms.length === 0) return null;
    return rooms.find((r) => r.id === bookParam) ?? null;
  }, [bookParam, rooms]);

  const activeBookingRoom = selectedRoomForBooking ?? matchedRoom;

  const handleCloseBooking = () => {
    setSelectedRoomForBooking(null);
    if (searchParams.has('book')) {
      searchParams.delete('book');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (activeCategory !== 'All' && r.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesView = r.view.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesView) return false;
      }
      return true;
    });
  }, [rooms, activeCategory, searchQuery]);

  const tabs: TabItem[] = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      id: cat,
      label: cat === 'Maharaja Presidential Suite' ? 'Presidential' : cat,
      count:
        cat === 'All'
          ? rooms.length
          : rooms.filter((r) => r.category.toLowerCase() === cat.toLowerCase()).length,
    }));
  }, [rooms]);

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#FAF7F0] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#886E4B] font-semibold mb-2">
            <KeyRound className="w-4 h-4" />
            <span>Regal Suites & Sanctuary Chambers</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#121211] tracking-tight">
            Reserve Your Sanctuary
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#7A766C] font-sans font-light leading-relaxed">
            Perched along Marine Drive overlooking the Arabian Sea, our private suites offer 24/7 dedicated royal butler service, handcrafted Indian teak furnishings, and private heated plunge terraces.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9A497]" />
              <input
                id="room-search-input"
                type="text"
                placeholder="Search by suite name, terrace, view, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FDFCF9] text-sm text-[#121211] placeholder:text-[#A9A497] pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DBCA] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A766C] hover:text-[#121211]"
                >
                  Clear
                </button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRooms}
              aria-label="Refresh suites"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeCategory}
            onChange={(id) => setActiveCategory(id)}
            className="w-full"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 flex items-center justify-between gap-3">
            <span className="text-sm">{error}</span>
            <Button variant="outline" size="sm" onClick={fetchRooms}>
              Retry
            </Button>
          </div>
        )}

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-[#E6DBCA] bg-[#FDFCF9] overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-8 h-8 stroke-[1.5]" />}
            title="No Suites Available"
            description="We could not find any chambers matching your filter criteria. Clear your search or explore all suites."
            actionLabel="View All Suites"
            onAction={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={(r) => setSelectedRoomForBooking(r)}
                onViewDetails={(r) => setSelectedRoomForDetail(r)}
              />
            ))}
          </div>
        )}

        {/* Booking Dialog */}
        <BookingModal
          room={activeBookingRoom}
          isOpen={Boolean(activeBookingRoom)}
          onClose={handleCloseBooking}
        />

        {/* Detail Modal */}
        <RoomDetailModal
          room={selectedRoomForDetail}
          isOpen={Boolean(selectedRoomForDetail)}
          onClose={() => setSelectedRoomForDetail(null)}
          onBook={(r) => setSelectedRoomForBooking(r)}
        />
      </div>
    </div>
  );
};
