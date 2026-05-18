import React, { useState, useRef, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { 
  Search, Plus, FolderPlus, FileUp, FolderUp, ChevronRight, 
  Folder, Folders, MoreVertical, Pencil, Trash2, Loader2, CheckCircle2, 
  Box, Upload, ChevronLeft, ChevronRight as ChevronRightIcon, 
  Cpu, ChevronsDown, ChevronsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FileRow, getFileIcon } from "../ExtractionTab/FileRow";
import { AdaptiveSourcePreview } from "../ExtractionTab/PreviewComponents";
import { 
  ImageExtractionConsole, 
  DocumentExtractionConsole, 
  AudioExtractionConsole, 
  VideoAnalysisPanel 
} from "../ExtractionTab/ConsoleComponents";
import { 
  Modal, 
  DeleteConfirmationModal, 
  DeleteFolderModal 
} from "../ExtractionTab/Modals";
import { 
  useEvidence, 
  useDeleteFile, 
  useUploadEvidence, 
  useRenameFolder, 
  useRenameFile, 
  useMoveFile, 
  useCreateFolder, 
  useDeleteBatch,
  useRerunExtraction
} from "@/hooks/useEvidence";
import { UploadModal, CompletedGroup } from "../../UploadModal";
import { toast } from "sonner";
import { EvidenceDerivationInjector } from "../ExtractionTab/EvidenceDerivationInjector";
import { useSearchParams } from "react-router-dom";

export default function ExtractionTab() {
  const { caseId } = useParams<{ caseId: string }>();
  const queryClient = useQueryClient();
  const { data: evidence, isLoading } = useEvidence(caseId!);
  const files = evidence?.files || [];
  const batches = evidence?.batches || [];

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [expandedBatches, setExpandedBatches] = useState<string[]>(["DOKUMEN", "GAMBAR", "AUDIO"]);
  const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);

  // Auto-expand first folder on load
  useEffect(() => {
    if (!isLoading && batches.length > 0 && !hasInitializedExpansion) {
      const firstFolder = batches.find(b => b.type === "Folder");
      if (firstFolder) {
        setExpandedBatches(prev => Array.from(new Set([...prev, firstFolder.id])));
      }
      setHasInitializedExpansion(true);
    }
  }, [isLoading, batches, hasInitializedExpansion]);

  const [deleteFolderTarget, setDeleteFolderTarget] = useState<any>(null);
  const [fileToRerun, setFileToRerun] = useState<any>(null);
  
  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
  const [isRerunModalOpen, setIsRerunModalOpen] = useState(false);
  
  // Form State
  const [newFolderName, setNewFolderName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [fileRenameValue, setFileRenameValue] = useState("");
  const [folderToRename, setFolderToRename] = useState<any>(null);
  const [fileToRename, setFileToRename] = useState<any>(null);
  const [isDerivationInjectorOpen, setIsDerivationInjectorOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Media State
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mutations
  const deleteFileMutation = useDeleteFile();
  const deleteBatchMutation = useDeleteBatch();
  const createFolderMutation = useCreateFolder();
  const renameFolderMutation = useRenameFolder();
  const renameFileMutation = useRenameFile();
  const moveFileMutation = useMoveFile();
  const uploadEvidenceMutation = useUploadEvidence();
  const rerunExtractionMutation = useRerunExtraction();

  // Injector Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        // Here we should ideally check user role, but for prototype we allow in dev/staging env
        setIsDerivationInjectorOpen(true);
      }
    };

    if (searchParams.get('audioDerivationInjector') === 'true') {
      setIsDerivationInjectorOpen(true);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchParams]);

  // Derived
  const filteredFiles = useMemo(() => {
    if (!files || !Array.isArray(files)) return [];
    return files.filter((f: any) => 
      f && f.name && f.type && (
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [files, searchQuery]);

  // Handlers
  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const expandAll = () => {
    const allFolderIds = batches.filter(b => b.type === "Folder").map(b => b.id);
    const virtualSections = ["DOKUMEN", "GAMBAR", "AUDIO"];
    setExpandedBatches(Array.from(new Set([...allFolderIds, ...virtualSections])));
  };

  const collapseAll = () => {
    setExpandedBatches([]);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolderMutation.mutateAsync({ caseId: caseId!, name: newFolderName });
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
      toast.success("Folder created successfully");
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    try {
      await deleteFileMutation.mutateAsync({ id: selectedFile.id, url: selectedFile.url });
      setSelectedFile(null);
      setIsDeleteModalOpen(false);
      toast.success("Evidence object purged from repository.");
    } catch (error) {
      toast.error("Failed to delete evidence");
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    try {
      if (deleteFolderTarget.isVirtual) {
        // Delete all files in this virtual section
        const filesToDelete = deleteFolderTarget.files || [];
        for (const file of filesToDelete) {
          await deleteFileMutation.mutateAsync({ id: file.id, url: file.url });
        }
        toast.success(`Section cleared: ${filesToDelete.length} objects removed.`);
      } else {
        await deleteBatchMutation.mutateAsync({ id: deleteFolderTarget.id });
        toast.success("Folder and contents deleted");
      }
      setDeleteFolderTarget(null);
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const handleRenameFolder = async () => {
    if (!folderToRename || !renameValue.trim()) return;
    try {
      if (folderToRename.isVirtual) {
        toast.success(`Section label updated to: ${renameValue}`);
      } else {
        await renameFolderMutation.mutateAsync({ id: folderToRename.id, name: renameValue });
        toast.success("Folder renamed");
      }
      setIsRenameFolderModalOpen(false);
    } catch (error) {
      toast.error("Failed to rename folder");
    }
  };

  const handleRenameFile = async () => {
    if (!fileToRename || !fileRenameValue.trim()) return;
    try {
      await renameFileMutation.mutateAsync({ fileId: fileToRename.id, name: fileRenameValue });
      setIsRenameFileModalOpen(false);
      toast.success("File renamed");
    } catch (error) {
      toast.error("Failed to rename file");
    }
  };

  const handleUploadEvidence = async (groups: CompletedGroup[]) => {
    try {
      await uploadEvidenceMutation.mutateAsync({ caseId: caseId!, groups });
    } catch (error) {
      console.error(error);
      toast.error("Persist Failure: One or more evidence objects failed to sync.");
    }
  };

  const handleRerunExtraction = async () => {
    if (!fileToRerun) return;
    try {
      setIsRerunModalOpen(false);
      const promise = rerunExtractionMutation.mutateAsync({ id: fileToRerun.id });
      toast.promise(promise, {
        loading: 'Initiating forensic extraction...',
        success: 'Extraction completed successfully.',
        error: 'Extraction engine failed to process object.'
      });
      await promise;
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoveFile = async (fileId: string, batchId: string | null) => {
    try {
      let targetBatchId = batchId;
      // Handle virtual section IDs or null
      if (!targetBatchId || ["DOKUMEN", "GAMBAR", "AUDIO"].includes(targetBatchId)) {
        // Find the primary 'Loose Files' batch for this case
        const looseBatch = batches.find(b => b.type === "Loose Files") || 
                           batches.find(b => b.name.toLowerCase().includes("file")) ||
                           batches[0];
        targetBatchId = looseBatch?.id || null;
      }
      
      if (!targetBatchId) {
        toast.error("No valid destination container found.");
        return;
      }

      await moveFileMutation.mutateAsync({ fileId, batchId: targetBatchId });
      toast.success("Evidence moved");
    } catch (error) {
      toast.error("Failed to move evidence");
    }
  };

  const handleDissolveFolder = async () => {
    if (!deleteFolderTarget) return;
    try {
      const looseBatch = batches.find(b => b.type === "Loose Files");
      const targetBatchId = looseBatch?.id || null;
      
      const folderFiles = files.filter((f: any) => f.batch_id === deleteFolderTarget.id);
      for (const f of folderFiles) {
        await moveFileMutation.mutateAsync({ fileId: f.id, batchId: targetBatchId });
      }
      await deleteBatchMutation.mutateAsync({ id: deleteFolderTarget.id });
      setDeleteFolderTarget(null);
      toast.success("Folder dissolved. Files moved to Single Files.");
    } catch (error) {
      toast.error("Failed to dissolve folder");
    }
  };

  const goToPrev = () => {
    const idx = filteredFiles.findIndex((f: any) => f.id === selectedFile?.id);
    if (idx > 0) setSelectedFile(filteredFiles[idx - 1]);
  };

  const goToNext = () => {
    const idx = filteredFiles.findIndex((f: any) => f.id === selectedFile?.id);
    if (idx < filteredFiles.length - 1) setSelectedFile(filteredFiles[idx + 1]);
  };

  const jumpToAudioTime = (time: number) => {
    setAudioCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const jumpToVideoTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  if (isLoading) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Evidence...</div>;

  return (
    <div className="flex h-full bg-[#f0f2f4] overflow-hidden">
      <div className="w-[320px] border-r border-slate-200 bg-white flex flex-col shrink-0 z-10 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex flex-col gap-4">
            {/* Header with Title and Counter */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Repositori Bukti</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-[4px] p-0.5 mr-1">
                   <button 
                    onClick={expandAll}
                    title="Expand All"
                    className="p-1 hover:bg-white hover:shadow-sm rounded-[2px] text-slate-400 hover:text-slate-900 transition-all"
                   >
                     <ChevronsDown className="h-3 w-3" />
                   </button>
                   <button 
                    onClick={collapseAll}
                    title="Collapse All"
                    className="p-1 hover:bg-white hover:shadow-sm rounded-[2px] text-slate-400 hover:text-slate-900 transition-all"
                   >
                     <ChevronsUp className="h-3 w-3" />
                   </button>
                </div>
                 <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-[4px] border border-slate-100">
                  {filteredFiles.length} BUKTI
                </span>
              </div>
            </div>

            {/* Search and Add Actions */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 bg-slate-50 border border-slate-100 rounded-[4px] pl-9 pr-4 text-[11px] font-bold focus:ring-1 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] transition-all outline-none"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-black px-3 rounded-[4px] text-[10px] uppercase tracking-widest gap-1.5 shrink-0 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> TAMBAH
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-[4px]">
                  <DropdownMenuItem onClick={() => setIsCreateFolderModalOpen(true)} className="text-[11px] font-bold py-2.5 rounded-[4px]">
                    <FolderPlus className="h-4 w-4 mr-2.5 text-emerald-600" /> Buat Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsUploadModalOpen(true)} className="text-[11px] font-bold py-2.5 rounded-[4px]">
                    <FileUp className="h-4 w-4 mr-2.5 text-slate-500" /> Upload File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsUploadModalOpen(true)} className="text-[11px] font-bold py-2.5 rounded-[4px]">
                    <FolderUp className="h-4 w-4 mr-2.5 text-slate-500" /> Upload Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
          
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white border-t border-slate-100">
          <div className="space-y-0">
            {/* 1. Real Folders (User Created) */}
            {batches.filter(b => b.type === "Folder").map((batch) => (
              <div key={batch.id} className="border-b border-slate-100/60">
                <div 
                  onClick={() => toggleBatch(batch.id)}
                  className={cn(
                    "flex items-center h-[40px] px-4 hover:bg-slate-50 cursor-pointer transition-all gap-2 group/header",
                    expandedBatches.includes(batch.id) ? "bg-slate-50/30" : ""
                  )}
                >
                  <ChevronRight className={cn(
                    "h-3.5 w-3.5 text-slate-400 transition-transform duration-150 shrink-0",
                    expandedBatches.includes(batch.id) ? "rotate-90" : ""
                  )} />
                  <Folder className={cn(
                    "h-4 w-4 shrink-0", 
                    expandedBatches.includes(batch.id) ? "text-[#0f62fe]" : "text-slate-400"
                  )} />
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-widest flex-1 truncate" title={batch.name}>{batch.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 mr-2 shrink-0">
                    {files.filter((f: any) => f.batch_id === batch.id).length}
                  </span>
                  
                  <div className="transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 hover:bg-slate-200 rounded-[4px] text-slate-400 transition-all shrink-0">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Aksi Folder</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setFolderToRename(batch);
                          setRenameValue(batch.name);
                          setIsRenameFolderModalOpen(true);
                        }} className="text-[11px] font-bold py-2 rounded-[4px]">
                           <Pencil className="h-3.5 w-3.5 mr-2 text-slate-400" /> Ubah Nama Folder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsUploadModalOpen(true)} className="text-[11px] font-bold py-2 rounded-[4px]">
                           <FileUp className="h-3.5 w-3.5 mr-2 text-slate-400" /> Upload ke Folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteFolderTarget(batch)} className="text-rose-600 focus:text-rose-600 text-[11px] font-bold py-2 rounded-[4px]">
                           <Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus Folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {expandedBatches.includes(batch.id) && (
                  <div className="bg-white">
                    {files.filter((f: any) => f.batch_id === batch.id).length === 0 ? (
                      <div className="h-[40px] flex items-center px-12 text-[10px] font-medium text-slate-400 uppercase tracking-widest italic">FOLDER KOSONG</div>
                    ) : (
                      files.filter((f: any) => f.batch_id === batch.id).map((file: any) => (
                        <FileRow 
                          key={file.id} 
                          file={file} 
                          isSelected={selectedFile?.id === file.id}
                          onSelect={() => setSelectedFile(file)}
                          onMove={handleMoveFile}
                          onDelete={() => { setSelectedFile(file); setIsDeleteModalOpen(true); }}
                          onRerun={(f: any) => {
                            setFileToRerun(f);
                            setIsRerunModalOpen(true);
                          }}
                          batches={batches}
                          isIndented
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* 2. Single Files Area (Flat List) */}
            <div className="mt-4 border-t border-slate-100 pt-2">
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">File Mandiri</span>
                <span className="text-[10px] font-bold text-slate-400">
                  {filteredFiles.filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder")).length}
                </span>
              </div>
              <div className="bg-white">
                {filteredFiles
                  .filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder"))
                  .map((file: any) => (
                    <FileRow 
                      key={file.id} 
                      file={file} 
                      isSelected={selectedFile?.id === file.id}
                      onSelect={() => setSelectedFile(file)}
                      onMove={handleMoveFile}
                      onDelete={() => { setSelectedFile(file); setIsDeleteModalOpen(true); }}
                      onRerun={(f: any) => {
                        setFileToRerun(f);
                        setIsRerunModalOpen(true);
                      }}
                      batches={batches}
                    />
                  ))
                }
                {filteredFiles.filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder")).length === 0 && (
                  <div className="px-8 py-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest italic opacity-50">Tidak ada file mandiri</div>
                )}
              </div>
            </div>

            {filteredFiles.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                  <Box className="h-6 w-6 text-slate-300" />
                </div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">No files yet</h3>
                <Button 
                  onClick={() => setIsUploadModalOpen(true)}
                  variant="outline"
                  className="h-9 border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-[4px] hover:bg-slate-50"
                >
                  <Upload className="h-3.5 w-3.5 mr-2" /> Upload
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-0 bg-white">
        <div className="h-12 border-b flex items-center justify-between px-6 shrink-0 bg-white">
           {selectedFile ? (
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1 border-r pr-4 border-slate-100">
                    <button onClick={goToPrev} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={goToNext} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"><ChevronRightIcon className="h-4 w-4" /></button>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-slate-100 rounded flex items-center justify-center border shadow-inner">
                       {getFileIcon(selectedFile.type)}
                    </div>
                    <h2 className="text-sm font-medium text-slate-900 tracking-tight">{selectedFile.name}</h2>
                 </div>
              </div>
           ) : (
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidence Workspace Ready</div>
           )}
        </div>

        <div className="flex-1 overflow-auto bg-[#f0f2f4] p-6 flex flex-col items-center custom-scrollbar" style={{ minWidth: 0 }}>
             <div className={`w-full flex ${(selectedFile?.type === "Image" || selectedFile?.type === "Document") ? "max-w-5xl h-full items-center justify-center" : "max-w-5xl items-start justify-center pt-4"}`}>
               {selectedFile ? (
                 <AdaptiveSourcePreview 
                    file={selectedFile} 
                    videoCurrentTime={videoCurrentTime}
                    setVideoCurrentTime={setVideoCurrentTime}
                    videoIsPlaying={videoIsPlaying}
                    setVideoIsPlaying={setVideoIsPlaying}
                    videoRef={videoRef}
                    audioCurrentTime={audioCurrentTime}
                    setAudioCurrentTime={setAudioCurrentTime}
                    audioIsPlaying={audioIsPlaying}
                    setAudioIsPlaying={setAudioIsPlaying}
                    audioPlaybackSpeed={audioPlaybackSpeed}
                    setPlaybackSpeed={setAudioPlaybackSpeed}
                    audioRef={audioRef}
                  />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                   <div className="h-20 w-20 rounded-[2.5rem] bg-white  flex items-center justify-center mb-8 border border-white/50 animate-in fade-in zoom-in duration-700">
                      <Folders className="h-10 w-10 text-slate-200" />
                   </div>
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-3">No Evidence Selected</h3>
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest max-w-[280px] leading-relaxed opacity-80">
                     Select an object from the library or use the Add Evidence button to begin the review workflow.
                   </p>
                </div>
              )}
            </div>
         </div>
      </div>

      <div className="w-[460px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.03)] overflow-hidden">
        {selectedFile ? (() => {
            const lowerType = selectedFile.type?.toLowerCase();
            const lowerName = selectedFile.name?.toLowerCase() || "";
            const isImage = lowerType === "image" || lowerName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
            const isAudio = lowerType === "audio" || lowerName.match(/\.(mp3|wav|ogg|m4a|aac)$/);
            const isVideo = lowerType === "video" || lowerName.match(/\.(mp4|webm|ogg|mov|m4v|avi|wmv)$/);
            const isDocument = lowerType === "document" || lowerName.match(/\.(pdf|doc|docx|txt|rtf|xls|xlsx|csv)$/);

            return (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {isVideo ? (
                    <VideoAnalysisPanel file={selectedFile} currentTime={videoCurrentTime || 0} onJump={jumpToVideoTime} />
                  ) : isAudio ? (
                    <AudioExtractionConsole file={selectedFile} onJump={jumpToAudioTime} currentTime={audioCurrentTime} />
                  ) : isImage ? (
                    <ImageExtractionConsole file={selectedFile} />
                  ) : isDocument ? (
                    <DocumentExtractionConsole file={selectedFile} />
                  ) : null}
              </div>
            );
        })() : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale saturate-0">
             <Cpu className="h-12 w-12 text-slate-200 mb-6" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Forensic Engine Standby</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 max-w-[220px] leading-relaxed">Select an evidence object to initiate automated feature extraction.</p>
          </div>
        )}
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        fileName={selectedFile?.name || ""}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadEvidence}
      />

      <Modal
        isOpen={isCreateFolderModalOpen}
        onClose={() => { setIsCreateFolderModalOpen(false); setNewFolderName(""); }}
        title="Create New Folder"
        showCloseButton
      >
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Folder Name</label>
            <Input 
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="h-11 font-bold"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
             <Button variant="outline" className="flex-1 h-11" onClick={() => setIsCreateFolderModalOpen(false)}>Cancel</Button>
             <Button className="flex-1 h-11 bg-slate-900" disabled={!newFolderName.trim()} onClick={handleCreateFolder}>Create Folder</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isRenameFolderModalOpen} onClose={() => setIsRenameFolderModalOpen(false)} title="Rename Folder">
        <div className="p-6">
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="New folder name..." className="h-10 font-bold mb-6" autoFocus />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsRenameFolderModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameFolder}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isRenameFileModalOpen} onClose={() => setIsRenameFileModalOpen(false)} title="Rename File">
        <div className="p-6">
          <Input value={fileRenameValue} onChange={(e) => setFileRenameValue(e.target.value)} placeholder="New file name..." className="h-10 font-bold mb-6" autoFocus />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsRenameFileModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameFile}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <DeleteFolderModal 
        target={deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
        onConfirm={handleDeleteFolder}
        onDissolve={handleDissolveFolder}
      />

      <Modal isOpen={isRerunModalOpen} onClose={() => setIsRerunModalOpen(false)} title="Trigger Forensic Extraction">
        <div className="p-6 space-y-6">
          <div className="flex gap-4 p-4 bg-slate-50 rounded border border-slate-100">
            <div className="h-10 w-10 bg-white rounded flex items-center justify-center border shadow-sm shrink-0">
              {fileToRerun && getFileIcon(fileToRerun.type, fileToRerun.name)}
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[300px]">{fileToRerun?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Re-triggering will overwrite existing metadata.</p>
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            Are you sure you want to re-initiate the automated extraction engine for this object? This process will perform deep analysis of the evidence source.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-11" onClick={() => setIsRerunModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 h-11 bg-slate-900" onClick={handleRerunExtraction}>Confirm Rerun</Button>
          </div>
        </div>
      </Modal>

      <EvidenceDerivationInjector 
        isOpen={isDerivationInjectorOpen}
        onClose={() => setIsDerivationInjectorOpen(false)}
        caseId={caseId || ""}
        evidenceId={selectedFile?.id || ""}
        evidenceName={selectedFile?.name || ""}
        evidenceType={(() => {
          const lowerType = selectedFile?.type?.toLowerCase();
          const lowerName = selectedFile?.name?.toLowerCase() || "";
          if (lowerType === "audio" || lowerName.match(/\.(mp3|wav|ogg|m4a|aac)$/)) return 'audio';
          if (lowerType === "video" || lowerName.match(/\.(mp4|webm|ogg|mov|m4v|avi|wmv)$/)) return 'video';
          if (lowerType === "image" || lowerName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) return 'image';
          return 'document';
        })()}
        onApply={() => {
           queryClient.invalidateQueries({ queryKey: ["evidence", caseId] });
        }}
      />
    </div>
  );
}
