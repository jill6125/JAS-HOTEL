import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAF7F0] flex items-center justify-center text-center">
      <div className="max-w-md mx-auto px-6 space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#F3ECE0] border border-[#E6DBCA] flex items-center justify-center text-[#886E4B] mx-auto">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>

        <span className="text-xs uppercase tracking-[0.3em] text-[#886E4B] font-semibold block">
          Error 404
        </span>

        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#121211] tracking-tight">
          Page Not Found
        </h1>

        <p className="text-sm text-[#7A766C] font-sans font-light leading-relaxed">
          The requested sanctuary chamber does not exist or may have been relocated. Allow us to escort you back to our grand salon.
        </p>

        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Sanctuary
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
