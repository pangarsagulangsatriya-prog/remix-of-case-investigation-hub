import React from 'react';
import { X, History, Activity, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AgentState } from "@/types/workspace";

interface AgentHistoryPanelProps {
  agent: AgentState;
  onClose: () => void;
}

export function AgentHistoryPanel({ agent, onClose }: AgentHistoryPanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-slate-200 z-[100]  flex flex-col animate-in slide-in-from-right duration-300">
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
        <div className="flex items-center gap-3">
           <History className="h-5 w-5 text-slate-400" />
           <div className="flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Run History</h3>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{agent.name}</span>
           </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 rounded-full hover:bg-slate-200 text-slate-400 transition-all">
           <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {agent.history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-12">
             <Activity className="h-12 w-12 text-slate-300 mb-6" />
             <h4 className="text-[12px] font-black uppercase tracking-[0.2em]">No History Found</h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">This agent has not been executed yet.</p>
          </div>
        ) : (
          agent.history.map((run, i) => (
            <div key={run.run_id} className="relative pl-6 pb-8 last:pb-0">
               {i !== agent.history.length - 1 && (
                  <div className="absolute left-[7px] top-4 bottom-0 w-px bg-slate-100" />
               )}
               <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                  <div className={`h-1.5 w-1.5 rounded-full ${run.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
               </div>
               
               <div className="bg-white border border-slate-100 rounded-sm p-4  hover:border-slate-300 transition-all cursor-default">
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</span>
                        <span className="text-[11px] font-black text-slate-800 tabular-nums">
                           {new Date(run.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${run.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                        {run.status}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Token Usage</div>
                        <div className="text-[12px] font-black text-slate-900 tabular-nums">{run.token_usage?.toLocaleString() || "—"}</div>
                     </div>
                     <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Duration</div>
                        <div className="text-[12px] font-black text-slate-900 tabular-nums">{(run.duration_ms! / 1000).toFixed(2)}s</div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                     <Users className="h-3 w-3 text-slate-300" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Triggered by: <span className="text-slate-800">{run.triggered_by}</span></span>
                  </div>

                  <div className="bg-slate-50/50 rounded-sm p-3 border border-slate-50">
                     <p className="text-[11px] font-bold text-slate-500 leading-snug italic">
                        "{run.summary || "No summary provided for this run."}"
                     </p>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Metrics</span>
           <span className="text-[10px] font-black text-slate-900 uppercase">{agent.runCount} Total Runs</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-3 rounded-sm border ">
              <div className="text-[14px] font-black text-slate-900 leading-none">
                 {agent.history.reduce((a, b) => a + (b.token_usage || 0), 0).toLocaleString()}
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Tokens</div>
           </div>
           <div className="bg-white p-3 rounded-sm border ">
              <div className="text-[14px] font-black text-slate-900 leading-none">
                 {(agent.history.reduce((a, b) => a + (b.duration_ms || 0), 0) / 1000).toFixed(1)}s
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Compute</div>
           </div>
        </div>
      </div>
    </div>
  );
}
