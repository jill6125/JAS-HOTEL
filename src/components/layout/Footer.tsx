import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121211] text-[#FAF7F0] pt-20 pb-12 border-t border-[#292825] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-[#292825]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl tracking-[0.2em] uppercase font-light text-[#FAF7F0]">
                JAS <span className="text-[#C5A880] font-normal">Hotel</span>
              </span>
            </Link>
            <p className="text-sm text-[#A9A497] max-w-sm leading-relaxed font-sans font-light">
              Hospitality, served with intention. Experience culinary craftsmanship, bespoke in-suite dining, and timeless sanctuary moments.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880]">
              <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
              <span>In-Room Dining Kitchen Open 24/7</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-medium font-sans">
              Culinary & Suites
            </h3>
            <ul className="space-y-2.5 text-sm text-[#A9A497]">
              <li>
                <Link to="/" className="hover:text-[#FAF7F0] transition-colors">
                  The Sanctuary
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-[#FAF7F0] transition-colors">
                  Suites & Chambers
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#FAF7F0] transition-colors">
                  Seasonal Dining Menu
                </Link>
              </li>
              <li>
                <Link to="/order" className="hover:text-[#FAF7F0] transition-colors">
                  Room Service
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#FAF7F0] transition-colors">
                  Guest Concierge Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Hotel Information */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-medium font-sans">
              Sanctuary Location
            </h3>
            <ul className="space-y-3 text-xs text-[#A9A497] font-sans">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>42 Nariman Point, Marine Drive, Mumbai, Maharashtra 400021, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>+91 (022) 6698 8000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>dining@jashotel.in</span>
              </li>
            </ul>
          </div>

          {/* Dining Service Hours */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-medium font-sans">
              Dining Hours
            </h3>
            <div className="space-y-2 text-xs text-[#A9A497] font-sans">
              <div>
                <p className="text-[#FAF7F0] font-medium">Breakfast & Brunch</p>
                <p className="text-[11px]">06:30 — 11:30 Daily</p>
              </div>
              <div>
                <p className="text-[#FAF7F0] font-medium">All-Day & Fine Dinner</p>
                <p className="text-[11px]">12:00 — 23:30 Daily</p>
              </div>
              <div>
                <p className="text-[#FAF7F0] font-medium">Night Owl Room Service</p>
                <p className="text-[11px]">23:30 — 06:30 Daily</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A766C]">
          <p>© {CURRENT_YEAR} JAS Hotel & Luxury Hospitality Group. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#A9A497] transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#A9A497] transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#A9A497] transition-colors cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
