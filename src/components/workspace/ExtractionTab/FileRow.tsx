import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Pencil, Trash2, MoreVertical, Folder, FileText, 
  Image as ImageIcon, Mic as AudioIcon, Video as VideoIcon, 
  FileCode, Box, RefreshCw, Loader2, Check, AlertCircle, X, Clock, AlertTriangle, Database, User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


export const getFileIcon = (type: string, name: string = "") => {
  const lowerType = type?.toLowerCase();
  const lowerName = name?.toLowerCase();

  const isImage = lowerType === "image" || lowerName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
  const isAudio = lowerType === "audio" || lowerName.match(/\.(mp3|wav|ogg|m4a|aac)$/);
  const isVideo = lowerType === "video" || lowerName.match(/\.(mp4|webm|ogg|mov|m4v|avi|wmv)$/);
  const isDocument = lowerType === "document" || lowerName.match(/\.(pdf|doc|docx|txt|rtf|xls|xlsx|csv)$/);

  if (isImage) return <ImageIcon className="h-4 w-4 text-emerald-500" />;
  if (isAudio) return <AudioIcon className="h-4 w-4 text-indigo-500" />;
  if (isVideo) return <VideoIcon className="h-4 w-4 text-rose-500" />;
  if (isDocument) return <FileText className="h-4 w-4 text-amber-500" />;
  
  return <FileCode className="h-4 w-4 text-slate-400" />;
};

const getFileType = (type: string, name: string = "") => {
  const lowerType = type?.toLowerCase();
  const lowerName = name?.toLowerCase();

  if (lowerType === "image" || lowerName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
     if (lowerName.match(/\.jpg|\.jpeg$/)) return "JPEG Image";
     if (lowerName.match(/\.png$/)) return "PNG Image";
     return "Image File";
  }
  if (lowerType === "audio" || lowerName.match(/\.(mp3|wav|ogg|m4a|aac)$/)) return "Audio Recording";
  if (lowerType === "video" || lowerName.match(/\.(mp4|webm|ogg|mov|m4v|avi|wmv)$/)) {
     if (lowerName.match(/\.mp4$/)) return "MP4 Video";
     return "Video File";
  }
  if (lowerType === "document" || lowerName.match(/\.(pdf|doc|docx|txt|rtf|xls|xlsx|csv)$/)) {
     if (lowerName.match(/\.pdf$/)) return "PDF Document";
     return "Document";
  }
  return "Unknown File";
};

const formatSize = (size: any) => {
  if (!size) return "0 KB";
  const bytes = typeof size === 'string' ? parseInt(size) : size;
  if (isNaN(bytes)) return size;
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "14 Okt 2023, 17:00";
  try {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    return dateStr;
  }
};

const formatFinishedAt = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    return "19 May, 00:12";
  }
};

