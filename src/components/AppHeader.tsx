import { Search, Bell, ChevronDown, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="h-11 flex items-center justify-between border-b px-3 bg-background shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-7 w-7">
          <Menu className="h-4 w-4" />
        </SidebarTrigger>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search cases, evidence, reports..."
            className="h-7 w-72 pl-7 text-xs bg-surface-sunken border-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => navigate("/cases/new")}
        >
          <Plus className="h-3 w-3" />
          New Case
        </Button>

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
