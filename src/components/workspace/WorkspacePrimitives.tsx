import React from 'react';
import { LucideIcon, Info, ChevronDown } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  count?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  description?: string;
}

export const SectionHeader = ({ 
  title, 
  icon: Icon, 
  count, 
  isOpen, 
  onToggle, 
  description 
}: SectionHeaderProps) => (
  <button 
    onClick={onToggle}
    className={`w-full flex items-center justify-between px-5 py-3 transition-all ${isOpen ? 'bg-slate-50/50 border-b' : 'hover:bg-slate-50/30'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-sm border  ${isOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex flex-col items-start">
         <div className="flex items-center gap-2">
            <span className={`text-[11px] font-black uppercase tracking-tight ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>
              {title}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-0.5 hover:bg-slate-100 rounded-full transition-colors cursor-help group/info" onClick={(e) => e.stopPropagation()}>
                    <Info className="h-2.5 w-2.5 text-slate-300 group-hover/info:text-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white border-slate-800">
                  {description || "Forensic modality analysis section."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
         </div>
         {count !== undefined && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-0.5">{count} detected</span>}
      </div>
    </div>
    <ChevronDown className={`h-3.5 w-3.5 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-900' : ''}`} />
  </button>
);

interface KVPProps {
  label: string;
  value: any;
  badge?: {
    text: string;
    className: string;
  };
  subValue?: string;
}

export const KVP = ({ label, value, badge, subValue }: KVPProps) => (
  <div className="flex flex-col gap-0.5 py-1.5 last:pb-0">
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
      {badge && (
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${badge.className}`}>
          {badge.text}
        </span>
      )}
    </div>
    <div className="text-[11px] font-bold text-slate-800 leading-snug">
      {value || "No data detected"}
      {subValue && <span className="block text-[9px] font-bold text-slate-400 mt-0.5">{subValue}</span>}
    </div>
  </div>
);

interface StatusPillProps {
  text: string;
  type?: 'observed' | 'claimed' | 'review' | 'default' | 'urgent';
}

export const StatusPill = ({ text, type = 'default' }: StatusPillProps) => {
  const styles = {
    observed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    claimed: 'bg-blue-50 text-blue-700 border-blue-100',
    review: 'bg-amber-50 text-amber-700 border-amber-100',
    urgent: 'bg-rose-50 text-rose-700 border-rose-100',
    default: 'bg-slate-50 text-slate-600 border-slate-100'
  };

  return (
    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${styles[type]}`}>
      {text}
    </span>
  );
};
