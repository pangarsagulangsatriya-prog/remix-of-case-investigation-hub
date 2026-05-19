// BUILD_VERSION: 2026-05-19 — Premium Architectural Interactive Upload Center + Tutorial Video Modals
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Upload, FileText, Image as ImageIcon, Mic as AudioIcon, 
  Video as VideoIcon, Trash2, CheckCircle2, Loader2, Play, Pause, 
  ChevronRight, ChevronLeft, Check, Folder, Info, Clock, Database, 
  Cpu, Plus, FolderPlus, FilePlus, Folders, X, AlertCircle, FileSearch,
  PlayCircle
} from "lucide-react";
import { useCreateCase } from "@/hooks/useCases";
import { useUploadEvidence, getFallbackMimeType } from "@/hooks/useEvidence";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UploadModal, CompletedGroup } from "@/components/UploadModal";

// ---- Types ----
type StagedFile = {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "document" | "unknown";
  sizeLabel: string;
  sizeBytes: number;
  status: "READY" | "UPLOADING" | "FAILED";
  rawFile: File;
  uploadedAt: string;
  folderPath?: string; // Optional folder directory grouping
};

function getGoogleDriveFileId(input: string): string | null {
  if (!input) return null;

  const filePathMatch = input.match(/\/file\/d\/([^/]+)/);
  if (filePathMatch?.[1]) return filePathMatch[1];

  const openIdMatch = input.match(/[?&]id=([^&]+)/);
  if (openIdMatch?.[1]) return openIdMatch[1];

  if (/^[a-zA-Z0-9_-]{20,}$/.test(input)) return input;

  return null;
}

