import React from "react";

export function BerauCoalLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 
         Simplified SVG representation of Berau Coal logo based on user-provided image 
         Green bars representing industry growth and safety + diamond frame
      */}
      <svg width="32" height="32" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" rx="40" fill="#333333" />
        <path d="M180 150L220 180H60L100 150H180Z" fill="white" />
        <path d="M40 80L160 30L210 50L90 100L40 80Z" fill="#33832E" />
        <path d="M60 120L180 70L230 90L110 140L60 120Z" fill="#33832E" />
        <path d="M80 160L200 110L250 130L130 180L80 160Z" fill="#33832E" />
      </svg>
      <span className="font-bold tracking-tight text-inherit">BERAU COAL</span>
    </div>
  );
}

export function InvestigationIntelligenceLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-8 w-8 bg-green-700 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <span className="font-bold text-slate-900 tracking-tight">Investigation Intelligence</span>
    </div>
  );
}
