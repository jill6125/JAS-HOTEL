import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-[#FDFCF9] rounded-2xl border border-[#E6DBCA] overflow-hidden transition-all duration-300',
          hoverEffect && 'hover:shadow-xl hover:border-[#C5A880]/50 hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
