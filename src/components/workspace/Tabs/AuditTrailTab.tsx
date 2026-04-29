import React from "react";
import { useParams } from "react-router-dom";
import { useAuditLogs } from "@/hooks/useAuditLogs";

export default function AuditTrailTab() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: realLogs, isLoading } = useAuditLogs(caseId!);

  if (isLoading) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Audit Trail...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50/10 h-screen overflow-hidden">
      <div className="h-12 border-b bg-white flex items-center justify-between px-6 shrink-0  relative z-10">
         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Logs</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
         <div className="bg-white border rounded-sm  overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Timestamp</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">User</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Action</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(realLogs || []).map((log: any, idx: number) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-[10px] font-mono text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                       <div className="text-xs font-bold text-slate-800">{log.user_name}</div>
                       <div className="text-[9px] text-slate-400 uppercase">System Auditor</div>
                    </td>
                    <td className="p-4 text-[11px] font-bold text-slate-900">{log.action}</td>
                     <td className="p-4">
                       <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-slate-50 border-slate-100 text-slate-400">
                          {log.entity_type}: {log.entity_name}
                       </span>
                    </td>
                  </tr>
                ))}
                {(!realLogs || realLogs.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      No logs recorded for this case
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
