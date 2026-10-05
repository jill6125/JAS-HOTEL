import React, { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'gold' | 'charcoal' | 'ivory' | 'outline' | 'success' | 'warning';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'gold',
  children,
  ...props
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    gold: 'bg-[#C5A880]/20 text-[#886E4B] border border-[#C5A880]/40',
    charcoal: 'bg-[#121211] text-[#FAF7F0] border border-[#121211]',
    ivory: 'bg-[#F3ECE0] text-[#4A4740] border border-[#E6DBCA]',
    outline: 'bg-transparent text-[#7A766C] border border-[#E6DBCA]',
    success: 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-800 border border-amber-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-widest uppercase font-sans select-none',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
