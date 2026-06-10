import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Database,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Server,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Network,
  Share2,
  FileText,
  Video,
  FileJson,
  LayoutGrid,
  ChevronRight,
  MoreVertical,
  Play,
  History,
  FolderOpen,
  ArrowRight,
  MapPin,
  Bot,
  Clock,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  mockSources, 
  mockConnectorLayers, 
  mockFieldMappings, 
  mockSyncJobs, 
  mockRunLogs, 
  mockSchemaFields 
} from "@/data/mockConnectorData";

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "Connected" || status === "Success" || status === "Mapped" || status === "Available") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" />
        {status}
      </span>
    );
  }
  if (status === "Warning" || status === "Need Mapping" || status === "Need Review") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="h-3 w-3" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
      <XCircle className="h-3 w-3" />
      {status}
    </span>
  );
};

const DataTypeIcon = ({ type }: { type: string }) => {
  switch(type) {
    case "Document": return <FileText className="h-4 w-4" />;
    case "Media": return <Video className="h-4 w-4" />;
    case "Sensor": return <Activity className="h-4 w-4" />;
    case "Form":
    case "Checklist":
      return <LayoutGrid className="h-4 w-4" />;
    default: return <Database className="h-4 w-4" />;
  }
};

export default function DataConnectorPage() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (connector: any, layerName: string) => {
    setSelectedConnector({ ...connector, layer: layerName });
    setIsDrawerOpen(true);
  };

  const handleNextStep = () => setModalStep(prev => Math.min(prev + 1, 5));
  const handlePrevStep = () => setModalStep(prev => Math.max(prev - 1, 1));

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">Data Connector Hub</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Kelola sumber data investigasi, sinkronisasi, dan routing ke AI Agent.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 h-9 text-xs font-bold bg-white text-slate-700 border-slate-200">
                <Download className="h-4 w-4 text-slate-400" />
                Export Assessment
              </Button>
              <Button variant="outline" className="gap-2 h-9 text-xs font-bold bg-white text-slate-700 border-slate-200">
                <RefreshCw className="h-4 w-4 text-slate-400" />
                Sync All
              </Button>
              <Button 
                onClick={() => { setIsModalOpen(true); setModalStep(1); }}
                className="gap-2 h-9 text-xs font-bold bg-[#1f9347] hover:bg-[#1b803e] text-white shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Source
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            {[
              { label: "Active Sources", value: "42", icon: Network, color: "text-blue-600" },
              { label: "Last Sync", value: "10 Jun 2026 02:08 PM", icon: Clock, color: "text-slate-600" },
              { label: "Sync Success Rate", value: "96%", icon: CheckCircle2, color: "text-emerald-600" },
              { label: "Failed Jobs", value: "2", icon: AlertCircle, color: "text-rose-600" },
              { label: "Data Quality Score", value: "87%", icon: Activity, color: "text-indigo-600" },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg bg-slate-50", stat.color)}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full h-full">
            <div className="bg-white border-b px-6 shrink-0">
              <TabsList className="h-12 bg-transparent border-none p-0 gap-6">
                <TabsTrigger value="catalog" className="data-[state=active]:border-b-2 data-[state=active]:border-[#1f9347] data-[state=active]:text-[#1f9347] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 font-bold text-sm text-slate-500">Connector Catalog</TabsTrigger>
                <TabsTrigger value="sources" className="data-[state=active]:border-b-2 data-[state=active]:border-[#1f9347] data-[state=active]:text-[#1f9347] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 font-bold text-sm text-slate-500">Sources</TabsTrigger>
                <TabsTrigger value="explorer" className="data-[state=active]:border-b-2 data-[state=active]:border-[#1f9347] data-[state=active]:text-[#1f9347] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 font-bold text-sm text-slate-500">Data Explorer</TabsTrigger>
                <TabsTrigger value="mapping" className="data-[state=active]:border-b-2 data-[state=active]:border-[#1f9347] data-[state=active]:text-[#1f9347] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 font-bold text-sm text-slate-500">Field Mapping</TabsTrigger>
                <TabsTrigger value="sync" className="data-[state=active]:border-b-2 data-[state=active]:border-[#1f9347] data-[state=active]:text-[#1f9347] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 font-bold text-sm text-slate-500">Sync Jobs</TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:border-b-2 data-[state=active]:border-[#1f9347] data-[state=active]:text-[#1f9347] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 font-bold text-sm text-slate-500">Run Logs</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 relative">
              {/* TAB 1: CONNECTOR CATALOG */}
              <TabsContent value="catalog" className="p-6 m-0 h-full flex gap-6">
                <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                  {mockConnectorLayers.map((layer, idx) => (
                    <div key={idx} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                      <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white tracking-wide">{layer.layerName}</h3>
                        <span className="text-xs font-medium text-slate-400">{layer.connectors.length} Connectors</span>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {layer.connectors.map((connector, cIdx) => (
                          <div 
                            key={cIdx} 
                            onClick={() => openDrawer(connector, layer.layerName)}
                            className="group border border-slate-200 rounded-lg p-4 hover:border-[#1f9347] hover:shadow-md transition-all cursor-pointer bg-white flex flex-col h-full relative"
                          >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="h-4 w-4 text-[#1f9347]" />
                            </div>
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 bg-slate-50 text-slate-600 rounded border shrink-0">
                                <DataTypeIcon type={connector.dataType} />
                              </div>
                              <h4 className="text-sm font-bold text-slate-800 leading-tight pr-4">{connector.name}</h4>
                            </div>
                            <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">{connector.syncMode}</span>
                              <StatusBadge status={connector.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Drawer Panel for Connector Catalog */}
                {isDrawerOpen && selectedConnector && (
                  <div className="w-[400px] shrink-0 bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col overflow-hidden sticky top-0 h-fit max-h-full">
                    <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Connector Detail</h3>
                      <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-slate-200 rounded">
                        <XCircle className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                      <div>
                        <div className="w-12 h-12 bg-slate-100 rounded-xl border flex items-center justify-center mb-4">
                          <DataTypeIcon type={selectedConnector.dataType} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight mb-1">{selectedConnector.name}</h2>
                        <p className="text-xs font-medium text-slate-500">{selectedConnector.layer}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data Type</span>
                          <span className="text-sm font-semibold text-slate-800">{selectedConnector.dataType}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sync Mode</span>
                          <span className="text-sm font-semibold text-slate-800">{selectedConnector.syncMode}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                          <StatusBadge status={selectedConnector.status} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Source System</span>
                          <span className="text-sm font-semibold text-slate-800">HSE Server</span>
                        </div>
                      </div>

                      <div className="border-t pt-5 space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">AI Routing Path</h4>
                        <div className="bg-slate-50 border rounded-lg p-3 text-xs font-medium text-slate-600 flex items-center gap-2">
                          <Database className="h-4 w-4 text-slate-400" />
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded">Extraction Agent</span>
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded">Analysis Agent</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex gap-2">
                      <Button className="flex-1 bg-[#1f9347] hover:bg-[#1b803e] text-xs font-bold shadow-sm">Configure Source</Button>
                      <Button variant="outline" className="flex-1 text-xs font-bold text-slate-700 border-slate-300">Run Sync</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: SOURCES */}
              <TabsContent value="sources" className="p-6 m-0 h-full flex flex-col">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                  <div className="p-4 border-b flex items-center gap-4 bg-slate-50/50">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search sources..." className="pl-9 h-9 text-xs" />
                    </div>
                    <Button variant="outline" className="h-9 text-xs font-bold gap-2 text-slate-600">
                      <Filter className="h-4 w-4" /> Filter by Layer
                    </Button>
                    <Button variant="outline" className="h-9 text-xs font-bold gap-2 text-slate-600">
                      <Filter className="h-4 w-4" /> Filter by Status
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Source Name</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Layer</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Source System</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Environment</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Type</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Auth Type</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Last Sync</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mockSources.map((source, i) => (
                          <tr key={i} className="hover:bg-[#f0fdf4]/50 transition-colors group cursor-pointer">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800">{source.name}</div>
                              <div className="text-[10px] text-slate-400">{source.connector}</div>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-600">{source.layer.split("—")[0]}</td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-600">{source.sourceSystem}</td>
                            <td className="px-4 py-3"><span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded uppercase">{source.environment}</span></td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-600">{source.type}</td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-600">{source.authType}</td>
                            <td className="px-4 py-3 text-[11px] font-medium text-slate-500">{source.lastSync}</td>
                            <td className="px-4 py-3"><StatusBadge status={source.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: DATA EXPLORER */}
              <TabsContent value="explorer" className="p-6 m-0 h-full flex gap-6">
                <div className="w-[300px] shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                  <div className="p-4 border-b bg-slate-50/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Select Source</span>
                    <Select defaultValue="SRC-001">
                      <SelectTrigger className="h-9 text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSources.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 overflow-auto p-2">
                    <div className="px-3 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-2 cursor-pointer border border-emerald-100">
                      <Database className="h-3.5 w-3.5" />
                      incident_investigation
                    </div>
                    <div className="px-3 py-2 text-slate-600 text-xs font-medium rounded-md flex items-center gap-2 cursor-pointer hover:bg-slate-50 mt-1">
                      <Database className="h-3.5 w-3.5" />
                      incident_evidence_attachments
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                  <div className="p-5 border-b flex justify-between items-start bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="h-5 w-5 text-slate-400" />
                        <h2 className="text-lg font-black text-slate-800">incident_investigation</h2>
                      </div>
                      <p className="text-xs text-slate-500">Source: CCR Investigation Source</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Row Count</span>
                        <span className="text-sm font-bold text-slate-700">14,239</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Last Updated</span>
                        <span className="text-sm font-bold text-slate-700">10 Jun 2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-100 border-b sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Field Name</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Type</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Null</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Sample Value</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Description</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Detected Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mockSchemaFields.map((field, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700">{field.name}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{field.type}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{field.nullable}</td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-700 truncate max-w-[200px]">{field.sample}</td>
                            <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[200px]">{field.desc}</td>
                            <td className="px-4 py-3">
                              <span className="bg-slate-100 border text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                {field.category}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: FIELD MAPPING */}
              <TabsContent value="mapping" className="p-6 m-0 h-full flex flex-col gap-6">
                <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700 shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Bot className="w-32 h-32 text-white" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">AI Agent Routing Flow</h3>
                  <div className="flex items-center gap-3 relative z-10 overflow-x-auto pb-2">
                    <div className="bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold border border-slate-600 shrink-0">Source Data</div>
                    <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-xs font-bold border border-emerald-500/30 shrink-0 flex items-center gap-2"><Bot className="h-4 w-4" /> Extraction Agent</div>
                    <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0" />
                    <div className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg text-xs font-bold border border-indigo-500/30 shrink-0 flex items-center gap-2"><Bot className="h-4 w-4" /> Fact & Chronology</div>
                    <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0" />
                    <div className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg text-xs font-bold border border-indigo-500/30 shrink-0 flex items-center gap-2"><Bot className="h-4 w-4" /> Actor Analysis</div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="text-xs font-black text-slate-400 shrink-0 tracking-widest uppercase">...</div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shrink-0 border border-blue-600">Submit AI Value</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mapping Source</span>
                      <Select defaultValue="SRC-001">
                        <SelectTrigger className="h-8 text-xs font-bold w-[250px] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockSources.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="h-8 text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 gap-2">
                        <Bot className="h-3 w-3" /> Auto Suggest
                      </Button>
                      <Button className="h-8 text-xs font-bold bg-[#1f9347] hover:bg-[#1b803e] text-white">Save Mapping</Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Source Field</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Canonical Field</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Extraction Agent</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Analysis Agent</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-center">Req</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mockFieldMappings.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{row.sourceField}</td>
                            <td className="px-4 py-3">
                              <div className="border rounded px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white w-full max-w-[200px] flex justify-between items-center">
                                {row.canonicalField} <ChevronDown className="h-3 w-3 text-slate-400" />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-indigo-600 bg-indigo-50/30">{row.extractionAgent}</td>
                            <td className="px-4 py-3 text-xs font-medium text-emerald-600 bg-emerald-50/30">{row.analysisAgent}</td>
                            <td className="px-4 py-3 text-center">
                              {row.required === "Yes" ? <span className="text-rose-500 font-bold">*</span> : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 5: SYNC JOBS */}
              <TabsContent value="sync" className="p-6 m-0 h-full flex flex-col">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Sync Jobs</h3>
                    <Button className="h-8 text-xs font-bold bg-white text-slate-700 border shadow-sm">
                      <RefreshCw className="h-3 w-3 mr-2" /> Sync All Now
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Sync Job</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Source</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Mode & Schedule</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Last Run</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Rows R/W</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mockSyncJobs.map((job, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-slate-800">{job.name}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{job.source}</td>
                            <td className="px-4 py-3">
                              <span className="block text-[11px] font-bold text-slate-700">{job.mode}</span>
                              <span className="block text-[10px] text-slate-400">{job.schedule}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="block text-[11px] font-bold text-slate-700">{job.lastRun}</span>
                              <span className="block text-[10px] text-slate-400">{job.duration !== "-" ? `Duration: ${job.duration}` : "-"}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-slate-600">
                              {job.read} / <span className="text-emerald-600 font-bold">{job.written}</span>
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                            <td className="px-4 py-3 text-right">
                               <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600 hover:bg-indigo-50"><Play className="h-3 w-3" /></Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700"><MoreVertical className="h-3 w-3" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                 </div>
              </TabsContent>

              {/* TAB 6: RUN LOGS */}
              <TabsContent value="logs" className="p-6 m-0 h-full flex flex-col">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                  <div className="p-4 border-b flex items-center gap-4 bg-slate-50/50">
                    <Button variant="outline" className="h-9 text-xs font-bold gap-2 text-slate-600">
                      <Filter className="h-4 w-4" /> Filter Status
                    </Button>
                    <Button variant="outline" className="h-9 text-xs font-bold gap-2 text-slate-600">
                      <History className="h-4 w-4" /> Date Range
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Run ID</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Sync Job</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Start Time</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Duration</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Read</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Written</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Error Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mockRunLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">{log.id}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{log.job}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{log.start}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{log.duration}</td>
                            <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                            <td className="px-4 py-3 text-right text-xs font-mono">{log.read}</td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600 font-bold">{log.written}</td>
                            <td className="px-4 py-3 text-xs font-medium text-rose-500 max-w-[200px] truncate">{log.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                 </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* CREATE SOURCE MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[700px] p-0 overflow-hidden bg-white">
          <div className="flex">
            {/* Steps Sidebar */}
            <div className="w-[200px] bg-slate-50 p-6 border-r shrink-0">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Create Source</h3>
              <div className="space-y-6">
                {[
                  "Select Connector",
                  "Source Setup",
                  "Credential Setup",
                  "Sync Config",
                  "Field Mapping"
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors",
                      modalStep > idx + 1 ? "bg-[#1f9347] border-[#1f9347] text-white" : 
                      modalStep === idx + 1 ? "border-[#1f9347] text-[#1f9347]" : "border-slate-200 text-slate-400 bg-white"
                    )}>
                      {modalStep > idx + 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-xs font-bold",
                      modalStep === idx + 1 ? "text-slate-800" : "text-slate-400"
                    )}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex flex-col h-[500px]">
              <div className="p-6 flex-1 overflow-y-auto">
                {modalStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-800">Select Connector</h2>
                    <p className="text-xs text-slate-500 mb-4">Choose the pre-built connector template for your data source.</p>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Defense Layer</label>
                      <Select defaultValue="layer2">
                        <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="layer1">Layer I — Organization Roles</SelectItem>
                          <SelectItem value="layer2">Layer II — Plan Readiness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Connector Template</label>
                      <Select defaultValue="c1">
                        <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="c1">Incident Investigation & Reporting Connector</SelectItem>
                          <SelectItem value="c2">JSA Connector</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {modalStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-800">Source Setup</h2>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source Name</label>
                        <Input placeholder="e.g. Production HSE DB" className="text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Environment</label>
                          <Select defaultValue="prod"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="prod">Production</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source Type</label>
                          <Select defaultValue="db"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="db">Database</SelectItem></SelectContent></Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Host / URL</label>
                        <Input placeholder="jdbc:postgresql://..." className="text-sm" />
                      </div>
                    </div>
                  </div>
                )}
                {modalStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-800">Credential Setup</h2>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Auth Type</label>
                        <Select defaultValue="userpass"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="userpass">DB User / Password</SelectItem></SelectContent></Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                        <Input placeholder="admin" className="text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                        <Input type="password" placeholder="••••••••" className="text-sm" />
                      </div>
                      <Button variant="outline" className="w-full font-bold text-indigo-600 border-indigo-200 bg-indigo-50 mt-2">Test Connection</Button>
                    </div>
                  </div>
                )}
                {modalStep === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-800">Sync Configuration</h2>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sync Mode</label>
                          <Select defaultValue="inc"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="inc">Incremental</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Schedule</label>
                          <Select defaultValue="1h"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="1h">Every 1 Hour</SelectItem></SelectContent></Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Key</label>
                        <Input placeholder="id" className="text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Watermark Field</label>
                        <Input placeholder="updated_at" className="text-sm" />
                      </div>
                    </div>
                  </div>
                )}
                {modalStep === 5 && (
                  <div className="space-y-4 flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                      <Bot className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-black text-slate-800">Ready to Auto-Map!</h2>
                    <p className="text-sm text-slate-500 max-w-xs">Connection successful. We will now auto-detect the schema and suggest AI mappings.</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-slate-50 flex justify-between">
                <Button variant="ghost" onClick={handlePrevStep} disabled={modalStep === 1} className="text-xs font-bold text-slate-500">Back</Button>
                {modalStep < 5 ? (
                  <Button onClick={handleNextStep} className="bg-[#1f9347] hover:bg-[#1b803e] text-xs font-bold">Next Step</Button>
                ) : (
                  <Button onClick={() => setIsModalOpen(false)} className="bg-[#1f9347] hover:bg-[#1b803e] text-xs font-bold">Save & Auto-Map</Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
