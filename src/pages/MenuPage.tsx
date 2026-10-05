import React, { useState, useEffect, useMemo } from 'react';
import { menuApi } from '../lib/api/menu';
import type { MenuItem } from '../types';
import { MenuCard } from '../components/menu/MenuCard';
import { Tabs, type TabItem } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Sparkles, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

const CATEGORIES = [
  'All',
  'Breakfast',
  'Starters',
  'Main Course',
  'Sides',
  'Desserts',
  'Beverages',
];

export const MenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  const fetchMenu = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuApi.getMenuItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Unable to reach JAS Hotel dining service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    menuApi.getMenuItems().then((data) => {
      if (!ignore) {
        setItems(data);
        setLoading(false);
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message || 'Unable to reach JAS Hotel dining service.');
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  // Filter items locally based on category, search, and flags
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeCategory !== 'All' && item.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      // Featured filter
      if (onlyFeatured && !item.featured) {
        return false;
      }
      // Available filter
      if (onlyAvailable && !item.available) {
        return false;
      }
      return true;
    });
  }, [items, activeCategory, searchQuery, onlyFeatured, onlyAvailable]);

  // Tab definitions with category counts
  const tabs: TabItem[] = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      id: cat,
      label: cat,
      count:
        cat === 'All'
          ? items.length
          : items.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length,
    }));
  }, [items]);

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#FAF7F0] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Luxury Eyebrow */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#886E4B] font-semibold mb-2">
            <span>In-Room & Hall Service</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#121211] tracking-tight">
            The Seasonal Dining Menu
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#7A766C] font-sans font-light leading-relaxed">
            Freshly prepared dishes crafted from heritage ingredients. Delivered in-suite with heated presentation service or prepared for pickup.
          </p>
        </div>

        {/* Search, Filter Toolbar & Category Tabs */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9A497]" />
              <input
                id="menu-search-input"
                type="text"
                placeholder="Search by dish name, ingredient, or flavor..."
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

            {/* Quick Toggle Filters (Featured, In-Stock) */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setOnlyFeatured((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-medium border transition-colors ${
                  onlyFeatured
                    ? 'bg-[#C5A880] text-[#121211] border-[#C5A880]'
                    : 'bg-[#FDFCF9] text-[#7A766C] border-[#E6DBCA] hover:border-[#121211]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Featured Only
              </button>

              <button
                type="button"
                onClick={() => setOnlyAvailable((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-medium border transition-colors ${
                  onlyAvailable
                    ? 'bg-[#121211] text-[#FAF7F0] border-[#121211]'
                    : 'bg-[#FDFCF9] text-[#7A766C] border-[#E6DBCA] hover:border-[#121211]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                In Stock Only
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchMenu}
                aria-label="Refresh menu items"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeCategory}
            onChange={(tabId) => setActiveCategory(tabId)}
            className="w-full"
          />
        </div>

        {/* Error State Banner */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-sans">{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchMenu}>
              Retry
            </Button>
          </div>
        )}

        {/* Menu Grid / Loading / Empty States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E6DBCA] bg-[#FDFCF9] overflow-hidden p-0 space-y-4"
              >
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-3/5" />
                    <Skeleton className="h-6 w-1/5" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="pt-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No Culinary Creations Found"
            description="We could not find any items matching your active category or search query. Try clearing the search or exploring another category."
            actionLabel="Reset Search & Filters"
            onAction={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setOnlyFeatured(false);
              setOnlyAvailable(false);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
