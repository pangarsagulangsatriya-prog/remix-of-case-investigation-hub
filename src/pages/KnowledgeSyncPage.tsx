import React from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  ArrowLeft, RefreshCw, FileText, CheckCircle2, XCircle, AlertCircle,
  Clock, Download, Play, Layers, Folder, Filter, Settings, History
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockSyncBatches, mockSyncItems } from "@/data/mockKnowledgeData";
import { toast } from "sonner";

export default function KnowledgeSyncPage() {
  const navigate = useNavigate();
  const latestBatch = mockSyncBatches[0];

  const handleSyncAll = () => toast.success("Sync All Documents started");
  const handleRebuildSemantic = () => toast.success("Rebuild All Semantic Index started");
  const handleRetryFailed = () => toast.success("Retry Failed Documents started");

  return (
    <AppLayout hideHeader={false}>
      <div className="flex flex-col h-[calc(100vh-44px)] bg-[#f0f2f4] overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/knowledge")}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-emerald-600" />
                  Knowledge Sync Utility
                </h1>
                <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                  Last sync: 29 Jun 2026, 15:28
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleRebuildSemantic} variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-wider bg-white">
                <Settings className="h-3.5 w-3.5 mr-1.5" /> Rebuild All Semantic Index
              </Button>
              <Button onClick={handleRetryFailed} variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-wider bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry Failed
              </Button>
              <Button onClick={handleSyncAll} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <Play className="h-3.5 w-3.5 mr-1.5" /> Sync All Documents
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Documents</span>
                <FileText className="h-4 w-4 text-slate-300" />
              </div>
              <div className="text-2xl font-black text-slate-800">120</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indexed</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-600">112</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updated This Sync</span>
                <History className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-600">8</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing</span>
                <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
              </div>
              <div className="text-2xl font-black text-indigo-600">5</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Failed</span>
                <XCircle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-600">3</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Need Re-index</span>
                <AlertCircle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-600">12</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Current Sync Batch Detail */}
            <div className="col-span-1 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Sync Batch</h2>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Processing
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Batch ID</div>
                  <div className="text-[12px] font-bold text-slate-800">{latestBatch.batchNo}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Started</div>
                    <div className="text-[11px] font-bold text-slate-700">29 Jun 2026, 15:28</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Triggered by</div>
                    <div className="text-[11px] font-bold text-slate-700">{latestBatch.triggeredBy}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Source</div>
                  <div className="text-[11px] font-bold text-slate-700">{latestBatch.source}</div>
                </div>

                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Scope</div>
                  <div className="text-[11px] font-bold text-slate-700 capitalize">All Knowledge Documents</div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Progress</div>
                    <div className="text-[11px] font-black text-emerald-600">{latestBatch.progressPercent}%</div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${latestBatch.progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 mt-1.5 text-center">
                    {latestBatch.processedDocuments} / {latestBatch.totalDocuments} documents processed
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full h-8 text-[10px] font-bold bg-white" onClick={() => toast.info("Exporting Sync Log...")}>
                    <Download className="h-3 w-3 mr-1.5" /> Export Sync Log
                  </Button>
                </div>
              </div>
            </div>

            {/* Sync Updates Table */}
            <div className="col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" /> Sync Updates
                </h2>
                <div className="flex items-center gap-2">
                  <select className="h-7 text-[10px] font-bold bg-white border border-slate-200 rounded px-2 outline-none">
                    <option>Semua Status</option>
                    <option>Processing</option>
                    <option>Failed</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-sm">
                    <tr>
                      <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Document</th>
                      <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Location</th>
                      <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Action</th>
                      <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                      <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {mockSyncItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3 min-w-[200px]">
                          <div className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.documentTitle}</div>
                          {item.documentNo && <div className="text-[9px] text-slate-400 mt-0.5">{item.documentNo}</div>}
                        </td>
                        <td className="px-4 py-3 min-w-[150px]">
                          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600 line-clamp-1">
                            <Layers className="h-3 w-3 text-indigo-400 shrink-0" /> {item.layerName}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 line-clamp-1 mt-0.5">
                            <Folder className="h-3 w-3 text-amber-400 shrink-0" /> {item.folderName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.status === "done" && (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Done</span>
                            </div>
                          )}
                          {item.status === "extracting" && (
                            <div className="flex items-center gap-1.5">
                              <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{item.progressPercent}%</span>
                            </div>
                          )}
                          {item.status === "failed" && (
                            <div className="flex items-center gap-1.5">
                              <XCircle className="h-3.5 w-3.5 text-rose-500" />
                              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Failed</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-600 min-w-[200px]">
                          {item.message}
                          <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString() : ''}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
