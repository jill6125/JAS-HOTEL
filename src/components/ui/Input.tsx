import React, { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs uppercase tracking-widest font-medium text-[#4A4740]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#7A766C] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              'w-full bg-[#FDFCF9] text-[#121211] placeholder:text-[#A9A497] text-sm rounded-lg border border-[#E6DBCA] px-3.5 py-2.5 transition-all duration-200 outline-none',
              'focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20',
              leftIcon && 'pl-10',
              isPassword && 'pr-10',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-400/20',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-[#7A766C] hover:text-[#121211] transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-600 font-sans tracking-wide">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-[#7A766C] font-sans">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
