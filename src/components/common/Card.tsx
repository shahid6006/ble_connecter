import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 md:p-6 shadow-xl backdrop-blur-sm transition-all duration-200 ${
        glow ? 'border-cyan-500/30 shadow-cyan-950/20' : 'hover:border-slate-700/80'
      } ${className}`}
    >
      {children}
    </div>
  );
};
