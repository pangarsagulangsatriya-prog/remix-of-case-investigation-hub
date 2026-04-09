import React, { useState, useCallback } from "react";
import { 
  X, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Mic as AudioIcon, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileIcon,
  Play,
  Pause,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
  duration?: string; // For audio
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (files: any[]) => void;
  initialType?: "Document" | "Image" | "Audio";
}

export function UploadModal({ isOpen, onClose, onUploadComplete, initialType }: UploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");
    const isDoc = file.type === "application/pdf" || 
                 file.type === "application/msword" || 
                 file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const sizeMB = file.size / (1024 * 1024);
    
    if (isImage && sizeMB > 20) return "Image exceeds 20MB limit";
    if (isAudio && sizeMB > 100) return "Audio exceeds 100MB limit";
    if (isDoc && sizeMB > 50) return "Document exceeds 50MB limit";
    
    if (!isImage && !isAudio && !isDoc) return "Unsupported file type";
    
    return null;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const addedFiles: UploadFile[] = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "idle",
      error: validateFile(file) || undefined
    }));

    setFiles(prev => [...prev, ...addedFiles]);
    if (addedFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(addedFiles[0].id);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) setSelectedFileId(null);
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    
    const uploadPromises = files.map(async (fileObj) => {
      if (fileObj.status === "success" || fileObj.error) return;

      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "uploading" } : f));

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 150));
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: i } : f));
      }

      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "success" } : f));
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);

    // Final callback after a short delay
    setTimeout(() => {
      const successfulFiles = files.filter(f => !f.error).map(f => ({
        id: "F-" + Math.random().toString(36).substr(2, 5),
        name: f.file.name,
        type: f.file.type.startsWith("image/") ? "Image" : f.file.type.startsWith("audio/") ? "Audio" : "Document",
        size: (f.file.size / (1024 * 1024)).toFixed(1) + " MB",
        uploadDate: new Date().toISOString().split('T')[0],
        status: "UPLOADED"
      }));
      onUploadComplete(successfulFiles);
      onClose();
      setFiles([]);
    }, 800);
  };

  if (!isOpen) return null;

  const selectedFile = files.find(f => f.id === selectedFileId);
  const totalProgress = files.length > 0 
    ? files.reduce((acc, f) => acc + f.progress, 0) / files.length 
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[640px] border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Upload Evidence Files</h2>
             <p className="text-xs text-slate-500 font-medium mt-0.5">Add supporting evidence to the investigation workspace</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: List & DropZone */}
          <div className="flex-1 flex flex-col border-r bg-slate-50/30 overflow-hidden">
             {files.length === 0 ? (
               <div 
                 className={`flex-1 flex flex-col items-center justify-center p-8 m-6 border-2 border-dashed rounded-xl transition-all
                   ${dragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-slate-200 bg-white"}
                 `}
                 onDragEnter={handleDrag}
                 onDragLeave={handleDrag}
                 onDragOver={handleDrag}
                 onDrop={onDrop}
               >
                 <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border shadow-sm text-slate-400">
                   <Upload className="h-8 w-8" />
                 </div>
                 <h3 className="text-sm font-bold text-slate-900 mb-1">Drag and drop files here</h3>
                 <p className="text-xs text-slate-500 mb-6 font-medium text-center max-w-[240px]">
                   Images (20MB), Audio (100MB), or PDF/Docs (50MB) supported
                 </p>
                 <input 
                   type="file" 
                   id="fileInput" 
                   className="hidden" 
                   multiple 
                   onChange={(e) => handleFiles(e.target.files)}
                 />
                 <Button 
                   variant="outline" 
                   className="h-9 px-6 bg-white border-primary/20 text-primary hover:bg-primary/5 font-bold text-xs"
                   onClick={() => document.getElementById('fileInput')?.click()}
                 >
                   Select Files to Upload
                 </Button>
               </div>
             ) : (
               <div className="flex-1 flex flex-col overflow-hidden">
                 <div className="flex-1 overflow-auto p-4 space-y-2">
                    {files.map((fileObj) => (
                      <div 
                        key={fileObj.id}
                        onClick={() => setSelectedFileId(fileObj.id)}
                        className={`group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer bg-white
                          ${selectedFileId === fileObj.id ? "border-primary shadow-sm ring-1 ring-primary/20" : "border-slate-100 hover:border-slate-200 hover:shadow-sm"}
                        `}
                      >
                         <div className="h-10 w-10 flex-shrink-0 bg-slate-50 border rounded-md overflow-hidden flex items-center justify-center">
                            {fileObj.file.type.startsWith("image/") ? (
                               <img src={fileObj.previewUrl} className="h-full w-full object-cover" />
                            ) : fileObj.file.type.startsWith("audio/") ? (
                               <AudioIcon className="h-5 w-5 text-amber-500" />
                            ) : (
                               <FileText className="h-5 w-5 text-primary" />
                            )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                               <span className="text-xs font-bold text-slate-800 truncate pr-2">{fileObj.file.name}</span>
                               <span className="text-[10px] font-bold text-slate-400">{(fileObj.file.size / 1024).toFixed(0)} KB</span>
                            </div>
                            {fileObj.error ? (
                               <div className="flex items-center gap-1.5 text-rose-600">
                                  <AlertCircle className="h-3 w-3" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">{fileObj.error}</span>
                               </div>
                            ) : fileObj.status === "uploading" ? (
                               <div className="space-y-1">
                                  <Progress value={fileObj.progress} className="h-1" />
                                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">Uploading {fileObj.progress}%</span>
                               </div>
                            ) : fileObj.status === "success" ? (
                               <div className="flex items-center gap-1.5 text-emerald-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Ready to submit</span>
                               </div>
                            ) : (
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending upload...</span>
                            )}
                         </div>
                         <button 
                           onClick={(e) => { e.stopPropagation(); removeFile(fileObj.id); }}
                           className="p-1.5 hover:bg-rose-50 rounded-md opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-rose-500"
                         >
                            <Trash2 className="h-4 w-4" />
                         </button>
                      </div>
                    ))}
                 </div>
                 <div className="p-4 border-t bg-white">
                    <Button 
                      variant="ghost" 
                      className="w-full border-2 border-dashed border-slate-200 h-10 text-xs font-bold text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                      onClick={() => document.getElementById('fileInput')?.click()}
                    >
                      + Add More Files
                    </Button>
                 </div>
               </div>
             )}
          </div>

          {/* Right: Preview Panel */}
          <div className="w-[320px] flex flex-col bg-white overflow-hidden">
             {selectedFile ? (
               <div className="flex-1 flex flex-col overflow-auto custom-scrollbar">
                  <div className="bg-slate-50 h-10 flex items-center px-4 border-b shrink-0">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metadata Preview</span>
                  </div>
                  
                  <div className="p-6 space-y-6 flex-1">
                     <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden border shadow-inner flex items-center justify-center group relative">
                        {selectedFile.file.type.startsWith("image/") ? (
                           <img src={selectedFile.previewUrl} className="h-full w-full object-contain" />
                        ) : selectedFile.file.type.startsWith("audio/") ? (
                           <div className="flex flex-col items-center gap-4 text-white">
                              <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                                 <AudioIcon className="h-8 w-8 text-amber-400" />
                              </div>
                              <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/10 gap-2">
                                 <Play className="h-3 w-3 fill-white" />
                                 <span className="text-2xs font-bold tracking-widest">00:00 / --:--</span>
                              </div>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center gap-3 text-white">
                              <FileIcon className="h-16 w-16 text-primary" />
                              <span className="text-2xs font-bold uppercase tracking-widest opacity-60">PDF Document</span>
                           </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <div>
                           <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] block mb-1">File Identity</span>
                           <h4 className="text-sm font-bold text-slate-900 leading-tight">{selectedFile.file.name}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Size</span>
                              <span className="text-xs font-bold text-slate-700">{(selectedFile.file.size / 1024).toFixed(0)} KB</span>
                           </div>
                           <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Type</span>
                              <span className="text-xs font-bold text-slate-700 truncate">{selectedFile.file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                           </div>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-xl text-white">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Initial Analysis Hub</span>
                           </div>
                           <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                              "This file will be automatically routed to the extraction engine for OCR and transcription upon submission."
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-300">
                  <FileIcon className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50">No File Selected</p>
               </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50/80 flex items-center justify-between">
           <div className="flex-1 pr-6">
              {isUploading && (
                <div className="flex items-center gap-3">
                   <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden border">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${totalProgress}%` }} />
                   </div>
                   <span className="text-[10px] font-bold text-primary tabular-nums">{totalProgress.toFixed(0)}%</span>
                </div>
              )}
           </div>
           <div className="flex items-center gap-3 shrink-0">
             <Button 
               variant="ghost" 
               className="h-10 text-xs font-bold text-slate-500 hover:text-slate-800"
               onClick={onClose}
               disabled={isUploading}
             >
               Cancel Workflow
             </Button>
             <Button 
               className="h-10 px-8 text-xs font-bold bg-primary hover:bg-green-800 shadow-md transition-all active:scale-95 gap-2"
               onClick={simulateUpload}
               disabled={isUploading || files.length === 0 || files.some(f => f.error)}
             >
               {isUploading ? (
                 <>
                   <Loader2 className="h-3.5 w-3.5 animate-spin" /> Authorizing...
                 </>
               ) : (
                 <>
                   Initialize Upload ({files.length} Files)
                 </>
               )}
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
