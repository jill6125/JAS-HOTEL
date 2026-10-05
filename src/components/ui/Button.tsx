import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-sans tracking-wide font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-[#121211] text-[#FAF7F0] hover:bg-[#292825] active:bg-[#0a0a09] border border-transparent shadow-sm',
      secondary:
        'bg-[#F3ECE0] text-[#121211] hover:bg-[#E6DBCA] active:bg-[#ded2bf] border border-[#E6DBCA]',
      outline:
        'bg-transparent text-[#121211] border border-[#121211]/30 hover:border-[#121211] hover:bg-[#121211]/5 active:bg-[#121211]/10',
      gold:
        'bg-[#C5A880] text-[#121211] hover:bg-[#D8BA8E] active:bg-[#B89970] font-semibold border border-transparent shadow-sm',
      ghost:
        'bg-transparent text-[#4A4740] hover:text-[#121211] hover:bg-[#F3ECE0]/60 active:bg-[#E6DBCA]/60',
      danger:
        'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:bg-red-200',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'text-xs uppercase tracking-widest px-3.5 py-1.5 rounded-md gap-1.5',
      md: 'text-sm tracking-wide px-5 py-2.5 rounded-lg gap-2',
      lg: 'text-base tracking-wider px-7 py-3.5 rounded-xl gap-2.5 font-medium',
      icon: 'p-2.5 rounded-lg w-10 h-10',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        whileHover={{ y: disabled || isLoading ? 0 : -1 }}
        transition={{ duration: 0.15 }}
        disabled={disabled || isLoading}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
