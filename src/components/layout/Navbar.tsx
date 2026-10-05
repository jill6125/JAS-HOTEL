import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart, useAuth } from '../../hooks';
import { ShoppingBag, User, Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change without cascading effects
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Suites', path: '/rooms' },
    { label: 'Menu', path: '/menu' },
    { label: 'Order', path: '/order' },
    { label: 'About', path: '/#story' },
  ];

  const handleNavClick = (path: string) => {
    if (path.startsWith('/#')) {
      if (isHome) {
        const id = path.replace('/#', '');
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const id = path.replace('/#', '');
          const elem = document.getElementById(id);
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-out text-left',
          isScrolled
            ? 'bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#E6DBCA] py-3.5 shadow-sm text-[#121211]'
            : isHome
            ? 'bg-transparent py-6 text-[#FAF7F0]'
            : 'bg-[#FAF7F0] border-b border-[#E6DBCA] py-4 text-[#121211]'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
            aria-label="JAS Hotel Home"
          >
            <span className="font-serif text-2xl sm:text-3xl font-light tracking-[0.2em] uppercase transition-colors">
              JAS <span className="font-normal text-[#C5A880]">Hotel</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <div key={link.label} className="relative">
                  {link.path.startsWith('/#') ? (
                    <button
                      type="button"
                      onClick={() => handleNavClick(link.path)}
                      className={cn(
                        'text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#C5A880] cursor-pointer',
                        isScrolled || !isHome ? 'text-[#4A4740]' : 'text-[#FAF7F0]/90'
                      )}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.path}
                      className={cn(
                        'text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#C5A880]',
                        isActive
                          ? 'text-[#C5A880] font-semibold'
                          : isScrolled || !isHome
                          ? 'text-[#4A4740]'
                          : 'text-[#FAF7F0]/90'
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C5A880]"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Icons (Cart, Account, CTA) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Account Link / State */}
            <Link
              to="/account"
              className={cn(
                'p-2 rounded-full transition-colors flex items-center gap-2 text-xs uppercase tracking-wider',
                isScrolled || !isHome
                  ? 'text-[#4A4740] hover:text-[#121211] hover:bg-[#F3ECE0]'
                  : 'text-[#FAF7F0]/90 hover:text-white hover:bg-white/10'
              )}
              aria-label="Guest Account"
            >
              <User className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden lg:inline text-[11px] font-medium">
                {user ? user.name.split(' ')[0] : 'Account'}
              </span>
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={openCart}
              id="navbar-cart-button"
              className={cn(
                'relative p-2.5 rounded-full transition-all duration-200 cursor-pointer',
                isScrolled || !isHome
                  ? 'text-[#121211] hover:bg-[#F3ECE0]'
                  : 'text-[#FAF7F0] hover:bg-white/10'
              )}
              aria-label={`Open Cart (${totalItems} items)`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#C5A880] text-[#121211] text-[10px] font-bold font-mono flex items-center justify-center shadow-xs"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* Prominent Order CTA (Desktop) */}
            <Link
              to="/order"
              className={cn(
                'hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all duration-300',
                isScrolled || !isHome
                  ? 'bg-[#121211] text-[#FAF7F0] hover:bg-[#292825]'
                  : 'bg-[#FAF7F0] text-[#121211] hover:bg-[#F3ECE0] shadow-md'
              )}
            >
              <span>Order Dining</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              id="mobile-nav-toggle"
              className={cn(
                'md:hidden p-2 rounded-lg transition-colors',
                isScrolled || !isHome
                  ? 'text-[#121211] hover:bg-[#F3ECE0]'
                  : 'text-[#FAF7F0] hover:bg-white/10'
              )}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Animated Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-30 bg-[#FAF7F0] pt-24 px-6 pb-12 flex flex-col justify-between md:hidden"
          >
            <div className="space-y-6 pt-6 text-left">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#886E4B] font-semibold block">
                JAS Hotel Dining
              </span>
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    {link.path.startsWith('/#') ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleNavClick(link.path);
                        }}
                        className="font-serif text-3xl text-[#121211] hover:text-[#C5A880] transition-colors block py-1 text-left w-full"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-serif text-3xl text-[#121211] hover:text-[#C5A880] transition-colors block py-1"
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-3xl text-[#121211] hover:text-[#C5A880] transition-colors block py-1"
                >
                  Guest Account {user ? `(${user.name.split(' ')[0]})` : ''}
                </Link>
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#E6DBCA] text-left">
              <div className="flex items-center justify-between text-xs text-[#7A766C]">
                <span>Room Service Delivery</span>
                <span className="font-medium text-[#121211]">24 / 7 Available</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/rooms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-3 bg-[#C5A880] text-[#121211] rounded-xl text-xs uppercase tracking-widest font-semibold shadow-sm text-center"
                >
                  <span>Book Suite</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-3 bg-[#121211] text-[#FAF7F0] rounded-xl text-xs uppercase tracking-widest font-semibold shadow-sm text-center"
                >
                  <span>Order Dining</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
