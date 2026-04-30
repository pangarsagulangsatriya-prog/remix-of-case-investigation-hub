import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from "@/components/AppLayout";
import { 
  FlaskConical, Download, Save, Upload, Play, CheckCircle2, 
  History, Settings, FileCode, MessageSquare, Database, 
  AlertTriangle, Brain, Activity, Clock, ShieldCheck, 
  RotateCw, Terminal, Search, ChevronRight, Users, Plus,
  Settings2, ShieldAlert, LayoutGrid, Code2, Info, ListTree,
  Cpu, DollarSign, X, Check, Volume2, Globe, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- TYPES ---
interface Model {
  id: string;
  name: string;
  provider: string;
  input_modalities: string[];
  output_modalities: string[];
  supports_structured_output: boolean;
  pricing: any;
}

// --- PRIMITIVES ---
function LabSection({ title, icon: Icon, children, count, actions }: { 
  title: string, 
  icon: any, 
  children: React.ReactNode, 
  count?: number,
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col border-b border-slate-100 last:border-0">
      <div className="px-4 py-2.5 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</span>
          {count !== undefined && (
            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-[3px] text-[8px] font-bold">{count}</span>
          )}
        </div>
        {actions}
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

function LabField({ label, children, description }: { label: string, children: React.ReactNode, description?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
      {description && <p className="text-[8px] font-bold text-slate-400 leading-tight italic">{description}</p>}
    </div>
  );
}

function LabInput({ value, readOnly, className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        "w-full h-8 px-2.5 bg-white border border-slate-200 rounded-sm text-[11px] font-bold text-slate-700 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition-all",
        readOnly && "bg-slate-50 text-slate-500 cursor-not-allowed",
        className
      )}
      value={value}
      readOnly={readOnly}
      {...props}
    />
  );
}

function LabSelect({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select 
      className={cn(
        "w-full h-8 px-2 bg-white border border-slate-200 rounded-sm text-[11px] font-bold text-slate-700 outline-none focus:border-primary/50 transition-all appearance-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

function LabBadge({ text, type = 'default' }: { text: string, type?: 'default' | 'success' | 'warning' | 'error' | 'info' }) {
  const styles = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <span className={cn("px-1.5 py-0.5 border rounded-[3px] text-[8px] font-black uppercase tracking-tighter", styles[type])}>
      {text}
    </span>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function LabsAudioExtractionPage() {
  // State: Sidebar Config
  const [gateway, setGateway] = useState('openrouter');
  const [credentialProfile] = useState('OPENROUTER_MAIN');
  const [connectionStatus, setConnectionStatus] = useState<'Not Tested' | 'Connected' | 'Failed'>('Not Tested');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [routingPolicy, setRoutingPolicy] = useState({ allowFallbacks: false, requireParameters: true, providerLock: '' });

  // State: Audio Upload
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioMetadata, setAudioMetadata] = useState<{ duration?: number, format?: string } | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // State: Editor
  const [activeTab, setActiveTab] = useState('System Prompt');
  const [systemPrompt, setSystemPrompt] = useState(`You are an expert audio forensic analyst specialized in telecommunication interception and investigation.

Your goal is to perform high-fidelity diarization and fact extraction from the provided audio stream.

CORE PRINCIPLES:
1. ACCURACY: Never hallucinate timestamps. Use 00:00 format.
2. OBJECTIVITY: Report tone based on acoustic features (pitch, jitter, shimmer).
3. TRACEABILITY: Every extracted fact must be linked to a specific utterance.

OUTPUT REQUIREMENTS:
- You must strictly adhere to the defined JSON Output Contract.
- Use the standard speaker labeling: OPERATOR_A, FIELD_UNIT_B, CONTROL_ROOM.`);
  
  const [userPrompt, setUserPrompt] = useState(`ANALYSIS_REQUEST:
Audio Evidence ID: {{evidence_id}}
Case Context: {{case_id}}

TASK:
Extract all dialogue from the provided audio file at {{audio_file_url}}.
Follow the {{speaker_policy}} for identifying and labeling participants.
Ensure output matches the following schema:
{{output_schema}}`);

  const [outputContract, setOutputContract] = useState(JSON.stringify({
    "audio_summary": "string",
    "conversation_flow": [
      {
        "start_time": "string",
        "end_time": "string",
        "speaker": "string",
        "utterance": "string",
        "tone": "string",
        "tags": ["string"],
        "extracted_fact": "string",
        "confidence": "number"
      }
    ]
  }, null, 2));

  const [uiMapping, setUiMapping] = useState(JSON.stringify({
    "component": "ConversationFlow",
    "mapping": {
      "items": "conversation_flow",
      "fields": {
        "title": "speaker",
        "subtitle": "utterance",
        "time": "start_time"
      }
    }
  }, null, 2));

  // State: Result Panel
  const [resultActiveTab, setResultActiveTab] = useState('Result Preview');
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Fetch Models on Load
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/labs/openrouter/models');
      const data = await res.json();
      if (data.data) {
        setModels(data.data);
      }
    } catch (e) {
      toast.error("Failed to load models from gateway");
    }
  };

  const testConnection = async () => {
    setConnectionStatus('Not Tested');
    try {
      const res = await fetch('/api/labs/openrouter/test-connection', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'connected') {
        setConnectionStatus('Connected');
        toast.success("Gateway connection established");
      } else {
        setConnectionStatus('Failed');
        toast.error(data.error || "Connection failed");
      }
    } catch (e) {
      setConnectionStatus('Failed');
      toast.error("Network error during connection test");
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Mock metadata for now
      setAudioMetadata({ format: file.type.split('/')[1] });
      toast.success(`Loaded: ${file.name}`);
    }
  };

  const runExtraction = async () => {
    if (!audioFile || !selectedModel) return;
    
    setIsRunning(true);
    setResultActiveTab('Logs');
    setExtractionResult(null);

    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('model_slug', selectedModel);
    formData.append('system_prompt', systemPrompt);
    formData.append('user_prompt', userPrompt);
    formData.append('output_contract_json_schema', outputContract);
    formData.append('ui_mapping_json', uiMapping);
    formData.append('allow_fallbacks', routingPolicy.allowFallbacks.toString());
    formData.append('require_parameters', routingPolicy.requireParameters.toString());

    try {
      const res = await fetch('/api/labs/audio-extraction/run', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      
      setExtractionResult(data);
      setResultActiveTab('Result Preview');
      toast.success("Extraction completed successfully");
    } catch (e: any) {
      toast.error(e.message);
      setResultActiveTab('Logs');
    } finally {
      setIsRunning(false);
    }
  };

  const filteredModels = models.filter(m => 
    providerFilter === 'All' || m.provider.toLowerCase().includes(providerFilter.toLowerCase())
  );

  const isRunDisabled = !audioFile || !selectedModel || !systemPrompt || isRunning;

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-50 overflow-hidden font-sans">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center">
                  <FlaskConical className="h-3.5 w-3.5 text-white" />
               </div>
               <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider">Labs</h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">Audio Extraction Playground</p>
          </div>

          <div className="flex items-center gap-2">
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                <Download className="h-3 w-3" /> Import XML
             </button>
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                <Save className="h-3 w-3" /> Save Draft
             </button>
             <button className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 border border-slate-900 rounded-sm text-[10px] font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest shadow-sm">
                <CheckCircle2 className="h-3 w-3" /> Publish to Engine
             </button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Config & Model Governance */}
          <div className="w-[320px] border-r border-slate-200 bg-white overflow-y-auto shrink-0 custom-scrollbar flex flex-col">
             <div className="flex-1 divide-y divide-slate-100">
                {/* 1. Model Governance */}
                <LabSection title="Model Governance" icon={ShieldCheck}>
                   <LabField label="Gateway">
                      <LabSelect value={gateway} onChange={(e) => setGateway(e.target.value)}>
                         <option value="openrouter">OpenRouter</option>
                         <option value="custom">Custom API</option>
                         <option value="google" disabled>Google Direct (Disabled)</option>
                         <option value="openai" disabled>OpenAI Direct (Disabled)</option>
                         <option value="bedrock" disabled>AWS Bedrock (Disabled)</option>
                      </LabSelect>
                   </LabField>

                   <LabField label="Credential Profile">
                      <div className="flex items-center gap-2">
                         <div className="flex-1 h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-between overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-600 truncate">{credentialProfile}</span>
                            <LabBadge 
                               text={connectionStatus} 
                               type={connectionStatus === 'Connected' ? 'success' : connectionStatus === 'Failed' ? 'error' : 'default'} 
                            />
                         </div>
                         <button 
                            onClick={testConnection}
                            className="h-8 w-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-sm hover:bg-slate-100 transition-all"
                            title="Test Connection"
                         >
                            <RotateCw className="h-3.5 w-3.5 text-slate-400" />
                         </button>
                      </div>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 italic uppercase tracking-tight">API keys are stored on the server.</p>
                   </LabField>

                   <LabField label="Provider Filter">
                      <LabSelect value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
                         <option value="All">All Providers</option>
                         <option value="OpenAI">OpenAI</option>
                         <option value="Google">Google</option>
                         <option value="Anthropic">Anthropic</option>
                         <option value="Meta">Meta</option>
                      </LabSelect>
                   </LabField>

                   <LabField label="Model Selector">
                      <LabSelect value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                         <option value="">Select an audio model...</option>
                         {filteredModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                         ))}
                      </LabSelect>
                      {selectedModel && (
                         <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-sm space-y-1">
                            <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase">
                               <span>{selectedModel.split('/')[0]}</span>
                               <span className="text-blue-600">Audio Support</span>
                            </div>
                         </div>
                      )}
                   </LabField>

                   <div className="space-y-2 pt-2 border-t border-slate-50 mt-2">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-slate-500 uppercase">Allow Fallbacks</span>
                         <input type="checkbox" checked={routingPolicy.allowFallbacks} onChange={(e) => setRoutingPolicy({...routingPolicy, allowFallbacks: e.target.checked})} className="h-3 w-3" />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-slate-500 uppercase">Require Params</span>
                         <input type="checkbox" checked={routingPolicy.requireParameters} onChange={(e) => setRoutingPolicy({...routingPolicy, requireParameters: e.target.checked})} className="h-3 w-3" />
                      </div>
                   </div>
                </LabSection>

                {/* 2. Audio Upload */}
                <LabSection title="Audio Sample" icon={Volume2}>
                   {!audioFile ? (
                      <div 
                         onClick={() => audioInputRef.current?.click()}
                         className="border-2 border-dashed border-slate-200 rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group"
                      >
                         <Upload className="h-6 w-6 text-slate-300 group-hover:text-slate-400 mb-2" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop audio file here</span>
                         <span className="text-[8px] font-bold text-slate-300 uppercase mt-1">mp3, wav, flac up to 25MB</span>
                      </div>
                   ) : (
                      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                         <div className="p-3 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                               <FileCode className="h-4 w-4 text-blue-500 shrink-0" />
                               <div className="flex flex-col overflow-hidden">
                                  <span className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{audioFile.name}</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">{(audioFile.size / 1024 / 1024).toFixed(2)} MB • {audioMetadata?.format}</span>
                               </div>
                            </div>
                            <button onClick={() => setAudioFile(null)} className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                               <Trash2 className="h-3.5 w-3.5" />
                            </button>
                         </div>
                         <div className="p-3 bg-slate-50/50">
                            <audio controls className="w-full h-8" src={URL.createObjectURL(audioFile)} />
                         </div>
                      </div>
                   )}
                   <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" className="hidden" />
                </LabSection>
             </div>
             
             {/* Run Action */}
             <div className="p-4 bg-white border-t border-slate-200">
                <button 
                   onClick={runExtraction}
                   disabled={isRunDisabled}
                   className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all shadow-md",
                      isRunDisabled ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
                   )}
                >
                   {isRunning ? <RotateCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
                   {isRunning ? "Extracting..." : "Run Audio Extraction"}
                </button>
                {isRunDisabled && !isRunning && (
                   <p className="text-[8px] font-bold text-rose-500 text-center mt-2 uppercase tracking-tighter italic">
                      {!audioFile ? "Missing audio sample" : !selectedModel ? "No model selected" : "Prompt required"}
                   </p>
                )}
             </div>
          </div>

          {/* Column 2: Editor Panels */}
          <div className="flex-1 flex flex-col bg-white border-r border-slate-200 overflow-hidden">
             <div className="bg-slate-50/80 px-4 flex items-center border-b border-slate-200 h-10 shrink-0">
                {['System Prompt', 'User Prompt', 'Output Contract', 'UI Mapping', 'XML Source'].map((tab) => (
                   <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                         "px-4 h-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
                         activeTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                      )}
                   >
                      {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900" />}
                      <span className="shrink-0">{tab}</span>
                   </button>
                ))}
             </div>

             <div className="flex-1 overflow-auto bg-white flex flex-col">
                {activeTab === 'System Prompt' && (
                   <div className="flex flex-col h-full">
                      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 shrink-0">
                         <div className="flex flex-col">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">System Prompt Configuration</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 italic uppercase tracking-tighter">Define core agent behavior and behavioral constraints</p>
                         </div>
                      </div>
                      <div className="flex-1 p-6">
                         <textarea 
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full h-full p-6 bg-slate-50/50 border border-slate-100 rounded-sm font-mono text-xs text-slate-700 leading-relaxed outline-none focus:bg-white focus:border-slate-300 transition-all shadow-inner custom-scrollbar resize-none"
                         />
                      </div>
                   </div>
                )}
                
                {activeTab === 'User Prompt' && (
                   <div className="flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-50 shrink-0">
                         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">User Template & Variables</h3>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 italic uppercase tracking-tighter">Map evidence metadata to input context</p>
                      </div>
                      <div className="flex-1 p-6">
                         <textarea 
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            className="w-full h-full p-6 bg-slate-900 border border-slate-800 rounded-sm font-mono text-xs text-emerald-400 leading-relaxed outline-none transition-all shadow-xl resize-none"
                         />
                      </div>
                   </div>
                )}

                {(activeTab === 'Output Contract' || activeTab === 'UI Mapping') && (
                   <div className="flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between shrink-0">
                         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{activeTab} JSON Schema</h3>
                         <LabBadge text="Strict Mode" type="info" />
                      </div>
                      <div className="flex-1 p-6">
                         <textarea 
                            value={activeTab === 'Output Contract' ? outputContract : uiMapping}
                            onChange={(e) => activeTab === 'Output Contract' ? setOutputContract(e.target.value) : setUiMapping(e.target.value)}
                            className="w-full h-full p-6 bg-[#0d1117] border border-slate-800 rounded-sm font-mono text-xs text-[#79c0ff] leading-relaxed outline-none transition-all shadow-xl resize-none"
                         />
                      </div>
                   </div>
                )}

                {activeTab === 'XML Source' && (
                   <div className="flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-50 shrink-0">
                         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Agent XML Definition</h3>
                      </div>
                      <div className="flex-1 bg-slate-900 p-6">
                         <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-auto h-full custom-scrollbar">
{`<?xml version="1.0" encoding="UTF-8"?>
<agent id="audio-extraction-v1" modality="audio">
    <metadata>
        <name>Audio Extraction Agent</name>
        <version>1.4.0</version>
    </metadata>
    <gateway name="${gateway}">
        <profile>${credentialProfile}</profile>
        <model name="${selectedModel || 'unselected'}" />
    </gateway>
    <prompts>
        <system_prompt ref="system_prompt.txt" />
        <user_prompt ref="user_prompt.txt" />
    </prompts>
    <output_contract format="json">
        <schema ref="schema.json" />
    </output_contract>
</agent>`}
                         </pre>
                      </div>
                   </div>
                )}
             </div>
          </div>

          {/* Column 3: Result Analysis */}
          <div className="w-[450px] bg-slate-50 flex flex-col overflow-hidden shrink-0 border-l border-slate-200">
             <div className="bg-slate-100/50 px-4 flex items-center border-b border-slate-200 h-10 shrink-0">
                {['Result Preview', 'JSON Output', 'Validation', 'Raw Response', 'Logs'].map((tab) => (
                   <button 
                      key={tab}
                      onClick={() => setResultActiveTab(tab)}
                      className={cn(
                         "px-3 h-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all relative",
                         resultActiveTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                      )}
                   >
                      {resultActiveTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900" />}
                      <span className="shrink-0">{tab}</span>
                   </button>
                ))}
             </div>

             <div className="flex-1 overflow-auto custom-scrollbar">
                {!extractionResult ? (
                   <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                         {isRunning ? <RotateCw className="h-8 w-8 text-slate-400 animate-spin" /> : <Activity className="h-8 w-8 text-slate-300" />}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">
                         {isRunning ? "Extraction in Progress" : "Ready for Extraction"}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed italic">
                         Upload an audio sample, choose an OpenRouter model, then run extraction against the current prompt and contract.
                      </p>
                   </div>
                ) : (
                   <div className="p-0">
                      {resultActiveTab === 'Result Preview' && (
                         <div className="p-6 space-y-4">
                            {extractionResult.parsed_output?.conversation_flow?.map((item: any, idx: number) => (
                               <div key={idx} className="p-4 bg-white border border-slate-200 rounded-sm shadow-sm space-y-3">
                                  <div className="flex items-center gap-2">
                                     <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded-sm tabular-nums tracking-widest">{item.start_time} — {item.end_time}</span>
                                     <span className={cn(
                                        "px-1.5 py-0.5 text-white text-[9px] font-black rounded-sm uppercase tracking-widest",
                                        idx % 2 === 0 ? "bg-blue-600" : "bg-slate-600"
                                     )}>{item.speaker}</span>
                                  </div>
                                  <div className="flex gap-3">
                                     <div className="h-7 w-7 rounded bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                                     </div>
                                     <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-800 leading-relaxed italic">"{item.utterance}"</p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                           <LabBadge text={item.tone} type={item.tone === 'Urgent' ? 'warning' : 'default'} />
                                           {item.tags?.map((tag: string) => <LabBadge key={tag} text={tag} type="info" />)}
                                        </div>
                                     </div>
                                  </div>
                                  <div className="pt-3 border-t border-slate-50 flex gap-3">
                                     <div className="h-6 w-6 rounded bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                        <Brain className="h-3.5 w-3.5 text-blue-500" />
                                     </div>
                                     <div className="flex-1">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">AI Extracted Fact</span>
                                        <p className="text-[10px] font-bold text-slate-700 leading-snug">{item.extracted_fact}</p>
                                     </div>
                                     <div className="flex flex-col items-end shrink-0">
                                        <span className="text-[8px] font-black text-emerald-600 uppercase">{(item.confidence * 100).toFixed(0)}% CONF</span>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      )}

                      {resultActiveTab === 'JSON Output' && (
                         <div className="h-full bg-[#0d1117] p-6">
                            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                               <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">Parsed Model Response</span>
                               <button 
                                  onClick={() => navigator.clipboard.writeText(JSON.stringify(extractionResult.parsed_output, null, 2))}
                                  className="px-2 py-1 text-[8px] font-black uppercase text-white/60 border border-white/10 rounded hover:bg-white/5 transition-all"
                               >Copy JSON</button>
                            </div>
                            <pre className="text-xs font-mono text-[#79c0ff] leading-relaxed">
                               {JSON.stringify(extractionResult.parsed_output, null, 2)}
                            </pre>
                         </div>
                      )}

                      {resultActiveTab === 'Validation' && (
                         <div className="p-6 space-y-4">
                            <div className={cn(
                               "p-4 border rounded-sm flex items-center gap-4",
                               extractionResult.validation?.valid ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                            )}>
                               <div className={cn(
                                  "h-8 w-8 rounded-full flex items-center justify-center",
                                  extractionResult.validation?.valid ? "bg-emerald-100" : "bg-rose-100"
                               )}>
                                  {extractionResult.validation?.valid ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-600" />}
                               </div>
                               <div>
                                  <h4 className={cn("text-[11px] font-black uppercase", extractionResult.validation?.valid ? "text-emerald-900" : "text-rose-900")}>
                                     {extractionResult.validation?.valid ? "Payload Integrity Valid" : "Validation Errors Detected"}
                                  </h4>
                                  <p className={cn("text-[9px] font-bold uppercase tracking-tighter", extractionResult.validation?.valid ? "text-emerald-600" : "text-rose-600")}>
                                     {extractionResult.validation?.valid ? "Schema checks passed" : `${extractionResult.validation?.errors?.length} issues identified`}
                                  </p>
                               </div>
                            </div>
                            <div className="space-y-2">
                               {extractionResult.validation?.errors?.map((err: string, i: number) => (
                                  <div key={i} className="px-4 py-2 bg-white border border-rose-100 rounded-sm flex items-center justify-between text-rose-700 text-[10px] font-bold uppercase tracking-tight">
                                     {err}
                                  </div>
                               ))}
                               <ValidationRow label="Type Validation" status={extractionResult.validation?.valid ? "Passed" : "Failed"} />
                               <ValidationRow label="Schema Conformance" status={extractionResult.validation?.valid ? "Passed" : "Failed"} />
                            </div>
                         </div>
                      )}

                      {resultActiveTab === 'Raw Response' && (
                         <div className="h-full bg-slate-900 p-6 overflow-auto">
                            <pre className="text-[10px] font-mono text-slate-400 leading-relaxed">
                               {JSON.stringify(extractionResult.raw_response, null, 2)}
                            </pre>
                         </div>
                      )}

                      {resultActiveTab === 'Logs' && (
                         <div className="bg-slate-900 min-h-full p-4 space-y-1">
                            <LogRow label="Run ID" value={extractionResult.run_id} />
                            <LogRow label="Gateway" value="OpenRouter" />
                            <LogRow label="Model" value={selectedModel} />
                            <LogRow label="Latency" value={`${extractionResult.latency}ms`} />
                            <LogRow label="Tokens" value={`${extractionResult.usage?.total_tokens || 0}`} />
                            <LogRow label="Est. Cost" value={`$${(extractionResult.cost || 0).toFixed(6)}`} />
                            <LogRow label="Status" value={extractionResult.validation?.valid ? "SUCCESS" : "PARTIAL"} type="success" />
                         </div>
                      )}
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ValidationRow({ label, status }: { label: string, status: string }) {
   return (
      <div className="px-4 py-2 bg-white border border-slate-100 rounded-sm flex items-center justify-between shadow-sm">
         <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{label}</span>
         <span className={cn("text-[9px] font-black uppercase tracking-widest", status === 'Passed' ? "text-emerald-600" : "text-rose-600")}>{status}</span>
      </div>
   );
}

function LogRow({ label, value, type = 'default' }: { label: string, value: string, type?: 'default' | 'success' }) {
   return (
      <div className="flex gap-4 font-mono text-[9px] leading-tight py-1 border-b border-white/5">
         <span className="text-slate-500 shrink-0 w-24 uppercase">{label}</span>
         <span className={cn(
            "font-black tracking-wider uppercase",
            type === 'success' ? 'text-emerald-400' : 'text-slate-300'
         )}>{value}</span>
      </div>
   );
}
