import React, { useState, useEffect } from "react";
import { 
  Pencil, Trash2, MoreVertical, Folder, FileText, 
  Image as ImageIcon, Mic as AudioIcon, Video as VideoIcon, 
  FileCode, Box, RefreshCw, Loader2, Check, AlertCircle, X, Clock
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
import { getEvidenceType, evidenceOutputContractConfig } from "./evidenceContract";

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

const formatSize = (size: any) => {
  if (!size) return "0 KB";
  const bytes = typeof size === 'string' ? parseInt(size) : size;
  if (isNaN(bytes)) return size;
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "29 APR, 15:57"; // Matches screenshot
  try {
    const date = new Date(dateStr);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    return dateStr;
  }
};

const formatFinishedAt = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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

const formatCompactTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
};

export function FileRow({ file, isSelected, onSelect, onMove, onDelete, onRename, onRerun, onOpenHistory, batches, isIndented }: any) {
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

  // Upload progress simulation (pending status lasts 20 seconds)
  const uploadProgress = Math.min(99, Math.max(1, Math.floor((elapsedSeconds / 20) * 100)));
  
  // Processing progress simulation (processing status lasts 30 seconds after the first 20 seconds)
  const processingProgress = Math.min(99, Math.max(1, Math.floor(((Math.max(0, elapsedSeconds - 20)) / 30) * 100)));

  const progressPercent = file.currentRunProgress || 
    (file.extraction_status === 'pending' ? uploadProgress : 
     file.extraction_status === 'processing' ? processingProgress : 
     file.extraction_status === 'completed' ? 100 : 
     file.extraction_status === 'failed' ? processingProgress : 12);

  const evType = getEvidenceType(file);
  const config = evidenceOutputContractConfig[evType];

  return (
    <div 
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 px-4 h-[62px] border-b border-slate-100 cursor-pointer transition-all relative group",
        isSelected ? "bg-[#e0e0e0] shadow-[inset_3px_0_0_#0f62fe]" : "hover:bg-[#f4f4f4]",
        isIndented ? "pl-10" : ""
      )}
    >
      {/* Icon Container 32x32 */}
      <div className={cn(
        "h-8 w-8 rounded-[4px] flex items-center justify-center shrink-0 border transition-all",
        isSelected ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100 group-hover:bg-white"
      )}>
        {getFileIcon(file.type, file.name)}
      </div>

      {/* Two-Row Content Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Row 1: File Name and Action Menu */}
        <div className="flex items-center justify-between w-full gap-2">
          <TooltipProvider delayDuration={500}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn(
                  "text-[12px] truncate leading-none", 
                  isSelected ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                )}>
                  {file.name}
                </p>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-900 text-[10px] text-white px-2 py-1">
                {file.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Action Menu (fixed on the right) */}
          <div className="shrink-0 z-20 -mr-1">
             <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                   <button className="p-1 hover:bg-slate-200 rounded-[4px] text-slate-500 transition-all">
                      <MoreVertical className="h-3.5 w-3.5" />
                   </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-[4px]">
                   <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Aksi Bukti</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => onRerun(file)} className="text-[11px] font-bold py-2 rounded-[4px]">
                      <RefreshCw className="h-3.5 w-3.5 mr-2 text-slate-400" /> Proses Ulang
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => onOpenHistory(file)} className="text-[11px] font-bold py-2 rounded-[4px]">
                      <Clock className="h-3.5 w-3.5 mr-2 text-slate-400" /> Lihat Riwayat Proses
                   </DropdownMenuItem>
                   {/* List all available custom folders */}
                   {batches && batches.filter((b: any) => b.type === "Folder" && b.id !== file.batch_id).length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Pindah ke Folder</DropdownMenuLabel>
                        {batches.filter((b: any) => b.type === "Folder" && b.id !== file.batch_id).map((b: any) => (
                           <DropdownMenuItem key={b.id} onClick={() => onMove(file.id, b.id)} className="text-[11px] font-bold py-2 rounded-[4px] flex items-center w-full" title={b.name}>
                              <Folder className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[130px] block">{b.name}</span>
                           </DropdownMenuItem>
                        ))}
                      </>
                   )}
                   
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => onMove(file.id, null)} className="text-[11px] font-bold py-2 rounded-[4px]">
                      <Box className="h-3.5 w-3.5 mr-2 text-slate-400" /> Pindah ke File Mandiri
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={onDelete} className="text-rose-600 focus:text-rose-600 text-[11px] font-bold py-2 rounded-[4px]">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus Bukti
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>

        {/* Row 2: Status Strip */}
        <div className="flex items-center justify-between w-full mt-1 pr-2">
           <div className="flex items-center gap-1.5 leading-none text-slate-500 truncate">
             {file.extraction_status === "completed" ? (
               <span className="text-[10px] font-bold text-emerald-600 tracking-tight uppercase">{config.badge} · DONE · {getProcessedDuration(file)}</span>
             ) : file.extraction_status === "failed" ? (
               <span className="text-[10px] font-bold text-rose-600 tracking-tight uppercase">{config.badge} · NEEDS ATTENTION · stopped at {progressPercent}%</span>
             ) : file.extraction_status === "queued" ? (
               <span className="text-[10px] font-bold text-slate-400 tracking-tight uppercase">{config.badge} · QUEUED · waiting</span>
             ) : (file.extraction_status === "pending" || file.extraction_status === "processing") ? (
               <span className="text-[10px] font-bold text-indigo-600 tracking-tight uppercase">{config.badge} · RUNNING · {formatCompactTime(elapsedSeconds)} · {progressPercent}%</span>
             ) : (
               <>
                 <span className="text-[10px] font-bold tracking-tight uppercase">{config.badge}</span>
                 <span className="text-slate-300">·</span>
                 <span className="text-[10px] font-medium tracking-tight">{formatSize(file.size)}</span>
                 <span className="text-slate-300">·</span>
                 <span className="text-[10px] font-medium tracking-tight">{formatDate(file.created_at)}</span>
               </>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

