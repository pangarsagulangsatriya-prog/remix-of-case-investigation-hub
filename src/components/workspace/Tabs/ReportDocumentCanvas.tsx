import React, { createContext, useContext } from 'react';
import { cn } from "@/lib/utils";

// A4 Landscape Dimensions at 96dpi
export const PAGE_WIDTH = 1123;
export const PAGE_HEIGHT = 794;

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
}

export const ReportPage: React.FC<ReportPageProps> = ({
  pageNumber,
  totalPages,
  title, // Can be used for semantic labels inside if needed, or ignored.
  version,
  status,
  children,
  isActive = false
}) => {
  const { zoom, panOffset } = useContext(ReportViewerContext);

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
          {/* Content Safe Area - 56px (p-14) / 48px equivalent */}
          <div className="flex-1 p-14 overflow-hidden flex flex-col">
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
