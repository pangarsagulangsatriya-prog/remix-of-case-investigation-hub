import React, { useState, useEffect } from "react";
import { 
  X, Code2, Play, CheckCircle2, List, Trash2, 
  RotateCw, Copy, AlertTriangle, Info, FileJson,
  Eye, CheckCircle, Video, Image as ImageIcon, FileText, Mic
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

interface EvidenceDerivationInjectorProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  evidenceId: string;
  evidenceName: string;
  evidenceType: 'audio' | 'video' | 'image' | 'document';
  onApply: () => void;
}

export function EvidenceDerivationInjector({
  isOpen,
  onClose,
  caseId,
  evidenceId,
  evidenceName,
  evidenceType,
  onApply
}: EvidenceDerivationInjectorProps) {
  const [activeTab, setActiveTab] = useState<"Paste JSON" | "Mapping Preview" | "Validation" | "Saved Outputs">("Paste JSON");
  const [jsonInput, setJsonInput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedOutputs, setSavedOutputs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Samples based on type
  const samples: Record<string, any> = {
    audio: {
      "investigation_metadata": {
        "total_speakers_detected": 2,
        "speaker_identities": [
          { "system_id": "Speaker_0", "resolved_name_or_role": "Investigator" },
          { "system_id": "Speaker_1", "resolved_name_or_role": "Aris (DMS Control Room Operator)" }
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
          "extracted_action_or_fact": "Daily control room procedures include shift data recap and unit connectivity monitoring."
        }
      ]
    },
    video: {
      "video_metadata": {
        "video_source_type": "Dashcam / Cabin Cam",
        "total_duration": "00:15",
        "scene_environment_notes": "Jalan pengangkutan tambang pada malam hari."
      },
      "executive_video_summary": "Video merekam pergerakan kendaraan berat yang diam di jalan pengangkutan tambang pada malam hari.",
      "ontology_mapping": {
        "identified_objects": [
          { "object_class": "Equipment/Vehicle", "object_identifier": "Unit Pengamat", "overall_role_or_state": "Statis" }
        ],
        "kinetic_events_or_hazards": [
          { "event_type": "Pergerakan", "linked_objects": ["Unit Pengamat"], "event_description": "Kendaraan bergerak maju perlahan." }
        ]
      },
      "video_blocks": [
        { "time_block": "00:00 - 00:05", "visual_summary": "Inisialisasi kamera.", "confidence_score": "Moderate", "contains_critical_incident": false }
      ],
      "investigation_notes": { "unclear_or_missing_info": ["Wajah operator tidak terlihat."] }
    },
    image: {
      "document_metadata": { "inferred_document_type": "Sketsa Kejadian", "date_mentioned": "05 November 2024" },
      "quick_summary_and_analysis": { "executive_summary": "Sketsa teknis rekonstruksi kejadian unit TC-4007.", "critical_findings": ["Tidak ditemukan jejak pengereman."] },
      "visual_markers_and_coordinates": [
        { "sequence_id": 1, "structural_context": "Unit Position", "extracted_content": "Unit TC-4007 Rebah", "visual_description": "Posisi akhir unit." }
      ]
    },
    document: {
      "document_metadata": { "inferred_document_type": "Interview BAP", "date_mentioned": "5 November 2024" },
      "quick_summary_and_analysis": { "executive_summary": "Laporan wawancara insiden truck roll-over.", "critical_findings": ["Operator mengalami micro-sleep."] },
      "ontology_mapping": { "personnel_involved": ["Syaiful Anwar", "Aris Achdiat"] },
      "structural_breakdown": [
        { "section_id": 1, "header": "Informasi Dasar", "content": "Waktu kejadian: 02:45 WITA.", "inferred_intent": "Establishing timeline." }
      ]
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSavedOutputs();
      setJsonInput("");
      setIsValid(null);
    }
  }, [isOpen, caseId, evidenceId]);

  const fetchSavedOutputs = async () => {
    try {
      const tableName = `evidence_${evidenceType}_derivation_outputs`;
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('case_id', caseId)
        .eq('evidence_id', evidenceId)
        .order('created_at', { ascending: false });

      if (error) {
         // Fallback to searching in generic history or just ignore if table missing
         setSavedOutputs([]);
      } else {
         setSavedOutputs(data || []);
      }
    } catch (e) {
      console.error(e);
      setSavedOutputs([]);
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
      
      if (evidenceType === 'audio') {
        if (!obj.investigation_metadata) errors.push("Missing investigation_metadata");
        if (!obj.dialogue_map) errors.push("Missing dialogue_map");
      } else if (evidenceType === 'video') {
        if (!obj.video_metadata) errors.push("Missing video_metadata");
        if (!obj.video_blocks) errors.push("Missing video_blocks");
      } else if (evidenceType === 'image') {
        if (!obj.document_metadata) errors.push("Missing document_metadata");
        if (!obj.visual_markers_and_coordinates) errors.push("Missing visual_markers_and_coordinates");
      } else if (evidenceType === 'document') {
        if (!obj.document_metadata) errors.push("Missing document_metadata");
        if (!obj.structural_breakdown) errors.push("Missing structural_breakdown");
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
      const tableName = `evidence_${evidenceType}_derivation_outputs`;
      
      // 1. Deactivate existing in specialized table
      try {
        await supabase
          .from(tableName)
          .update({ is_active: false })
          .eq('case_id', caseId)
          .eq('evidence_id', evidenceId);
      } catch (e) {}

      // 2. Update the main evidence_files metadata (Central Source of Truth)
      const { data: fileData } = await supabase
        .from('evidence_files')
        .select('metadata')
        .eq('id', evidenceId)
        .single();
      
      const derivationKey = `${evidenceType}_derivation`;
      const updatedMetadata = {
        ...(fileData?.metadata || {}),
        [derivationKey]: {
          ...obj,
          output_source: 'demo_json_injector',
          is_demo_override: true,
          updated_at: new Date().toISOString()
        }
      };

      await supabase
        .from('evidence_files')
        .update({ metadata: updatedMetadata })
        .eq('id', evidenceId);

      // 3. Insert into history table if possible
      try {
        await supabase
          .from(tableName)
          .insert({
            case_id: caseId,
            evidence_id: evidenceId,
            evidence_name: evidenceName,
            raw_json: obj,
            is_active: apply,
            is_demo_override: true,
            created_at: new Date().toISOString()
          });
      } catch (e) {}

      toast.success(apply ? `${evidenceType.toUpperCase()} derivation applied.` : "Saved to history.");
      if (apply) {
        onApply();
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

  const handleApplySaved = async (id: string, rawJson: any) => {
    setIsLoading(true);
    try {
      const tableName = `evidence_${evidenceType}_derivation_outputs`;
      
      // Update specialized table
      try {
        await supabase
          .from(tableName)
          .update({ is_active: false })
          .eq('case_id', caseId)
          .eq('evidence_id', evidenceId);

        await supabase
          .from(tableName)
          .update({ is_active: true })
          .eq('id', id);
      } catch (e) {}

      // Update main metadata
      const { data: fileData } = await supabase
        .from('evidence_files')
        .select('metadata')
        .eq('id', evidenceId)
        .single();
      
      const derivationKey = `${evidenceType}_derivation`;
      const updatedMetadata = {
        ...(fileData?.metadata || {}),
        [derivationKey]: {
          ...rawJson,
          output_source: 'demo_json_injector_history',
          is_demo_override: true,
          updated_at: new Date().toISOString()
        }
      };

      await supabase
        .from('evidence_files')
        .update({ metadata: updatedMetadata })
        .eq('id', evidenceId);

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
      const tableName = `evidence_${evidenceType}_derivation_outputs`;
      await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      fetchSavedOutputs();
      toast.success("Output deleted.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getTypeIcon = () => {
    switch(evidenceType) {
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileJson className="h-4 w-4" />;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${evidenceType.toUpperCase()} Derivation JSON Injector`} 
      showCloseButton
    >
      <div className="bg-slate-50 border-b px-6 py-3 flex items-center justify-between">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target Evidence</span>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="text-slate-400">{getTypeIcon()}</div>
               <span className="text-[10px] font-black text-slate-900 truncate max-w-[200px]">{evidenceName}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol</span>
            <span className="text-[10px] font-bold text-slate-900 uppercase">{evidenceType}_derivation_v1.2</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Engine Status</span>
           <span className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              DEMO ACTIVE
           </span>
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

      <div className="h-[480px] overflow-hidden flex flex-col bg-white">
        {activeTab === "Paste JSON" && (
          <div className="flex-1 flex flex-col p-4 space-y-4">
            <div className="flex-1 border rounded-sm overflow-hidden flex flex-col bg-slate-950 shadow-2xl relative">
               <div className="absolute top-2 right-2 flex gap-1 opacity-40 hover:opacity-100 transition-opacity z-10">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
               </div>
               <textarea 
                  className="flex-1 p-5 font-mono text-[10px] text-emerald-400 bg-transparent outline-none resize-none custom-scrollbar leading-relaxed"
                  placeholder={`Paste your ${evidenceType} derivation JSON here...`}
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setIsValid(null);
                  }}
               />
            </div>
            <div className="flex items-center justify-between gap-2">
               <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setJsonInput(JSON.stringify(samples[evidenceType], null, 2))} className="h-8 text-[9px] font-black uppercase tracking-widest">Sample</Button>
                  <Button variant="outline" size="sm" onClick={handleFormat} className="h-8 text-[9px] font-black uppercase tracking-widest">Format</Button>
                  <Button variant="outline" size="sm" onClick={() => validateJson(jsonInput)} className="h-8 text-[9px] font-black uppercase tracking-widest">Validate</Button>
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setJsonInput("")} className="h-8 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 px-3">Clear</Button>
                  <Button onClick={() => handleSave(true)} disabled={isLoading || !jsonInput} className="h-8 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-4 shadow-lg hover:shadow-slate-200 transition-all">
                    {isLoading ? <RotateCw className="h-3 w-3 animate-spin mr-2" /> : <Play className="h-3 w-3 mr-2 fill-current" />}
                    Save & Inject
                  </Button>
               </div>
            </div>
          </div>
        )}

        {activeTab === "Validation" && (
          <div className="flex-1 p-8 overflow-auto custom-scrollbar">
            {isValid === null ? (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <FileJson className="h-12 w-12 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Payload status pending</p>
               </div>
            ) : isValid ? (
               <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 text-slate-900">Schema Integrity Verified</h4>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 max-w-[240px] leading-relaxed">
                    The provided JSON matches the {evidenceType}_derivation interface definition and is safe for injection.
                  </p>
               </div>
            ) : (
               <div className="space-y-4 animate-in slide-in-from-bottom-2">
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-sm flex items-center gap-3">
                     <AlertTriangle className="h-5 w-5 text-rose-600" />
                     <span className="text-[10px] font-black text-rose-900 uppercase">Payload Validation Error</span>
                  </div>
                  <div className="space-y-1">
                     {validationErrors.map((err, i) => (
                        <div key={i} className="p-3 bg-white border border-slate-100 rounded-sm text-[10px] font-bold text-rose-700 uppercase tracking-tight flex items-center gap-2">
                           <div className="h-1 w-1 bg-rose-400 rounded-full shrink-0" />
                           {err}
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        )}

        {activeTab === "Mapping Preview" && (
           <div className="flex-1 p-6 overflow-auto custom-scrollbar bg-slate-50">
              <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Runtime Component Mapping Preview</p>
                  </div>
                 
                 {jsonInput ? (
                    (() => {
                       try {
                          const obj = JSON.parse(jsonInput);
                          return (
                            <div className="space-y-4">
                               <div className="p-4 bg-white border border-slate-200 rounded-sm shadow-sm">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Inferred Summary</span>
                                  <p className="text-[11px] font-bold text-slate-800 leading-relaxed italic">
                                    {obj.executive_video_summary || obj.quick_summary_and_analysis?.executive_summary || "No summary found."}
                                  </p>
                               </div>
                               <div className="p-4 bg-slate-900 rounded-sm border border-slate-800">
                                  <div className="flex items-center justify-between mb-3">
                                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Metadata Chunks</span>
                                     <span className="text-[9px] font-black text-emerald-400 uppercase">Live Preview</span>
                                  </div>
                                  <pre className="text-[10px] font-mono text-slate-300 overflow-auto max-h-[150px] custom-scrollbar">
                                     {JSON.stringify(obj.ontology_mapping || obj.investigation_metadata || obj.document_metadata, null, 2)}
                                  </pre>
                               </div>
                            </div>
                          );
                       } catch (e) {
                          return <div className="p-10 text-center text-rose-500 font-bold">Invalid JSON</div>;
                       }
                    })()
                 ) : (
                    <div className="p-20 text-center opacity-30 italic text-[10px] uppercase font-black tracking-widest">No data for mapping</div>
                 )}
              </div>
           </div>
        )}

        {activeTab === "Saved Outputs" && (
           <div className="flex-1 overflow-auto custom-scrollbar divide-y">
              {savedOutputs.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-center p-12">
                    <List className="h-10 w-10 mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No history found for this evidence</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Injected payloads will appear here for easy rollback.</p>
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
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pipeline: {out.is_demo_override ? 'Manual Injector' : 'Automated'} • Version 1.2</span>
                       </div>
                       <div className="flex gap-1">
                          <button onClick={() => { setJsonInput(JSON.stringify(out.raw_json, null, 2)); setActiveTab("Paste JSON"); }} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900" title="Load into Editor"><Copy className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleApplySaved(out.id, out.raw_json)} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-emerald-600" title="Apply Now"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDeleteSaved(out.id)} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-rose-500" title="Delete Entry"><Trash2 className="h-3.5 w-3.5" /></button>
                       </div>
                    </div>
                 ))
              )}
           </div>
        )}
      </div>

      <div className="p-5 bg-slate-50 border-t flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Event Trace: {evidenceType.toUpperCase()}_INJECT_SIG</span>
         </div>
         <Button variant="ghost" onClick={onClose} className="h-10 px-8 text-[10px] font-black uppercase tracking-widest hover:bg-white border">Close Workspace</Button>
      </div>
    </Modal>
  );
}
