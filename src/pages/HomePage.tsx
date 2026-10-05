import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { gsap } from '../animations/gsapConfig';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { menuApi } from '../lib/api/menu';
import type { MenuItem } from '../types';
import { MenuCard } from '../components/menu/MenuCard';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowDown, ArrowUpRight, Compass, Sparkles, Star, Utensils } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState<boolean>(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const expImgRef = useRef<HTMLImageElement>(null);
  const prefersReduced = useReducedMotion();

  // Fetch featured items
  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        setLoadingFeatured(true);
        const items = await menuApi.getMenuItems({ featured: true });
        if (isMounted) {
          // Take 3-4 items as specified
          setFeaturedItems(items.slice(0, 4));
        }
      } catch (err) {
        console.warn('Failed to load featured items:', err);
      } finally {
        if (isMounted) setLoadingFeatured(false);
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP Cinematic Hero & Parallax Choreography
  useEffect(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Hero Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        heroImgRef.current,
        { scale: 1.15, filter: 'brightness(0.65)' },
        { scale: 1.0, filter: 'brightness(0.85)', duration: 1.8 }
      ).fromTo(
        '.hero-reveal',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, stagger: 0.15 },
        '-=1.2'
      );

      // Hero Scroll Parallax
      if (heroRef.current && heroImgRef.current) {
        gsap.to(heroImgRef.current, {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Experience Parallax
      if (experienceRef.current && expImgRef.current) {
        gsap.to(expImgRef.current, {
          yPercent: -12,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: experienceRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [prefersReduced]);

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. CINEMATIC HERO */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-[#0A0A09]"
        aria-label="JAS Hotel Welcome"
      >
        {/* Background Image with Parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={heroImgRef}
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=90"
            alt="JAS Hotel luxury ambiance"
            className="w-full h-full object-cover object-center will-change-transform"
          />
          {/* Subtle gradient overlays for pristine editorial legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A09]/90 via-[#0A0A09]/40 to-[#0A0A09]/60" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div
          ref={heroTextRef}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center text-[#FAF7F0] flex flex-col items-center justify-center space-y-6 sm:space-y-8"
        >
          {/* Luxury Monogram / Eyebrow */}
          <div className="hero-reveal flex items-center gap-3">
            <span className="h-[1px] w-8 sm:w-16 bg-[#C5A880]/60" />
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-medium text-[#C5A880]">
              The Culinary Sanctuary
            </span>
            <span className="h-[1px] w-8 sm:w-16 bg-[#C5A880]/60" />
          </div>

          {/* Main Cinematic Headline */}
          <h1 className="hero-reveal font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95] text-[#FAF7F0]">
            JAS <span className="font-normal italic text-[#C5A880]">Hotel</span>
          </h1>

          {/* Luxury Subheading */}
          <p className="hero-reveal max-w-xl text-sm sm:text-base md:text-lg text-[#E6DBCA] font-sans font-light leading-relaxed tracking-wide">
            Where time slows, seasonal gastronomy awakens, and refined hospitality is served with exquisite intention.
          </p>

          {/* Hero CTAs */}
          <div className="hero-reveal flex flex-col sm:flex-row items-center gap-4 pt-4 sm:pt-6">
            <Link to="/rooms">
              <Button
                variant="gold"
                size="lg"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
                className="w-48 sm:w-auto"
              >
                Reserve Suite
              </Button>
            </Link>
            <Link to="/menu">
              <Button
                variant="outline"
                size="lg"
                className="w-48 sm:w-auto text-[#FAF7F0] border-[#FAF7F0]/40 hover:border-[#FAF7F0] hover:bg-white/10"
              >
                Explore Dining
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToStory}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[#FAF7F0]/70 hover:text-[#C5A880] transition-colors flex flex-col items-center gap-2 cursor-pointer focus-visible:outline-none"
          aria-label="Scroll down to hotel story"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-medium">
            Discover
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </button>
      </section>

      {/* 2. INTRO / STORY SECTION */}
      <section
        id="story"
        ref={storyRef}
        className="py-24 sm:py-32 bg-[#FAF7F0] border-b border-[#E6DBCA] text-left"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Story Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#886E4B] font-semibold">
                <Compass className="w-4 h-4" />
                <span>Atithi Devo Bhava • Royal Indian Heritage</span>
              </div>

              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#121211] leading-[1.08] tracking-tight">
                Hospitality, served with <span className="italic font-normal text-[#886E4B]">intention.</span>
              </h2>

              <p className="text-base text-[#4A4740] font-sans leading-relaxed font-light">
                At JAS Hotel, dining is an imperial sensory ritual rooted in India's timeless royal courts.
                Every dish is conceived by Master Chef Ranveer Rathore, uniting slow-cooked Awadhi <em>dum</em>
                traditions, clay tandoor embers, and rich coastal spice harvests.
              </p>

              <p className="text-sm text-[#7A766C] font-sans leading-relaxed">
                From our legendary 48-hour slow-simmered Dal JAS and fragrant lamb biryani sealed under dough
                to hand-crafted saffron sheermal and chilled Ratnagiri mango lassis delivered in pure silver
                service to your suite, each plate honors majestic hospitality.
              </p>

              <div className="pt-4 grid grid-cols-3 gap-6 border-t border-[#E6DBCA]">
                <div>
                  <span className="font-serif text-3xl sm:text-4xl text-[#121211] font-light">24/7</span>
                  <p className="text-[11px] uppercase tracking-wider text-[#7A766C] mt-1 font-sans">
                    Suite Service
                  </p>
                </div>
                <div>
                  <span className="font-serif text-3xl sm:text-4xl text-[#121211] font-light">30m</span>
                  <p className="text-[11px] uppercase tracking-wider text-[#7A766C] mt-1 font-sans">
                    Fresh Tandoor
                  </p>
                </div>
                <div>
                  <span className="font-serif text-3xl sm:text-4xl text-[#121211] font-light">100%</span>
                  <p className="text-[11px] uppercase tracking-wider text-[#7A766C] mt-1 font-sans">
                    Desi Ghee & A2 Milk
                  </p>
                </div>
              </div>
            </div>

            {/* Right Asymmetrical Editorial Image Composition */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#E6DBCA] shadow-2xl bg-[#F3ECE0] aspect-[4/5] max-w-lg mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=85"
                  alt="Royal Indian fine dining presentation at JAS Hotel"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Floating Quote Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden sm:block absolute -bottom-8 -left-6 bg-[#1B1B19] text-[#FAF7F0] p-6 rounded-2xl border border-[#C5A880]/30 shadow-2xl max-w-xs text-left"
              >
                <div className="flex items-center gap-1 text-[#C5A880] mb-2">
                  <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                  <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                  <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                  <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                  <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                </div>
                <p className="font-serif italic text-sm text-[#FAF7F0]/90">
                  "An ode to royal Indian culinary grandeur. The Dal JAS and Awadhi Biryani set a gold standard."
                </p>
                <span className="block mt-2 text-[10px] uppercase tracking-widest text-[#C5A880]">
                  — Condé Nast Traveller India
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DINING CARDS */}
      <section className="py-24 sm:py-32 bg-[#F8F5EE] border-b border-[#E6DBCA] text-left">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#886E4B] font-semibold mb-2">
                <Utensils className="w-4 h-4" />
                <span>Executive Selections</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#121211] tracking-tight">
                Featured Culinary Creations
              </h2>
            </div>
            <Link to="/menu">
              <Button
                variant="outline"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
                className="shrink-0"
              >
                View Full Menu
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-[#E6DBCA] bg-[#FDFCF9] overflow-hidden">
                    <Skeleton className="aspect-[16/10] w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  </div>
                ))
              : featuredItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE SECTION (CINEMATIC PARALLAX) */}
      <section
        ref={experienceRef}
        className="relative py-36 sm:py-48 overflow-hidden bg-[#0A0A09] text-[#FAF7F0] flex items-center justify-center text-center"
      >
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={expImgRef}
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=85"
            alt="JAS Hotel dining hall"
            className="w-full h-full object-cover object-center will-change-transform opacity-40 scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A09] via-transparent to-[#0A0A09]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A880] font-medium block">
            The In-Room Dining Experience
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light leading-[1.05] tracking-tight text-[#FAF7F0]">
            An intimate dining table, <br />
            <span className="italic font-normal text-[#C5A880]">within your sanctuary.</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-[#D4CFC3] font-sans font-light leading-relaxed">
            From silver cloches lifted at your suite balcony to custom wine pairings curated by our master sommelier,
            JAS Hotel elevates every stay into an unforgettable private retreat.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link to="/menu">
              <Button variant="gold" size="lg">
                Explore The Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. STRONG FINAL CTA */}
      <section className="py-24 sm:py-32 bg-[#FAF7F0] text-center border-b border-[#E6DBCA]">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="w-12 h-12 rounded-full bg-[#F3ECE0] border border-[#E6DBCA] flex items-center justify-center text-[#886E4B] mx-auto">
            <Sparkles className="w-5 h-5 stroke-[1.5]" />
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#121211] tracking-tight leading-tight">
            Your table is <span className="italic font-normal text-[#886E4B]">waiting.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#7A766C] font-sans font-light max-w-xl mx-auto leading-relaxed">
            Order in-room room service directly to your suite or reserve your evening table at the main dining hall.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/rooms">
              <Button
                variant="gold"
                size="lg"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Book A Suite
              </Button>
            </Link>
            <Link to="/menu">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Explore Menu
              </Button>
            </Link>
            <Link to="/order">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Order Room Service
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
