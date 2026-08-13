const fs = require('fs');

const content = `import React, { createContext, useContext, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

// Widescreen Canvas Size
export const PAGE_WIDTH = 1920;
export const PAGE_HEIGHT = 1080;

interface ReportViewerContextType {
  zoom: number;
  panOffset: { x: number; y: number };
}

export const ReportViewerContext = createContext<ReportViewerContextType>({ zoom: 1, panOffset: { x: 0, y: 0 } });

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
  title,
  version,
  status,
  children,
  isActive = false
}) => {
  const { zoom, panOffset } = useContext(ReportViewerContext);

  return (
    <div 
      className={cn(
        "absolute inset-0 flex justify-center w-full h-full transition-opacity duration-150",
        isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
      )}
      style={{
        transform: isActive ? \`translate(\${panOffset.x}px, \${panOffset.y}px)\` : 'none',
      }}
    >
      <div 
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: PAGE_WIDTH * zoom, height: PAGE_HEIGHT * zoom, marginTop: 48, marginBottom: 48 }} 
      >
        <div 
          className="absolute top-0 left-0 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col overflow-hidden shrink-0 print:relative print:shadow-none print:border-none"
          style={{ 
            width: \`\${PAGE_WIDTH}px\`, 
            height: \`\${PAGE_HEIGHT}px\`,
            transform: \`scale(\${zoom})\`,
            transformOrigin: 'top left'
          }}
        >
          {/* Content Safe Area */}
          <div className="flex-1 p-12 overflow-hidden flex flex-col">
            {children}
          </div>
          
          {/* Subtle Footer Pagination */}
          <div className="absolute bottom-6 right-12 text-[10px] font-bold text-slate-400">
            {String(pageNumber).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/workspace/Tabs/ReportDocumentCanvas.tsx', content);
