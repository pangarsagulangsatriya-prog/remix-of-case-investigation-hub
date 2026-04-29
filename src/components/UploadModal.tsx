import React, { useState, useCallback, useRef, useEffect } from "react";
import * as mammoth from "mammoth";
import { toast } from "sonner";
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Mic as AudioIcon,
  Video as VideoIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileIcon,
  FolderPlus,
  FilePlus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Folders,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---- Types ----

type FileCategory = "Image" | "Audio" | "Video" | "Document" | "Unsupported";

interface UploadFileItem {
  id: string;
  file: File;
  groupId: string;
  /** path within its folder, e.g. "sub/file.jpg" — equals file.name for loose files */
  relativePath: string;
  category: FileCategory;
  previewUrl?: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
}

interface UploadGroup {
  id: string;
  name: string;
  isFolder: boolean;
  expanded: boolean;
}

export interface CompletedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  relativePath: string;
  uploadDate: string;
  status: string;
  groupId: string;
  groupName: string;
  file: File;
}

export interface CompletedGroup {
  batchId: string;
  name: string;
  isFolder: boolean;
  files: CompletedFile[];
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (groups: CompletedGroup[]) => Promise<void> | void;
}

// ---- Constants ----

const LOOSE_GROUP_ID = "__loose__";

// ---- Pure helpers ----

function categorizeFile(file: File): FileCategory {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type.startsWith("image/") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".gif") || name.endsWith(".webp")) {
    return "Image";
  }
  if (type.startsWith("audio/") || name.endsWith(".mp3") || name.endsWith(".m4a") || name.endsWith(".wav") || name.endsWith(".ogg") || name.endsWith(".aac") || name.endsWith(".flac")) {
    return "Audio";
  }
  if (type.startsWith("video/") || name.endsWith(".mp4") || name.endsWith(".mov") || name.endsWith(".avi") || name.endsWith(".webm") || name.endsWith(".mkv") || name.endsWith(".m4v") || name.endsWith(".3gp")) {
    return "Video";
  }
  
  if (
    type.includes("pdf") ||
    type.includes("word") ||
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type === "text/plain" ||
    type === "text/csv" ||
    name.endsWith(".pdf") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx") ||
    name.endsWith(".txt") ||
    name.endsWith(".csv") ||
    name.endsWith(".ppt") ||
    name.endsWith(".pptx")
  ) {
    return "Document";
  }
  return "Unsupported";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function CategoryIcon({
  category,
  className = "h-4 w-4",
}: {
  category: FileCategory;
  className?: string;
}) {
  switch (category) {
    case "Image":
      return <ImageIcon className={`${className} text-emerald-500`} />;
    case "Audio":
      return <AudioIcon className={`${className} text-amber-500`} />;
    case "Video":
      return <VideoIcon className={`${className} text-slate-600`} />;
    case "Document":
      return <FileText className={`${className} text-blue-500`} />;
    default:
      return <FileIcon className={`${className} text-slate-400`} />;
  }
}

/** Recursively read all files from a dropped FileSystemDirectoryEntry */
async function readFolderEntries(
  entry: FileSystemDirectoryEntry,
  basePath = ""
): Promise<{ file: File; relativePath: string }[]> {
  const results: { file: File; relativePath: string }[] = [];
  const reader = entry.createReader();

  // readEntries must be called until it returns an empty array
  const readBatch = (): Promise<FileSystemEntry[]> =>
    new Promise((resolve, reject) => reader.readEntries(resolve, reject));

  const allEntries: FileSystemEntry[] = [];
  let batch: FileSystemEntry[];
  do {
    batch = await readBatch();
    allEntries.push(...batch);
  } while (batch.length > 0);

  for (const child of allEntries) {
    const childPath = basePath ? `${basePath}/${child.name}` : child.name;
    if (child.isFile) {
      const file = await new Promise<File>((res, rej) =>
        (child as FileSystemFileEntry).file(res, rej)
      );
      results.push({ file, relativePath: childPath });
    } else if (child.isDirectory) {
      const nested = await readFolderEntries(
        child as FileSystemDirectoryEntry,
        childPath
      );
      results.push(...nested);
    }
  }
  return results;
}

