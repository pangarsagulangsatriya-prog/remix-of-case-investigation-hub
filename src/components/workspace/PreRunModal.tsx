import React from 'react';
import { X, Database, HelpCircle, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AgentState } from "@/types/workspace";

interface PreRunModalProps {
  agent: AgentState;
  onClose: () => void;
  onRun: (isRerun: boolean) => void;
}

export function PreRunModal({ agent, onClose, onRun }: PreRunModalProps) {
  const isRerun = agent.status === 'completed' || agent.status === 'failed' || agent.status === 'cancelled';
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-sm  overflow-hidden border border-slate-200">
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-sm bg-slate-900 text-white flex items-center justify-center  shadow-slate-900/10">
                <agent.icon className="h-4 w-4" />
             </div>
             <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 leading-none">Execute Node</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Configuration & Cost Warning</span>
             </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 text-slate-400">
             <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-sm p-5 border border-slate-100 space-y-4">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase mb-2">Agent Context</span>
                <span className="text-[14px] font-black text-slate-900 uppercase tracking-tight leading-none">{agent.name}</span>
                <p className="text-[11px] font-bold text-slate-500 mt-2 leading-relaxed opacity-70">{agent.purpose}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Execution Mode</span>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${isRerun ? "text-amber-600" : "text-emerald-600"}`}>
                      {isRerun ? "Rerun / Re-analysis" : "Fresh Execution"}
                   </span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Last Run</span>
                   <span className="text-[10px] font-black text-slate-800 uppercase tabular-nums">{agent.lastRunTimestamp || "Never"}</span>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                   <Database className="h-3 w-3 text-slate-400" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Estimate</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white border border-slate-100 rounded-sm ">
                   <div className="text-[18px] font-black text-slate-900 leading-none">{agent.tokenEstimate?.toLocaleString()}</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                      Est. Tokens <HelpCircle className="h-2.5 w-2.5" />
                   </div>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-sm ">
                   <div className="text-[18px] font-black text-slate-900 leading-none">12</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Source Evidence</div>
                </div>
             </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 border-dashed rounded-sm p-4 flex gap-3">
             <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
             <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase block tracking-wider">Token Consumption Warning</span>
                <p className="text-[11px] font-black text-amber-900 leading-snug opacity-70">
                   Running this agent will consume cloud inference tokens. Cost will be billed to the Case ID budget.
                </p>
             </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 text-[11px] font-black uppercase tracking-widest rounded-sm">
             Cancel
          </Button>
          <Button onClick={() => onRun(isRerun)} className="flex-1 h-11 bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-sm  shadow-slate-900/10">
             {isRerun ? "Confirm Rerun" : "Confirm Execute"}
          </Button>
        </div>
      </div>
    </div>
  );
}
