import { Bell, ChevronDown, Menu, Dices, PowerOff } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { InvestigationIntelligenceLogo } from "./BrandLogo";

export function AppHeader() {
  return (
    <header className="h-11 flex items-center justify-between border-b px-3 bg-white shrink-0 antialiased">
      <div className="flex items-center gap-2 px-3">
        {/* Logo removed as requested */}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('demo:reset'))}
            className="h-8 w-8 rounded-sm bg-slate-100 flex items-center justify-center border hover:bg-slate-200 transition-colors"
            title="Hard Reset (Demo)"
          >
            <PowerOff className="h-4 w-4 text-rose-500" />
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('demo:rollDice'))}
            className="h-8 w-8 rounded-sm bg-slate-100 flex items-center justify-center border hover:bg-slate-200 transition-colors"
            title="Roll the Dice (Demo)"
          >
            <Dices className="h-4 w-4 text-amber-500" />
          </button>
          <div className="h-8 w-8 rounded-sm bg-slate-100 flex items-center justify-center relative border">
            <Bell className="h-4 w-4 text-slate-500" />
            <div className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
          </div>
          
          <div className="flex items-center gap-2 group cursor-pointer pl-2 border-l">
            <div className="h-8 w-8 rounded-sm bg-emerald-600 flex items-center justify-center text-[11px] font-black text-white ">
              JD
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
