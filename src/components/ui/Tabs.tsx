import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1.5 p-1 bg-[#F3ECE0]/80 rounded-xl border border-[#E6DBCA] overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-2 text-xs uppercase tracking-widest font-medium rounded-lg transition-colors whitespace-nowrap z-10 cursor-pointer',
              isActive ? 'text-[#121211]' : 'text-[#7A766C] hover:text-[#121211]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[#FDFCF9] rounded-lg shadow-sm border border-[#E6DBCA]/70 z-[-1]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                    isActive ? 'bg-[#C5A880]/20 text-[#886E4B]' : 'bg-[#E6DBCA] text-[#7A766C]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
