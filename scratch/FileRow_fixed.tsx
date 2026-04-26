function FileRow({ 
  file, 
  isSelected, 
  onSelect, 
  onMove,
  batches,
  isIndented = false
}: { 
  file: any, 
  isSelected: boolean, 
  onSelect: () => void, 
  onMove: (fileId: string, batchId: string | null) => void,
  batches: any[],
  isIndented?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onSelect}
          className={cn(
            "group flex items-center justify-between p-2 pr-3 rounded-sm cursor-pointer transition-all border-l-2",
            isSelected 
              ? "bg-slate-100 border-primary" 
              : "hover:bg-slate-50 border-transparent",
            isIndented ? "pl-8" : "pl-2"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {!isIndented && <div className="w-4 shrink-0" />} 
            <div className={cn(
              "h-7 w-7 rounded flex items-center justify-center shrink-0 border shadow-sm transition-colors",
              isSelected ? "bg-white text-primary border-primary/20" : "bg-white text-slate-400 group-hover:text-slate-600"
            )}>
              {getFileIcon(file.type)}
            </div>
            <div className="overflow-hidden">
              <p className={cn(
                "text-[11px] font-bold truncate leading-tight tracking-tight",
                isSelected ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
              )}>
                {file.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {file.review_status === 'reviewed' && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-1 hover:bg-white rounded text-slate-300 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Move to</div>
              <DropdownMenuItem 
                onClick={() => onMove(file.id, null)}
                disabled={!file.batch_id}
                className="text-[10px] font-bold"
              >
                <Folder className="h-3.5 w-3.5 mr-2 text-slate-400" /> Root Directory
              </DropdownMenuItem>
              {batches.filter(b => b.type === "Folder" && b.id !== file.batch_id).map(batch => (
                <DropdownMenuItem 
                  key={batch.id} 
                  onClick={() => onMove(file.id, batch.id)}
                  className="text-[10px] font-bold"
                >
                  <Folder className="h-3.5 w-3.5 mr-2 text-primary/60" /> {batch.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-[10px] font-bold py-1 px-2">
        {file.name}
      </TooltipContent>
    </Tooltip>
  );
}
