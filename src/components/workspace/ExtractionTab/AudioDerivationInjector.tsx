import React, { useState, useEffect } from "react";
import { 
  X, Code2, Play, CheckCircle2, List, Trash2, 
  RotateCw, Copy, AlertTriangle, Info, FileJson,
  Eye, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./Modals";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

function StatusChip({ text, type }: { text: string, type: 'success' | 'warning' | 'default' }) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
      type === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
      type === 'warning' ? "bg-rose-50 text-rose-600 border-rose-100" :
      "bg-slate-100 text-slate-500 border-slate-200"
    )}>
      {text}
    </span>
  );
}

interface AudioDerivationInjectorProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  evidenceId: string;
  evidenceName: string;
  onApply: () => void;
}

export function AudioDerivationInjector({
  isOpen,
  onClose,
  caseId,
  evidenceId,
  evidenceName,
  onApply
}: AudioDerivationInjectorProps) {
  const [activeTab, setActiveTab] = useState<"Paste JSON" | "Mapping Preview" | "Validation" | "Saved Outputs">("Paste JSON");
  const [jsonInput, setJsonInput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedOutputs, setSavedOutputs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sampleJson = {
    "investigation_metadata": {
      "total_speakers_detected": 2,
      "speaker_identities": [
        {
          "system_id": "Speaker_0",
          "resolved_name_or_role": "Investigator"
        },
        {
          "system_id": "Speaker_1",
          "resolved_name_or_role": "Aris (DMS Control Room Operator)"
        }
      ]
    },
    "dialogue_map": [
      {
        "start_dialog": "00:00:19",
        "end_dialog": "00:01:22",
        "speaker_label": "Aris",
        "theme_tag": "Procedure",
        "interaction_type": "Statement",
        "verbatim_text": "Eh, untuk setiap kegiatan kami...",
        "paralinguistics": ["hesitation", "fillers"],
        "extracted_action_or_fact": "Daily control room procedures include shift data recap, DMS readiness checks, unit connectivity monitoring, and fatigue alert tracking."
      }
    ]
  };

  useEffect(() => {
    if (isOpen) {
      fetchSavedOutputs();
    }
  }, [isOpen, caseId, evidenceId]);

  const fetchSavedOutputs = async () => {
    try {
      const { data, error } = await supabase
        .from('evidence_audio_derivation_outputs')
        .select('*')
        .eq('case_id', caseId)
        .eq('evidence_id', evidenceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedOutputs(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormat = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
      toast.success("JSON Formatted");
    } catch (e) {
      toast.error("Invalid JSON syntax");
    }
  };

  const validateJson = (input: string) => {
    const errors: string[] = [];
    try {
      const obj = JSON.parse(input);
      if (!obj.investigation_metadata) errors.push("Missing investigation_metadata");
      else {
        if (typeof obj.investigation_metadata.total_speakers_detected !== 'number') errors.push("total_speakers_detected must be a number");
        if (!Array.isArray(obj.investigation_metadata.speaker_identities)) errors.push("speaker_identities must be an array");
      }
      if (!obj.dialogue_map) errors.push("Missing dialogue_map");
      else if (!Array.isArray(obj.dialogue_map)) errors.push("dialogue_map must be an array");
      else {
        obj.dialogue_map.forEach((item: any, i: number) => {
          if (!item.start_dialog && !item.start_time) errors.push(`Item ${i}: Missing start_dialog or start_time`);
          if (!item.end_dialog && !item.end_time) errors.push(`Item ${i}: Missing end_dialog or end_time`);
          if (!item.speaker_label) errors.push(`Item ${i}: Missing speaker_label`);
          if (!item.theme_tag) errors.push(`Item ${i}: Missing theme_tag`);
          if (!item.interaction_type) errors.push(`Item ${i}: Missing interaction_type`);
          if (!item.verbatim_text && !item.text) errors.push(`Item ${i}: Missing verbatim_text or text`);
        });
      }
    } catch (e) {
      errors.push("Invalid JSON syntax: " + (e as Error).message);
    }
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  const handleSave = async (apply = true) => {
    if (!validateJson(jsonInput)) {
      setActiveTab("Validation");
      return;
    }

    setIsLoading(true);
    try {
      const obj = JSON.parse(jsonInput);
      
      // Deactivate existing
      await supabase
        .from('evidence_audio_derivation_outputs')
        .update({ is_active: false })
        .eq('case_id', caseId)
        .eq('evidence_id', evidenceId);

      // 2. ALSO update the evidence_files metadata as a more reliable storage fallback
      // First get current metadata to preserve other fields
      const { data: fileData } = await supabase
        .from('evidence_files')
        .select('metadata')
        .eq('id', evidenceId)
        .single();
      
      const updatedMetadata = {
        ...(fileData?.metadata || {}),
        audio_derivation: {
          investigation_metadata: obj.investigation_metadata,
          dialogue_map: obj.dialogue_map,
          output_source: 'demo_json_injector',
          is_demo_override: true,
          updated_at: new Date().toISOString()
        }
      };

      await supabase
        .from('evidence_files')
        .update({ metadata: updatedMetadata })
        .eq('id', evidenceId);

      // Invalidate query to trigger UI update
      // (Assuming we have access to queryClient or we can use the onApply callback)
      
      // 3. Attempt specialized table insert (may fail if table missing, but we proceed)
      try {
        await supabase
          .from('evidence_audio_derivation_outputs')
          .insert({
            case_id: caseId,
            evidence_id: evidenceId,
            evidence_name: evidenceName,
            investigation_metadata: obj.investigation_metadata,
            dialogue_map: obj.dialogue_map,
            raw_json: obj,
            is_active: apply,
            is_demo_override: true
          });
      } catch (e) {
        console.warn("Specialized derivation table not found, using metadata fallback only.");
      }

      toast.success(apply ? "Audio derivation saved and applied." : "Audio derivation saved to history.");
      if (apply) {
        onApply(); // This callback should handle refetching if needed
        onClose();
      } else {
        fetchSavedOutputs();
      }
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySaved = async (id: string) => {
    setIsLoading(true);
    try {
      await supabase
        .from('evidence_audio_derivation_outputs')
        .update({ is_active: false })
        .eq('case_id', caseId)
        .eq('evidence_id', evidenceId);

      await supabase
        .from('evidence_audio_derivation_outputs')
        .update({ is_active: true })
        .eq('id', id);

      toast.success("Output applied.");
      onApply();
      fetchSavedOutputs();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      await supabase
        .from('evidence_audio_derivation_outputs')
        .delete()
        .eq('id', id);
      fetchSavedOutputs();
      toast.success("Output deleted.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Audio Derivation JSON Injector" 
      showCloseButton
    >
      <div className="bg-slate-50 border-b px-6 py-3 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Case ID</span>
            <span className="text-[10px] font-bold text-slate-900">{caseId}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Evidence</span>
            <span className="text-[10px] font-bold text-slate-900 truncate max-w-[150px]">{evidenceName}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</span>
           <span className="text-[10px] font-black text-blue-600 uppercase">Demo Active</span>
        </div>
      </div>

      <div className="flex border-b h-10 bg-white shrink-0">
        {(["Paste JSON", "Mapping Preview", "Validation", "Saved Outputs"] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 text-[9px] font-black uppercase tracking-widest transition-all relative",
              activeTab === tab ? "text-slate-900 bg-slate-50/50" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="h-[450px] overflow-hidden flex flex-col bg-white">
        {activeTab === "Paste JSON" && (
          <div className="flex-1 flex flex-col p-4 space-y-4">
            <div className="flex-1 border rounded-sm overflow-hidden flex flex-col bg-slate-900 shadow-inner">
               <textarea 
                  className="flex-1 p-4 font-mono text-[10px] text-emerald-400 bg-transparent outline-none resize-none custom-scrollbar"
                  placeholder="Paste your Audio Derivation JSON here..."
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setIsValid(null);
                  }}
               />
            </div>
            <div className="flex items-center justify-between gap-2">
               <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setJsonInput(JSON.stringify(sampleJson, null, 2))} className="h-8 text-[9px] font-black uppercase tracking-widest">Sample</Button>
                  <Button variant="outline" size="sm" onClick={handleFormat} className="h-8 text-[9px] font-black uppercase tracking-widest">Format</Button>
                  <Button variant="outline" size="sm" onClick={() => validateJson(jsonInput)} className="h-8 text-[9px] font-black uppercase tracking-widest">Validate</Button>
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setJsonInput("")} className="h-8 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600">Clear</Button>
                  <Button onClick={() => handleSave(true)} disabled={isLoading} className="h-8 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-4">
                    {isLoading ? <RotateCw className="h-3 w-3 animate-spin mr-2" /> : <Play className="h-3 w-3 mr-2" />}
                    Save & Apply
                  </Button>
               </div>
            </div>
          </div>
        )}

        {activeTab === "Validation" && (
          <div className="flex-1 p-6 overflow-auto custom-scrollbar">
            {isValid === null ? (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <FileJson className="h-10 w-10 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Input not yet validated</p>
               </div>
            ) : isValid ? (
               <div className="h-full flex flex-col items-center justify-center text-center text-emerald-600">
                  <CheckCircle className="h-12 w-12 mb-4" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-1">JSON Schema Valid</h4>
                  <p className="text-[10px] font-bold uppercase tracking-tighter opacity-80">Output matches audio_derivation_v1 contract</p>
               </div>
            ) : (
               <div className="space-y-4">
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-sm flex items-center gap-3">
                     <AlertTriangle className="h-5 w-5 text-rose-600" />
                     <span className="text-[10px] font-black text-rose-900 uppercase">Schema Validation Failed</span>
                  </div>
                  <div className="space-y-1">
                     {validationErrors.map((err, i) => (
                        <div key={i} className="p-3 bg-white border border-rose-100 rounded-sm text-[10px] font-bold text-rose-700 uppercase tracking-tight flex items-center gap-2">
                           <div className="h-1 w-1 bg-rose-300 rounded-full shrink-0" />
                           {err}
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        )}

        {activeTab === "Mapping Preview" && (
           <div className="flex-1 p-4 overflow-auto custom-scrollbar bg-slate-50">
              <div className="space-y-3">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">UI Mapping Preview (Sidebar Style)</p>
                 {jsonInput ? (
                    (() => {
                       try {
                          const obj = JSON.parse(jsonInput);
                          return obj.dialogue_map?.map((item: any, i: number) => (
                             <div key={i} className="p-4 bg-white border border-slate-200 rounded-sm shadow-sm space-y-3">
                                <div className="flex items-center gap-2">
                                   <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded-sm tracking-widest tabular-nums">{item.start_dialog}</span>
                                   <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-sm uppercase tracking-widest">{item.speaker_label}</span>
                                   <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black rounded-sm uppercase tracking-widest ml-auto">{item.theme_tag}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed italic">"{item.verbatim_text}"</p>
                                <div className="pt-3 border-t border-slate-50">
                                   <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Extracted Fact</span>
                                      <p className="text-[10px] font-bold text-slate-700 leading-snug">{item.extracted_action_or_fact}</p>
                                   </div>
                                </div>
                             </div>
                          ));
                       } catch (e) {
                          return <div className="p-10 text-center text-rose-500 font-bold">Invalid JSON</div>;
                       }
                    })()
                 ) : (
                    <div className="p-20 text-center opacity-30 italic text-[10px] uppercase font-black tracking-widest">No preview data</div>
                 )}
              </div>
           </div>
        )}

        {activeTab === "Saved Outputs" && (
           <div className="flex-1 overflow-auto custom-scrollbar divide-y">
              {savedOutputs.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                    <List className="h-8 w-8 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No injection history</span>
                 </div>
              ) : (
                 savedOutputs.map(out => (
                    <div key={out.id} className={cn(
                       "p-4 flex items-center justify-between hover:bg-slate-50 transition-colors",
                       out.is_active && "bg-blue-50/50"
                    )}>
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-slate-900 uppercase">{new Date(out.created_at).toLocaleString()}</span>
                             {out.is_active && <StatusChip text="ACTIVE" type="success" />}
                          </div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Source: {out.output_source} • v1.0</span>
                       </div>
                       <div className="flex gap-1">
                          <button onClick={() => { setJsonInput(JSON.stringify(out.raw_json, null, 2)); setActiveTab("Paste JSON"); }} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900" title="Copy to Editor"><Copy className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleApplySaved(out.id)} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-emerald-600" title="Apply"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDeleteSaved(out.id)} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-rose-500" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                       </div>
                    </div>
                 ))
              )}
           </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Event: AUDIO_DERIVATION_DEMO_INJECTED</span>
         <Button variant="ghost" onClick={onClose} className="h-9 px-6 text-[10px] font-black uppercase tracking-widest">Close Injector</Button>
      </div>
    </Modal>
  );
}