function buildFileItem(
  file: File,
  groupId: string,
  relativePath: string
): UploadFileItem {
  const category = categorizeFile(file);
  return {
    id: Math.random().toString(36).substr(2, 9),
    file,
    groupId,
    relativePath,
    category,
    previewUrl: (category === "Image" || category === "Audio" || category === "Video" || category === "Document") ? URL.createObjectURL(file) : undefined,
    progress: 0,
    status: "idle",
    error: category === "Unsupported" ? "Unsupported file type" : undefined,
  };
}

// ---- Component ----

export function UploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [groups, setGroups] = useState<UploadGroup[]>([]);
  const [fileItems, setFileItems] = useState<UploadFileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [warningsDismissed, setWarningsDismissed] = useState(false);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [isDocxLoading, setIsDocxLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ---- DOCX Preview Logic ----
  useEffect(() => {
    const convertDocx = async () => {
      const selectedFile = fileItems.find(f => f.id === selectedFileId);
      if (selectedFile?.category === "Document" && selectedFile.file.name.toLowerCase().endsWith(".docx")) {
        setIsDocxLoading(true);
        setDocxHtml(null);
        try {
          const arrayBuffer = await selectedFile.file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(result.value);
        } catch (err) {
          console.error("DOCX conversion error:", err);
          setDocxHtml("<p class='text-rose-500 font-bold'>Gagal memproses pratinjau dokumen Word.</p>");
        } finally {
          setIsDocxLoading(false);
        }
      } else {
        setDocxHtml(null);
      }
    };

    convertDocx();
  }, [selectedFileId, fileItems]);

  // ---- Reset ----

  const resetState = useCallback(() => {
    setFileItems((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      return [];
    });
    setGroups([]);
    setSelectedFileId(null);
    setIsUploading(false);
    setWarnings([]);
    setWarningsDismissed(false);
    setDocxHtml(null);
    setIsDocxLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetState();
      onClose();
    }
  }, [isUploading, resetState, onClose]);

  // ---- Shared ingestion helper ----
  // Accepts a flat list of {file, relativePath} pairs plus group metadata.
  // Returns true if at least one valid file was added.
  const ingestBatch = useCallback(
    (
      items: { file: File; relativePath: string }[],
      groupId: string,
      newGroup?: UploadGroup,
      needsLooseGroup = false
    ): boolean => {
      const valid: UploadFileItem[] = [];
      const skipped: string[] = [];

      for (const { file, relativePath } of items) {
        const item = buildFileItem(file, groupId, relativePath);
        if (item.error) skipped.push(file.name);
        else valid.push(item);
      }

      const newWarnings: string[] = [];
      if (skipped.length > 0) {
        const preview = skipped.slice(0, 3).join(", ");
        const extra = skipped.length > 3 ? ` and ${skipped.length - 3} more` : "";
        newWarnings.push(`${skipped.length} unsupported file(s) skipped: ${preview}${extra}.`);
      }

      if (valid.length === 0) {
        if (newGroup) {
          newWarnings.push(
            `Folder "${newGroup.name}" contains no supported files and was not added.`
          );
        }
        if (newWarnings.length > 0) {
          setWarnings((prev) => [...prev, ...newWarnings]);
          setWarningsDismissed(false);
        }
        return false;
      }

      setGroups((prev) => {
        let updated = [...prev];
        if (needsLooseGroup && !updated.find((g) => g.id === LOOSE_GROUP_ID)) {
          updated.push({
            id: LOOSE_GROUP_ID,
            name: "Individual Files",
            isFolder: false,
            expanded: true,
          });
        }
        if (newGroup) updated = [...updated, newGroup];
        return updated;
      });

      setFileItems((prev) => [...prev, ...valid]);
      setSelectedFileId((prev) => prev ?? valid[0].id);

      if (newWarnings.length > 0) {
        setWarnings((prev) => [...prev, ...newWarnings]);
        setWarningsDismissed(false);
      }
      return true;
    },
    []
  );

  // ---- "Add Files" input handler ----

  const handleFilesInput = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const items = Array.from(fileList).map((f) => ({
        file: f,
        relativePath: f.name,
      }));
      ingestBatch(items, LOOSE_GROUP_ID, undefined, true);
    },
    [ingestBatch]
  );

  // ---- "Add Folder" input handler (webkitdirectory) ----

  const handleFolderInput = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const filesArr = Array.from(fileList);
      const folderName =
        filesArr[0].webkitRelativePath?.split("/")[0] || "Uploaded Folder";
      const groupId = "folder_" + Math.random().toString(36).substr(2, 6);

      const items = filesArr.map((f) => ({
        file: f,
        relativePath:
          f.webkitRelativePath?.split("/").slice(1).join("/") || f.name,
      }));

      ingestBatch(items, groupId, {
        id: groupId,
        name: folderName,
        isFolder: true,
        expanded: true,
      });

      if (folderInputRef.current) folderInputRef.current.value = "";
    },
    [ingestBatch]
  );

  // ---- Drag & drop ----

  const handleDragEvent = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    if (e.type === "dragleave") setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const { items } = e.dataTransfer;
      if (!items || items.length === 0) return;

      // Collect all processing async to batch state updates at the end
      const pendingGroups: UploadGroup[] = [];
      const pendingFiles: UploadFileItem[] = [];
      const pendingLooseFiles: UploadFileItem[] = [];
      const newWarnings: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (!entry) continue;

        if (entry.isFile) {
          const file = await new Promise<File>((res, rej) =>
            (entry as FileSystemFileEntry).file(res, rej)
          );
          const item = buildFileItem(file, LOOSE_GROUP_ID, file.name);
          if (item.error) {
            newWarnings.push(`"${file.name}" is not supported and was skipped.`);
          } else {
            pendingLooseFiles.push(item);
          }
        } else if (entry.isDirectory) {
          const folderName = entry.name;
          let contents: { file: File; relativePath: string }[] = [];
          try {
            contents = await readFolderEntries(
              entry as FileSystemDirectoryEntry
            );
          } catch {
            newWarnings.push(`Could not read folder "${folderName}".`);
            continue;
          }

          if (contents.length === 0) {
            newWarnings.push(`Folder "${folderName}" is empty and was skipped.`);
            continue;
          }

          const groupId = "folder_" + Math.random().toString(36).substr(2, 6);
          const groupItems: UploadFileItem[] = [];
          const unsupported: string[] = [];

          for (const { file, relativePath } of contents) {
            const item = buildFileItem(file, groupId, relativePath);
            if (item.error) unsupported.push(file.name);
            else groupItems.push(item);
          }

          if (unsupported.length > 0) {
            const preview = unsupported.slice(0, 3).join(", ");
            newWarnings.push(
              `${unsupported.length} unsupported file(s) in "${folderName}" skipped: ${preview}${unsupported.length > 3 ? " …" : ""}.`
            );
          }

          if (groupItems.length > 0) {
            pendingGroups.push({
              id: groupId,
              name: folderName,
              isFolder: true,
              expanded: true,
            });
            pendingFiles.push(...groupItems);
          } else {
            newWarnings.push(
              `Folder "${folderName}" has no supported files and was skipped.`
            );
          }
        }
      }

      // Single batched state update
      const hasLoose = pendingLooseFiles.length > 0;
      const allNew = [...pendingLooseFiles, ...pendingFiles];

      if (pendingGroups.length > 0 || hasLoose) {
        setGroups((prev) => {
          let updated = [...prev];
          if (hasLoose && !updated.find((g) => g.id === LOOSE_GROUP_ID)) {
            updated.push({
              id: LOOSE_GROUP_ID,
              name: "Loose Files",
              isFolder: false,
              expanded: true,
            });
          }
          return [...updated, ...pendingGroups];
        });
      }
      if (allNew.length > 0) {
        setFileItems((prev) => [...prev, ...allNew]);
        setSelectedFileId((prev) => prev ?? allNew[0].id);
      }
      if (newWarnings.length > 0) {
        setWarnings((prev) => [...prev, ...newWarnings]);
        setWarningsDismissed(false);
      }
    },
    []
  );

  // ---- Remove file / group ----

  const removeFile = useCallback(
    (id: string) => {
      setFileItems((prev) => {
        const item = prev.find((f) => f.id === id);
        if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
        return prev.filter((f) => f.id !== id);
      });
      setSelectedFileId((prev) => (prev === id ? null : prev));
    },
    []
  );

  const removeGroup = useCallback(
    (groupId: string) => {
      setFileItems((prev) => {
        prev
          .filter((f) => f.groupId === groupId)
          .forEach((f) => {
            if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
          });
        return prev.filter((f) => f.groupId !== groupId);
      });
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setSelectedFileId((prev) => {
        const stillExists = fileItems.some(
          (f) => f.id === prev && f.groupId !== groupId
        );
        return stillExists ? prev : null;
      });
    },
    [fileItems]
  );

  const toggleGroup = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, expanded: !g.expanded } : g))
    );
  }, []);

  // ---- Upload simulation ----

  const handleUpload = useCallback(async () => {
    const valid = fileItems.filter((f) => !f.error);
    if (valid.length === 0) return;

    setIsUploading(true);
    setFileItems((prev) => prev.map((f) => !f.error ? { ...f, status: "uploading", progress: 50 } : f));

    const today = new Date().toISOString().split("T")[0];
    const completed: CompletedGroup[] = groups
      .map((group) => ({
        batchId: group.id,
        name: group.name,
        isFolder: group.isFolder,
        files: valid
          .filter((f) => f.groupId === group.id)
          .map((f) => ({
            id: "F-" + Math.random().toString(36).substr(2, 6),
            name: f.file.name,
            type: f.category,
            size: formatBytes(f.file.size),
            relativePath: f.relativePath,
            uploadDate: today,
            status: "UPLOADED",
            groupId: group.id,
            groupName: group.name,
            file: f.file,
          })),
      }))
      .filter((g) => g.files.length > 0);

    try {
      // Trigger background processing non-blockingly
      onUploadComplete(completed);
      
      setFileItems((prev) => prev.map((f) => !f.error ? { ...f, status: "success", progress: 100 } : f));
      
      // Close instantly
      setIsUploading(false);
      resetState();
      onClose();
      
      toast.success(`Ingestion started for ${valid.length} objects.`);
    } catch (err: any) {
      setIsUploading(false);
      setWarnings([err?.message || "Upload failed"]);
      setFileItems((prev) => prev.map((f) => !f.error ? { ...f, status: "error", progress: 0, error: err?.message || "Upload failed" } : f));
    }
  }, [fileItems, groups, onUploadComplete, resetState, onClose]);

  // ---- Derived values ----

  const totalValid = fileItems.filter((f) => !f.error).length;
  const totalBytes = fileItems
    .filter((f) => !f.error)
    .reduce((s, f) => s + f.file.size, 0);
  const overallProgress =
    totalValid > 0
      ? fileItems
          .filter((f) => !f.error)
          .reduce((s, f) => s + f.progress, 0) / totalValid
      : 0;

  const selectedFile = fileItems.find((f) => f.id === selectedFileId);
  const isEmpty = groups.length === 0;

  if (!isOpen) return null;

  // ---- Render ----

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[680px] border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* ---- Header ---- */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-900 rounded-[4px] flex items-center justify-center shadow-sm">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-widest">
                Upload Bukti
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-slate-200 rounded-[2px] transition-colors disabled:opacity-40"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* ---- Hidden file inputs ---- */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx"
          onChange={(e) => {
            handleFilesInput(e.target.files);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
        {/* webkitdirectory lets the user pick a whole folder */}
        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          // @ts-ignore — non-standard but broadly supported
          webkitdirectory=""
          multiple
          onChange={(e) => {
            handleFolderInput(e.target.files);
          }}
        />

        {/* ---- Warnings banner ---- */}
        {warnings.length > 0 && !warningsDismissed && (
          <div className="px-5 py-2 bg-amber-50 border-b border-amber-200 flex items-start gap-2 shrink-0">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-0.5">
              {warnings.slice(0, 3).map((w, i) => (
                <p key={i} className="text-xs font-medium text-amber-700">
                  {w}
                </p>
              ))}
              {warnings.length > 3 && (
                <p className="text-xs font-medium text-amber-600">
                  +{warnings.length - 3} more warning(s)
                </p>
              )}
            </div>
            <button
              onClick={() => setWarningsDismissed(true)}
              className="text-amber-400 hover:text-amber-600 p-0.5 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ---- Main content ---- */}
        {isEmpty ? (
          /* Empty drop-zone */
          <div
            className="flex-1 flex flex-col items-center justify-center p-8"
            onDragEnter={handleDragEvent}
            onDragLeave={handleDragEvent}
            onDragOver={handleDragEvent}
            onDrop={handleDrop}
          >
            <div
              className={`w-full max-w-lg flex flex-col items-center justify-center p-14 border-2 border-dashed rounded-[2px] transition-all duration-200
                ${
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-slate-200 bg-slate-50/40"
                }`}
            >
              <div className="h-16 w-16 bg-white border border-slate-200 rounded-[2px] flex items-center justify-center mb-5 shadow-sm">
                <Folders className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-1.5">
                {isDragActive ? "Lepaskan untuk menambahkan" : "Seret file atau folder ke sini"}
              </h3>
              <p className="text-xs text-slate-400 font-medium text-center mb-8 max-w-xs leading-relaxed">
                Gambar · Dokumen · Audio · Video
                <br />
                Folder dibaca secara rekursif dan dikelompokkan otomatis
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-10 px-6 text-xs font-bold border-slate-200 rounded-[2px] hover:border-primary/50 hover:text-primary hover:bg-primary/5 gap-2 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FilePlus className="h-4 w-4" />
                  Tambah File
                </Button>
                <Button
                  variant="outline"
                  className="h-10 px-6 text-xs font-bold border-slate-200 rounded-[2px] hover:border-primary/50 hover:text-primary hover:bg-primary/5 gap-2 transition-all"
                  onClick={() => folderInputRef.current?.click()}
                >
                  <FolderPlus className="h-4 w-4" />
                  Tambah Folder
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Split pane: file list + preview */
          <div className="flex-1 flex overflow-hidden">
            {/* ---- Left: grouped file list ---- */}
            <div className="w-[320px] min-w-[240px] flex flex-col border-r bg-white overflow-hidden shrink-0">
              <div className="flex-1 overflow-auto custom-scrollbar">
                {/* 1. Loose Files First (Flattened) */}
                {fileItems.filter(f => f.groupId === LOOSE_GROUP_ID).map((fileObj) => (
                  <div
                    key={fileObj.id}
                    onClick={() => !fileObj.error && setSelectedFileId(fileObj.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2 border-b border-slate-50 transition-all group/frow relative cursor-pointer",
                      fileObj.error ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50",
                      selectedFileId === fileObj.id ? "bg-slate-100 border-l-[3px] border-l-slate-900" : "border-l-[3px] border-l-transparent"
                    )}
                  >
                    <div className="h-7 w-7 rounded-sm bg-slate-50 border flex items-center justify-center shrink-0 overflow-hidden">
                      {fileObj.category === "Image" && fileObj.previewUrl ? (
                        <img src={fileObj.previewUrl} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <CategoryIcon category={fileObj.category} className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{fileObj.file.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fileObj.category}</span>
                        <span className="text-[9px] text-slate-300">·</span>
                        <span className="text-[9px] text-slate-400 font-medium">{formatBytes(fileObj.file.size)}</span>
                      </div>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(fileObj.id); }}
                        className="p-1 hover:bg-rose-50 rounded-sm opacity-0 group-hover/frow:opacity-100 transition-all text-slate-300 hover:text-rose-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}

                {/* 2. Folders */}
                {groups.filter(g => g.id !== LOOSE_GROUP_ID).map((group) => {
                  const gFiles = fileItems.filter((f) => f.groupId === group.id);
                  const validFiles = gFiles.filter((f) => !f.error);
                  const groupBytes = validFiles.reduce((s, f) => s + f.file.size, 0);
                  const groupProgress = validFiles.length > 0 ? validFiles.reduce((s, f) => s + f.progress, 0) / validFiles.length : 0;

                  return (
                    <div key={group.id} className="border-b last:border-b-0 bg-white">
                      {/* Group header */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 border-b border-slate-100 group/ghdr">
                        <button
                          onClick={() => toggleGroup(group.id)}
                          className="p-0.5 hover:bg-slate-200 rounded-sm transition-colors shrink-0"
                        >
                          {group.expanded ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                        </button>
                        <Folders className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight flex-1 truncate">{group.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 mr-2">{validFiles.length}</span>
                        {!isUploading && (
                          <button
                            onClick={() => removeGroup(group.id)}
                            className="p-1 hover:bg-rose-50 rounded-sm opacity-0 group-hover/ghdr:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {group.expanded &&
                        gFiles.map((fileObj) => (
                          <div
                            key={fileObj.id}
                            onClick={() => !fileObj.error && setSelectedFileId(fileObj.id)}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-1.5 pl-8 border-b border-slate-50 transition-all group/frow cursor-pointer",
                              selectedFileId === fileObj.id ? "bg-slate-50 border-l-[3px] border-l-slate-400" : "border-l-[3px] border-l-transparent hover:bg-slate-50/50"
                            )}
                          >
                             <div className="h-6 w-6 rounded-sm bg-slate-50 border flex items-center justify-center shrink-0 overflow-hidden">
                                {fileObj.category === "Image" && fileObj.previewUrl ? (
                                  <img src={fileObj.previewUrl} className="h-full w-full object-cover" alt="" />
                                ) : (
                                  <CategoryIcon category={fileObj.category} className="h-3 w-3" />
                                )}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-[10px] font-medium text-slate-700 truncate leading-tight">{fileObj.file.name}</p>
                               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{formatBytes(fileObj.file.size)}</span>
                             </div>
                             {!isUploading && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeFile(fileObj.id); }}
                                  className="p-1 hover:bg-rose-50 rounded-sm opacity-0 group-hover/frow:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                             )}
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>

              {/* Add more buttons */}
              {!isUploading && (
                <div className="p-2 border-t bg-slate-50 flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-[10px] font-bold bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-sm transition-all shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                    Add Files
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-[10px] font-bold bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-sm transition-all shadow-sm"
                    onClick={() => folderInputRef.current?.click()}
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    Add Folder
                  </Button>
                </div>
              )}
            </div>

            {/* ---- Right: preview ---- */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {selectedFile ? (
                <>
                  {/* Preview header */}
                  <div className="h-10 border-b flex items-center gap-2 px-4 bg-slate-50/50 shrink-0">
                    <CategoryIcon
                      category={selectedFile.category}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate flex-1">
                      {selectedFile.file.name}
                    </span>
                    <span className="text-[9px] font-medium text-slate-300 shrink-0">
                      {formatBytes(selectedFile.file.size)}
                    </span>
                  </div>

                    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 bg-slate-50/20 custom-scrollbar">
                      {/* Media preview area */}
                      <div className="aspect-video bg-[#0c121e] rounded-[4px] overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center relative group/prev">
                         <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/prev:opacity-100 transition-opacity">
                            <div className="px-2 py-1 bg-slate-900/80 backdrop-blur rounded-[2px] text-[9px] font-bold text-white uppercase tracking-widest border border-white/10">
                               Forensic Preview
                            </div>
                         </div>
                        {selectedFile.category === "Image" && selectedFile.previewUrl ? (
                          <img src={selectedFile.previewUrl} className="h-full w-full object-contain" alt="" />
                        ) : selectedFile.category === "Audio" ? (
                          <div className="flex flex-col items-center gap-5 text-white w-full px-8">
                            <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                              <AudioIcon className="h-7 w-7 text-amber-400" />
                            </div>
                            <audio controls src={selectedFile.previewUrl} className="w-full max-w-sm" />
                          </div>
                        ) : selectedFile.category === "Video" ? (
                          <video src={selectedFile.previewUrl} controls className="h-full w-full object-contain" />
                        ) : selectedFile.category === "Document" && selectedFile.file.name.toLowerCase().endsWith(".docx") ? (
                           <div className="h-full w-full bg-white overflow-auto p-8 custom-scrollbar">
                              {isDocxLoading ? (
                                 <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menyiapkan Pratinjau...</p>
                                 </div>
                              ) : (
                                 <div 
                                    className="prose prose-sm max-w-none text-slate-900"
                                    dangerouslySetInnerHTML={{ __html: docxHtml || "" }} 
                                 />
                              )}
                           </div>
                        ) : selectedFile.category === "Document" && selectedFile.file.type === "application/pdf" ? (
                          <iframe src={selectedFile.previewUrl} className="h-full w-full border-none bg-white" title="PDF Preview" />
                        ) : selectedFile.category === "Document" && selectedFile.file.type === "text/plain" ? (
                           <iframe src={selectedFile.previewUrl} className="h-full w-full border-none bg-white font-mono text-[10px] p-4" title="Text Preview" />
                        ) : (
                          <div className="flex flex-col items-center gap-4 text-white">
                            <div className="h-16 w-16 bg-white/5 rounded-[4px] flex items-center justify-center border border-white/10">
                              <CategoryIcon category={selectedFile.category} className="h-8 w-8 opacity-80" />
                            </div>
                            <div className="text-center">
                              <p className="text-[11px] font-black uppercase tracking-widest text-white/90 mb-1">{selectedFile.category}</p>
                              <p className="text-[9px] font-medium text-white/40 uppercase tracking-tight">Enterprise Document Preview</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Metadata grid */}
                      <div className="grid grid-cols-2 gap-6 bg-white p-4 rounded-[4px] border border-slate-100 shadow-sm">
                        {[
                          { label: "NAMA FILE", value: selectedFile.file.name },
                          { label: "MODALITAS", value: selectedFile.category },
                          { label: "UKURAN", value: formatBytes(selectedFile.file.size) },
                          { label: "PATH ASAL", value: selectedFile.relativePath },
                        ].map(({ label, value }) => (
                          <div key={label} className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block">
                              {label}
                            </span>
                            <span className="text-[11px] font-bold text-slate-800 truncate block tracking-tight">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>


                  </div>
                </>
              ) : (
                /* No file selected — also acts as a drop target */
                <div
                  className="flex-1 flex flex-col items-center justify-center p-8"
                  onDragEnter={handleDragEvent}
                  onDragLeave={handleDragEvent}
                  onDragOver={handleDragEvent}
                  onDrop={handleDrop}
                >
                  <div
                    className={`p-10 border-2 border-dashed rounded-2xl transition-all text-center w-full max-w-xs
                      ${isDragActive ? "border-primary bg-primary/5" : "border-slate-100"}`}
                  >
                    <FileIcon className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      {isDragActive
                        ? "Release to add"
                        : "Select a file to preview"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- Footer ---- */}
        <div className="px-6 py-4 border-t bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {!isEmpty && (
              <>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{totalValid} BUKTI</span>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{formatBytes(totalBytes)} Payload</span>
                </div>
                {isUploading && (
                  <div className="flex items-center gap-3 ml-4 flex-1 max-w-[200px]">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 tabular-nums shrink-0">
                      {overallProgress.toFixed(0)}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="ghost"
                className="h-9 px-6 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-[4px]"
              onClick={handleClose}
              disabled={isUploading}
            >
              {isEmpty ? "Close" : "Discard"}
            </Button>
            {!isEmpty && (
              <Button
                className={cn(
                  "h-10 px-8 text-[11px] font-black bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] transition-all active:scale-[0.98] gap-2 uppercase tracking-[0.15em] shadow-lg shadow-slate-200",
                  isUploading ? "opacity-80" : ""
                )}
                onClick={handleUpload}
                disabled={isUploading || totalValid === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Memproses…
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    MULAI PROSES
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