function toGoogleDrivePreviewUrl(input: string): string | null {
  const fileId = getGoogleDriveFileId(input);
  if (!fileId) return null;

  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function getTutorialEmbedUrl(input: string): string {
  if (!input) {
    // Default high-quality public OSINT/investigation tutorial video
    return "https://www.youtube.com/embed/9GbVAMf-t-I";
  }

  const fileId = getGoogleDriveFileId(input);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // If it's already a YouTube URL, convert it to embed format if needed
  if (input.includes("youtube.com/watch?v=")) {
    const videoId = input.split("v=")[1]?.split("&")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  } else if (input.includes("youtu.be/")) {
    const videoId = input.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  return input;
}

// Helper to recursively read all files from dropped entry (lifted to page scope)
async function readFileSystemEntries(item: FileSystemEntry, path = ""): Promise<{ file: File; relativePath: string }[]> {
  if (item.isFile) {
    const file = await new Promise<File>((res, rej) => (item as FileSystemFileEntry).file(res, rej));
    return [{ file, relativePath: path ? `${path}/${item.name}` : item.name }];
  } else if (item.isDirectory) {
    const reader = (item as FileSystemDirectoryEntry).createReader();
    const entries: FileSystemEntry[] = [];
    let batch: FileSystemEntry[];
    
    const readBatch = (): Promise<FileSystemEntry[]> =>
      new Promise((res, rej) => reader.readEntries(res, rej));
    
    do {
      batch = await readBatch();
      entries.push(...batch);
    } while (batch.length > 0);

    const nextPath = path ? `${path}/${item.name}` : item.name;
    const results = await Promise.all(entries.map(e => readFileSystemEntries(e, nextPath)));
    return results.flat();
  }
  return [];
}

export default function CreateCasePage() {
  const navigate = useNavigate();
  const createCaseMutation = useCreateCase();
  const uploadEvidenceMutation = useUploadEvidence();

  // State
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [caseName, setCaseName] = useState("");
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Drag and drop state for the main center panel dropzone
  const [isDragOverCenter, setIsDragOverCenter] = useState(false);

  // Creation Loading State
  const [isCreating, setIsCreating] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Default User Role for shortcut & visibility testing (can be customized)
  const [currentUserRole, setCurrentUserRole] = useState<string>("admin"); // "admin", "dev", "user"
  const isAdminOrDev = currentUserRole === "admin" || currentUserRole === "dev";

  // Persistent Tutorial Config loaded from local storage
  const [tutorialUrl, setTutorialUrl] = useState(() => {
    return localStorage.getItem("create_case_upload_tutorial_url") || "";
  });

  // Modal / Dialog Toggles
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);

  // Auto-suggest Case Title based on first staged file name
  useEffect(() => {
    if (isTitleManuallyEdited) return;

    if (stagedFiles.length === 0) {
      setCaseName("");
    } else if (stagedFiles.length === 1) {
      const fileName = stagedFiles[0].name;
      const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      const cleanName = baseName.replace(/[_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setCaseName(`Investigasi: ${cleanName}`);
    } else {
      const today = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      setCaseName(`Kasus Multi-Bukti – ${today}`);
    }
  }, [stagedFiles, isTitleManuallyEdited]);

  // Elapsed timer during creation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCreating) {
      const start = Date.now();
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isCreating]);

  // Keyboard shortcut listener (Ctrl + Alt + T) to edit the tutorial link
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Catch Ctrl + Alt + T
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        if (isAdminOrDev) {
          setIsLinkEditorOpen(true);
        } else {
          console.warn("Hidden edit shortcut blocked: current user is not an admin/dev.");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdminOrDev]);

  // Auto-select first staged file
  useEffect(() => {
    if (stagedFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(stagedFiles[0].id);
    }
  }, [stagedFiles, selectedFileId]);

  const activeStagedFile = stagedFiles.find(f => f.id === selectedFileId);

  const handleRemoveFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStagedFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (selectedFileId === id) {
        setSelectedFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleDirectCreateAndUpload = async (
    rawFiles: { file: File; folderPath?: string }[],
    customMetadata?: { title: string; site: string }
  ) => {
    if (rawFiles.length === 0) return;

    try {
      setIsCreating(true);
      setCreateProgress(5);
      setActiveStep(0);

      // Determine case title based on uploaded files or customMetadata
      let calculatedCaseTitle = customMetadata?.title || "";
      if (!calculatedCaseTitle) {
        if (rawFiles.length === 1) {
          const fileName = rawFiles[0].file.name;
          const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
          const cleanName = baseName.replace(/[_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          calculatedCaseTitle = `Investigasi: ${cleanName}`;
        } else {
          const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
          calculatedCaseTitle = `Kasus Multi-Bukti – ${today}`;
        }
      }

      // Create unique case number
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const caseNumber = `CS-${year}-${randomSuffix}`;

      // Progress animation simulation
      const advanceProgress = (targetVal: number, duration: number) => {
        return new Promise<void>((resolve) => {
          const stepTime = Math.max(10, Math.floor(duration / 10));
          const interval = setInterval(() => {
            setCreateProgress(prev => {
              const next = prev + 5;
              if (next >= targetVal) {
                clearInterval(interval);
                resolve();
                return targetVal;
              }
              return next;
            });
          }, stepTime);
        });
      };

      await advanceProgress(20, 200);
      setActiveStep(1); // Attaching evidence...

      // 1. Create case
      const siteText = customMetadata?.site ? `[Site: ${customMetadata.site}] ` : "";
      const caseResult = await createCaseMutation.mutateAsync({
        title: calculatedCaseTitle,
        description: `${siteText}Case initialized with early evidence payload.`,
        severity: "Critical",
        status: "open",
        case_number: caseNumber
      });

      await advanceProgress(60, 300);
      setActiveStep(2); // Preparing Evidence Review...

      // 2. Prepare groups (loose files vs folders)
      const folderMap = new Map<string, { file: File; relativePath: string }[]>();
      const looseFiles: { file: File; relativePath: string }[] = [];

      rawFiles.forEach(item => {
        if (item.folderPath) {
          const folderName = item.folderPath.split('/')[0] || "Staged Folder";
          if (!folderMap.has(folderName)) {
            folderMap.set(folderName, []);
          }
          folderMap.get(folderName)!.push({
            file: item.file,
            relativePath: item.file.name
          });
        } else {
          looseFiles.push({
            file: item.file,
            relativePath: item.file.name
          });
        }
      });

      const groups: any[] = [];

      // Add folders
      folderMap.forEach((files, folderName) => {
        groups.push({
          name: folderName,
          isFolder: true,
          files: files.map(item => {
            let category = "Document";
            const name = item.file.name.toLowerCase();
            if (name.match(/\.(mp4|webm|ogg|mov|avi)$/)) category = "Video";
            else if (name.match(/\.(jpg|jpeg|png|gif|webp)$/)) category = "Image";
            else if (name.match(/\.(mp3|wav|ogg|m4a|aac)$/)) category = "Audio";

            return {
              file: item.file,
              category,
              relativePath: item.relativePath
            };
          })
        });
      });

      // Add loose files under intake batch if any
      if (looseFiles.length > 0) {
        groups.push({
          name: "Intake Staging",
          isFolder: false,
          files: looseFiles.map(item => {
            let category = "Document";
            const name = item.file.name.toLowerCase();
            if (name.match(/\.(mp4|webm|ogg|mov|avi)$/)) category = "Video";
            else if (name.match(/\.(jpg|jpeg|png|gif|webp)$/)) category = "Image";
            else if (name.match(/\.(mp3|wav|ogg|m4a|aac)$/)) category = "Audio";

            return {
              file: item.file,
              category,
              relativePath: item.relativePath
            };
          })
        });
      }

      // 3. Upload staged files
      await uploadEvidenceMutation.mutateAsync({
        caseId: caseResult.id,
        groups
      });

      await advanceProgress(90, 200);
      setActiveStep(3); // Opening workspace...

      await advanceProgress(100, 100);

      toast.success("Workspace initialized successfully");
      navigate(`/cases/${caseResult.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize workspace");
      setIsCreating(false);
    }
  };

  const mapFilesToStagedFiles = (files: { file: File; folderPath?: string }[]): StagedFile[] => {
    return files.map(item => {
      let category: "video" | "image" | "audio" | "document" | "unknown" = "document";
      const name = item.file.name.toLowerCase();
      if (name.match(/\.(mp4|webm|ogg|mov|avi)$/)) category = "video";
      else if (name.match(/\.(jpg|jpeg|png|gif|webp)$/)) category = "image";
      else if (name.match(/\.(mp3|wav|ogg|m4a|aac)$/)) category = "audio";

      const bytes = item.file.size;
      let sizeLabel = bytes + " B";
      if (bytes >= 1024 * 1024) sizeLabel = (bytes / (1024 * 1024)).toFixed(1) + " MB";
      else if (bytes >= 1024) sizeLabel = (bytes / 1024).toFixed(1) + " KB";

      return {
        id: "F-" + Math.random().toString(36).substr(2, 6),
        name: item.file.name,
        type: category,
        sizeLabel,
        sizeBytes: bytes,
        status: "READY",
        rawFile: item.file,
        uploadedAt: new Date().toISOString().split("T")[0],
        folderPath: item.folderPath
      };
    });
  };

  const handleUploadModalComplete = async (
    groups: CompletedGroup[],
    caseMetadata?: { title: string; site: string }
  ) => {
    const filesToStage: { file: File; folderPath?: string }[] = [];
    
    groups.forEach(group => {
      group.files.forEach(fileItem => {
        let folderPath: string | undefined = undefined;
        if (group.isFolder) {
          const pathParts = fileItem.relativePath.split("/");
          if (pathParts.length > 1) {
            folderPath = `${group.name}/${pathParts.slice(0, -1).join("/")}`;
          } else {
            folderPath = group.name;
          }
        }
        filesToStage.push({
          file: fileItem.file,
          folderPath
        });
      });
    });

    if (filesToStage.length > 0) {
      // Close the upload modal immediately so the main page's progress loader is fully visible
      setIsUploadModalOpen(false);
      // Directly trigger creation process to avoid double action, passing custom caseMetadata
      await handleDirectCreateAndUpload(filesToStage, caseMetadata);
    }
  };

  const handleCreateWorkspace = () => {
    if (stagedFiles.length === 0) return;
    const filesToUpload = stagedFiles.map(f => ({
      file: f.rawFile,
      folderPath: f.folderPath
    }));
    handleDirectCreateAndUpload(filesToUpload);
  };

  // Center Dropzone drag and drop event listeners
  const handleCenterDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCenter(true);
  };

  const handleCenterDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCenter(false);
  };

  const handleCenterDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCenter(false);

    const { items } = e.dataTransfer;
    if (!items || items.length === 0) return;

    const fileEntries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      if (entry) fileEntries.push(entry);
    }

    try {
      const allFiles = await Promise.all(fileEntries.map(entry => readFileSystemEntries(entry)));
      const flatFiles = allFiles.flat();

      if (flatFiles.length > 0) {
        const formattedFiles = flatFiles.map(item => {
          const pathParts = item.relativePath.split("/");
          const folderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : undefined;
          return {
            file: item.file,
            folderPath
          };
        });
        const newStaged = mapFilesToStagedFiles(formattedFiles);
        setStagedFiles(prev => [...prev, ...newStaged]);
        toast.success(`Berhasil menambahkan ${newStaged.length} bukti dari drop area ke antrean draf.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse dropped files");
    }
  };

  // Callback to update tutorial url config from dialog
  const handleSaveTutorialUrl = (newUrl: string) => {
    localStorage.setItem("create_case_upload_tutorial_url", newUrl);
    setTutorialUrl(newUrl);
  };

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50/10">
        
        {/* TOP HEADER */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/cases')}
              className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 text-slate-500 border border-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div>
              <div className="flex items-center gap-2 py-1 px-1.5 -ml-1.5">
                <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2 leading-none uppercase">
                  Create New Case
                </h1>
                <span className="text-slate-400 font-mono text-sm leading-none ml-1">#Draft-Workspace</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
               variant="ghost" 
               size="sm" 
               className="text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider" 
               onClick={() => navigate("/cases")}
             >
               Discard
             </Button>
             <Button 
               size="sm" 
               className={cn(
                 "h-9 font-bold px-6 text-xs gap-2 transition-all duration-300 uppercase tracking-wider rounded-[4px] shadow-sm border",
                 stagedFiles.length > 0 
                   ? "bg-slate-900 text-white hover:bg-slate-800 border-slate-950" 
                   : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
               )}
               disabled={stagedFiles.length === 0 || isCreating}
               onClick={handleCreateWorkspace}
             >
                {isCreating ? "CREATING..." : stagedFiles.length === 0 ? "UPLOAD EVIDENCE FIRST" : "CREATE WORKSPACE"}
             </Button>
          </div>
        </div>

        {/* ACTIVE EVIDENCE REVIEW TAB (Mirroring CaseWorkspacePage) */}
        <div className="bg-white border-b h-12 flex items-center justify-between px-6 shrink-0 relative z-20">
          <div className="flex gap-1 h-full items-center">
            {["Evidence Review", "Analysis", "Reports", "Review", "Audit Trail"].map((tab) => (
              <div
                key={tab}
                className={cn(
                  "h-full px-5 text-xs font-bold transition-all relative flex items-center select-none cursor-default",
                  tab === "Evidence Review" ? "text-primary bg-primary/5" : "text-slate-355/40 opacity-40"
                )}
              >
                {tab}
                {tab === "Evidence Review" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 border-l pl-6 border-slate-100">
                <Clock className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-[10px] font-bold text-slate-355 uppercase tracking-widest">
                  Drafting Case
                </span>
             </div>
          </div>
        </div>

        {/* THREE PANEL GRID LAYOUT */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* LEFT PANEL: Evidence Intake */}
          <div className="w-[320px] border-r border-slate-200 bg-white flex flex-col shrink-0 z-10 shadow-[1px_0_10px_rgba(0,0,0,0.015)]">
            <div className="px-5 border-b border-slate-150/70 flex items-center justify-between shrink-0 h-14">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] leading-none">Evidence Intake</span>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="text-[9.5px] font-black text-slate-800 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-[4px] bg-slate-50 uppercase tracking-wider flex items-center gap-1 transition-all duration-200 shadow-3xs"
              >
                <Plus className="h-3 w-3" /> Tambah
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              {stagedFiles.length > 0 ? (
                <div className="space-y-1.5">
                  {stagedFiles.map((file) => {
                    const Icon = file.type === 'video' ? VideoIcon : file.type === 'image' ? ImageIcon : file.type === 'audio' ? AudioIcon : FileText;
                    const isSelected = file.id === selectedFileId;
                    
                    return (
                      <div 
                        key={file.id} 
                        onClick={() => setSelectedFileId(file.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-[4px] border text-left cursor-pointer transition-all animate-in fade-in slide-in-from-bottom-1 duration-200",
                          isSelected 
                            ? "border-slate-300 bg-slate-50/50 shadow-2xs" 
                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/20"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "h-8 w-8 rounded-[4px] flex items-center justify-center shrink-0 border",
                            isSelected ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-slate-50 border-slate-100 text-slate-500"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-800 truncate block max-w-[150px]">{file.name}</span>
                              <span className={cn(
                                "text-[7px] font-black px-1 rounded-[2px] uppercase tracking-wider",
                                file.type === 'video' ? "bg-slate-100 text-slate-700" : file.type === 'audio' ? "bg-amber-50 text-amber-700 border border-amber-100" : file.type === 'image' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                              )}>
                                {file.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              <span>{file.sizeLabel}</span>
                              <span>·</span>
                              <span className="text-slate-500 font-black">{file.status}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={(e) => handleRemoveFile(file.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[4px] transition-all shrink-0 ml-2"
                          title="Remove evidence"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ARCHITECTURAL REPOSITORY SCAFFOLD PREVIEW */
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  
                  {/* Multimodal Intake Header Box with elevated visual structure */}
                  <div className="border border-slate-200/70 rounded-[4px] p-4 bg-slate-50/50 flex items-start gap-3.5 shadow-3xs">
                    <div className="h-8 w-8 rounded-[4px] bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <Folders className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide block leading-none mb-1">
                        Multimodal intake
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold block leading-relaxed">
                        File and folder upload supported.
                      </span>
                    </div>
                  </div>

                  {/* Elegant Ghost Folder Tree with crisp Guide Lines */}
                  <div className="space-y-2.5 border-l border-slate-200/80 pl-4 ml-3.5 relative">
                    {[
                      { name: "Raw Video", icon: VideoIcon },
                      { name: "Raw Audio", icon: AudioIcon },
                      { name: "Documents", icon: FileText },
                      { name: "Images", icon: ImageIcon }
                    ].map((ghost, index) => (
                      <div 
                        key={ghost.name} 
                        className="flex items-center justify-between p-2.5 rounded-[3px] border border-slate-100 bg-white select-none cursor-default relative shadow-3xs"
                        style={{ opacity: 0.55 - index * 0.08 }}
                      >
                        {/* Guide branch line tick */}
                        <div className="absolute left-[-17px] top-[17px] w-2.5 h-px bg-slate-200/80" />
                        
                        <div className="flex items-center gap-2">
                          <Folder className="h-3 w-3 text-slate-350 shrink-0" />
                          <span className="text-[9.5px] font-bold text-slate-600 tracking-wide">{ghost.name}</span>
                        </div>
                        <span className="h-3.5 px-1.5 bg-slate-50 border border-slate-150 text-slate-400 rounded-[2px] text-[7.5px] font-mono leading-none flex items-center justify-center">
                          0
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tiny Outlined Chips legend at bottom */}
                  <div className="pt-4 border-t border-slate-150/60 grid grid-cols-2 gap-1.5">
                    {["VIDEO", "IMAGE", "AUDIO", "DOCUMENT"].map((type) => (
                      <span 
                        key={type} 
                        className="text-[7.5px] font-black tracking-widest py-1.5 rounded-[2px] bg-white text-slate-400 border border-slate-200 uppercase text-center select-none shadow-3xs"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER PANEL: Staged Workspace Canvas */}
          <div className="flex-1 overflow-auto bg-[#fafbfc] p-6 flex flex-col items-center custom-scrollbar relative" style={{ minWidth: 0 }}>
            
            {/* Very light blueprint-like vertical drafting guide lines across composition */}
            <div 
              className="absolute inset-0 z-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px'
              }}
            />

            <div className="w-full max-w-5xl flex flex-col h-full relative z-10">
              
              {/* Strong vertical separator & alignment with TutorialVideoButton on the right */}
              <div className="flex items-center justify-between mb-4 h-10 px-1 border-b border-slate-200/60 pb-3 shrink-0">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-[0.2em] leading-none">EVIDENCE WORKSPACE DRAFT</span>
                
                {/* Reusable Tutorial Video Button */}
                <TutorialVideoButton 
                  onClick={() => setIsTutorialModalOpen(true)} 
                />
              </div>

              {/* Dynamic Center Canvas */}
              {stagedFiles.length > 0 && activeStagedFile ? (
                <div className="flex-1 flex flex-col gap-6 bg-white border border-slate-250 rounded-[4px] p-6 shadow-xs min-h-0 overflow-y-auto custom-scrollbar relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* File Metadata Header */}
                  <div className="flex items-start justify-between border-b pb-4 shrink-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded-[2px] uppercase tracking-wider text-white shadow-2xs",
                          activeStagedFile.type === 'video' ? "bg-slate-900" : activeStagedFile.type === 'audio' ? "bg-amber-600" : activeStagedFile.type === 'image' ? "bg-emerald-600" : "bg-blue-600"
                        )}>
                          {activeStagedFile.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeStagedFile.sizeLabel}</span>
                      </div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">{activeStagedFile.name}</h3>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-700 bg-slate-50 border border-slate-200 rounded-[2px] px-2 py-0.5 tracking-wider uppercase block">Staged Ready</span>
                      <span className="text-[9.5px] text-slate-400 font-bold block mt-1 uppercase tracking-tighter">Intake: {activeStagedFile.uploadedAt}</span>
                    </div>
                  </div>

                  {/* PREVIEWS */}
                  <div className="flex-1 min-h-[240px] bg-slate-50 rounded-[4px] border border-slate-200/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    
                    {/* VIDEO PREVIEW */}
                    {activeStagedFile.type === 'video' && (
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="flex-1 bg-slate-950 rounded-[4px] flex items-center justify-center relative group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                          <div className="absolute top-3 left-3 font-mono text-[9px] text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                            <span>REC · DRAFT VIDEO PLAYBACK</span>
                          </div>
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:scale-105 hover:bg-white/30 transition-all shadow-lg"
                          >
                            {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                          </button>
                        </div>
                        <div className="h-10 mt-3 bg-slate-900 border border-slate-800 rounded-[4px] flex items-center justify-between px-3 text-[9px] font-mono text-slate-450">
                          <span className="text-slate-400">00:00:00</span>
                          <div className="flex-1 mx-4 h-1 bg-slate-850 rounded relative">
                            <div className="absolute top-0 left-0 h-full bg-slate-500 rounded w-[35%]" />
                          </div>
                          <span>00:04:12</span>
                        </div>
                      </div>
                    )}

                    {/* AUDIO PREVIEW */}
                    {activeStagedFile.type === 'audio' && (
                      <div className="w-full h-full flex flex-col justify-between p-2">
                        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[4px] flex items-center justify-center gap-0.5 p-6 relative">
                          <div className="absolute top-3 left-3 font-mono text-[9px] text-amber-500 uppercase tracking-widest">
                            AUDIO WAVEFORM PREVIEW
                          </div>
                          {[15, 30, 20, 45, 60, 25, 40, 75, 90, 40, 55, 30, 20, 45, 65, 80, 50, 20, 35, 10].map((h, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-1.5 rounded-full transition-all duration-300",
                                isPlaying ? "bg-amber-500" : "bg-slate-700"
                              )} 
                              style={{ 
                                height: `${h}%`,
                                animation: isPlaying ? `pulse 1.2s ease-in-out infinite alternate ${i * 0.05}s` : 'none'
                              }} 
                            />
                          ))}
                        </div>
                        <div className="h-10 mt-3 bg-white border border-slate-200 rounded-[4px] flex items-center justify-between px-3 text-[9px] font-mono text-slate-500 shadow-2xs">
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="flex items-center gap-1.5 text-slate-800 hover:text-slate-900 font-bold"
                          >
                            {isPlaying ? <Pause className="h-3 w-3 fill-slate-800" /> : <Play className="h-3 w-3 fill-slate-800" />} PLAY DISPATCH LOG
                          </button>
                        </div>
                      </div>
                    )}

                    {/* IMAGE PREVIEW */}
                    {activeStagedFile.type === 'image' && (
                      <div className="w-full h-full flex items-center justify-center p-2 bg-slate-900 rounded-[4px] overflow-hidden border border-slate-800 relative">
                        <img 
                          src={URL.createObjectURL(activeStagedFile.rawFile)} 
                          className="max-h-full max-w-full object-contain rounded-[4px]" 
                          alt="Image Staged Preview" 
                        />
                      </div>
                    )}

                    {/* DOCUMENT PREVIEW */}
                    {activeStagedFile.type === 'document' && (
                      <div className="w-full h-full flex flex-col bg-white border rounded-[4px] shadow-2xs p-4 text-left justify-between overflow-hidden">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-[9px] font-black text-slate-455 uppercase tracking-widest flex items-center gap-1.5">
                              <FileText className="h-3 w-3" /> Staged Document Layout
                            </span>
                            <span className="text-[8px] font-mono text-slate-400">PDF / DOCX SOURCE</span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 w-32 bg-slate-200 rounded-[2px]" />
                            <div className="h-1.5 w-full bg-slate-100 rounded-[2px]" />
                            <div className="h-1.5 w-5/6 bg-slate-100 rounded-[2px]" />
                          </div>
                        </div>
                        <span className="text-[8.5px] text-slate-450 uppercase tracking-wider block border-t pt-2 mt-2 leading-none text-center">
                          Document reader prepared successfully
                        </span>
                      </div>
                    )}

                    {/* UNKNOWN PREVIEW */}
                    {activeStagedFile.type === 'unknown' && (
                      <div className="text-center p-6 space-y-2">
                        <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-700">PRATINJAU TIDAK TERSEDIA</h4>
                        <span className="text-[9px] text-slate-455 block">Ekstraksi parser akan memproses berkas ini secara umum.</span>
                      </div>
                    )}

                  </div>

                  {/* Single Case Name Input */}
                  <div className="border-t border-slate-100 pt-5 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Case Name</label>
                    <Input 
                      className="h-9 text-xs border-slate-250 bg-slate-50/50 focus:bg-white transition-all font-bold text-slate-800 rounded-[4px]" 
                      placeholder="Auto-generated from evidence" 
                      value={caseName}
                      onChange={(e) => {
                        setCaseName(e.target.value);
                        setIsTitleManuallyEdited(true);
                      }}
                    />
                    <span className="text-[9px] text-slate-400 font-semibold mt-1 block">You can rename this later.</span>
                  </div>

                </div>
              ) : (
                /* HIGHLY INTERACTIVE DOUBLE-FRAMED DRAFTING UPLOAD ZONE (MAIN HERO VIEW) */
                <div 
                  className="flex-1 bg-white border border-slate-200 rounded-[4px] p-4 flex flex-col shadow-sm min-h-[380px] overflow-hidden relative"
                >
                  
                  {/* Subtle technical corner marks */}
                  <div className="absolute top-6 left-6 h-2 w-2 border-t border-l border-slate-350 pointer-events-none" />
                  <div className="absolute top-6 right-6 h-2 w-2 border-t border-r border-slate-350 pointer-events-none" />
                  <div className="absolute bottom-6 left-6 h-2 w-2 border-b border-l border-slate-350 pointer-events-none" />
                  <div className="absolute bottom-6 right-6 h-2 w-2 border-b border-r border-slate-350 pointer-events-none" />

                  {/* Inner dashed boundary frame with soft background tint & active drop listeners */}
                  <div 
                    onClick={() => setIsUploadModalOpen(true)}
                    onDragOver={handleCenterDragOver}
                    onDragEnter={handleCenterDragOver}
                    onDragLeave={handleCenterDragLeave}
                    onDrop={handleCenterDrop}
                    className={cn(
                      "flex-1 border border-dashed rounded-[4px] flex flex-col items-center justify-center p-8 text-center cursor-pointer relative group shadow-inner select-none transition-all duration-205 outline-none focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2",
                      isDragOverCenter 
                        ? "border-emerald-500/80 bg-emerald-50/5 scale-[0.99] shadow-[inset_0_0_12px_rgba(16,185,129,0.04)]" 
                        : "border-slate-200/90 hover:border-slate-400 bg-slate-50/20 hover:bg-slate-50/30"
                    )}
                  >
                    {/* Technical alignment guidelines crosshair overlay */}
                    <div className="absolute inset-x-8 top-1/2 h-px bg-slate-200/20 pointer-events-none" />
                    <div className="absolute inset-y-8 left-1/2 w-px bg-slate-200/20 pointer-events-none" />

                    {/* Architectural Grid inside the dropzone */}
                    <div 
                      className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgb(148, 163, 184) 1px, transparent 1px),
                          linear-gradient(to bottom, rgb(148, 163, 184) 1px, transparent 1px)
                        `,
                        backgroundSize: '16px 16px'
                      }}
                    />

                    {/* Premium upload icon block inside small elevated tile */}
                    <div className={cn(
                      "h-12 w-12 rounded-[4px] bg-white border border-slate-200 shadow-2xs flex items-center justify-center mb-5 relative z-10 transition-all duration-200",
                      isDragOverCenter 
                        ? "border-emerald-250 bg-emerald-50/10 scale-105 text-emerald-600" 
                        : "group-hover:-translate-y-0.5 group-hover:scale-102 group-hover:shadow-xs text-slate-500"
                    )}>
                       <Upload className={cn("h-5 w-5 transition-transform duration-300", isDragOverCenter && "animate-pulse")} />
                    </div>
                    
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-1.5 relative z-10 leading-none transition-all duration-200">
                      {isDragOverCenter ? "Drop files to add evidence" : "Upload evidence to begin"}
                    </h3>
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest max-w-[360px] leading-relaxed mb-6 relative z-10 transition-all duration-200">
                      {isDragOverCenter ? "Release your mouse button to stage files." : "Drag a file or folder here, or add it manually."}
                    </p>

                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUploadModalOpen(true);
                      }}
                      className="h-10 px-9 bg-slate-900 hover:bg-slate-800 font-bold text-xs uppercase tracking-wider text-white rounded-[4px] shadow-sm relative z-10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      + Tambah Evidence
                    </Button>

                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-3 relative z-10 select-none opacity-80 hover:opacity-100 transition-opacity">
                      atau seret file ke area ini
                    </span>
                    
                    <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-[0.15em] mt-5 block relative z-10">
                      Video, image, audio, and document supported.
                    </span>

                    <span className="text-[8.5px] text-slate-350/80 font-bold uppercase tracking-wide mt-2 block relative z-10">
                      Preview appears here before the workspace is created.
                    </span>
                  </div>

                  {/* Subtle footer microcopy */}
                  <div className="h-8 border-t border-slate-100/70 flex items-center justify-between px-3 text-[9px] font-bold text-slate-400/90 tracking-wide uppercase select-none">
                    <span>Forensic workspace draft</span>
                    <span>Details can be completed later.</span>
                  </div>

                </div>
              )}

            </div>

            {/* INLINE CENTER LOADING TRANSITION STATE */}
            {isCreating && (
              <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-2xs z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-full max-w-sm bg-white rounded-[4px] shadow-lg p-8 border border-slate-250 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                  
                  <div className="relative h-12 w-12 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-100 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-slate-900 animate-spin" />
                    <Database className="h-5 w-5 text-slate-900" />
                  </div>

                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider mb-1">Creating workspace</h3>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest mb-6">
                    {createProgress}% · 00:{elapsedSeconds.toString().padStart(2, '0')}
                  </p>

                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-6 border">
                    <div 
                      className="h-full bg-slate-800 transition-all duration-300 rounded-full" 
                      style={{ width: `${createProgress}%` }} 
                    />
                  </div>

                  {/* Checklist of steps */}
                  <div className="w-full text-left space-y-2 bg-slate-50 p-3 rounded-[2px] border border-slate-150 text-[9px] font-black text-slate-455 uppercase tracking-wider">
                    {[
                      { id: 0, label: "Creating case" },
                      { id: 1, label: "Attaching evidence" },
                      { id: 2, label: "Opening Evidence Review" }
                    ].map((step) => {
                      const isDone = activeStep > step.id;
                      const isActive = activeStep === step.id;
                      return (
                        <div key={step.id} className="flex items-center gap-2.5">
                          <div className={cn(
                            "h-3.5 w-3.5 rounded-full flex items-center justify-center border shrink-0",
                            isDone ? "bg-slate-900 border-slate-900 text-white" : isActive ? "border-slate-800 bg-white" : "border-slate-200"
                          )}>
                            {isDone ? <Check className="h-1.5 w-1.5 text-white" /> : isActive ? <Loader2 className="h-1.5 w-1.5 text-slate-800 animate-spin" /> : null}
                          </div>
                          <span className={cn(
                            isDone ? "text-slate-700" : isActive ? "text-slate-900" : "text-slate-355"
                          )}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Expected Output Schema */}
          <div className="w-[320px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-[-1px_0_10px_rgba(0,0,0,0.015)] overflow-hidden">
            <div className="px-5 border-b border-slate-150/70 flex items-center justify-between shrink-0 h-14">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] leading-none">Expected Review Output</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              
              {!activeStagedFile ? (
                /* REFINED STRUCTURAL GHOST ANALYSIS MODULES */
                <div className="space-y-5 text-left animate-in fade-in duration-300">
                  
                  {/* Top Empty State card with soft elevation */}
                  <div className="border border-slate-200/70 rounded-[4px] p-4 bg-slate-50/50 flex items-start gap-3.5 shadow-3xs">
                    <div className="h-8 w-8 rounded-[4px] bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileSearch className="h-4 w-4 text-slate-650" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-850 uppercase tracking-wide block leading-none mb-1">
                        Ready after evidence is added
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold block leading-relaxed">
                        Review output appears here.
                      </span>
                    </div>
                  </div>

                  {/* 3 Ghost output groups modeled as premium structural modules */}
                  <div className="space-y-3.5">
                    {[
                      { 
                        num: "01",
                        title: "Preview", 
                        chips: ["File Preview", "Metadata"] 
                      },
                      { 
                        num: "02",
                        title: "Extraction", 
                        chips: ["Transcript", "Key Moments", "Visual Notes"] 
                      },
                      { 
                        num: "03",
                        title: "Review", 
                        chips: ["Findings", "Timeline", "Source Links"] 
                      }
                    ].map((group, index) => (
                      <div 
                        key={group.title} 
                        className="p-3.5 border border-slate-150/70 rounded-[4px] bg-white shadow-3xs select-none cursor-default relative overflow-hidden"
                        style={{ opacity: 0.85 - index * 0.15 }}
                      >
                        {/* Number aligned top-right nicely */}
                        <span className="absolute top-2.5 right-3 text-[10px] font-mono font-black text-slate-200">
                          {group.num}
                        </span>

                        <h5 className="text-[9px] font-black text-slate-455 uppercase tracking-[0.15em] mb-2.5 leading-none">
                          {group.title}
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {group.chips.map(chip => (
                            <span 
                              key={chip} 
                              className="text-[7.5px] font-bold px-2 py-0.5 rounded-[2px] bg-slate-50/50 text-slate-500 border border-slate-200/60 uppercase tracking-wide"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                  
                  <div className="bg-slate-50 border border-slate-200/60 rounded-[4px] p-3.5 mb-2 shadow-3xs">
                    <span className="text-[10.5px] font-black text-slate-700 block leading-tight uppercase tracking-wider mb-1">
                      Matched {activeStagedFile.type} outputs
                    </span>
                    <span className="text-[9px] text-slate-455 font-bold block leading-normal">
                      Active review modules based on file type.
                    </span>
                  </div>

                  {/* 3 Compact Chips */}
                  <div className="space-y-2">
                    {activeStagedFile.type === "video" && ["Sequence Blocks", "Key Moments", "Timeline Notes"].map((chip) => (
                      <div key={chip} className="flex items-center gap-2 p-2.5 rounded-[4px] border border-slate-100 bg-white shadow-3xs text-[10px] font-bold text-slate-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-550 shrink-0" />
                        <span>{chip}</span>
                      </div>
                    ))}

                    {activeStagedFile.type === "audio" && ["Transcript", "Speaker Turns", "Time References"].map((chip) => (
                      <div key={chip} className="flex items-center gap-2 p-2.5 rounded-[4px] border border-slate-100 bg-white shadow-3xs text-[10px] font-bold text-slate-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-550 shrink-0" />
                        <span>{chip}</span>
                      </div>
                    ))}

                    {activeStagedFile.type === "image" && ["Visual Notes", "Marked Areas", "Quality Check"].map((chip) => (
                      <div key={chip} className="flex items-center gap-2 p-2.5 rounded-[4px] border border-slate-100 bg-white shadow-3xs text-[10px] font-bold text-slate-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-550 shrink-0" />
                        <span>{chip}</span>
                      </div>
                    ))}

                    {activeStagedFile.type === "document" && ["Summary", "Key Sections", "Page References"].map((chip) => (
                      <div key={chip} className="flex items-center gap-2 p-2.5 rounded-[4px] border border-slate-100 bg-white shadow-3xs text-[10px] font-bold text-slate-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-550 shrink-0" />
                        <span>{chip}</span>
                      </div>
                    ))}

                    {activeStagedFile.type === "unknown" && ["Source Data", "Raw Metadata", "Forensic File Log"].map((chip) => (
                      <div key={chip} className="flex items-center gap-2 p-2.5 rounded-[4px] border border-slate-100 bg-white shadow-3xs text-[10px] font-bold text-slate-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-550 shrink-0" />
                        <span>{chip}</span>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* ALIGNED FORENSIC UPLOAD MODAL */}
        <UploadModal 
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={handleUploadModalComplete}
          submitButtonLabel="CREATE CASE"
          isCreateCaseMode={true}
        />

        {/* CUSTOM TUTORIAL VIDEO MODAL */}
        <TutorialVideoModal
          isOpen={isTutorialModalOpen}
          onClose={() => setIsTutorialModalOpen(false)}
          tutorialUrl={tutorialUrl}
        />

        {/* HIDDEN TUTORIAL LINK CONFIG EDITOR DIALOG */}
        <TutorialLinkEditorDialog
          isOpen={isLinkEditorOpen}
          onClose={() => setIsLinkEditorOpen(false)}
          tutorialUrl={tutorialUrl}
          onSave={handleSaveTutorialUrl}
        />

      </div>
    </AppLayout>
  );
}

// ---- TUTORIAL VIDEO BUTTON COMPONENT ----
interface TutorialButtonProps {
  onClick: () => void;
}

function TutorialVideoButton({ onClick }: TutorialButtonProps) {
  return (
    <button
      id="tutorial-video-button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="h-8 px-3.5 rounded-[4px] border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#334155] text-xs font-bold transition-all duration-150 flex items-center gap-1.5 shadow-3xs uppercase tracking-wider"
      title="Putar Tutorial Unggah Bukti"
    >
      <PlayCircle className="h-3.5 w-3.5" />
      <span>Tutorial</span>
    </button>
  );
}

// ---- TUTORIAL VIDEO MODAL COMPONENT ----
interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialUrl: string;
}

function TutorialVideoModal({ isOpen, onClose, tutorialUrl }: TutorialVideoModalProps) {
  if (!isOpen) return null;

  const previewUrl = getTutorialEmbedUrl(tutorialUrl);

  return (
    <div id="tutorial-video-modal" className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-98 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
              <PlayCircle className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest">
              Upload Evidence Tutorial
            </h3>
          </div>
          <button
            id="tutorial-video-close-button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Area (16:9 aspect ratio) */}
        <div className="p-6 bg-slate-100 flex items-center justify-center">
          {previewUrl ? (
            <iframe
              id="tutorial-video-iframe"
              src={previewUrl}
              className="w-full aspect-video rounded-xl border border-slate-200 bg-slate-950 shadow-md"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="w-full aspect-video rounded-xl border border-slate-200 bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-slate-400 shadow-md">
              <AlertCircle className="h-10 w-10 text-rose-500 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Tutorial video belum bisa ditampilkan.
              </h4>
              <p className="text-[11px] font-medium text-slate-400 max-w-[360px] leading-relaxed">
                Pastikan link Google Drive dapat diakses dan diatur ke sharing permission "Anyone with the link can view".
              </p>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div className="px-6 py-3.5 border-t bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
            Tutorial ini membantu proses upload file dan folder.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200/60 rounded-[4px]"
          >
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}

// ---- HIDDEN TUTORIAL LINK CONFIG EDITOR DIALOG ----
interface LinkEditorProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialUrl: string;
  onSave: (newUrl: string) => void;
}

function TutorialLinkEditorDialog({ isOpen, onClose, tutorialUrl, onSave }: LinkEditorProps) {
  const [inputValue, setInputValue] = useState(tutorialUrl);
  const [testPreviewUrl, setTestPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(tutorialUrl);
      setTestPreviewUrl(null);
    }
  }, [isOpen, tutorialUrl]);

  if (!isOpen) return null;

  const generatedPreview = toGoogleDrivePreviewUrl(inputValue);

  const handleSave = () => {
    if (inputValue.trim() && !generatedPreview) {
      toast.error("Use a valid Google Drive video link.");
      return;
    }
    onSave(inputValue.trim());
    toast.success("Tutorial link updated successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-98 duration-150">
        
        <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Cpu className="h-4 w-4 text-slate-700" />
            <span className="text-xs font-black uppercase tracking-wider">Edit Tutorial Link (Admin)</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-[4px]">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-left">
          
          <div className="space-y-1.5">
            <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Google Drive URL / File ID</label>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
              className="text-xs font-bold border-slate-250 text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Generated Preview URL</label>
            <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-150 font-mono text-[10px] text-slate-500 break-all select-all">
              {generatedPreview || <span className="text-rose-500 font-bold font-sans uppercase">Invalid Google Drive Link</span>}
            </div>
          </div>

          {testPreviewUrl && (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-950 p-1">
              <iframe
                src={testPreviewUrl}
                className="w-full aspect-video rounded-md"
                allow="autoplay"
              />
            </div>
          )}

        </div>

        <div className="px-5 py-3 border-t bg-slate-50 flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            disabled={!generatedPreview}
            onClick={() => setTestPreviewUrl(generatedPreview)}
            className="text-[10px] font-bold border-slate-200 uppercase"
          >
            Test Preview
          </Button>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-[10px] font-bold uppercase text-slate-500"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 text-white"
            >
              Save
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}


