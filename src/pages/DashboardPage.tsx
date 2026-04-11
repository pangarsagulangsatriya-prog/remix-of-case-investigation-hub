import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";
import { useNavigate } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { Button } from "@/components/ui/button";
import {
  FolderSearch,
  AlertTriangle,
  Clock,
  FileCheck,
  FileSearch,
  ChevronRight,
  History,
  Brain,
  LayoutGrid,
  Plus,
  Star,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: cases, isLoading } = useCases();

  const caseList = cases || [];
  
  // Calculate real metrics
  const openCasesCount = caseList.filter(c => c.status !== 'closed' && c.status !== 'approved').length;
  const inReviewCount = caseList.filter(c => c.status === 'in_review').length;
  const awaitingApprovalCount = caseList.filter(c => c.status === 'approved').length;
  const urgentCount = caseList.filter(c => c.severity === 'critical').length;
  
  const summaryCards = [
    { label: "Open Cases", value: openCasesCount.toString(), icon: FolderSearch, change: "Active projects" },
    { label: "In Review", value: inReviewCount.toString(), icon: FileSearch, change: "Awaiting analyst" },
    { label: "Awaiting Approval", value: awaitingApprovalCount.toString(), icon: FileCheck, change: "Ready for board" },
    { label: "Critical Cases", value: urgentCount.toString(), icon: AlertTriangle, change: "Immediate attention" },
    { label: "Total Evidence", value: "—", icon: Clock, change: "Linked items" },
  ];

  const recentCases = caseList.slice(0, 6).map(c => ({
    id: c.case_number,
    title: c.title,
    site: c.site || "Global",
    severity: (c.severity || "medium") as any,
    owner: c.owner || "Unassigned",
    status: (c.status || "draft") as any,
    updated: new Date(c.updated_at || c.created_at).toLocaleDateString(),
    raw_id: c.id
  }));

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center bg-slate-50/50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Intelligence Dashboard…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-slate-50/10">
        <div className="h-12 border-b bg-white flex items-center justify-between px-6 shrink-0 shadow-sm relative z-30">
          <div className="flex items-center gap-3">
             <div className="h-7 w-7 bg-primary/5 rounded flex items-center justify-center text-primary">
                <LayoutGrid className="h-4 w-4" />
             </div>
             <h1 className="text-sm font-bold text-slate-900 border-none p-0 inline-flex items-center gap-2">
                Operational Intelligence <span className="text-slate-300 font-normal">/ Dashboard</span>
             </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment</span>
                <select className="text-[11px] font-bold border-none bg-slate-100 rounded px-3 py-1 text-slate-700 focus:ring-0">
                  <option>All Global Sites</option>
                  <option>Site Alpha - Conveyors</option>
                  <option>Site Beta - Processing</option>
                </select>
             </div>
             <div className="h-6 w-px bg-slate-200" />
             <Button size="sm" className="h-8 text-xs font-bold gap-2 bg-slate-900 group" onClick={() => navigate('/cases')}>
                <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" /> Create New Case
             </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-6 grid grid-cols-5 gap-4">
            {summaryCards.map((card, idx) => (
              <div key={card.label} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <card.icon className="h-12 w-12" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{card.label}</span>
                  <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${
                    card.label === 'Critical Cases' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {card.change}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                   <span className="text-2xl font-bold text-slate-900 leading-none">{card.value}</span>
                   <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, (Number(card.value) / 20) * 100)}%` }} />
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex px-6 pb-20 gap-6">
            <div className="flex-1 space-y-6">
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-slate-50/30 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-slate-400" />
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Case Lifecycle Distribution</h3>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">YTD 2026</span>
                </div>
                <div className="p-6">
                  <div className="flex gap-1.5 h-6 rounded-lg overflow-hidden border border-slate-100 shadow-inner p-1 bg-slate-50">
                    <div className="bg-slate-400 h-full rounded-sm shadow-sm" style={{ width: "20%" }} />
                    <div className="bg-status-inprogress h-full rounded-sm shadow-sm" style={{ width: "40%" }} />
                    <div className="bg-status-review h-full rounded-sm shadow-sm" style={{ width: "20%" }} />
                    <div className="bg-status-approved h-full rounded-sm shadow-sm" style={{ width: "15%" }} />
                    <div className="bg-slate-900 h-full rounded-sm shadow-sm" style={{ width: "5%" }} />
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6">
                    {[
                      { label: "Draft", color: "bg-slate-400", count: caseList.filter(c => c.status === 'draft').length },
                      { label: "In Progress", color: "bg-status-inprogress", count: caseList.filter(c => c.status === 'in_progress').length },
                      { label: "In Review", color: "bg-status-review", count: caseList.filter(c => c.status === 'in_review').length },
                      { label: "Approved", color: "bg-status-approved", count: caseList.filter(c => c.status === 'approved').length },
                      { label: "Closed", color: "bg-slate-900", count: caseList.filter(c => c.status === 'closed').length },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${s.color} shadow-sm`} />
                        <div>
                           <span className="text-[11px] font-bold text-slate-700 block leading-none">{s.label}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{s.count} Cases</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-slate-50/30 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Recent Case Updates</h3>
                   </div>
                   <button onClick={() => navigate('/cases')} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 group">
                      Investigator Portal <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                   </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full enterprise-table border-none">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="pl-6 text-left">Identifier</th>
                        <th className="text-left">Case Title</th>
                        <th className="text-left">Severity</th>
                        <th className="text-left">Owner</th>
                        <th className="text-left">Status</th>
                        <th className="pr-6 text-right">Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentCases.map((c) => (
                        <tr key={c.raw_id} className="cursor-pointer hover:bg-slate-50/80 transition-all group" onClick={() => navigate(`/cases/${c.raw_id}`)}>
                          <td className="pl-6 font-mono text-[11px] font-bold text-primary py-4">{c.id}</td>
                          <td className="text-xs font-bold text-slate-800 py-4 max-w-[240px] truncate group-hover:text-primary transition-colors">{c.title}</td>
                          <td className="py-4"><SeverityChip severity={c.severity} /></td>
                          <td className="text-[11px] font-bold text-slate-600 py-4">{c.owner}</td>
                          <td className="py-4"><StatusChip status={c.status} /></td>
                          <td className="pr-6 text-[11px] font-bold text-slate-400 py-4 italic text-right">{c.updated}</td>
                        </tr>
                      ))}
                      {recentCases.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No active cases found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="w-80 space-y-6 shrink-0">
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b bg-slate-50/30 flex items-center gap-2">
                   <Brain className="h-4 w-4 text-primary" />
                   <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">System Health</span>
                </div>
                <div className="p-4 space-y-4">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-3">
                       <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                          <Plus className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-emerald-900 leading-tight">Supabase Runtime</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Operational • 100% Uptime</p>
                       </div>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-3">
                       <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                          <Star className="h-4 w-4 fill-primary" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">AI Extraction Logic</p>
                          <p className="text-[10px] text-slate-500 font-medium">Synced with Supabase</p>
                       </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
