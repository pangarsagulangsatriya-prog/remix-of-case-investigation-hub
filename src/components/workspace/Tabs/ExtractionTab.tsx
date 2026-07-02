import React, { useState, useRef, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { 
  Search, Plus, FolderPlus, FileUp, FolderUp, ChevronRight, 
  Folder, Folders, MoreVertical, Pencil, Trash2, Loader2, CheckCircle2, 
  Box, Upload, ChevronLeft, ChevronRight as ChevronRightIcon, 
  Cpu, ChevronsDown, ChevronsUp, AlertCircle, RefreshCw, FolderOpen,
  Dices, PowerOff, Database, FileText, Filter
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
  VideoAnalysisPanel,
  VideoSceneSession,
  AudioSceneSession
} from "../ExtractionTab/ConsoleComponents";
import EvidencePreparationExperience from "../ExtractionTab/EvidencePreparationExperience";
import { EvidenceCenterEmptyState, EvidenceRightEmptyState } from "../ExtractionTab/EvidenceEmptyState";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Clock, RotateCcw, Check, X } from "lucide-react";
import { toast } from "sonner";
import { EvidenceDerivationInjector } from "../ExtractionTab/EvidenceDerivationInjector";
import { useSearchParams } from "react-router-dom";
import { useTour } from '@/components/workspace/TourContext';

