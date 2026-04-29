import React from "react";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/StatusChip";
import { Pencil } from "lucide-react";

export default function ReportsTab() {
  return (
    <div className="flex h-full bg-slate-50/10">
      <div className="w-[300px] border-r bg-white flex flex-col shrink-0">
        <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reports</span>
           <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-primary">+ Create New</Button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
           {[
             { title: "Initial Investigation Report", version: "V1.2", date: "Today", status: "draft" },
             { title: "Internal Compliance Review", version: "V1.0", date: "Yesterday", status: "in_review" },
             { title: "Executive Safety Summary", version: "V0.8", date: "2d ago", status: "draft" },
           ].map((r, i) => (
             <div key={i} className={`p-3 rounded-sm border cursor-pointer ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-white border-transparent'}`}>
                <div className="flex justify-between items-start mb-1">
                   <h4 className="text-xs font-bold text-slate-800 leading-tight">{r.title}</h4>
                   <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500">{r.version}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                   <span className="text-[10px] text-slate-400">Edited {r.date}</span>
                   <StatusChip status={r.status as any} />
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-8 overflow-auto">
         <div className="w-full max-w-[800px] flex flex-col gap-6">
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-sm border  w-full mb-8">
               <h2 className="text-lg font-bold text-slate-900 border-none p-0">Initial Investigation Report V1.2</h2>
               <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-9 font-bold text-xs">Preview PDF</Button>
                  <Button className="h-9 font-bold text-xs bg-slate-900">Finalize Build</Button>
               </div>
            </div>

            <div className="space-y-8 pb-32">
               {[
                 { title: "1. Executive Summary", content: "On April 5, 2026, a conveyor belt failure occurred in Zone B of Site Alpha, resulting in material spillage and near-miss injury.", ai: true },
                 { title: "2. Facts & Incident Chronology", content: "Extraction confirms the failure occurred at 14:35 relative to section 14. E-Stop was manually triggered 12 mins later.", ai: true },
                 { title: "3. Analysis & Root Cause", content: "Click to insert AI PEEPO proof-points...", ai: false },
                 { title: "4. Preventive Actions", content: "Replacement of roller support bracket with industrial Grade 8 steel...", ai: false },
               ].map((section, idx) => (
                  <div key={idx} className="group relative bg-white border border-slate-200 rounded-sm p-6  hover: transition-all">
                     <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{section.title}</h4>
                        <div className="flex gap-1.5">
                           {section.ai && <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">AI Drafted</span>}
                           <Pencil className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                     </div>
                     <p className={`text-sm leading-relaxed ${section.content.includes("Click") ? "text-slate-300 italic" : "text-slate-700 font-medium"}`}>{section.content}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
