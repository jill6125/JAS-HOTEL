import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-[#F3ECE0] flex items-center justify-center text-[#886E4B] mb-5 border border-[#E6DBCA]">
        {icon || <UtensilsCrossed className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h3 className="font-serif text-2xl font-light text-[#121211] tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#7A766C] leading-relaxed mb-6 font-sans">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