export default function ExtractionTab() {
  const { currentStep: tourStep, isActive: isTourActive } = useTour();
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyFile, setHistoryFile] = useState<any>(null);
  const { caseId } = useParams<{ caseId: string }>();
  const queryClient = useQueryClient();
  const { data: evidence, isLoading } = useEvidence(caseId!);
  const files = evidence?.files || [];
  const batches = evidence?.batches || [];

  // State
  const [primaryEvidences, setPrimaryEvidences] = useState<any[]>(() => {
    // Force the new dual-file setup for the demo, ignoring previous localStorage state
    return [
      {
        id: "dummy-primary-1",
        name: "Form_Insiden_Lengkap.pdf",
        type: "document",
        size: 152300,
        created_at: "2026-06-09T20:59:00Z",
        extraction_status: "completed",
        batch_id: "UTAMA",
        url: "https://hseautomation.beraucoal.co.id/beats2/file/15354568"
      },
      {
        id: "dummy-primary-2",
        name: "Metadata_Insiden_2161.json",
        type: "case-metadata",
        size: 4096,
        created_at: "2026-06-09T21:05:00Z",
        extraction_status: "completed",
        batch_id: "UTAMA",
        url: "https://dummy-hse.local/files/metadata_2161"
      }
    ];
  });
  const [isPrimaryUploadModalOpen, setIsPrimaryUploadModalOpen] = useState(false);

  const savePrimaryEvidences = (newEvidences: any[]) => {
    setPrimaryEvidences(newEvidences);
    const toSave = newEvidences.map(({ url, ...rest }) => rest);
    localStorage.setItem(`primary_evidences_demo_global`, JSON.stringify(toSave));
  };

  const handleDeletePrimaryEvidence = (id: string) => {
    const updated = primaryEvidences.filter((e) => e.id !== id);
    savePrimaryEvidences(updated);
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
    toast.success("File bukti utama berhasil dihapus");
  };

  const handlePrimaryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((file, idx) => ({
        id: `primary-new-${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        type: file.type.includes('video') ? 'video' : file.type.includes('audio') ? 'audio' : file.type.includes('image') ? 'image' : 'document',
        created_at: new Date().toISOString(),
        extraction_status: "completed",
        batch_id: "UTAMA",
        url: URL.createObjectURL(file)
      }));
      savePrimaryEvidences([...primaryEvidences, ...newFiles]);
      setIsPrimaryUploadModalOpen(false);
      toast.success(`${newFiles.length} file bukti utama berhasil ditambahkan`);
    }
  };

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

  // Tour Auto-Select Logic
  useEffect(() => {
    if (isTourActive && (tourStep === 6 || tourStep === 7)) {
      if (!selectedFile && primaryEvidences.length > 0) {
        setSelectedFile(primaryEvidences[0]);
      }
    }
  }, [isTourActive, tourStep, selectedFile, primaryEvidences]);

  const [deleteFolderTarget, setDeleteFolderTarget] = useState<any>(null);
  const [fileToRerun, setFileToRerun] = useState<any>(null);
  
  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
  const [isRerunModalOpen, setIsRerunModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [revertTargetRunId, setRevertTargetRunId] = useState<string | null>(null);
  
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
  const formatSize = (size: any) => {
    if (!size) return "0 B";
    const bytes = typeof size === 'string' ? parseInt(size) : size;
    if (isNaN(bytes)) return size;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileHistory = (file: any) => {
    if (!file) return [];
    const key = `file_history_${file.id}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);

    const baseDate = new Date(file.created_at || new Date());
    
    const formatDateFull = (date: Date) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    };

    let mockRuns = [];
    if (file.extraction_status === "completed") {
      const run3Date = new Date(file.updated_at || file.created_at || new Date());
      const run2Date = new Date(run3Date.getTime() - 3 * 3600000);
      const run1Date = new Date(run3Date.getTime() - 24 * 3600000);
      
      mockRuns = [
        {
          id: `${file.id}_run_3`,
          runIndex: 3,
          status: "completed",
          timestamp: formatDateFull(run3Date),
          isActive: true,
          data: {
            extractedText: `[Run #3 Active Version] Deep audio forensic extraction completed with KM 14-500 Rebah markers successfully mapped.`,
          }
        },
        {
          id: `${file.id}_run_2`,
          runIndex: 2,
          status: "failed",
          timestamp: formatDateFull(run2Date),
          error: "Reason: Analysis engine timeout or connection reset by peer (504)",
        },
        {
          id: `${file.id}_run_1`,
          runIndex: 1,
          status: "completed",
          timestamp: formatDateFull(run1Date),
          isActive: false,
          data: {
            extractedText: `[Run #1 Legacy Version] Legaged parsing succeeded with partial keypoint markers.`,
          }
        }
      ];
    } else {
      const run2Date = new Date(file.updated_at || file.created_at || new Date());
      const run1Date = new Date(run2Date.getTime() - 12 * 3600000);
      
      mockRuns = [
        {
          id: `${file.id}_run_2`,
          runIndex: 2,
          status: "failed",
          timestamp: formatDateFull(run2Date),
          isActive: true,
          error: file.metadata?.error_message || "Reason: Unsupported audio format or token limit exceeded",
        },
        {
          id: `${file.id}_run_1`,
          runIndex: 1,
          status: "completed",
          timestamp: formatDateFull(run1Date),
          isActive: false,
          data: {
            extractedText: `[Run #1 Version Data] Initial forensic parsing succeeded.`,
          }
        }
      ];
    }
    
    localStorage.setItem(key, JSON.stringify(mockRuns));
    return mockRuns;
  };

  const getActiveRunId = (file: any) => {
    if (!file) return null;
    const activeKey = `file_active_run_${file.id}`;
    const activeStored = localStorage.getItem(activeKey);
    if (activeStored) return activeStored;

    const history = getFileHistory(file);
    const completedRuns = history.filter((r: any) => r.status === "completed");
    const activeItem = history.find((r: any) => r.isActive) || completedRuns[0] || history[0];
    if (activeItem) {
      localStorage.setItem(activeKey, activeItem.id);
      return activeItem.id;
    }
    return null;
  };

  const handleRestoreVersion = (runId: string) => {
    if (!historyFile) return;
    
    const key = `file_history_${historyFile.id}`;
    const history = getFileHistory(historyFile);
    
    // Find the target run that we are reverting to so we can mention it in the log
    const completedRuns = history.filter((r: any) => r.status === "completed").reverse(); // order so oldest first
    const totalVersions = completedRuns.length;
    const targetIdx = completedRuns.findIndex((r: any) => r.id === runId);
    const versionNum = targetIdx !== -1 ? targetIdx + 1 : 1;

    // Create the revert event log item
    const now = new Date();
    const formatDateFull = (date: Date) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    };

    const targetRun = history.find((r: any) => r.id === runId);
    const targetTime = targetRun ? targetRun.timestamp : formatDateFull(now);

    const revertEventId = `${historyFile.id}_revert_${Date.now()}`;
    const revertEvent = {
      id: revertEventId,
      runIndex: history.length + 1,
      status: "reverted",
      timestamp: formatDateFull(now),
      description: `Ekstraksi forensik dipulihkan ke versi V${versionNum} (Eksekusi: ${targetTime}).`
    };

    // Update active status for runs
    const updated = history.map((run: any) => ({
      ...run,
      isActive: run.id === runId
    }));

    // Prepend the revert event to history
    const finalHistory = [revertEvent, ...updated];
    
    localStorage.setItem(`file_active_run_${historyFile.id}`, runId);
    localStorage.setItem(key, JSON.stringify(finalHistory));
    
    const updatedFile = {
      ...historyFile,
      activeRunId: runId
    };
    setHistoryFile(updatedFile);

    // Also update selectedFile if it's the active one
    if (selectedFile && selectedFile.id === historyFile.id) {
      setSelectedFile(updatedFile);
    }

    setIsRevertModalOpen(false);
    setRevertTargetRunId(null);
    toast.success(`Data berhasil dipulihkan ke versi V${versionNum}.`);
    queryClient.invalidateQueries({ queryKey: ["evidence"] });
  };

  const rerunExtractionMutation = useRerunExtraction();

  // Injector Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        // Here we should ideally check user role, but for prototype we allow in dev/staging env
        setIsDerivationInjectorOpen(true);
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        setIsPrimaryUploadModalOpen(true);
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
    
    // Filter matching files first
    const matched = files.filter((f: any) => 
      f && f.name && f.type && (
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Identify mandiri files to find the last one
    const mandiriIds = matched
      .filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder"))
      .map((f: any) => f.id);
    const lastMandiriId = mandiriIds[mandiriIds.length - 1];

    return matched.map((f: any) => {
      // Hardcode demo simulation: always fail these files unless currently retrying/processing
      if (f.extraction_status !== "pending" && f.extraction_status !== "processing") {
        if (f.id === lastMandiriId && f.extraction_status === "completed") {
          return {
            ...f,
            extraction_status: "failed",
            metadata: {
              ...(f.metadata || {}),
              error_message: "Analysis engine timeout (504)"
            }
          };
        }
        if (f.name.includes("WhatsApp Image")) {
          return {
            ...f,
            extraction_status: "failed",
            metadata: {
              ...(f.metadata || {}),
              error_message: "Failed to upload evidence payload. Connection lost during chunk upload (408)."
            }
          };
        }
        if (f.name.includes("ChatGPT Image")) {
          return {
            ...f,
            extraction_status: "failed",
            metadata: {
              ...(f.metadata || {}),
              error_message: "Analysis engine timeout or connection reset by peer (504)."
            }
          };
        }
      }
      return f;
    });
  }, [files, searchQuery, batches]);

  // Handlers
  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const isAllExpanded = useMemo(() => {
    const allFolderIds = batches.filter(b => b.type === "Folder").map(b => b.id);
    const virtualSections = ["DOKUMEN", "GAMBAR", "AUDIO"];
    const allIds = Array.from(new Set([...allFolderIds, ...virtualSections]));
    return allIds.length > 0 && allIds.every(id => expandedBatches.includes(id));
  }, [batches, expandedBatches]);

  const toggleAll = () => {
    const allFolderIds = batches.filter(b => b.type === "Folder").map(b => b.id);
    const virtualSections = ["DOKUMEN", "GAMBAR", "AUDIO"];
    const allIds = Array.from(new Set([...allFolderIds, ...virtualSections]));
    
    if (isAllExpanded) {
      setExpandedBatches([]);
    } else {
      setExpandedBatches(allIds);
    }
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

    // Check if AI Analysis is running
    const isAnalysisActive = localStorage.getItem(`analysis_running_${caseId}`) === "true";
    if (isAnalysisActive) {
      toast.error("File tidak dapat dihapus karena analisis AI sedang berjalan menggunakan sumber daya dari repositori bukti.");
      setIsDeleteModalOpen(false);
      return;
    }

    if (selectedFile.extraction_status === "pending" || selectedFile.extraction_status === "processing") {
      toast.error(`File "${selectedFile.name}" sedang dalam proses ${selectedFile.extraction_status === "pending" ? "upload" : "analisis/ekstraksi"} dan tidak dapat dihapus.`);
      setIsDeleteModalOpen(false);
      return;
    }
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

    // Check if AI Analysis is running
    const isAnalysisActive = localStorage.getItem(`analysis_running_${caseId}`) === "true";
    if (isAnalysisActive) {
      toast.error("Folder tidak dapat dihapus karena analisis AI sedang berjalan menggunakan sumber daya dari repositori bukti.");
      setDeleteFolderTarget(null);
      return;
    }

    // Get files in this folder (virtual or real)
    const folderFiles = deleteFolderTarget.isVirtual 
      ? (deleteFolderTarget.files || []) 
      : files.filter((f: any) => f.batch_id === deleteFolderTarget.id);

    // Check if any file inside the folder is uploading or processing
    const hasRunningFiles = folderFiles.some((f: any) => f.extraction_status === "pending" || f.extraction_status === "processing");
    if (hasRunningFiles) {
      toast.error("Folder tidak dapat dihapus karena terdapat file di dalamnya yang sedang dalam proses upload atau ekstraksi.");
      setDeleteFolderTarget(null);
      return;
    }

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
    const targetFile = fileToRerun;
    try {
      setIsRerunModalOpen(false);
      const promise = rerunExtractionMutation.mutateAsync({ id: targetFile.id });
      toast.promise(promise, {
        loading: 'Initiating forensic extraction...',
        success: 'Extraction completed successfully.',
        error: 'Extraction engine failed to process object.'
      });
      await promise;

      // SUCCESS: Append a brand new successful run to both tracks in localStorage
      const historyKey = `file_history_${targetFile.id}`;
      const runs = getFileHistory(targetFile);
      const newRunIndex = runs.length > 0 ? Math.max(...runs.map((r: any) => r.runIndex)) + 1 : 1;
      
      const now = new Date();
      const formatDateFull = (date: Date) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      };

      const newRun = {
        id: `${targetFile.id}_run_${newRunIndex}`,
        runIndex: newRunIndex,
        status: "completed",
        timestamp: formatDateFull(now),
        isActive: false, // will become active in activeRunId
        data: {
          extractedText: `[Run #${newRunIndex} Active Version] Deep audio forensic extraction completed with KM 14-500 Rebah markers successfully mapped.`
        }
      };

      const updatedRuns = [newRun, ...runs.map((r: any) => ({ ...r, isActive: false }))];
      localStorage.setItem(historyKey, JSON.stringify(updatedRuns));
      localStorage.setItem(`file_active_run_${targetFile.id}`, newRun.id);

      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    } catch (error) {
      console.error(error);
      
      // FAILURE: Append a brand new failed run to execution log track in localStorage
      const historyKey = `file_history_${targetFile.id}`;
      const runs = getFileHistory(targetFile);
      const newRunIndex = runs.length > 0 ? Math.max(...runs.map((r: any) => r.runIndex)) + 1 : 1;
      
      const now = new Date();
      const formatDateFull = (date: Date) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      };

      const newRun = {
        id: `${targetFile.id}_run_${newRunIndex}`,
        runIndex: newRunIndex,
        status: "failed",
        timestamp: formatDateFull(now),
        error: "Reason: Unsupported audio format or token limit exceeded"
      };

      const updatedRuns = [newRun, ...runs];
      localStorage.setItem(historyKey, JSON.stringify(updatedRuns));

      queryClient.invalidateQueries({ queryKey: ["evidence"] });
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

    // Check if AI Analysis is running
    const isAnalysisActive = localStorage.getItem(`analysis_running_${caseId}`) === "true";
    if (isAnalysisActive) {
      toast.error("Folder tidak dapat dibubarkan karena analisis AI sedang berjalan menggunakan sumber daya dari repositori bukti.");
      setDeleteFolderTarget(null);
      return;
    }

    // Get files in this folder
    const folderFiles = files.filter((f: any) => f.batch_id === deleteFolderTarget.id);

    // Check if any file inside the folder is uploading or processing
    const hasRunningFiles = folderFiles.some((f: any) => f.extraction_status === "pending" || f.extraction_status === "processing");
    if (hasRunningFiles) {
      toast.error("Folder tidak dapat dibubarkan karena terdapat file di dalamnya yang sedang dalam proses upload atau ekstraksi.");
      setDeleteFolderTarget(null);
      return;
    }

    try {
      const looseBatch = batches.find(b => b.type === "Loose Files");
      const targetBatchId = looseBatch?.id || null;
      
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

  const activeFile = useMemo(() => {
    if (!selectedFile) return null;
    return filteredFiles.find((f: any) => f.id === selectedFile.id) || selectedFile;
  }, [selectedFile, filteredFiles]);

  // Transition Tracking for Success State (800ms)
  const prevStatusMap = useRef<Record<string, string>>({});
  const [successFileId, setSuccessFileId] = useState<string | null>(null);
  const [hoveredFile, setHoveredFile] = useState<any | null>(null);

  useEffect(() => {
    if (!activeFile) return;
    const prevStatus = prevStatusMap.current[activeFile.id];
    const currStatus = activeFile.extraction_status;
    
    if ((prevStatus === "processing" || prevStatus === "pending") && currStatus === "completed") {
      setSuccessFileId(activeFile.id);
      setTimeout(() => setSuccessFileId(null), 800);
    }
    
    prevStatusMap.current[activeFile.id] = currStatus;
  }, [activeFile]);

  if (isLoading) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Evidence...</div>;

  return (
    <div className="flex h-full bg-[#f0f2f4] overflow-hidden">
      <div className={cn(
        "border-r border-slate-200 bg-white flex flex-col shrink-0 z-10 shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-all duration-300",
        activeFile ? "w-[320px]" : "flex-1"
      )}>
        <div className="p-5 shrink-0 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    id="tour-step-2-upload"
                    className="h-9 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-black px-4 rounded-md text-[10px] uppercase tracking-widest gap-1.5 shrink-0 shadow-sm transition-all"
                  >
                    <Plus className="h-4 w-4 text-slate-500" /> TAMBAH
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-md shadow-lg border-slate-200">
                  <DropdownMenuItem onClick={() => setIsCreateFolderModalOpen(true)} className="text-[11px] font-bold py-2.5 cursor-pointer">
                    <FolderPlus className="h-4 w-4 mr-2.5 text-emerald-600" /> Buat Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsUploadModalOpen(true)} className="text-[11px] font-bold py-2.5 cursor-pointer">
                    <FileUp className="h-4 w-4 mr-2.5 text-slate-500" /> Upload File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsUploadModalOpen(true)} className="text-[11px] font-bold py-2.5 cursor-pointer">
                    <FolderUp className="h-4 w-4 mr-2.5 text-slate-500" /> Upload Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div id="tour-step-3-search" className="relative flex-1 max-w-[400px] flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama atau tipe berkas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 bg-white border border-slate-200 rounded-md pl-9 pr-4 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none shadow-sm"
                  />
                </div>
                <Button variant="outline" className="h-9 w-9 p-0 rounded-md border-slate-200 text-slate-500 hover:text-slate-900 bg-white shadow-sm shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
               <div className="flex items-center bg-white border border-slate-200 rounded-[6px] divide-x divide-slate-200 shadow-sm overflow-hidden shrink-0">
                  <div className="flex flex-col items-center justify-center py-1.5 px-3 min-w-[75px] bg-white">
                    <span className="text-[15px] font-black text-rose-600 leading-none mb-0.5">
                      {1 + batches.filter(b => b.type === "Folder").length + filteredFiles.filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder")).length}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-none">
                      Total
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-1.5 px-3 min-w-[75px] bg-white">
                    <span className="text-[15px] font-black text-slate-800 leading-none mb-0.5">
                      1
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-none">
                      Utama
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-1.5 px-3 min-w-[75px] bg-white">
                    <span className="text-[15px] font-black text-[#0f62fe] leading-none mb-0.5">
                      {batches.filter(b => b.type === "Folder").length + filteredFiles.filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder")).length}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-none">
                      Pendukung
                    </span>
                  </div>
               </div>
               <button 
                onClick={toggleAll}
                title={isAllExpanded ? "Collapse All Folders" : "Expand All Folders"}
                className="p-1.5 hover:bg-slate-50 hover:shadow-sm rounded-[4px] border border-slate-200 text-slate-500 hover:text-slate-900 transition-all bg-white flex items-center justify-center shrink-0 h-9 w-9"
               >
                 {isAllExpanded ? (
                   <FolderOpen className="h-4 w-4" />
                 ) : (
                   <Folder className="h-4 w-4" />
                 )}
               </button>
            </div>
          </div>
        <div id="tour-step-4-groups" className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white relative">
          {/* Table Header removed per user request */}

          <div className="space-y-0">

            {/* BUKTI UTAMA / DATA CCR */}
            <div className="mt-2">
              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-100/80 border-y border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">DATA CCR</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">{primaryEvidences.length}</span>
              </div>
              <div className="bg-white">
                {primaryEvidences.map((evidence) => (
                  <FileRow 
                    key={evidence.id}
                    file={evidence} 
                    isSelected={selectedFile?.id === evidence.id}
                    onSelect={() => setSelectedFile(selectedFile?.id === evidence.id ? null : evidence)}
                    onMove={handleMoveFile}
                    onDelete={() => handleDeletePrimaryEvidence(evidence.id)}
                    onRerun={() => {}}
                    onOpenHistory={() => {}}
                    batches={batches}
                    onHoverChange={setHoveredFile}
                  />
                ))}
              </div>
            </div>

            {/* BUKTI PENDUKUNG */}
            <div className="mt-6">
              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-100/80 border-y border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">BUKTI PENDUKUNG</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
                  {batches.filter(b => b.type === "Folder").length + filteredFiles.filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder")).length}
                </span>
              </div>
               <div className="bg-white">
            {/* 1. Real Folders (User Created) */}
            {batches.filter(b => b.type === "Folder").map((batch) => (
              <div key={batch.id} className="border-b border-slate-200">
                <div 
                  onClick={() => toggleBatch(batch.id)}
                  className={cn(
                    "grid grid-cols-[minmax(250px,_1fr)_150px_160px_140px_130px_60px] gap-4 items-center px-4 py-2 min-h-[44px] hover:bg-slate-200/50 cursor-pointer transition-all group/header",
                    expandedBatches.includes(batch.id) ? "bg-slate-100/60 shadow-inner" : "bg-slate-50/80"
                  )}
                >
                  {/* Col 1: Name and Icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronRight className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0",
                      expandedBatches.includes(batch.id) ? "rotate-90" : ""
                    )} />
                    <div className="h-7 w-7 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Folder className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    <span className="text-[12px] font-medium text-slate-800 truncate" title={batch.name}>{batch.name}</span>
                  </div>

                  {/* Col 2: Type */}
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    Folder Berkas
                  </div>

                  {/* Col 2.5: Uploader */}
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    -
                  </div>

                  {/* Col 3: Date */}
                  <div className="text-[11px] text-slate-500 font-medium">
                    14 Okt 2023, 16:45
                  </div>

                  {/* Col 4: Status AI */}
                  <div className="text-[12px] text-slate-400 font-medium">
                    -
                  </div>
                  
                  {/* Col 5: Actions */}
                  <div className="flex items-center justify-center shrink-0 transition-opacity opacity-0 group-hover/header:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-all shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-[6px]">
                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Aksi Folder</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setFolderToRename(batch);
                          setRenameValue(batch.name);
                          setIsRenameFolderModalOpen(true);
                        }} className="text-[11px] font-bold py-2 rounded-[4px]">
                           <Pencil className="h-3.5 w-3.5 mr-2 text-slate-400" /> Ubah Nama
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                           const isAnalysisActive = localStorage.getItem(`analysis_running_${caseId}`) === "true";
                           if (isAnalysisActive) {
                             toast.warning("Folder tidak dapat dihapus karena analisis AI sedang berjalan.");
                             return;
                           }
                           const folderFiles = files.filter((f: any) => f.batch_id === batch.id);
                           const hasRunningFiles = folderFiles.some((f: any) => f.extraction_status === "pending" || f.extraction_status === "processing");
                           if (hasRunningFiles) {
                             toast.warning("Folder tidak dapat dihapus karena terdapat file yang sedang diproses.");
                             return;
                           }
                           setDeleteFolderTarget(batch);
                        }} 
                        className={cn(
                           "text-rose-600 focus:text-rose-600 text-[11px] font-bold py-2 rounded-[4px]",
                           (files.filter((f: any) => f.batch_id === batch.id).some((f: any) => f.extraction_status === "pending" || f.extraction_status === "processing") || (localStorage.getItem(`analysis_running_${caseId}`) === "true")) && "text-slate-400 focus:text-slate-400 opacity-60"
                        )}>
                           <Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus Folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {expandedBatches.includes(batch.id) && (
                  <div className="bg-slate-50/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] border-t border-slate-100">
                    {files.filter((f: any) => f.batch_id === batch.id).length === 0 ? (
                      <div className="h-[44px] flex items-center px-12 text-[10px] font-medium text-slate-400 uppercase tracking-widest italic bg-white">FOLDER KOSONG</div>
                    ) : (
                      files.filter((f: any) => f.batch_id === batch.id).map((file: any) => (
                        <FileRow 
                          key={file.id} 
                          file={file} 
                          isSelected={selectedFile?.id === file.id}
                          onSelect={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                          onMove={handleMoveFile}
                          onDelete={() => { setSelectedFile(file); setIsDeleteModalOpen(true); }}
                          onRerun={(f: any) => {
                            setFileToRerun(f);
                            setIsRerunModalOpen(true);
                          }}
                          onOpenHistory={(f: any) => {
                            setHistoryFile(f);
                            setIsHistoryDrawerOpen(true);
                          }}
                          batches={batches}
                          isIndented
                          onHoverChange={setHoveredFile}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
                {(() => {
                  const mandiriFiles = filteredFiles.filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder"));
                  return mandiriFiles.map((file: any) => {
                    return (
                      <FileRow 
                        key={file.id} 
                        file={file} 
                        isSelected={selectedFile?.id === file.id}
                        onSelect={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                        onMove={handleMoveFile}
                        onDelete={() => { setSelectedFile(file); setIsDeleteModalOpen(true); }}
                        onRerun={(f: any) => {
                          setFileToRerun(f);
                          setIsRerunModalOpen(true);
                        }}
                        onOpenHistory={(f: any) => {
                          setHistoryFile(f);
                          setIsHistoryDrawerOpen(true);
                        }}
                        batches={batches}
                        onHoverChange={setHoveredFile}
                      />
                    );
                  });
                })()}
                {filteredFiles.filter((f: any) => !batches.find(b => b.id === f.batch_id && b.type === "Folder")).length === 0 && (
                  <div className="px-8 py-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest italic opacity-50">Tidak ada bukti pendukung</div>
                )}
               </div>
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

      {(activeFile && (activeFile.extraction_status === "processing" || activeFile.extraction_status === "pending" || successFileId === activeFile.id)) ? (
         <div className="flex-1 flex flex-col relative z-0 bg-white">
           <EvidencePreparationExperience file={activeFile} isSuccess={successFileId === activeFile.id} />
         </div>
      ) : activeFile ? (
        <>
          <div className="flex-1 flex flex-col relative z-0 bg-white">
            <div className="h-12 border-b flex items-center justify-between px-6 shrink-0 bg-white">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1 border-r pr-4 border-slate-100">
                    <button onClick={goToPrev} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={goToNext} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"><ChevronRightIcon className="h-4 w-4" /></button>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-slate-100 rounded flex items-center justify-center border shadow-inner">
                       {getFileIcon(activeFile.type)}
                    </div>
                    <h2 className="text-sm font-medium text-slate-900 tracking-tight">{activeFile.name}</h2>
                 </div>
              </div>
        </div>

         <div id="tour-step-6-preview" className="flex-1 overflow-auto bg-[#f0f2f4] p-6 flex flex-col items-center custom-scrollbar" style={{ minWidth: 0 }}>
             <div className={`w-full flex ${(activeFile?.type === "Image" || activeFile?.type === "Document") ? "max-w-5xl h-full items-center justify-center" : "max-w-5xl items-start justify-center pt-4"}`}>
                 <AdaptiveSourcePreview 
                    file={activeFile} 
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
            </div>
         </div>
      </div>

      {!(activeFile.type?.toLowerCase() === "case-metadata") && (
        <div id="tour-step-7-insights" className="w-[460px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.03)] overflow-hidden">
          {(() => {
               if (activeFile.extraction_status === "failed") {
                 return (
                   <div id="failed-extraction-console" className="flex-1 flex flex-col h-full bg-white select-none antialiased">
                     <div className="px-5 border-b border-slate-100 flex items-center justify-between shrink-0 h-11">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] leading-none">ANALYSIS CONSOLE</span>
                       <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-[3px] uppercase tracking-wider leading-none">FAILED</span>
                     </div>

                     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                       <div className="h-16 w-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shadow-sm shrink-0">
                         <AlertCircle className="h-7 w-7 text-rose-500" />
                       </div>

                       <div className="space-y-2 max-w-[320px]">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Ekstraksi Bukti Gagal</h3>
                         <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider leading-relaxed">
                           Mesin analisis kecerdasan AI gagal melakukan ekstraksi dan penataan berkas data forensik ini.
                         </p>
                       </div>

                       <div className="w-full max-w-[340px] text-left p-4 rounded-[6px] bg-rose-50/30 border border-rose-100 font-mono text-[10.5px] text-rose-800 space-y-1.5 shadow-2xs">
                         <div className="flex items-center justify-between border-b border-rose-100/50 pb-1.5 mb-1.5">
                           <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest">Detail Kesalahan</span>
                           <span className="text-[8px] font-bold text-rose-500/80">ERROR CODE: 504</span>
                         </div>
                         <p className="leading-relaxed font-semibold">
                           {activeFile.metadata?.error_message || "Reason: Analysis engine timeout or connection reset by peer (504)"}
                         </p>
                       </div>

                       <Button
                         id="retry-extraction-button"
                         onClick={() => {
                           setFileToRerun(activeFile);
                           setIsRerunModalOpen(true);
                         }}
                         className="h-11 px-9 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-[4px] shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2"
                       >
                         <RefreshCw className="h-3.5 w-3.5" />
                         <span>Proses Ulang (Retry)</span>
                       </Button>
                     </div>
                   </div>
                 );
               }

               const lowerType = activeFile.type?.toLowerCase();
               const lowerName = activeFile.name?.toLowerCase() || "";
               const isImage = lowerType === "image" || lowerName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
               const isAudio = lowerType === "audio" || lowerName.match(/\.(mp3|wav|ogg|m4a|aac)$/);
               const isVideo = lowerType === "video" || lowerName.match(/\.(mp4|webm|ogg|mov|m4v|avi|wmv)$/);
               const isDocument = lowerType === "document" || lowerName.match(/\.(pdf|doc|docx|txt|rtf|xls|xlsx|csv)$/);
               const isCaseMetadata = lowerType === "case-metadata";

               return (
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                     {isVideo ? (
                       <VideoAnalysisPanel file={activeFile} currentTime={videoCurrentTime || 0} onJump={jumpToVideoTime} />
                     ) : isAudio ? (
                       <AudioExtractionConsole file={activeFile} onJump={jumpToAudioTime} currentTime={audioCurrentTime} />
                     ) : isImage ? (
                       <ImageExtractionConsole file={activeFile} />
                     ) : isDocument ? (
                       <DocumentExtractionConsole file={activeFile} />
                     ) : null}
                 </div>
               );
           })()}
        </div>
      )}
      </>
      ) : null}

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        fileName={selectedFile?.name || ""}
      />

      <Modal 
        isOpen={isRevertModalOpen} 
        onClose={() => { setIsRevertModalOpen(false); setRevertTargetRunId(null); }} 
        title="Konfirmasi Pemulihan Versi"
        showCloseButton
      >
        <div className="p-6 space-y-6">
          <div className="flex gap-4 p-4 bg-amber-50/40 border border-amber-100 rounded-[6px] items-start">
            <RotateCcw className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Peringatan Revert Data</p>
              <p className="text-[10px] font-bold text-amber-600/90 leading-normal uppercase">
                Aksi ini akan menimpa data ekstraksi forensik aktif saat ini.
              </p>
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            Apakah Anda yakin ingin memulihkan hasil ekstraksi forensik berkas ini ke versi cadangan yang dipilih? Tindakan ini akan dicatat dalam Log Audit Eksekusi berkas.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-11 text-[10px] font-black uppercase tracking-widest" onClick={() => { setIsRevertModalOpen(false); setRevertTargetRunId(null); }}>Batal</Button>
            <Button className="flex-1 h-11 bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800" onClick={() => revertTargetRunId && handleRestoreVersion(revertTargetRunId)}>Ya, Revert</Button>
          </div>
        </div>
      </Modal>

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

            <Sheet open={isHistoryDrawerOpen} onOpenChange={setIsHistoryDrawerOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[450px] bg-white border-l border-slate-100 shadow-2xl p-6 overflow-y-auto z-[9999]">
          <SheetHeader className="pb-4 border-b border-slate-100">
            <SheetTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" /> Riwayat Proses & Versi
            </SheetTitle>
            <SheetDescription className="text-[11px] text-slate-500 font-bold leading-normal">
              Tinjau riwayat eksekusi dan pulihkan data hasil ekstraksi forensik ke versi sebelumnya.
            </SheetDescription>
          </SheetHeader>

          {historyFile && (
            <div className="mt-5 space-y-6">
              {/* File Info Card */}
              <div className="flex gap-3 p-3 bg-slate-50 border border-slate-100 rounded-[6px] items-center">
                <div className="h-10 w-10 bg-white rounded-[4px] flex items-center justify-center border shadow-sm shrink-0">
                  {getFileIcon(historyFile.type, historyFile.name)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest truncate" title={historyFile.name}>
                    {historyFile.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    Ukuran: {formatSize(historyFile.size)}
                  </p>
                </div>
              </div>

              {/* SECTION 1: RIWAYAT VERSI CADANGAN */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                  <Box className="h-3.5 w-3.5 text-indigo-500" /> Riwayat Versi Cadangan (Maks. 3)
                </h3>
                
                <div className="space-y-3">
                  {(() => {
                    const runs = getFileHistory(historyFile);
                    const successfulRuns = runs.filter((r: any) => r.status === "completed");
                    const versionHistoryPool = successfulRuns.slice(0, 3);
                    const activeRunId = getActiveRunId(historyFile);
                    const totalVersions = successfulRuns.length;

                    if (versionHistoryPool.length === 0) {
                      return (
                        <p className="text-[10px] text-slate-400 italic bg-slate-50 border border-dashed rounded-[6px] p-3 text-center">
                          Tidak ada versi cadangan yang tersedia.
                        </p>
                      );
                    }

                    return versionHistoryPool.map((run: any, idx: number) => {
                      const isActive = run.id === activeRunId;
                      const versionNum = totalVersions - idx;
                      return (
                        <div 
                          key={run.id} 
                          className={cn(
                            "p-3 rounded-[6px] border transition-all duration-200 text-left",
                            isActive 
                              ? "bg-indigo-50/30 border-indigo-100 shadow-xs" 
                              : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                                V{versionNum}
                              </span>
                              <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] border shadow-xs leading-none bg-emerald-50 text-emerald-700 border-emerald-100">
                                Done
                              </span>
                            </div>
                            
                            {isActive && (
                              <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs leading-none">
                                Versi Aktif
                              </span>
                            )}
                          </div>

                          <p className={cn("text-[9px] text-slate-400 font-bold", !isActive && "mb-2", isActive && "mt-1.5")}>
                            Eksekusi: {run.timestamp}
                          </p>

                          {/* Revert button is ONLY shown for older, non-active versions */}
                          {!isActive && (
                            <div className="mt-2.5 flex justify-end">
                              <button
                                onClick={() => {
                                  setRevertTargetRunId(run.id);
                                  setIsRevertModalOpen(true);
                                }}
                                className="flex items-center gap-1 text-[9.5px] font-bold text-slate-600 border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 hover:cursor-pointer px-3 py-1 rounded-[4px] shadow-xs transition-all duration-150 active:scale-95 leading-none"
                              >
                                <RotateCcw className="h-3 w-3" /> Revert to This Version
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <hr className="border-slate-100 my-6" />

              {/* SECTION 2: LOG AUDIT EKSEKUSI */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Log Audit Eksekusi
                </h3>

                <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6 pt-3 pb-3">
                  {(() => {
                    const runs = getFileHistory(historyFile);
                    if (runs.length === 0) {
                      return (
                        <p className="text-[9.5px] text-slate-400 italic text-left">Tidak ada log riwayat.</p>
                      );
                    }

                    return runs.map((run: any) => {
                      const isCompleted = run.status === "completed";
                      const isReverted = run.status === "reverted";
                      
                      return (
                        <div key={run.id} className="relative">
                          {/* Timeline Bullet Indicator */}
                          <div className={cn(
                            "absolute -left-[35px] top-0 w-5 h-5 rounded-full border flex items-center justify-center shadow-xs z-10",
                            isCompleted 
                              ? "bg-emerald-50/50 border-emerald-100 text-emerald-500" 
                              : isReverted 
                                ? "bg-amber-50/50 border-amber-100 text-amber-500"
                                : "bg-rose-50/50 border-rose-100 text-rose-500"
                          )}>
                            {isCompleted ? (
                              <Check className="h-2.5 w-2.5" />
                            ) : isReverted ? (
                              <RotateCcw className="h-2.5 w-2.5" />
                            ) : (
                              <X className="h-2.5 w-2.5" />
                            )}
                          </div>

                          {/* Timeline Content Item (Slightly smaller, more muted text) */}
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                                {isReverted ? "Revert Event" : `Run #${run.runIndex}`}
                              </span>
                              <span className={cn(
                                "text-[7.5px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded-[3px] border shadow-xs leading-none",
                                isCompleted 
                                  ? "bg-emerald-50/50 text-emerald-600/90 border-emerald-100/50" 
                                  : isReverted 
                                    ? "bg-amber-50/50 text-amber-600/90 border-amber-100/50"
                                    : "bg-rose-50/50 text-rose-600/90 border-rose-100/50"
                              )}>
                                {isCompleted ? "Done" : isReverted ? "Reverted" : "Failed"}
                              </span>
                            </div>

                            <p className="text-[8.5px] text-slate-400 font-bold">
                              Eksekusi: {run.timestamp}
                            </p>

                            {/* Revert Description */}
                            {isReverted && (
                              <div className="bg-amber-50/20 border border-amber-100/30 rounded-[4px] p-2 mt-1 text-[9px] text-amber-700/80 leading-normal break-words">
                                {run.description}
                              </div>
                            )}

                            {/* Error reason */}
                            {!isCompleted && !isReverted && (
                              <div className="bg-rose-50/20 border border-rose-100/30 rounded-[4px] p-2 mt-1 text-[9px] text-rose-600/80 leading-normal font-mono break-words">
                                {run.error}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

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

      <Modal
        isOpen={isPrimaryUploadModalOpen}
        onClose={() => setIsPrimaryUploadModalOpen(false)}
        title="Upload Data CCR"
        showCloseButton
      >
        <div className="p-6">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-slate-500" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest"><span className="text-[#0f62fe]">Pilih file</span> atau tarik kesini</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Multiple files didukung</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              multiple
              onChange={handlePrimaryUpload} 
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
