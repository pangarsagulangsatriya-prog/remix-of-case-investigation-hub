import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Upload } from "lucide-react";

export default function CreateCasePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
     title: "",
     date: "",
     site: "Site Alpha",
     severity: "Critical",
     description: ""
  });

  const progressSteps = [
    { label: "Case Identity", done: formData.title.length > 5, required: true },
    { label: "Incident Parameters", done: formData.date !== "", required: true },
    { label: "Site Classification", done: formData.site !== "", required: true },
    { label: "Executive Summary", done: formData.description.length > 20, required: true },
    { label: "Evidence Attachment", done: false, required: false },
  ];

  const completion = (progressSteps.filter(s => s.done).length / progressSteps.filter(s => s.required).length) * 100;

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-slate-50/10">
        <div className="h-12 border-b bg-white flex items-center justify-between px-6 shrink-0 shadow-sm relative z-10">
           <div className="flex items-center gap-3">
              <div className="h-7 w-7 bg-primary/5 rounded flex items-center justify-center text-primary">
                 <Plus className="h-4 w-4" />
              </div>
              <h1 className="text-sm font-bold text-slate-900 border-none p-0 inline-flex items-center gap-2">
                 Workspace Initializer <span className="text-slate-300 font-normal">/ New Investigation</span>
              </h1>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Readiness</span>
                 <div className="h-1 w-24 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(completion, 100)}%` }} />
                 </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500" onClick={() => navigate("/cases")}>Discard</Button>
              <Button size="sm" className="h-8 text-xs font-bold px-6 bg-slate-900" onClick={() => navigate("/cases/CS-2026-0148")}>
                 Initialize Workspace
              </Button>
           </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
           <div className="max-w-6xl mx-auto p-8 flex gap-8">
              <div className="flex-1 space-y-6">
                 {/* Form Section 1: Core Info */}
                 <div className="bg-white border rounded-2xl shadow-sm p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                    <div>
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Incident Identity</h3>
                       <p className="text-2xs text-slate-400 font-medium uppercase tracking-widest">Establish the primary investigation record</p>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investigation Title</label>
                          <Input 
                            className="h-10 text-sm border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium" 
                            placeholder="e.g. Conveyor Belt Failure - Zone B Site Alpha" 
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event Occurence</label>
                             <Input 
                                type="datetime-local" 
                                className="h-10 text-sm border-slate-100 bg-slate-50/50" 
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                             />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Site / Node Location</label>
                             <select className="flex h-10 w-full rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm">
                                <option>Site Alpha - Northern Link</option>
                                <option>Site Beta - Processing Area</option>
                                <option>Site Gamma - Storage Facility</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Form Section 2: Classification */}
                 <div className="bg-white border rounded-2xl shadow-sm p-8 space-y-6">
                    <div>
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Classification & Severity</h3>
                       <p className="text-2xs text-slate-400 font-medium uppercase tracking-widest">Categorize the incident impact level</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                       {["Critical", "High", "Medium"].map((s) => (
                         <button 
                            key={s}
                            onClick={() => setFormData({...formData, severity: s})}
                            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                               formData.severity === s 
                               ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                               : "border-slate-100 hover:bg-slate-50"
                            }`}
                         >
                            <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${
                               s === "Critical" ? "text-rose-600" : s === "High" ? "text-amber-600" : "text-blue-600"
                            }`}>{s}</span>
                            <span className="text-xs font-bold text-slate-700">Level {s === "Critical" ? 5 : s === "High" ? 4 : 3}</span>
                            {formData.severity === s && <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary rotate-45 transform translate-x-2 translate-y-2" />}
                         </button>
                       ))}
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Initial Executive Summary</label>
                       <Textarea 
                          className="min-h-[120px] text-sm border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium leading-relaxed" 
                          placeholder="Provide a high-level overview of the incident as currently understood..." 
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                       />
                       <span className="text-[9px] text-slate-400 font-bold uppercase block mt-1">Min. 100 characters for high-quality AI analysis priming</span>
                    </div>
                 </div>

                 {/* Form Section 3: Evidence Drop */}
                 <div className="bg-white border rounded-2xl shadow-sm p-8 space-y-6">
                    <div>
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Evidence Payload</h3>
                       <p className="text-2xs text-slate-400 font-medium uppercase tracking-widest">Stage initial files for immediate extraction</p>
                    </div>

                    <div className="border-2 border-dashed rounded-2xl p-12 text-center hover:border-primary/40 transition-all cursor-pointer group bg-slate-50/30">
                       <div className="h-14 w-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6 text-primary" />
                       </div>
                       <p className="text-sm font-bold text-slate-900">
                          Drop investigation assets here or{" "}
                          <span className="text-primary underline decoration-2 underline-offset-4">browse corporate storage</span>
                       </p>
                       <p className="text-2xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">SECURE ENCRYPTED UPLOAD • MAX 250MB / FILE</p>
                    </div>
                 </div>
              </div>

              {/* Sidebar Checklist */}
              <div className="w-80 space-y-6 shrink-0">
                 <div className="bg-white border rounded-2xl shadow-sm p-6 sticky top-0">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6 border-b pb-3">Validation Protocol</h4>
                    <div className="space-y-4">
                       {progressSteps.map((step, i) => (
                         <div key={i} className="flex items-start gap-3 group">
                            <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                               step.done 
                               ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                               : "border-slate-200"
                            }`}>
                               {step.done && <CheckCircle2 className="h-3 w-3" />}
                            </div>
                            <div className="flex-1">
                               <p className={`text-xs font-bold leading-none ${step.done ? "text-slate-900" : "text-slate-400"}`}>{step.label}</p>
                               <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">{step.required ? "Required Audit Field" : "Optional Stage"}</span>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="mt-8 pt-6 border-t">
                       <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                          <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center text-white shrink-0">
                             <Brain className="h-3.5 w-3.5" />
                          </div>
                          <div>
                             <p className="text-[11px] font-bold text-blue-900 leading-tight">AI Priming Ready</p>
                             <p className="text-[9px] text-blue-700/70 font-medium leading-relaxed mt-1">Workspace will automatically initialize extraction pipelines upon creation.</p>
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
