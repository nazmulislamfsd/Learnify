import React from 'react';

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center group ${className}`}>
      {/* Rebranded Typography */}
      <div className="flex flex-col -space-y-1">
        <div className="flex items-baseline">
          <span className="text-2xl font-display font-black tracking-tighter text-white">
            LEARNI
          </span>
          <span className="text-2xl font-display font-black tracking-tighter bg-gradient-to-tr from-brand-primary to-orange-400 bg-clip-text text-transparent">
            Fy
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">
          Empower Your Potential
        </span>
      </div>
    </div>
  );
}
