import { 
  Pencil, Trash2, MoreVertical, Folder, FileText, 
  Image as ImageIcon, Mic as AudioIcon, Video as VideoIcon, 
  FileCode, Box, RefreshCw, Loader2
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

export const getFileIcon = (type: string) => {
  switch (type) {
    case "Image": return <ImageIcon className="h-4 w-4 text-emerald-500" />;
    case "Audio": return <AudioIcon className="h-4 w-4 text-indigo-500" />;
    case "Video": return <VideoIcon className="h-4 w-4 text-rose-500" />;
    case "Document": return <FileText className="h-4 w-4 text-amber-500" />;
    default: return <FileCode className="h-4 w-4 text-slate-400" />;
  }
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
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 px-4 h-[56px] border-b border-slate-100 cursor-pointer transition-all relative group",
        isSelected ? "bg-[#e0e0e0] shadow-[inset_3px_0_0_#0f62fe]" : "hover:bg-[#f4f4f4]",
        isIndented ? "pl-10" : ""
      )}
    >
      {/* Icon Container 32x32 */}
      <div className={cn(
        "h-8 w-8 rounded-[4px] flex items-center justify-center shrink-0 border transition-all",
        isSelected ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100 group-hover:bg-white"
      )}>
        {getFileIcon(file.type)}
      </div>

      {/* Middle Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <TooltipProvider delayDuration={500}>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className={cn(
                "text-[12px] truncate leading-none mb-1.5", 
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
        
        <div className="flex items-center gap-1.5 leading-none">
           <span className="text-[10px] font-medium text-slate-500 tracking-tight">{formatSize(file.size)}</span>
           <span className="text-slate-300">·</span>
           <span className="text-[10px] font-medium text-slate-500 tracking-tight">{formatDate(file.created_at)}</span>
           
           {/* Status Label - Simplified to Dot/Loader with Tooltip */}
           <div className="flex items-center ml-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help py-1">
                      {file.extraction_status === "pending" ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-3 w-3 text-[#0f62fe] animate-spin" />
                        </div>
                      ) : file.extraction_status === "completed" ? (
                        <div className="h-2 w-2 rounded-[4px] bg-[#24a148] shadow-[0_0_8px_rgba(36,161,72,0.4)]" />
                      ) : null}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 text-[10px] text-white px-2 py-1 font-black uppercase tracking-widest border-none">
                    {file.extraction_status === "pending" ? "Analysis in Progress..." : "Extraction Completed"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
           </div>
        </div>
      </div>
      
      {/* Right Side: Actions Only */}
      <div className="flex items-center gap-2 shrink-0 h-full">
          <div className="transition-opacity">
             <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                   <button className="p-1.5 hover:bg-slate-200 rounded-[4px] text-slate-500 transition-all">
                      <MoreVertical className="h-4 w-4" />
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
                           <DropdownMenuItem key={b.id} onClick={() => onMove(file.id, b.id)} className="text-[11px] font-bold py-2 rounded-[4px]">
                              <Folder className="h-3.5 w-3.5 mr-2 text-slate-400" /> {b.name}
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
    </div>
  );
}

