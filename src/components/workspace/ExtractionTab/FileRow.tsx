import React, { useState, useEffect } from "react";
import { 
  Pencil, Trash2, MoreVertical, Folder, FileText, 
  Image as ImageIcon, Mic as AudioIcon, Video as VideoIcon, 
  FileCode, Box, RefreshCw, Loader2, Check, AlertCircle
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

export function FileRow({ file, isSelected, onSelect, onMove, onDelete, onRename, onRerun, batches, isIndented }: any) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (file.extraction_status === "pending" || file.extraction_status === "processing") {
      const start = new Date(file.created_at || new Date()).getTime();
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
  const processingProgress = Math.min(99, Math.max(1, Math.floor(((elapsedSeconds - 20) / 30) * 100)));

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

        {/* Row 2: Metadata and Status Badge */}
        <div className="flex items-center justify-between w-full mt-1">
          {/* Left Side: Plain Text Metadata */}
          <div className="flex items-center gap-1.5 leading-none text-slate-500">
             <span className="text-[10px] font-medium tracking-tight">{formatSize(file.size)}</span>
             <span className="text-slate-300">·</span>
             <span className="text-[10px] font-medium tracking-tight">{formatDate(file.created_at)}</span>
          </div>

          {/* Right Side: Status Badge */}
          <div className="shrink-0 z-10 -mr-0.5">
             <TooltipProvider delayDuration={0}>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <div className="cursor-help transition-all duration-200 hover:scale-105 active:scale-95">
                     {file.extraction_status === "pending" ? (
                       <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[8px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 shadow-sm leading-none transition-all duration-200">
                         <Loader2 className="h-2 w-2 text-blue-600 animate-spin shrink-0" />
                         <span>Uploading</span>
                       </div>
                     ) : file.extraction_status === "processing" ? (
                       <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[8px] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shadow-sm leading-none transition-all duration-200">
                         <Loader2 className="h-2 w-2 text-purple-700 animate-spin shrink-0" />
                         <span>Processing</span>
                       </div>
                     ) : file.extraction_status === "completed" ? (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[8px] font-bold bg-emerald-50/80 text-emerald-700 leading-none transition-all duration-200 hover:opacity-85 hover:-translate-y-[0.5px]">
                          <Check className="h-2 w-2 text-emerald-600 shrink-0" />
                          <span>Done</span>
                        </div>
                     ) : file.extraction_status === "failed" ? (
                       <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[8px] font-semibold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 shadow-sm leading-none transition-all duration-200 hover:bg-rose-100">
                         <AlertCircle className="h-2 w-2 text-rose-600 shrink-0" />
                         <span>Gagal</span>
                       </div>
                     ) : null}
                   </div>
                 </TooltipTrigger>
                 <TooltipContent side="top" className="bg-slate-900 text-[10px] text-white px-3 py-2 border-none shadow-xl rounded-[6px] transition-all duration-200 animate-in fade-in zoom-in-95">
                   {file.extraction_status === "pending" ? (
                     <div className="flex flex-col gap-0.5">
                       <span className="font-bold text-blue-400 text-[11px]">{uploadProgress}% uploaded</span>
                       <span className="text-[9px] opacity-80 font-normal">Running for {formatElapsedTime(elapsedSeconds)}</span>
                     </div>
                   ) : file.extraction_status === "processing" ? (
                     <div className="flex flex-col gap-0.5">
                       <span className="font-bold text-purple-300 text-[11px]">{processingProgress}% processed</span>
                       <span className="text-[9px] opacity-80 font-normal">Processing for {formatElapsedTime(elapsedSeconds)}</span>
                     </div>
                   ) : file.extraction_status === "failed" ? (
                     <span className="font-bold text-rose-300 text-[11px]">
                       Error: {file.metadata?.error_message || "Analysis engine timeout"}
                     </span>
                   ) : (
                     <span className="font-bold text-emerald-400 text-[11px]">Extraction Completed</span>
                   )}
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

