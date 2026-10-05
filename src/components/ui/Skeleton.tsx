import React, { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[#E6DBCA]/50', className)}
      {...props}
    />
  );
};