const getProcessedDuration = (file: any) => {
  const totalSeconds = Math.max(12, (file.size % 50) + 15);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export function FileRow({ file, isSelected, onSelect, onMove, onDelete, onRename, onRerun, onOpenHistory, batches, isIndented, onHoverChange }: any) {
  const { caseId } = useParams<{ caseId: string }>();
  const isAnalysisActive = localStorage.getItem(`analysis_running_${caseId}`) === "true";
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFailedHovered, setIsFailedHovered] = useState(false);

  useEffect(() => {
    if (file.extraction_status === "pending" || file.extraction_status === "processing") {
      const start = new Date(file.updated_at || file.created_at || new Date()).getTime();
      const updateTimer = () => {
        const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
        setElapsedSeconds(diff);
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [file.extraction_status, file.created_at]);

  const formatElapsedTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Upload progress simulation
  const uploadProgress = Math.min(99, Math.max(1, Math.floor((elapsedSeconds / 20) * 100)));
  const processingProgress = Math.min(99, Math.max(1, Math.floor(((elapsedSeconds - 20) / 30) * 100)));

  return (
    <div 
      onClick={onSelect}
      onMouseEnter={() => onHoverChange && onHoverChange(file)}
      onMouseLeave={() => onHoverChange && onHoverChange(null)}
      className={cn(
        "grid grid-cols-[minmax(250px,_1fr)_150px_160px_140px_130px_60px] gap-4 items-center px-4 py-1.5 min-h-[40px] border-b border-slate-200 cursor-pointer transition-all relative group bg-white",
        isSelected ? "bg-slate-50/70 shadow-[inset_3px_0_0_#0f62fe]" : "hover:bg-slate-50/50"
      )}
    >
      {/* Col 1: Name and Icon */}
      <div className={cn("flex items-center gap-3 min-w-0", isIndented ? "pl-8" : "")}>
        <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
          {getFileIcon(file.type, file.name)}
        </div>
        <div className="min-w-0 flex-1">
          <TooltipProvider delayDuration={500}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-[12px] font-medium text-slate-800 truncate leading-none mb-0.5">
                  {file.name}
                </p>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-900 text-[10px] text-white px-2 py-1">
                {file.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isSelected && (
            <div className="text-[10px] font-medium text-slate-500 flex items-center gap-2">
              <span>{formatSize(file.size)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Col 2: Type */}
      <div className="text-[11px] text-slate-500 font-medium truncate">
        {getFileType(file.type, file.name)}
      </div>

      {/* Col 2.5: Uploader */}
      <div className="flex items-center gap-2 truncate">
        {file.batch_id === "UTAMA" ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex w-fit items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 cursor-help border-b-dashed border-b-slate-400">
                  <Database className="h-3 w-3 text-slate-500" />
                  Data CCR
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[250px] p-3 text-xs leading-relaxed bg-white text-slate-700 border-slate-200 shadow-md">
                <p><strong>CCR (Central Control Room)</strong> adalah pusat kendali operasi. Data ini otomatis disinkronisasi dari sistem _dispatch_ pusat dan dianggap valid sebagai bukti utama investigasi.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <div className="h-5 w-5 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-50">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=RudiHeryanto&backgroundColor=f8fafc" alt="Rudi Heryanto" className="h-full w-full object-cover" />
            </div>
            <span className="truncate font-semibold">Rudi Heryanto</span>
          </div>
        )}
      </div>

      {/* Col 3: Date */}
      <div className="text-[11px] text-slate-500 font-medium">
        {formatDate(file.created_at)}
      </div>

      {/* Col 4: Status AI */}
      <div id="tour-step-5-status" className="flex items-center shrink-0">
         <TooltipProvider delayDuration={0}>
           <Tooltip>
             <TooltipTrigger asChild>
                <div className="cursor-help">
                  {(!file.extraction_status || file.extraction_status === "unprocessed" || file.extraction_status === "waiting") ? (
                    <div className="flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                      Menunggu
                    </div>
                  ) : file.extraction_status === "pending" ? (
                    <div className="flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[9px] font-bold text-blue-600">
                      <Loader2 className="h-2 w-2 animate-spin" />
                      Uploading
                    </div>
                  ) : file.extraction_status === "processing" ? (
                    <div className="flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-[9px] font-bold text-purple-700">
                      <Loader2 className="h-2 w-2 animate-spin" />
                      Menganalisis
                    </div>
                  ) : file.extraction_status === "completed" ? (
                    <div className="flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[9px] font-bold text-emerald-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                      Teranalisis
                    </div>
                  ) : file.extraction_status === "failed" ? (
                    <div 
                      onClick={(e) => { e.stopPropagation(); onRerun(file); }}
                      onMouseEnter={() => setIsFailedHovered(true)}
                      onMouseLeave={() => setIsFailedHovered(false)}
                      className="flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[9px] font-bold text-rose-700 cursor-pointer hover:bg-rose-100"
                    >
                      {isFailedHovered ? <RefreshCw className="h-2 w-2 animate-spin-once" /> : <AlertTriangle className="h-2 w-2" />}
                      {isFailedHovered ? "Coba Lagi" : "Error Analisis"}
                    </div>
                  ) : null}
                </div>
             </TooltipTrigger>
             <TooltipContent side="top" className="bg-white border border-slate-200 shadow-md rounded-[6px] px-3 py-2 text-[10px] text-slate-700">
                {file.extraction_status === "pending" ? (
                  <div className="flex flex-col gap-0.5 text-left min-w-[120px]">
                    <span className="font-semibold text-blue-600 text-[11px]">{uploadProgress}% uploaded</span>
                    <span className="text-[9px] text-slate-400 font-normal">Running for {formatElapsedTime(elapsedSeconds)}</span>
                  </div>
                ) : file.extraction_status === "processing" ? (
                  <div className="flex flex-col gap-0.5 text-left min-w-[120px]">
                    <span className="font-semibold text-purple-600 text-[11px]">{processingProgress}% processed</span>
                    <span className="text-[9px] text-slate-400 font-normal">Processing for {formatElapsedTime(elapsedSeconds)}</span>
                  </div>
                ) : file.extraction_status === "completed" ? (
                  <div className="flex flex-col gap-0.5 text-left min-w-[120px]">
                    <span className="font-semibold text-emerald-600 text-[11px] flex items-center gap-1">✓ Extraction Completed</span>
                    <span className="text-[10px] text-slate-700 font-medium">Processed in {getProcessedDuration(file)}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-normal">Finished at: {formatFinishedAt(file.updated_at || file.created_at)}</span>
                  </div>
                ) : file.extraction_status === "failed" ? (
                  <div className="flex flex-col gap-0.5 text-left min-w-[150px]">
                    <span className="font-semibold text-rose-600 text-[11px] flex items-center gap-1">✕ Processing Failed</span>
                    <span className="text-[10px] text-slate-700 font-medium max-w-[180px] break-words">Reason: {file.metadata?.error_message || "Analysis engine timeout"}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-normal">Finished at: {formatFinishedAt(file.updated_at || file.created_at)}</span>
                    <div className="my-1.5 border-t border-slate-100" />
                    <span className="text-[9.5px] text-slate-500 font-medium flex items-center gap-1 leading-normal"><span>💡</span> Click this badge to retry processing.</span>
                  </div>
                ) : null}
             </TooltipContent>
           </Tooltip>
         </TooltipProvider>
      </div>

      {/* Col 5: Actions */}
      <div className="flex items-center justify-center shrink-0">
         <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
               <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-all">
                  <MoreVertical className="h-4 w-4" />
               </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-[6px]">
               <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Aksi Bukti</DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => onRerun(file)} className="text-[11px] font-bold py-2 rounded-[4px]">
                  <RefreshCw className="h-3.5 w-3.5 mr-2 text-slate-400" /> Proses Ulang
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => onOpenHistory(file)} className="text-[11px] font-bold py-2 rounded-[4px]">
                  <Clock className="h-3.5 w-3.5 mr-2 text-slate-400" /> Lihat Riwayat
               </DropdownMenuItem>
               {file.batch_id !== "UTAMA" && batches && batches.filter((b: any) => b.type === "Folder" && b.id !== file.batch_id).length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Pindah ke Folder</DropdownMenuLabel>
                    {batches.filter((b: any) => b.type === "Folder" && b.id !== file.batch_id).map((b: any) => (
                       <DropdownMenuItem key={b.id} onClick={() => onMove(file.id, b.id)} className="text-[11px] font-bold py-2 rounded-[4px] flex items-center w-full">
                          <Folder className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px] block">{b.name}</span>
                       </DropdownMenuItem>
                    ))}
                  </>
               )}
               {file.batch_id !== "UTAMA" && (
                 <>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => onMove(file.id, null)} className="text-[11px] font-bold py-2 rounded-[4px]">
                      <Box className="h-3.5 w-3.5 mr-2 text-slate-400" /> Pindah ke File Mandiri
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={(e) => {
                         const isAnalysisActive = localStorage.getItem(`analysis_running_${caseId}`) === "true";
                         if (isAnalysisActive) {
                           e.preventDefault();
                           e.stopPropagation();
                           toast.warning("File tidak dapat dihapus karena analisis AI sedang berjalan.");
                           return;
                         }
                         if (file.extraction_status === "pending" || file.extraction_status === "processing") {
                           e.preventDefault();
                           e.stopPropagation();
                           toast.warning(`File "${file.name}" sedang diproses dan tidak dapat dihapus.`);
                           return;
                         }
                         onDelete();
                       }} 
                       className={cn(
                         "text-rose-600 focus:text-rose-600 text-[11px] font-bold py-2 rounded-[4px]",
                         (file.extraction_status === "pending" || file.extraction_status === "processing" || isAnalysisActive) && "text-slate-400 focus:text-slate-400 opacity-60"
                       )}>
                       <Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus Bukti
                    </DropdownMenuItem>
                 </>
               )}
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
    </div>
  );
}

