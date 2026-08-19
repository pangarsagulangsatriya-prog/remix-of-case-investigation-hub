import React, { createContext, useContext } from 'react';
import { cn } from "@/lib/utils";

// Google Slide 16:9 Dimensions at 96dpi
export const PAGE_WIDTH = 960;
export const PAGE_HEIGHT = 540;

interface ReportViewerContextType {
  zoom: number;
  panOffset: { x: number; y: number };
}

export const ReportViewerContext = createContext<ReportViewerContextType>({ 
  zoom: 1, 
  panOffset: { x: 0, y: 0 } 
});

interface ReportPageProps {
  pageNumber: number;
  totalPages: number;
  title: string;
  version: string;
  status: string;
  children: React.ReactNode;
  isActive?: boolean;
  isThumbnail?: boolean;
  isLoading?: boolean;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  pageNumber,
  totalPages,
  title, // Can be used for semantic labels inside if needed, or ignored.
  version,
  status,
  children,
  isActive = false,
  isThumbnail = false,
  isLoading = false
}) => {
  const { zoom, panOffset } = useContext(ReportViewerContext);

  const skeletonOverlay = (
    <div className="absolute inset-0 z-20 bg-white p-14 flex flex-col gap-6 animate-pulse pointer-events-none">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="h-6 w-1/3 bg-slate-100 rounded" />
        <div className="h-4 w-16 bg-slate-50 rounded" />
      </div>
      <div className="h-8 w-2/3 bg-slate-100 rounded mb-4" />
      <div className="flex gap-4">
        <div className="flex-1 h-32 bg-slate-50 rounded border border-slate-100" />
        <div className="flex-1 h-32 bg-slate-50 rounded border border-slate-100" />
      </div>
      <div className="flex-1 mt-4 bg-slate-50 rounded border border-slate-100" />
    </div>
  );

  if (isThumbnail) {
    return (
      <div className="w-full h-full relative overflow-hidden pointer-events-none select-none flex justify-center bg-slate-50">
        <div 
          className="absolute top-0 left-0 bg-white flex flex-col origin-top-left"
          style={{ 
            width: `${PAGE_WIDTH}px`, 
            height: `${PAGE_HEIGHT}px`,
            // Provide a CSS variable or default to a safe scale that fits within standard thumbnail containers.
            // A 16:9 thumbnail might be roughly 144x81px. Scale = 144 / 960 = 0.15
            transform: `scale(var(--thumbnail-scale, 0.15))`
          }}
        >
          {isLoading && skeletonOverlay}
          <div className={cn("flex-1 p-14 overflow-hidden flex flex-col bg-white transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "absolute inset-0 flex justify-center w-full h-full transition-opacity duration-150 ease-in-out",
        isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
      )}
      style={{
        transform: isActive ? `translate(${panOffset.x}px, ${panOffset.y}px)` : 'none',
      }}
    >
      <div 
        className="relative shrink-0 flex items-center justify-center transition-transform duration-150 ease-in-out"
        style={{ 
          width: PAGE_WIDTH * zoom, 
          height: PAGE_HEIGHT * zoom, 
          marginTop: 48, 
          marginBottom: 48 
        }} 
      >
        <div 
          className="absolute top-0 left-0 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col overflow-hidden shrink-0 print:relative print:shadow-none print:border-none"
          style={{ 
            width: `${PAGE_WIDTH}px`, 
            height: `${PAGE_HEIGHT}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
          {isLoading && skeletonOverlay}
          {/* Content Safe Area - 56px (p-14) / 48px equivalent */}
          <div className={cn("flex-1 p-14 overflow-hidden flex flex-col transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}>
            {children}
          </div>
          
          {/* Subtle Muted Footer Pagination */}
          <div className="absolute bottom-8 right-14 text-[11px] font-semibold text-slate-400 no-print">
            {String(pageNumber).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};
