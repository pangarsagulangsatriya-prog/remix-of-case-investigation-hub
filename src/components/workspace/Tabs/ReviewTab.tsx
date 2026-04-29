import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Check, Clock } from "lucide-react";

export default function ReviewTab() {
  return (
    <div className="flex h-full bg-slate-50/10">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white border rounded-sm  p-8 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 ">
                   <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Review & Board Approval</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase mt-1">CS-2026-0147 [v1.2]</p>
                </div>
             </div>
             <div className="flex gap-2.5">
               <Button variant="outline" className="h-10 text-xs font-bold px-5">Request Corrections</Button>
               <Button className="h-10 text-xs font-bold px-6 bg-slate-900 text-white">Approve Case</Button>
             </div>
          </div>

          <div className="bg-white border rounded-sm  overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Formal Approval Chain</span>
               <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">Board Review In-Progress</span>
            </div>
            <div className="p-8 flex items-center justify-between relative">
               <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -translate-y-[24px]" />
               {[
                 { role: "Investigator", user: "Sarah Chen", status: "submitted", date: "Apr 8, 10:12" },
                 { role: "Site Reviewer", user: "John Doe", status: "reviewed", date: "Apr 8, 14:45" },
                 { role: "HSE Board", user: "Director Smith", status: "pending", date: "Present" },
                 { role: "Regulatory", user: "Inspector G", status: "waiting", date: "—" },
               ].map((step, i) => (
                <div key={step.role} className="flex flex-col items-center gap-3 relative z-10 w-48 text-center">
                   <div className={`h-10 w-10 rounded-full border-4 flex items-center justify-center transition-all ${
                     step.status === "reviewed" || step.status === "submitted" ? "bg-emerald-500 border-white text-white  shadow-emerald-500/20" :
                     step.status === "pending" ? "bg-amber-500 border-white text-white  shadow-amber-500/20 animate-pulse" :
                     "bg-slate-100 border-white text-slate-400"
                   }`}>
                      {step.status === "reviewed" || step.status === "submitted" ? <Check className="h-4 w-4" /> : step.status === "pending" ? <Clock className="h-4 w-4" /> : (i+1)}
                   </div>
                   <div>
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter mb-0.5">{step.role}</h4>
                      <p className="text-xs font-bold text-slate-700">{step.user}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
