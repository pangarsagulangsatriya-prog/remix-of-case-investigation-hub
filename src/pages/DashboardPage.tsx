import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FolderSearch,
  AlertTriangle,
  Clock,
  FileCheck,
  FileSearch,
  ChevronRight,
  MessageSquare,
  History,
  Brain,
  LayoutGrid,
  Plus,
} from "lucide-react";

const summaryCards = [
  { label: "Open Cases", value: "24", icon: FolderSearch, change: "+3 this week" },
  { label: "In Review", value: "8", icon: FileSearch, change: "2 overdue" },
  { label: "Awaiting Approval", value: "5", icon: FileCheck, change: "1 urgent" },
  { label: "Overdue Actions", value: "12", icon: AlertTriangle, change: "4 critical" },
  { label: "Pending Extraction", value: "31", icon: Clock, change: "from 6 cases" },
];

const recentCases = [
  { id: "CS-2026-0147", title: "Conveyor belt failure - Zone B", site: "Site Alpha", severity: "critical" as const, owner: "Sarah Chen", status: "in_progress" as const, updated: "2h ago" },
  { id: "CS-2026-0146", title: "Near miss - haul truck intersection", site: "Site Alpha", severity: "high" as const, owner: "John Doe", status: "in_review" as const, updated: "4h ago" },
  { id: "CS-2026-0145", title: "Chemical spill - processing plant", site: "Site Beta", severity: "high" as const, owner: "Maria Santos", status: "in_progress" as const, updated: "6h ago" },
  { id: "CS-2026-0144", title: "Scaffolding collapse - Pit 3", site: "Site Alpha", severity: "critical" as const, owner: "Ahmed Khan", status: "draft" as const, updated: "1d ago" },
  { id: "CS-2026-0143", title: "Electrical arc flash incident", site: "Site Gamma", severity: "medium" as const, owner: "Lisa Park", status: "approved" as const, updated: "1d ago" },
  { id: "CS-2026-0142", title: "Ground control failure", site: "Site Beta", severity: "high" as const, owner: "John Doe", status: "in_review" as const, updated: "2d ago" },
];

const pendingReviews = [
  { case: "CS-2026-0146", type: "Extraction Review", items: 14, from: "AI Agent" },
  { case: "CS-2026-0145", type: "Report Approval", items: 1, from: "Maria Santos" },
  { case: "CS-2026-0144", type: "Analysis Review", items: 3, from: "AI Agent" },
  { case: "CS-2026-0141", type: "Report Revision", items: 1, from: "Manager" },
];

