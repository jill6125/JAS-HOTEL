import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Preparing dining selection...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 space-y-4">
      <div className="relative">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
      </div>
      <p className="font-serif italic text-lg text-[#7A766C] tracking-wide">
        {message}
      </p>
    </div>
  );
};
