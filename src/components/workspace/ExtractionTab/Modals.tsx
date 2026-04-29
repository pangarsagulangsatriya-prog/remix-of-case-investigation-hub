import React, { useState } from "react";
import { 
  X, Trash2, Folders, FileText, Image as ImageIcon, 
  AlertTriangle, Loader2, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  showCloseButton = false
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  children: React.ReactNode,
  showCloseButton?: boolean
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white rounded-sm w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 shadow-2xl">
        <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
          {showCloseButton && (
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-all">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fileName 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  fileName: string 
}) {
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  
  if (!isOpen) return null;
  const isConfirmed = captchaInput === captchaCode;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white rounded-sm  w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        <div className="p-6">
          <div className="h-12 w-12 rounded-sm bg-rose-50 flex items-center justify-center mb-4">
             <Trash2 className="h-6 w-6 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 border-none p-0 mb-2">Delete Evidence File</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            This action is <span className="text-rose-600 font-bold uppercase underline">irreversible</span>. Deleting <span className="font-bold text-slate-900">"{fileName}"</span> will permanently remove it and all associated AI-extracted intelligence from this case.
          </p>

          <div className="space-y-4">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Security Challenge</label>
               <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 mb-2 select-none pointer-events-none flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Type the code to confirm deletion</span>
                  <span className="text-3xl font-extrabold text-slate-300 tracking-[0.5em]">{captchaCode}</span>
               </div>
               <input 
                  autoFocus
                  className="w-full h-12 border rounded-sm px-4 text-center font-black text-xl tracking-[0.2em] focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-200"
                  placeholder="0000"
                  maxLength={4}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
               />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
           <Button variant="ghost" onClick={onClose} className="text-slate-500 font-bold hover:bg-slate-100">Cancel</Button>
           <Button 
              onClick={onConfirm} 
              disabled={!isConfirmed}
              className={`h-11 px-8 font-black uppercase tracking-widest transition-all ${isConfirmed ? 'bg-rose-600 hover:bg-rose-700 text-white  shadow-rose-500/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
           >
              Confirm Delete
           </Button>
        </div>
      </div>
    </div>
  );
}

export function DeleteFolderModal({
  target,
  onClose,
  onConfirm,
}: {
  target: any;
  onClose: () => void;
  onConfirm: () => void;
  onDissolve: () => void;
}) {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [wrongAttempt, setWrongAttempt]       = useState(false);
  const [isDeleting, setIsDeleting]           = useState(false);

  const CAPTCHA_ICONS = [
    { id: "folder",   label: "Folder",   Icon: Folders,  correct: true  },
    { id: "document", label: "Document", Icon: FileText,  correct: false },
    { id: "image",    label: "Image",    Icon: ImageIcon, correct: false },
  ];

  const [shuffled] = useState(() => {
    const arr = [...CAPTCHA_ICONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  if (!target) return null;

  const handleIconClick = (correct: boolean) => {
    if (captchaVerified) return;
    if (correct) {
      setCaptchaVerified(true);
      setWrongAttempt(false);
    } else {
      setWrongAttempt(true);
      setTimeout(() => setWrongAttempt(false), 900);
    }
  };

  const handleDelete = async () => {
    if (!captchaVerified || isDeleting) return;
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 450));
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={!isDeleting ? onClose : undefined}
      />
      <div className="relative z-10 bg-white rounded-sm  w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 rounded-sm bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-rose-500" />
            </div>
            {!isDeleting && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-sm transition-colors text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1">Delete Folder?</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            You are about to delete this folder and all files inside it.
          </p>
        </div>
        <div className="mx-6 mb-5 rounded-sm border border-slate-100 bg-slate-50/60 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <Folders className="h-4 w-4 text-primary/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Folder</span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate block">{target.name}</span>
            </div>
            <span className="text-[10px] font-black text-slate-500 bg-white border px-2 py-0.5 rounded-full shrink-0">
              {target.files?.length || 0} files
            </span>
          </div>
        </div>
        <div className="mx-6 mb-5 flex items-start gap-2 px-3 py-2.5 rounded-sm bg-amber-50 border border-amber-100">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
            This action will remove the folder and its contents from Evidence Control. This cannot be undone.
          </p>
        </div>
        <div className="mx-6 mb-6">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">
            Click the folder icon to enable deletion
          </label>
          <div className={`flex gap-2 transition-all ${wrongAttempt ? "animate-pulse" : ""}`}>
            {shuffled.map(({ id, label, Icon, correct }) => {
              const isSelected = captchaVerified && correct;
              return (
                <button
                  key={id}
                  disabled={captchaVerified}
                  onClick={() => handleIconClick(correct)}
                  className={[
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-sm border transition-all",
                    isSelected
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 cursor-default"
                      : wrongAttempt && !correct
                      ? "bg-rose-50 border-rose-100 text-rose-400"
                      : captchaVerified
                      ? "bg-slate-50 border-slate-100 text-slate-300 cursor-default"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 cursor-pointer",
                  ].join(" ")}
                >
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isDeleting}
              className="h-9 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  setIsDeleting(true);
                  await onDissolve();
                  setIsDeleting(false);
                }}
                disabled={!captchaVerified || isDeleting}
                variant="outline"
                className={[
                  "h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                  captchaVerified && !isDeleting
                    ? "border-slate-300 text-slate-700 hover:bg-white"
                    : "text-slate-300 cursor-not-allowed",
                ].join(" ")}
              >
                Dissolve (Keep Files)
              </Button>

              <Button
                onClick={async () => {
                  setIsDeleting(true);
                  await onConfirm();
                  setIsDeleting(false);
                }}
                disabled={!captchaVerified || isDeleting}
                className={[
                  "h-9 px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                  captchaVerified && !isDeleting
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed",
                ].join(" ")}
              >
                {isDeleting ? "Processing..." : "Delete All"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
