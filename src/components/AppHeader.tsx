import { Bell, ChevronDown, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { InvestigationIntelligenceLogo } from "./BrandLogo";

export function AppHeader() {
  return (
    <header className="h-11 flex items-center justify-between border-b px-3 bg-white shrink-0 antialiased">
      <div className="flex items-center gap-2 px-3">
        <InvestigationIntelligenceLogo className="h-6 w-auto" />
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors">
          <span>Site Alpha</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        <button className="relative p-1.5 rounded hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted transition-colors">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xs font-semibold text-primary-foreground">JD</span>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