const recentComments = [
  { user: "Sarah Chen", case: "CS-0147", text: "Evidence extraction complete, 3 items flagged low confidence", time: "1h ago" },
  { user: "Ahmed Khan", case: "CS-0144", text: "Added 4 new photo evidence from site inspection", time: "3h ago" },
  { user: "Lisa Park", case: "CS-0143", text: "Final report approved by management", time: "5h ago" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-slate-50/10">
        {/* Tactical Overview Ribbon */}
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
             <Button size="sm" className="h-8 text-xs font-bold gap-2 bg-slate-900 group">
                <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" /> Create New Case
             </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {/* Executive Metrics Ribbon */}
          <div className="p-6 grid grid-cols-5 gap-4">
            {summaryCards.map((card, idx) => (
              <div key={card.label} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <card.icon className="h-12 w-12" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{card.label}</span>
                  <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${
                    card.change.includes('urgent') || card.change.includes('overdue') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {card.change}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                   <span className="text-2xl font-bold text-slate-900 leading-none">{card.value}</span>
                   <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${60 - idx * 10}%` }} />
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex px-6 pb-20 gap-6">
            {/* Primary Command Center */}
            <div className="flex-1 space-y-6">
              {/* Distribution Matrix */}
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
                    <div className="bg-slate-400 h-full rounded-sm shadow-sm" style={{ width: "15%" }} title="Draft: 4" />
                    <div className="bg-status-inprogress h-full rounded-sm shadow-sm" style={{ width: "35%" }} title="In Progress: 8" />
                    <div className="bg-status-review h-full rounded-sm shadow-sm" style={{ width: "25%" }} title="In Review: 6" />
                    <div className="bg-status-approved h-full rounded-sm shadow-sm" style={{ width: "15%" }} title="Approved: 4" />
                    <div className="bg-slate-900 h-full rounded-sm shadow-sm" style={{ width: "10%" }} title="Closed: 2" />
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6">
                    {[
                      { label: "Draft", color: "bg-slate-400", count: 4, val: "15%" },
                      { label: "In Progress", color: "bg-status-inprogress", count: 8, val: "35%" },
                      { label: "In Review", color: "bg-status-review", count: 6, val: "25%" },
                      { label: "Approved", color: "bg-status-approved", count: 4, val: "15%" },
                      { label: "Closed", color: "bg-slate-900", count: 2, val: "10%" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${s.color} shadow-sm`} />
                        <div>
                           <span className="text-[11px] font-bold text-slate-700 block leading-none">{s.label}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{s.count} Cases • {s.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priority Investigation Feed */}
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-slate-50/30 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Priority Case Watchlist</h3>
                   </div>
                   <button onClick={() => navigate('/cases')} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 group">
                      Investigator Portal <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                   </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full enterprise-table border-none">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="pl-6">Identifier</th>
                        <th>Case Title</th>
                        <th>Severity</th>
                        <th>Owner</th>
                        <th>Status</th>
                        <th className="pr-6">Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentCases.map((c) => (
                        <tr key={c.id} className="cursor-pointer hover:bg-slate-50/80 transition-all group" onClick={() => navigate(`/cases/${c.id}`)}>
                          <td className="pl-6 font-mono text-[11px] font-bold text-primary py-4">{c.id}</td>
                          <td className="text-xs font-bold text-slate-800 py-4 max-w-[240px] truncate group-hover:text-primary transition-colors">{c.title}</td>
                          <td className="py-4"><SeverityChip severity={c.severity} /></td>
                          <td className="text-[11px] font-bold text-slate-600 py-4">{c.owner}</td>
                          <td className="py-4"><StatusChip status={c.status} /></td>
                          <td className="pr-6 text-[11px] font-bold text-slate-400 py-4 italic">{c.updated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Tactical Sidebar */}
            <div className="w-80 space-y-6 shrink-0">
              {/* Critical Tasks */}
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-amber-200/50">
                <div className="px-4 py-3 border-b bg-amber-50/30 flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">Pending Board Reviews</span>
                </div>
                <div className="divide-y divide-amber-100">
                  {pendingReviews.map((r, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-amber-50/50 cursor-pointer transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono font-bold text-primary group-hover:underline">{r.case}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">{r.type}</div>
                      <div className="flex items-center justify-between mt-2">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">By {r.from}</span>
                         <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500 font-bold">{r.items} Items</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-slate-50 border-t">
                   <Button variant="ghost" className="w-full h-8 text-xs font-bold text-primary hover:bg-white hover:border-primary/20">Open Approval Workspace</Button>
                </div>
              </div>

              {/* Intelligence Feed */}
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b bg-slate-50/30 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Safety Intelligence Feed</span>
                </div>
                <div className="p-4 space-y-5">
                  {recentComments.map((c, i) => (
                    <div key={i} className="relative pl-5 border-l-2 border-slate-100 last:border-0 pb-1">
                      <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-slate-200" />
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-900 leading-none">{c.user}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{c.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-1.5">"{c.text}"</p>
                      <button className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">Context: {c.case}</button>
                    </div>
                  ))}
                </div>
                <div className="p-4 pt-1 mb-2">
                   <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-3">
                      <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                         <Star className="h-4 w-4 fill-primary" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-800 leading-tight">System Performance</p>
                         <p className="text-[10px] text-slate-500 font-medium">99.8% AI Uptime</p>
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
