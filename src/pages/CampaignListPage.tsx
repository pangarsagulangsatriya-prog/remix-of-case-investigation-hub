import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useCases, useDeleteCase } from "@/hooks/useCases";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { 
  Loader2, 
  AlertCircle, 
  Trash2, 
  AlertTriangle,
  Info,
  List,
  FileText,
  Globe,
  Clock,
  History,
  MoreVertical,
  ExternalLink,
  Search,
  Grid,
  Filter,
  LayoutGrid,
  Plus,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Paperclip,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Upload,
  Folder,
  Folders,
  Cpu,
  Check,
  Mic as AudioIcon,
  Video as VideoIcon,
  Image as ImageIcon,
  Database,
  Dices,
  PowerOff,
  User,
  Activity
} from "lucide-react";

// Mock types for legacy compatibility if needed, but we'll use Case from hook
import type { Case } from "@/hooks/useCases";

const getSiteFromDescription = (desc?: string) => {
  if (!desc) return "Site Alpha";
  const match = desc.match(/\[Site:\s*([^\]]+)\]/);
  return match ? match[1] : "Site Alpha";
};

type ViewMode = "table" | "grid-compact" | "grid-expanded";

const HeaderTooltip = ({ label, description, sourceLabel, className = "" }: { label: string; description: string; sourceLabel?: string; className?: string }) => (
  <th className={className}>
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help hover:text-slate-800 transition-colors">
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white p-3.5 max-w-[280px] border border-slate-200 shadow-xl rounded-lg font-normal normal-case">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-slate-800 tracking-wide">{label}</span>
              {sourceLabel && (
                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200/50 px-1.5 py-0.5 rounded-sm uppercase tracking-wider whitespace-nowrap">
                  {sourceLabel}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-slate-600 leading-relaxed text-left">{description}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </th>
);

export default function CaseListPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [caseToCreate, setCaseToCreate] = useState<Case | null>(null);
  const [createdCaseIds, setCreatedCaseIds] = useState<Set<string>>(new Set());
  const [incidentDateRange, setIncidentDateRange] = useState<DateRange | undefined>();
  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDetailLocations, setSelectedDetailLocations] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isStepperExpanded, setIsStepperExpanded] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    noInsiden: true,
    kategori: true,
    waktuInsiden: true,
    waktuPelaporan: true,
    perusahaan: true,
    site: true,
    lokasi: true,
    detailLokasi: true,
    statusInvestigasi: true,
    statusAi: true,
  });

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategories,
    selectedCompanies,
    selectedSites,
    selectedLocations,
    selectedDetailLocations,
    selectedStatuses,
    incidentDateRange,
    reportDateRange
  ]);  // Cascading lists helper
  const availableLocations = selectedSites.flatMap(site => {
    if (site === "GMO") return ["Pit J", "Pit A"];
    if (site === "Site Alpha") return ["Pit B"];
    if (site === "Site Beta") return ["Pit C", "Pit D"];
    return [];
  });

  const availableDetailLocations = selectedLocations.flatMap(loc => {
    if (loc === "Pit J") return ["Area Loading", "Workshop"];
    if (loc === "Pit A") return ["Hauling Road"];
    if (loc === "Pit B") return ["Workshop B"];
    if (loc === "Pit C") return ["Pit C Area"];
    if (loc === "Pit D") return ["Pit D Area"];
    return [];
  });

  // Reset Lokasi & Detail Lokasi if parent changes
  useEffect(() => {
    if (selectedSites.length === 0) {
      setSelectedLocations([]);
      setSelectedDetailLocations([]);
    } else {
      setSelectedLocations(prev => prev.filter(loc => availableLocations.includes(loc)));
    }
  }, [selectedSites]);

  useEffect(() => {
    if (selectedLocations.length === 0) {
      setSelectedDetailLocations([]);
    } else {
      setSelectedDetailLocations(prev => prev.filter(dt => availableDetailLocations.includes(dt)));
    }
  }, [selectedLocations]);

  // Database Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [syncLogs, setSyncLogs] = useState([
    { id: 1, time: new Date(Date.now() - 3600000 * 2), status: "success", type: "auto", detail: "Updated 12 rows, 0 failed. Synced Evidence documents." },
    { id: 2, time: new Date(Date.now() - 3600000 * 24), status: "failed", type: "auto", detail: "Failed to sync 2 rows due to network timeout." },
  ]);

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCompanies([]);
    setIncidentDateRange(undefined);
    setReportDateRange(undefined);
    setSelectedSites([]);
    setSelectedLocations([]);
    setSelectedDetailLocations([]);
    setSelectedStatuses([]);
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedCompanies.length + 
    (incidentDateRange?.from ? 1 : 0) + 
    (reportDateRange?.from ? 1 : 0) + 
    selectedSites.length + 
    selectedLocations.length + 
    selectedDetailLocations.length +
    selectedStatuses.length;

  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
      setSyncLogs(prev => [
        { id: Date.now(), time: new Date(), status: "success", type: "manual", detail: "Updated 5 incidents, synced 3 new evidence files." },
        ...prev
      ]);
      toast.success("Database synced successfully");
    }, 2500);
  };

  const { data: casesData, isLoading, error } = useCases();
  const deleteCaseMutation = useDeleteCase();
  const cases = casesData || [];

  const [demoStatuses, setDemoStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleReset = () => {
      const newStatuses: Record<string, string> = {};
      cases.forEach(c => newStatuses[c.id] = "belum_dimulai");
      setDemoStatuses(newStatuses);
      toast.success("DEMO: Semua status di-reset ke Belum Dimulai");
    };

    const handleRoll = () => {
      const statuses = ["belum_dimulai", "draft", "selesai"];
      const newStatuses: Record<string, string> = {};
      cases.forEach(c => newStatuses[c.id] = statuses[Math.floor(Math.random() * statuses.length)]);
      setDemoStatuses(newStatuses);
      toast.success("DEMO: Status AI diacak");
    };

    window.addEventListener('demo:reset', handleReset);
    window.addEventListener('demo:rollDice', handleRoll);
    return () => {
      window.removeEventListener('demo:reset', handleReset);
      window.removeEventListener('demo:rollDice', handleRoll);
    };
  }, [cases]);

  const getCaseStatus = (c: Case) => {
    if (demoStatuses[c.id]) return demoStatuses[c.id];
    if (createdCaseIds.has(c.id)) return "draft";
    return ["belum_dimulai", "draft", "selesai"][cases.indexOf(c) % 3];
  };

  const filteredCases = cases.filter((c, i) => {
    if (selectedCategories.length > 0) {
      const category = ["Near Miss", "Medical Treatment Injury", "Property Damage", "First Aid", "Fatality"][i % 5];
      if (!selectedCategories.includes(category)) return false;
    }
    if (selectedCompanies.length > 0) {
      const company = "PT Bumi Tambang Nusantara";
      if (!selectedCompanies.includes(company)) return false;
    }
    if (selectedSites.length > 0) {
      const site = "GMO";
      if (!selectedSites.includes(site)) return false;
    }
    if (selectedLocations.length > 0) {
      const location = "Pit J";
      if (!selectedLocations.includes(location)) return false;
    }
    if (selectedDetailLocations.length > 0) {
      const detail = "Area Loading";
      if (!selectedDetailLocations.includes(detail)) return false;
    }
    if (selectedStatuses.length > 0) {
      const statusAI = getCaseStatus(c);
      if (!selectedStatuses.includes(statusAI)) return false;
    }
    if (incidentDateRange?.from) {
      const incidentDateObj = new Date("2026-04-05");
      if (incidentDateObj < incidentDateRange.from) return false;
      if (incidentDateRange.to && incidentDateObj > incidentDateRange.to) return false;
    }
    if (reportDateRange?.from) {
      const reportDateObj = new Date("2026-04-08");
      if (reportDateObj < reportDateRange.from) return false;
      if (reportDateRange.to && reportDateObj > reportDateRange.to) return false;
    }
    return true;
  });

  const itemsPerPage = 15;
  const totalItems = filteredCases.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const activePage = currentPage > totalPages ? 1 : currentPage;
  
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedCases = filteredCases.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Toolbar */}
        <div className="filter-bar border-b-0 h-10 px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-bold text-foreground">Investigation Campaign</h1>
            <span className="text-2xs font-medium text-muted-foreground px-1.5 py-0.5 bg-muted rounded-full">{filteredCases.length}</span>
          </div>
          <div className="flex-1" />
        </div>

        {/* Filter Selection Panel */}
        <div className="flex flex-col border-y bg-slate-50/50">
          {/* Main Top Bar */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  placeholder="Search ID Investigasi..." 
                  className="h-8 w-60 pl-8 text-xs bg-white border-slate-200 focus-visible:ring-primary/20"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 gap-1.5 font-semibold text-xs transition-all ${showFilters ? "bg-slate-100 border-slate-300 text-slate-900 shadow-inner" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"} ${activeFiltersCount > 0 ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className={`h-3.5 w-3.5 ${activeFiltersCount > 0 ? "text-primary" : "text-slate-500"}`} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 font-semibold text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    Kolom
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2 bg-white border shadow-lg rounded-md z-30">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5 border-b mb-1">Tampilkan Kolom</div>
                  {[
                    { key: "noInsiden", label: "No Insiden" },
                    { key: "kategori", label: "Kategori Insiden" },
                    { key: "waktuInsiden", label: "Waktu Insiden" },
                    { key: "waktuPelaporan", label: "Waktu Pelaporan" },
                    { key: "perusahaan", label: "Perusahaan Pelapor" },
                    { key: "site", label: "Site" },
                    { key: "lokasi", label: "Lokasi" },
                    { key: "detailLokasi", label: "Detail Lokasi" },
                    { key: "statusInvestigasi", label: "Status Investigasi" },
                    { key: "statusAi", label: "Status AI" },
                  ].map((col) => {
                    const isChecked = visibleColumns[col.key];
                    return (
                      <div
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-50 text-xs font-semibold text-slate-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVisibleColumns(prev => ({
                            ...prev,
                            [col.key]: !prev[col.key]
                          }));
                        }}
                      >
                        <Checkbox checked={isChecked} />
                        <span>{col.label}</span>
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Sync</span>
                <span className="text-xs font-semibold text-slate-700">{lastSyncTime.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})} {lastSyncTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <Button 
                size="icon"
                variant="ghost" 
                className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full"
                onClick={() => setIsLogsModalOpen(true)}
                title="View Sync Logs"
              >
                <History className="h-4 w-4" />
              </Button>
              <div className="h-6 w-[1px] bg-slate-200 mx-1" />
              <Button 
                size="sm" 
                variant="outline"
                disabled={isSyncing}
                className="h-8 px-3 text-xs font-bold gap-2 bg-white hover:bg-slate-50 transition-all border-slate-200"
                onClick={handleSyncData}
              >
                {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <RefreshCw className="h-3.5 w-3.5 text-primary" />}
                {isSyncing ? "Syncing..." : "Sync Data"}
              </Button>
            </div>
          </div>

          {/* Collapsible Expanded Filters */}
          {showFilters && (
            <div className="px-4 py-3 border-t bg-slate-100/30 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 items-end w-full">
                {/* Kategori Insiden */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Insiden</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 pl-3 pr-2 text-xs font-normal w-full justify-between shadow-none cursor-pointer border transition-colors ${selectedCategories.length > 0 ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                      >
                        <span className="truncate">
                          {selectedCategories.length > 0 ? `Kategori (${selectedCategories.length})` : "Kategori Insiden"}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 bg-white shadow-lg border rounded-md" align="start">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</span>
                        {selectedCategories.length > 0 && (
                          <button onClick={() => setSelectedCategories([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600">Clear</button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {["Near Miss", "Medical Treatment Injury", "Property Damage", "First Aid", "Fatality"].map((cat) => {
                          const isChecked = selectedCategories.includes(cat);
                          return (
                            <div 
                              key={cat}
                              className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-slate-50"
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedCategories(selectedCategories.filter(c => c !== cat));
                                } else {
                                  setSelectedCategories([...selectedCategories, cat]);
                                }
                              }}
                            >
                              <Checkbox checked={isChecked} />
                              <span className="text-xs text-slate-700 font-medium">{cat}</span>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Perusahaan Pelapor */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan Pelapor</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 pl-3 pr-2 text-xs font-normal w-full justify-between shadow-none cursor-pointer border transition-colors ${selectedCompanies.length > 0 ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                      >
                        <span className="truncate">
                          {selectedCompanies.length > 0 ? `Perusahaan (${selectedCompanies.length})` : "Perusahaan Pelapor"}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 bg-white shadow-lg border rounded-md" align="start">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan</span>
                        {selectedCompanies.length > 0 && (
                          <button onClick={() => setSelectedCompanies([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600">Clear</button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {["PT Bumi Tambang Nusantara", "PT Tambang Makmur", "PT Energy Jaya"].map((comp) => {
                          const isChecked = selectedCompanies.includes(comp);
                          return (
                            <div 
                              key={comp}
                              className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-slate-50"
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedCompanies(selectedCompanies.filter(c => c !== comp));
                                } else {
                                  setSelectedCompanies([...selectedCompanies, comp]);
                                }
                              }}
                            >
                              <Checkbox checked={isChecked} />
                              <span className="text-xs text-slate-700 font-medium truncate">{comp}</span>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Waktu Insiden */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Insiden</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative inline-flex items-center w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 pl-3 pr-8 text-xs font-normal w-full justify-between shadow-none cursor-pointer border transition-colors ${incidentDateRange?.from ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate">
                              {incidentDateRange?.from ? (
                                incidentDateRange.to ? (
                                  `${format(incidentDateRange.from, "dd MMM yyyy")} - ${format(incidentDateRange.to, "dd MMM yyyy")}`
                                ) : (
                                  format(incidentDateRange.from, "dd MMM yyyy")
                                )
                              ) : (
                                "Waktu Insiden"
                              )}
                            </span>
                          </div>
                          {!incidentDateRange?.from && <CalendarIcon className="h-3.5 w-3.5 opacity-50" />}
                        </Button>
                        {incidentDateRange?.from && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setIncidentDateRange(undefined);
                            }}
                            className="absolute right-2.5 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Hapus filter"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white shadow-md border rounded-md" align="start">
                      <Calendar
                        mode="range"
                        selected={incidentDateRange}
                        onSelect={setIncidentDateRange}
                        initialFocus
                      />
                      <div className="flex items-center justify-between px-3 py-2 border-t bg-slate-50 text-xs">
                        <span className="text-slate-500 font-medium truncate max-w-[180px]">
                          {incidentDateRange?.from ? (
                            incidentDateRange.to ? (
                              `${format(incidentDateRange.from, "dd MMM yyyy")} - ${format(incidentDateRange.to, "dd MMM yyyy")}`
                            ) : (
                              format(incidentDateRange.from, "dd MMM yyyy")
                            )
                          ) : (
                            "Belum ada rentang"
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => setIncidentDateRange(undefined)}
                        >
                          Clear
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Waktu Pelaporan */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Pelaporan</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative inline-flex items-center w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 pl-3 pr-8 text-xs font-normal w-full justify-between shadow-none cursor-pointer border transition-colors ${reportDateRange?.from ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate">
                              {reportDateRange?.from ? (
                                reportDateRange.to ? (
                                  `${format(reportDateRange.from, "dd MMM yyyy")} - ${format(reportDateRange.to, "dd MMM yyyy")}`
                                ) : (
                                  format(reportDateRange.from, "dd MMM yyyy")
                                )
                              ) : (
                                "Waktu Pelaporan"
                              )}
                            </span>
                          </div>
                          {!reportDateRange?.from && <CalendarIcon className="h-3.5 w-3.5 opacity-50" />}
                        </Button>
                        {reportDateRange?.from && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setReportDateRange(undefined);
                            }}
                            className="absolute right-2.5 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Hapus filter"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white shadow-md border rounded-md" align="start">
                      <Calendar
                        mode="range"
                        selected={reportDateRange}
                        onSelect={setReportDateRange}
                        initialFocus
                      />
                      <div className="flex items-center justify-between px-3 py-2 border-t bg-slate-50 text-xs">
                        <span className="text-slate-500 font-medium truncate max-w-[180px]">
                          {reportDateRange?.from ? (
                            reportDateRange.to ? (
                              `${format(reportDateRange.from, "dd MMM yyyy")} - ${format(reportDateRange.to, "dd MMM yyyy")}`
                            ) : (
                              format(reportDateRange.from, "dd MMM yyyy")
                            )
                          ) : (
                            "Belum ada rentang"
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => setReportDateRange(undefined)}
                        >
                          Clear
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Site */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 pl-3 pr-2 text-xs font-normal w-full justify-between shadow-none cursor-pointer border transition-colors ${selectedSites.length > 0 ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                      >
                        <span className="truncate">
                          {selectedSites.length > 0 ? `Site (${selectedSites.length})` : "Site"}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3 bg-white shadow-lg border rounded-md" align="start">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site</span>
                        {selectedSites.length > 0 && (
                          <button onClick={() => setSelectedSites([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600">Clear</button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {["GMO", "Site Alpha", "Site Beta"].map((st) => {
                          const isChecked = selectedSites.includes(st);
                          return (
                            <div 
                              key={st}
                              className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-slate-50"
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedSites(selectedSites.filter(s => s !== st));
                                } else {
                                  setSelectedSites([...selectedSites, st]);
                                }
                              }}
                            >
                              <Checkbox checked={isChecked} />
                              <span className="text-xs text-slate-700 font-medium">{st}</span>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Lokasi */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedSites.length === 0}
                        className={`h-8 pl-3 pr-2 text-xs font-normal w-full justify-between shadow-none cursor-pointer border transition-colors ${selectedSites.length === 0 ? "opacity-60 bg-slate-50 text-slate-400" : selectedLocations.length > 0 ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                      >
                        <span className="truncate">
                          {selectedSites.length > 0 ? (selectedLocations.length > 0 ? `Lokasi (${selectedLocations.length})` : "Lokasi") : "Pilih Site"}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3 bg-white shadow-lg border rounded-md" align="start">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi</span>
                        {selectedLocations.length > 0 && (
                          <button onClick={() => setSelectedLocations([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600">Clear</button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {availableLocations.map((lk) => {
                          const isChecked = selectedLocations.includes(lk);
                          return (
                            <div 
                              key={lk}
                              className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-slate-50"
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedLocations(selectedLocations.filter(l => l !== lk));
                                } else {
                                  setSelectedLocations([...selectedLocations, lk]);
                                }
                              }}
                            >
                              <Checkbox checked={isChecked} />
                              <span className="text-xs text-slate-700 font-medium">{lk}</span>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Detail Lokasi */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detail Lokasi</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedLocations.length === 0}
                        className={`h-8 pl-3 pr-2 text-xs font-normal w-full justify-between shadow-none cursor-pointer border transition-colors ${selectedLocations.length === 0 ? "opacity-60 bg-slate-50 text-slate-400" : selectedDetailLocations.length > 0 ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                      >
                        <span className="truncate">
                          {selectedLocations.length > 0 ? (selectedDetailLocations.length > 0 ? `Detail (${selectedDetailLocations.length})` : "Detail Lokasi") : "Pilih Lokasi"}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 bg-white shadow-lg border rounded-md" align="start">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detail Lokasi</span>
                        {selectedDetailLocations.length > 0 && (
                          <button onClick={() => setSelectedDetailLocations([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600">Clear</button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {availableDetailLocations.map((dt) => {
                          const isChecked = selectedDetailLocations.includes(dt);
                          return (
                            <div 
                              key={dt}
                              className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-slate-50"
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedDetailLocations(selectedDetailLocations.filter(d => d !== dt));
                                } else {
                                  setSelectedDetailLocations([...selectedDetailLocations, dt]);
                                }
                              }}
                            >
                              <Checkbox checked={isChecked} />
                              <span className="text-xs text-slate-700 font-medium">{dt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status AI */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status AI</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 pl-3 pr-2 text-xs font-normal w-full justify-between shadow-none cursor-pointer border transition-colors ${selectedStatuses.length > 0 ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                      >
                        <span className="truncate">
                          {selectedStatuses.length > 0 ? `Status AI (${selectedStatuses.length})` : "Status AI"}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3 bg-white shadow-lg border rounded-md" align="start">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status AI</span>
                        {selectedStatuses.length > 0 && (
                          <button onClick={() => setSelectedStatuses([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600">Clear</button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {["belum_dimulai", "draft", "selesai"].map((st) => {
                          const isChecked = selectedStatuses.includes(st);
                          const labels: Record<string, string> = {
                            belum_dimulai: "Belum Dimulai",
                            draft: "Draft",
                            selesai: "Selesai"
                          };
                          const displayLabel = labels[st] || st;
                          return (
                            <div 
                              key={st}
                              className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-slate-50"
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedStatuses(selectedStatuses.filter(s => s !== st));
                                } else {
                                  setSelectedStatuses([...selectedStatuses, st]);
                                }
                              }}
                            >
                              <Checkbox checked={isChecked} />
                              <span className="text-xs text-slate-700 font-medium">{displayLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Reset All */}
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs font-bold gap-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 border border-dashed border-rose-200 px-2"
                    onClick={handleClearAllFilters}
                  >
                    <X className="h-3.5 w-3.5" /> Clear All
                  </Button>
                )}
              </div>

              {/* Selected Filter Chips Area */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Selected Filters
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {/* Categories */}
                    {selectedCategories.map(cat => (
                      <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                        {cat}
                        <X className="h-3 w-3 cursor-pointer p-0.5 rounded-full hover:bg-primary/30 text-primary/70" onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))} />
                      </span>
                    ))}
                    {/* Companies */}
                    {selectedCompanies.map(comp => (
                      <span key={comp} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                        {comp}
                        <X className="h-3 w-3 cursor-pointer p-0.5 rounded-full hover:bg-primary/30 text-primary/70" onClick={() => setSelectedCompanies(selectedCompanies.filter(c => c !== comp))} />
                      </span>
                    ))}
                    {/* Sites */}
                    {selectedSites.map(st => (
                      <span key={st} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                        {st}
                        <X className="h-3 w-3 cursor-pointer p-0.5 rounded-full hover:bg-primary/30 text-primary/70" onClick={() => setSelectedSites(selectedSites.filter(s => s !== st))} />
                      </span>
                    ))}
                    {/* Locations */}
                    {selectedLocations.map(lk => (
                      <span key={lk} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                        {lk}
                        <X className="h-3 w-3 cursor-pointer p-0.5 rounded-full hover:bg-primary/30 text-primary/70" onClick={() => setSelectedLocations(selectedLocations.filter(l => l !== lk))} />
                      </span>
                    ))}
                    {/* Detail Locations */}
                    {selectedDetailLocations.map(dt => (
                      <span key={dt} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                        {dt}
                        <X className="h-3 w-3 cursor-pointer p-0.5 rounded-full hover:bg-primary/30 text-primary/70" onClick={() => setSelectedDetailLocations(selectedDetailLocations.filter(d => d !== dt))} />
                      </span>
                    ))}
                    {/* Statuses */}
                    {selectedStatuses.map(st => {
                      const labels: Record<string, string> = {
                        belum_dimulai: "Belum Dimulai",
                        draft: "Draft",
                        selesai: "Selesai"
                      };
                      return (
                        <span key={st} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                          {labels[st] || st}
                          <X className="h-3 w-3 cursor-pointer p-0.5 rounded-full hover:bg-primary/30 text-primary/70" onClick={() => setSelectedStatuses(selectedStatuses.filter(s => s !== st))} />
                        </span>
                      );
                    })}
                    {/* Date Ranges */}
                    {incidentDateRange?.from && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                        Insiden: {format(incidentDateRange.from, "dd MMM yyyy")}{incidentDateRange.to && ` - ${format(incidentDateRange.to, "dd MMM yyyy")}`}
                        <X className="h-3 w-3 cursor-pointer p-0.5 rounded-full hover:bg-primary/30 text-primary/70" onClick={() => setIncidentDateRange(undefined)} />
                      </span>
                    )}
                    {reportDateRange?.from && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                        Laporan: {format(reportDateRange.from, "dd MMM yyyy")}{reportDateRange.to && ` - ${format(reportDateRange.to, "dd MMM yyyy")}`}
                        <X className="h-3 w-3 cursor-pointer p-0.5 rounded-full hover:bg-primary/30 text-primary/70" onClick={() => setReportDateRange(undefined)} />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Workspace Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-slate-50/20 p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white border rounded-lg shadow-sm">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Synchronizing Workspace...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white border rounded-lg shadow-sm p-8 text-center">
                <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase mb-2">Sync Error</h3>
                <p className="text-xs text-slate-500 font-medium mb-4 max-w-xs ">{(error as Error).message}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry Connection</Button>
              </div>
            ) : cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white border rounded-lg shadow-sm p-8 text-center border-dashed">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-base font-black text-slate-900 border-none p-0 mb-1">No Cases Found</h3>
                <p className="text-xs text-slate-500 font-medium mb-6 max-w-sm ml-auto mr-auto">Your investigation workspace is empty. Create a new case to start extracting intelligence from evidence.</p>
                <Button size="sm" className="h-9 px-6 font-black uppercase tracking-widest bg-primary" onClick={() => navigate("/campaign/new")}>
                  <Plus className="h-4 w-4 mr-2" /> Start New Case
                </Button>
              </div>
            ) : viewMode === "table" ? (
              <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
                <table className="w-full min-w-[1200px] enterprise-table border-none">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      {visibleColumns.noInsiden && <HeaderTooltip className="pl-4" label="No Insiden" sourceLabel="Data Sync CCR" description="Nomor identifikasi unik untuk setiap insiden." />}
                      {visibleColumns.kategori && <HeaderTooltip label="Kategori Insiden" sourceLabel="Data Sync CCR" description="Klasifikasi dari jenis insiden (misalnya: Near Miss, Fatality, dll)." />}
                      {visibleColumns.waktuInsiden && <HeaderTooltip label="Waktu Insiden" sourceLabel="Data Sync CCR" description="Waktu kejadian aktual ketika insiden tersebut terjadi di lapangan." />}
                      {visibleColumns.waktuPelaporan && <HeaderTooltip label="Waktu Pelaporan" sourceLabel="Data Sync CCR" description="Waktu ketika insiden ini dilaporkan dan direkam ke dalam sistem." />}
                      {visibleColumns.perusahaan && <HeaderTooltip label="Perusahaan Pelapor" sourceLabel="Data Sync CCR" description="Perusahaan atau sub-kontraktor yang melaporkan insiden ini." />}
                      {visibleColumns.site && <HeaderTooltip label="Site" sourceLabel="Data Sync CCR" description="Lokasi area kerja utama atau site tempat insiden terjadi." />}
                      {visibleColumns.lokasi && <HeaderTooltip label="Lokasi" sourceLabel="Data Sync CCR" description="Area geografis spesifik di dalam site tempat insiden terjadi." />}
                      {visibleColumns.detailLokasi && <HeaderTooltip label="Detail Lokasi" sourceLabel="Data Sync CCR" description="Titik spesifik atau area mendetail dari lokasi kejadian perkara." />}
                      {visibleColumns.statusInvestigasi && <HeaderTooltip label="Status Investigasi" sourceLabel="Data Sync CCR" description="Status terkini dari tahapan investigasi secara keseluruhan." />}
                      {visibleColumns.statusAi && <HeaderTooltip label="Status AI" description="Tahapan analisis dan pengolahan data otomatis yang sedang dikerjakan oleh kecerdasan buatan." />}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCases.map((c) => {
                      const idx = cases.indexOf(c);
                      return (
                        <tr
                          key={c.id}
                          className={`cursor-pointer transition-colors ${selectedCase?.id === c.id ? "active" : "hover:bg-slate-50/70"}`}
                          onClick={() => setSelectedCase(c)}
                          onDoubleClick={() => navigate(`/campaign/${c.id}`)}
                        >
                          {visibleColumns.noInsiden && <td className="pl-4 font-mono text-xs text-primary font-semibold">{323 + idx}</td>}
                          {visibleColumns.kategori && <td className="text-xs font-medium text-slate-900 truncate max-w-[150px]">{["Near Miss", "Medical Treatment Injury", "Property Damage", "First Aid", "Fatality"][idx % 5]}</td>}
                          {visibleColumns.waktuInsiden && <td className="text-xs text-slate-600 font-medium">05 April 2026</td>}
                          {visibleColumns.waktuPelaporan && <td className="text-xs text-slate-500 font-medium">08 April 2026</td>}
                          {visibleColumns.perusahaan && <td className="text-xs text-slate-700 font-medium">PT Bumi Tambang Nusantara</td>}
                          {visibleColumns.site && <td className="text-xs text-slate-700 font-medium">GMO</td>}
                          {visibleColumns.lokasi && <td className="text-xs text-slate-700 font-medium">Pit J</td>}
                          {visibleColumns.detailLokasi && <td className="text-xs text-slate-700 font-medium">Area Loading</td>}
                          {visibleColumns.statusInvestigasi && (
                            <td className="text-xs font-semibold text-slate-700">
                              {idx % 2 === 0 ? "SUBMITTED" : "CLOSED"}
                            </td>
                          )}
                          {visibleColumns.statusAi && <td className="py-2.5"><StatusChip status={getCaseStatus(c)} /></td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Table View Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50 text-xs">
                  <div className="text-slate-500 font-medium">
                    Showing <span className="font-semibold text-slate-800">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
                    <span className="font-semibold text-slate-800">
                      {Math.min(startIndex + itemsPerPage, totalItems)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-800">{totalItems}</span> cases
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-2xs font-semibold"
                      disabled={activePage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, pageIdx) => {
                        const pageNum = pageIdx + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={activePage === pageNum ? "default" : "ghost"}
                            size="sm"
                            className={`h-8 w-8 text-2xs font-bold ${activePage === pageNum ? "bg-primary text-white hover:bg-primary/95" : ""}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-2xs font-semibold"
                      disabled={activePage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedCases.map((c) => {
                    const idx = cases.indexOf(c);
                    return (
                      <CaseGridCard 
                        key={c.id} 
                        caseData={c} 
                        idx={idx}
                        statusAi={getCaseStatus(c)}
                        mode={viewMode as "grid-compact" | "grid-expanded"}
                        isSelected={selectedCase?.id === c.id}
                        onClick={() => setSelectedCase(c)}
                        onOpen={() => navigate(`/campaign/${c.id}`)}
                      />
                    );
                  })}
                </div>

                {/* Grid View Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg shadow-sm text-xs">
                  <div className="text-slate-500 font-medium">
                    Showing <span className="font-semibold text-slate-800">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
                    <span className="font-semibold text-slate-800">
                      {Math.min(startIndex + itemsPerPage, totalItems)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-800">{totalItems}</span> cases
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-2xs font-semibold"
                      disabled={activePage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, pageIdx) => {
                        const pageNum = pageIdx + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={activePage === pageNum ? "default" : "ghost"}
                            size="sm"
                            className={`h-8 w-8 text-2xs font-bold ${activePage === pageNum ? "bg-primary text-white hover:bg-primary/95" : ""}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-2xs font-semibold"
                      disabled={activePage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side Preview Panel */}
          {selectedCase && (() => {
            const mockStatus = getCaseStatus(selectedCase);
            const steps = [
              { step: "Belum Dimulai", done: true },
              { step: "Draft", done: mockStatus === "draft" || mockStatus === "selesai" },
              { step: "Selesai", done: mockStatus === "selesai" },
            ];
            const completedCount = steps.filter(s => s.done).length;
            const progressPercent = Math.round((completedCount / steps.length) * 100);

            return (
              <div className="side-panel w-[340px] border-l bg-white shadow-xl z-20 shrink-0 transform transition-transform animate-in slide-in-from-right duration-200 relative flex flex-col h-[calc(100vh-100px)] overflow-hidden">
                <div className="flex items-center justify-between px-4 h-14 border-b bg-slate-50/80 backdrop-blur-sm gap-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const idx = cases.indexOf(selectedCase);
                      const mockStatus = getCaseStatus(selectedCase);
                      const isCaseCreated = mockStatus !== "belum_dimulai";
                      
                      return !isCaseCreated ? (
                        <Button 
                          size="sm"
                          className="h-8 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-600 shadow-sm transition-all text-white uppercase tracking-wider"
                          onClick={() => setCaseToCreate(selectedCase)}
                        >
                          Create Campaign
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all text-white uppercase tracking-wider"
                          onClick={() => navigate(`/campaign/${selectedCase.id}`)}
                        >
                          Open Campaign
                        </Button>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedCase(null)} 
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all border bg-white"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto no-scrollbar">
                  <div className="p-5 space-y-6">
                    {/* Panel Title */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Incident ID</span>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                          Insiden - {323 + cases.indexOf(selectedCase)}
                        </h2>
                        {getCaseStatus(selectedCase) !== "belum_dimulai" && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-semibold">
                              {(() => {
                                const start = new Date("2026-04-08T09:15:00+07:00");
                                const now = new Date();
                                let diff = Math.max(0, now.getTime() - start.getTime());
                                const days = Math.floor(diff / 86400000);
                                diff -= days * 86400000;
                                const hours = Math.floor(diff / 3600000);
                                diff -= hours * 3600000;
                                const mins = Math.floor(diff / 60000);
                                const parts = [];
                                if (days > 0) parts.push(`${days}d`);
                                if (hours > 0) parts.push(`${hours}h`);
                                if (mins > 0) parts.push(`${mins}m`);
                                return parts.length > 0 ? parts.join(" ") : "Just now";
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status AI Badge */}
                    <div className="flex flex-col gap-3 bg-slate-50/80 border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Status AI</span>
                        <StatusChip status={getCaseStatus(selectedCase)} />
                      </div>
                      
                      {getCaseStatus(selectedCase) !== "belum_dimulai" && (
                        <div className="pt-3 border-t border-slate-200/60 flex flex-col gap-2.5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Started</span>
                              <span className="text-[11px] font-semibold text-slate-700">08 Apr 2026, 09:15 AM</span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">By</span>
                              <span className="text-[11px] font-semibold text-slate-700">Jane Doe</span>
                            </div>
                          </div>
                          <div className="flex flex-col pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Updated (09 Apr 2026, 14:30 PM)</span>
                            <span className="text-[11px] font-medium text-slate-700 leading-snug">Completed extraction of evidence 001.mp4 and generated factual chronologies.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Matrix */}
                    <div className="space-y-3 pt-3">
                      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider">
                        <span className="font-bold text-[#161616]">
                          PROSES CAMPAIGN
                        </span>
                        <span className="font-bold text-[#24a148]">{completedCount}/{steps.length} SELESAI ({progressPercent}%)</span>
                      </div>
                      
                      {/* Carbon Progress Bar (flat, 4px) */}
                      <div className="h-1.5 w-full bg-[#e0e0e0]">
                        <div 
                          className="h-full bg-[#24a148] transition-all duration-300 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {/* Carbon Stepper Container (flat, light grey, sharp borders, always displayed inline) */}
                      <div className="relative space-y-4 bg-[#f4f4f4] p-4 border border-[#e0e0e0] rounded-none">
                        {/* Vertical Connector Line */}
                        <div className="absolute left-[26px] top-6 bottom-8 w-[1px] bg-[#e0e0e0]" />

                        {steps.map((s, idx) => {
                          const isCurrent = !s.done && (idx === 0 || steps[idx - 1].done);
                          return (
                            <div key={s.step} className="flex items-center gap-3 relative z-10">
                              {/* Step Indicator Node */}
                              <div className={`flex items-center justify-center h-4 w-4 rounded-full border text-[8px] font-bold transition-all duration-200 ${
                                s.done 
                                  ? "bg-[#24a148] border-[#24a148] text-white" 
                                  : isCurrent
                                  ? "bg-white border-[#0f62fe] text-[#0f62fe]"
                                  : "bg-white border-[#c6c6c6] text-[#8d8d8d]"
                              }`}>
                                {s.done ? "✓" : idx + 1}
                              </div>
                              <span className={`text-[11px] font-semibold transition-colors duration-200 ${
                                s.done 
                                  ? "text-[#161616]" 
                                  : isCurrent
                                  ? "text-[#0f62fe]"
                                  : "text-[#8d8d8d]"
                              }`}>
                                {s.step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Operational Data */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      {[
                        { label: "Kategori Insiden", value: ["Near Miss", "Medical Treatment Injury", "Property Damage", "First Aid", "Fatality"][cases.indexOf(selectedCase) % 5], icon: FileText },
                        { label: "Waktu Insiden", value: "05 April 2026", icon: Clock },
                        { label: "Waktu Pelaporan", value: "08 April 2026", icon: Clock },
                        { label: "Perusahaan Pelapor", value: "PT Bumi Tambang Nusantara", icon: Globe },
                        { label: "Site", value: "GMO", icon: Globe },
                        { label: "Lokasi", value: "Pit J", icon: Globe },
                        { label: "Detail Lokasi", value: "Area Loading", icon: Globe },

                      ].map((item) => (
                        <div key={item.label} className="grid grid-cols-12 border-b border-slate-200 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-5 bg-slate-50/80 px-3 py-2.5 flex items-center border-r border-slate-200">
                            <span className="text-[11px] text-slate-600 font-semibold leading-tight">{item.label}</span>
                          </div>
                          <div className="col-span-7 px-3 py-2.5 text-xs font-bold text-slate-900 flex items-center min-h-[38px] bg-white">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <CreateCaseConfirmDialog
        caseData={caseToCreate}
        cases={cases}
        isOpen={!!caseToCreate}
        onClose={() => setCaseToCreate(null)}

        onConfirm={() => {
          if (caseToCreate) {
            setCreatedCaseIds(prev => {
              const newSet = new Set(prev);
              newSet.add(caseToCreate.id);
              return newSet;
            });
            const caseId = caseToCreate.id;
            setCaseToCreate(null);
            navigate(`/campaign/${caseId}?isCreating=true`);
          }
        }}
      />
      
      <DeleteCaseDialog 
        caseData={caseToDelete}
        isOpen={!!caseToDelete}
        onClose={() => setCaseToDelete(null)}
        onConfirm={async () => {
          if (caseToDelete) {
            try {
              await deleteCaseMutation.mutateAsync(caseToDelete.id);
              toast.success("Case deleted successfully");
              setCaseToDelete(null);
              if (selectedCase?.id === caseToDelete.id) setSelectedCase(null);
            } catch (err) {
              toast.error("Failed to delete case");
            }
          }
        }}
        isDeleting={deleteCaseMutation.isPending}
      />

      <SyncLogsDialog
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={syncLogs}
      />
    </AppLayout>
  );
}

function SyncLogsDialog({
  isOpen,
  onClose,
  logs
}: {
  isOpen: boolean;
  onClose: () => void;
  logs: any[];
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-800 px-6 py-6 text-white relative">
          <History className="h-12 w-12 text-slate-700 absolute top-4 right-4" />
          <h2 className="text-lg font-black uppercase tracking-widest mb-1">Database Sync Logs</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider opacity-80">Historical Synchronization Records</p>
        </div>
        
        <div className="p-0 bg-slate-50 max-h-[60vh] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <span className="text-sm font-semibold">No sync logs found.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-white hover:bg-slate-50/50 transition-colors flex gap-4">
                  <div className="mt-0.5 shrink-0">
                    {log.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black uppercase tracking-wider ${log.status === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                          {log.status === "success" ? "Sync Successful" : "Sync Failed"}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          {log.type === "manual" ? "Manual" : "Auto"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(log.time).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      {log.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-white border-t">
          <Button variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-widest w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const getIncidentMockMetadata = (caseObj: Case | null, casesList: Case[]) => {
  if (!caseObj) return null;
  const idx = casesList.findIndex(c => c.id === caseObj.id);
  const safeIdx = idx === -1 ? 0 : idx;
  
  return {
    no_incident: `${323 + safeIdx}`,
    ccr_id: `CCR-2026-0${safeIdx + 1}`,
    incident_date: "05 April 2026",
    reporting_date: "08 April 2026",
    incident_type: ["Unsafe Condition", "Unsafe Act", "Property Damage", "Near Miss"][safeIdx % 4],
    incident_category: ["Near Miss", "Medical Treatment Injury", "Property Damage", "First Aid", "Fatality"][safeIdx % 5],
    reporter: ["Aris (DMS Officer)", "Fatur (Pengawas)", "Saiful (Operator)", "Jane Doe"][safeIdx % 4],
    ccr_company_name: "PT Bumi Tambang Nusantara",
    ccr_employee_name: ["Saiful", "Aris", "Fatur", "John Doe"][safeIdx % 4],
    site_company_name: "Berau Coal",
    site_id: `GMO-0${safeIdx + 1}`,
    site_name: safeIdx % 2 === 0 ? "GMO" : "Site Alpha",
    investigation_status: safeIdx % 2 === 0 ? "SUBMITTED" : "CLOSED"
  };
};

function CreateCaseConfirmDialog({
  caseData,
  cases,
  isOpen,
  onClose,
  onConfirm
}: {
  caseData: Case | null;
  cases: Case[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaTarget = "5629"; // Hardcoded simple captcha for demo
  
  // Loading State
  const [isCreating, setIsCreating] = useState(false);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setIsConfirmed(false);
      setCaptchaInput("");
      setIsCreating(false);
    }
  }, [isOpen]);

  if (!caseData || !isOpen) return null;

  const incMeta = getIncidentMockMetadata(caseData, cases);

  const handleCreateCase = () => {
    onConfirm();
  };

  const isSubmitDisabled = !isConfirmed || captchaInput !== captchaTarget || isCreating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-500" />
            Konfirmasi Create Campaign
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 pt-2">
            Apakah Anda yakin untuk meng-create campaign ini?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col gap-2 my-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Judul Insiden:</span>
            <span className="text-xs font-black text-slate-800 text-right">{incMeta?.no_incident || caseData.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kategori:</span>
            <span className="text-xs font-bold text-slate-800 text-right">{incMeta?.incident_type || "-"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex items-center h-5 mt-0.5">
              <input 
                type="checkbox" 
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-600 font-medium group-hover:text-slate-800">
              Saya setuju untuk membuat campaign berdasarkan data insiden ini.
            </span>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Verifikasi Keamanan</span>
            <div className="flex gap-3">
              <div className="bg-slate-100 border border-slate-300 rounded-md px-4 py-2 flex items-center justify-center select-none shadow-inner">
                <span className="text-lg font-black tracking-[0.2em] text-slate-700 blur-[0.5px] line-through decoration-slate-400">{captchaTarget}</span>
              </div>
              <input 
                type="text" 
                placeholder="Ketik angka di samping..."
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="flex-1 text-sm bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Batal
          </Button>
          <Button 
            disabled={isSubmitDisabled}
            onClick={handleCreateCase}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isCreating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              <><Plus className="mr-2 h-4 w-4" /> Create Campaign</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCaseDialog({ 
  caseData, 
  isOpen, 
  onClose, 
  onConfirm,
  isDeleting
}: { 
  caseData: Case | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const [captcha, setCaptcha] = useState("");
  const [expectedCaptcha] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  if (!caseData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-rose-600 px-6 py-8 text-white relative">
          <AlertTriangle className="h-12 w-12 text-rose-200/40 absolute top-4 right-4" />
          <h2 className="text-lg font-black uppercase tracking-widest mb-1">Confirm Deletion</h2>
          <p className="text-rose-100 text-xs font-bold uppercase tracking-wider opacity-80">Irreversible Action Protocol</p>
        </div>
        
        <div className="p-6 space-y-6 bg-white">
          <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="h-10 w-10 bg-white rounded-lg border shadow-sm flex items-center justify-center shrink-0">
               <div className="h-6 w-6 bg-rose-50 rounded flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-rose-500" />
               </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-0.5">{caseData.case_number || caseData.id.slice(0, 8)}</p>
              <h4 className="text-sm font-bold text-slate-900 truncate">{caseData.title}</h4>
              <p className="text-2xs text-slate-400 font-bold uppercase mt-1">Status: {caseData.status}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <Info className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Pre-deletion Audit</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Deleting this case will permanently erase all associated evidence files, reports, and all extraction metadata. This operation cannot be undone.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 flex flex-col items-center">
               <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Type the code to confirm deletion</span>
               <span className="text-3xl font-extrabold text-slate-300 tracking-[0.5em]">{expectedCaptcha}</span>
            </div>
            <Input 
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="0000"
              maxLength={4}
              className="h-12 text-xl font-bold bg-slate-50 border-slate-200 focus:bg-white transition-all text-center tracking-[0.2em]"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting} className="text-xs font-bold uppercase tracking-widest">Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={captcha !== expectedCaptcha || isDeleting}
            className="h-9 px-6 text-xs font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all gap-2"
          >
            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Confirm Deletion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CaseGridCard({ 
  caseData, 
  idx,
  statusAi,
  mode, 
  isSelected, 
  onClick,
  onOpen 
}: { 
  caseData: Case; 
  idx: number;
  statusAi: string;
  mode: "grid-compact" | "grid-expanded"; 
  isSelected: boolean;
  onClick: () => void;
  onOpen: () => void;
}) {
  return (
    <div 
      className={`
        relative flex flex-col h-full bg-white border rounded-lg transition-all duration-200 cursor-pointer
        ${isSelected 
          ? "border-primary ring-1 ring-primary/20 shadow-md bg-white" 
          : "border-slate-200 hover:border-primary/40 hover:shadow-sm hover:translate-y-[-1px] group"
        }
      `}
      onClick={onClick}
    >
      {/* Selection Indicator */}
      {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg" />}

      {/* Card Header */}
      <div className="px-4 py-3 border-b border-transparent flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-primary font-bold tracking-widest">{caseData.case_number || caseData.id.slice(0, 8)}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{getSiteFromDescription(caseData.description)}</span>
          </div>
        </div>
        <StatusChip status={statusAi} />
      </div>

      {/* Card Body */}
      <div className="px-4 pb-3 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {caseData.title}
        </h3>
        
        {/* Severity & Date Row */}
        <div className="flex items-center justify-end text-slate-400">
          <Clock className="h-3 w-3 mr-1" />
          <span className="text-[11px] font-bold">{new Date(caseData.created_at).toLocaleDateString()}</span>
        </div>

        {/* Expanded Summary Area (Only for Manager view) */}
        {mode === "grid-expanded" && (
          <div className="mb-4 p-2.5 rounded bg-slate-50 border border-slate-100">
             <p className="text-[11px] text-slate-600 line-clamp-3 font-medium italic italic">
               {caseData.description}
             </p>
          </div>
        )}

        <div className="mt-auto space-y-4 pt-1">
          {/* Metadata Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <span className="text-[9px] font-bold text-slate-600">A</span>
              </div>
              <span className="text-xs font-bold text-slate-700">Admin</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">{new Date(caseData.updated_at).toLocaleDateString()}</span>
          </div>


        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-2 bg-slate-50/50 border-t flex items-center justify-between rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
        >
          View Case <ChevronRight className="h-3 w-3" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1 rounded hover:bg-slate-200 transition-colors">
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onOpen}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Open case
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

