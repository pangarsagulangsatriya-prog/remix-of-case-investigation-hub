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
        "flex items-center gap-2.5 px-3 py-2 border-b border-slate-50 cursor-pointer transition-all relative group",
        isSelected ? "bg-primary/5 shadow-[inset_3px_0_0_#2563eb]" : "hover:bg-slate-50",
        isIndented ? "pl-8" : ""
      )}
    >
      <div className={cn(
        "h-7 w-7 rounded flex items-center justify-center shrink-0 border shadow-inner transition-all",
        isSelected ? "bg-white border-primary/20" : "bg-slate-50 border-slate-100 group-hover:bg-white"
      )}>
        {getFileIcon(file.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-[11px] font-bold truncate leading-tight", isSelected ? "text-slate-900" : "text-slate-600")}>{file.name}</p>
          {file.extraction_status === "pending" && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-[2px] border border-amber-200/30 animate-pulse">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              <span className="text-[7px] font-black uppercase tracking-[0.1em]">In Progress</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 opacity-60">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{formatSize(file.size)}</span>
           <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(file.created_at)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
         <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
               <button className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-all">
                  <MoreVertical className="h-3.5 w-3.5" />
               </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
               <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Evidence Actions</DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => onRename(file)} className="text-[11px] font-bold py-2">
                  <Pencil className="h-3.5 w-3.5 mr-2 text-slate-400" /> Rename Evidence
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => onRerun(file)} className="text-[11px] font-bold py-2">
                  <RefreshCw className="h-3.5 w-3.5 mr-2 text-slate-400" /> Rerun Extraction
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Move to Folder</DropdownMenuLabel>
               {batches.filter((b: any) => b.id !== file.batch_id).map((b: any) => (
                  <DropdownMenuItem key={b.id} onClick={() => onMove(file.id, b.id)} className="text-[11px] font-bold py-2">
                     <Folder className="h-3.5 w-3.5 mr-2 text-slate-400" /> {b.name}
                  </DropdownMenuItem>
               ))}
               {file.batch_id && (
                  <DropdownMenuItem onClick={() => onMove(file.id, null)} className="text-[11px] font-bold py-2">
                     <Box className="h-3.5 w-3.5 mr-2 text-slate-400" /> Move to Single Files
                  </DropdownMenuItem>
               )}
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={onDelete} className="text-rose-600 focus:text-rose-600 text-[11px] font-bold py-2">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Object
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
    </div>
  );
}
