import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useTour, TOUR_STEPS } from './TourContext';
import { X, ChevronRight, ChevronLeft, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ProductTourOverlay: React.FC = () => {
  const { isActive, currentStep, nextStep, prevStep, endTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS.find(s => s.id === currentStep);

  const updatePosition = () => {
    if (!isActive || !step) return;
    
    // Sometimes elements animate in, so a small timeout or requestAnimationFrame helps
    setTimeout(() => {
      const element = document.getElementById(step.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
        // Scroll into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        setTargetRect(null);
      }
    }, 100);
  };

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isActive, currentStep, step]);

  if (!isActive || !step) return null;

  const getTooltipPosition = () => {
    if (!targetRect) return {};
    
    const spacing = 16;
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = targetRect.bottom + spacing;
        left = targetRect.left + (targetRect.width / 2) - 150; // assuming card is ~300px wide
        break;
      case 'top':
        top = targetRect.top - spacing - 200; // rough height estimate
        left = targetRect.left + (targetRect.width / 2) - 150;
        break;
      case 'left':
        top = targetRect.top;
        left = targetRect.left - spacing - 320;
        break;
      case 'right':
        top = targetRect.top;
        left = targetRect.right + spacing;
        break;
      case 'center':
        top = window.innerHeight / 2 - 100;
        left = window.innerWidth / 2 - 150;
        break;
    }

    // Keep within bounds
    if (left < 16) left = 16;
    if (left + 320 > window.innerWidth) left = window.innerWidth - 336;
    if (top < 16) top = 16;
    if (top + 200 > window.innerHeight) top = window.innerHeight - 216;

    return { top, left };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* 
        Reverse shadow technique: 
        We draw an absolutely positioned transparent box over the target, 
        and give it a massive box shadow to dim everything else.
      */}
      {targetRect && (
        <div 
          className="absolute transition-all duration-500 ease-in-out bg-transparent ring-2 ring-emerald-500 rounded-sm"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
            pointerEvents: 'none' // The user cannot click the dimmed area
          }}
        />
      )}

      {/* When no target, just dim whole screen */}
      {!targetRect && (
        <div className="absolute inset-0 bg-slate-900/65 transition-opacity" />
      )}

      {/* Floating Tooltip Card */}
      {targetRect && (
        <div 
          className="absolute bg-white border border-slate-200 p-5 w-[320px] rounded-lg pointer-events-auto transition-all duration-500 ease-in-out flex flex-col gap-3 shadow-2xl animate-in zoom-in-95"
          style={getTooltipPosition()}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
              Langkah {currentStep} / {TOUR_STEPS.length}
            </span>
            <button 
              onClick={endTour}
              className="p-1 hover:bg-slate-100 rounded-sm transition-colors text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight mb-1.5">{step.title}</h3>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{step.content}</p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
            <button 
              onClick={endTour}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Lewati
            </button>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevStep}
                disabled={currentStep === 1}
                className="h-8 px-3 rounded-none text-[10px] font-bold border-slate-200 text-slate-600"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
              {currentStep < TOUR_STEPS.length ? (
                <Button 
                  size="sm" 
                  onClick={nextStep}
                  className="h-8 px-4 rounded-none text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Lanjut <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={endTour}
                  className="h-8 px-4 rounded-none text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Selesai <Flag className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
