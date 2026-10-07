import React, { useState, useRef, useEffect } from 'react';
import { QuestionBankApiIntegration } from '@/components/workspace/QuestionBankApiIntegration';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Download, Undo, Redo, FileSearch } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type PageState = 'EMPTY' | 'FILE_READY' | 'GENERATING' | 'ERROR' | 'QUESTION_READY';

const MOCK_GENERATED_MARKDOWN = `# Question Bank

Source: LPI_Pit_J_Agustus_2026.pdf

## Fakta dan Kronologi

1. Kapan kejadian berlangsung?
2. Aktivitas apa yang sedang dilakukan sebelum kejadian?
3. Bagaimana urutan kejadian berlangsung?
4. Kondisi apa yang pertama kali teridentifikasi?

## Aktor

5. Siapa saja pekerja yang terlibat?
6. Siapa pengawas pekerjaan pada saat kejadian?
7. Apa peran masing-masing personel?

## PEEPO

### People

8. Faktor manusia apa yang tercatat dalam LPI?
9. Apakah pekerja telah menerima instruksi kerja yang relevan?

### Equipment

10. Apakah terdapat kondisi alat yang berkontribusi terhadap kejadian?

### Environment

11. Kondisi lingkungan apa yang tercatat saat kejadian?

### Process

12. Prosedur apa yang digunakan saat pekerjaan berlangsung?

### Organization

13. Faktor organisasi apa yang tercatat dalam hasil investigasi?

## IPLS

14. Faktor penyebab apa yang tercatat dalam analisis IPLS?
15. Apa hubungan antara penyebab langsung dan penyebab dasar?

## Prevention

16. Tindakan apa yang direkomendasikan untuk mencegah kejadian serupa?`;

export default function QuestionBankPage() {
  const [activeMode, setActiveMode] = useState<'DEMO1' | 'DEMO2' | 'DEMO3'>('DEMO1');
  const [pageState, setPageState] = useState<PageState>('EMPTY');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Generating states
  const [generationStep, setGenerationStep] = useState(0); // 0: Reading, 1: Extracting, 2: Generating
  
  // Editor state
  const [markdownText, setMarkdownText] = useState("");
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...'>('Saved');
  
  // Modals
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPageState('FILE_READY');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setPageState('FILE_READY');
      } else {
        alert("Mohon upload file PDF");
      }
    }
  };

  const startGeneration = () => {
    setPageState('GENERATING');
    setGenerationStep(0);
    
    // Simulate steps
    setTimeout(() => setGenerationStep(1), 1500);
    setTimeout(() => setGenerationStep(2), 3000);
    setTimeout(() => {
      // Simulate success
      setMarkdownText(MOCK_GENERATED_MARKDOWN);
      setPageState('QUESTION_READY');
    }, 5500);
    
    // For V1 we just assume success, but if we wanted to mock error:
    // setTimeout(() => setPageState('ERROR'), 4000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownText(e.target.value);
    setSaveStatus('Saving...');
  };

  useEffect(() => {
    if (saveStatus === 'Saving...') {
      const timer = setTimeout(() => {
        setSaveStatus('Saved');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const confirmRegenerate = () => {
    setShowRegenerateConfirm(false);
    startGeneration();
  };

  const downloadFile = (format: 'md' | 'txt') => {
    const filename = `Question_Bank_${selectedFile?.name.replace('.pdf', '') || 'LPI'}.${format}`;
    const blob = new Blob([markdownText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const questionCount = (markdownText.match(/^\d+\./gm) || []).length;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen bg-slate-50/50">
        <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white shadow-sm z-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-700" />
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-indigo-600" />
              <h1 className="font-bold text-[15px] text-slate-800 tracking-tight">Question Bank</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 ml-4 absolute left-1/2 -translate-x-1/2">
            <button onClick={() => setActiveMode('DEMO1')} className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all", activeMode === 'DEMO1' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Demo 1: PDF</button>
            <button onClick={() => setActiveMode('DEMO2')} className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all", activeMode === 'DEMO2' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Demo 2: LPI ID</button>
            <button onClick={() => setActiveMode('DEMO3')} className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all", activeMode === 'DEMO3' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Demo 3: API</button>
          </div>
          
          {activeMode === 'DEMO1' && pageState === 'QUESTION_READY' && (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadFile('txt')}
                className="h-8 text-xs font-semibold"
              >
                Download .TXT
              </Button>
              <Button 
                size="sm" 
                onClick={() => downloadFile('md')}
                className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download .MD
              </Button>
            </div>
          )}
        </header>

        <main className={cn("flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col mx-auto w-full", activeMode === 'DEMO3' ? "max-w-[1400px]" : "max-w-5xl")}>
          
          {activeMode === 'DEMO3' && <QuestionBankApiIntegration />}
          {activeMode === 'DEMO2' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 pb-20">
              <FileSearch className="w-12 h-12 mb-4 text-slate-300" />
              <h2 className="text-xl font-bold mb-2 text-slate-800">Demo 2: Generate dari ID</h2>
              <p className="text-sm">Fitur pencarian ID sedang dalam tahap pengembangan.</p>
            </div>
          )}
          {activeMode === 'DEMO1' && (pageState === 'EMPTY' || pageState === 'FILE_READY' || pageState === 'GENERATING' || pageState === 'ERROR') && (
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full h-full pb-20">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Generate Question Bank</h2>
                <p className="text-slate-500 text-sm">Generate daftar pertanyaan dari dokumen LPI.</p>
              </div>

              {pageState === 'EMPTY' && (
                <div 
                  className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-indigo-50/30 group shadow-sm"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-slate-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mb-6 transition-colors">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Upload LPI</h3>
                  <p className="text-sm text-slate-500 mb-6">Drop PDF di sini atau Browse</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                    <span>PDF</span>
                    <span>&bull;</span>
                    <span>Max 25 MB</span>
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                </div>
              )}

              {pageState === 'FILE_READY' && (
                <div className="w-full">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center shrink-0 border border-red-100">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{selectedFile?.name || 'Document.pdf'}</h3>
                      <p className="text-xs text-slate-500 mt-1">{(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(1) : '4.8')} MB &bull; PDF Document</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedFile(null);
                        setPageState('EMPTY');
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={startGeneration} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold transition-all"
                    >
                      Generate Questions
                    </Button>
                  </div>
                </div>
              )}

              {pageState === 'GENERATING' && (
                <div className="w-full bg-white border border-slate-200 rounded-2xl p-10 shadow-sm flex flex-col items-center">
                  <h3 className="text-lg font-bold text-slate-900 mb-8 tracking-tight">Generating Question Bank</h3>
                  
                  <div className="w-full max-w-sm space-y-5">
                    <div className={cn("flex items-center gap-4", generationStep >= 0 ? "text-slate-800" : "text-slate-300")}>
                      {generationStep > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                      )}
                      <span className="text-sm font-medium">Reading PDF</span>
                    </div>
                    
                    <div className={cn("flex items-center gap-4", generationStep >= 1 ? "text-slate-800" : "text-slate-300 opacity-50")}>
                      {generationStep > 1 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : generationStep === 1 ? (
                        <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                      )}
                      <span className="text-sm font-medium">Extracting LPI content</span>
                    </div>
                    
                    <div className={cn("flex items-center gap-4", generationStep >= 2 ? "text-slate-800" : "text-slate-300 opacity-50")}>
                      {generationStep > 2 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : generationStep === 2 ? (
                        <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                      )}
                      <span className="text-sm font-medium">Generating questions</span>
                    </div>
                  </div>
                  
                  <div className="mt-10 text-sm font-semibold text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    Processing document...
                  </div>
                </div>
              )}

              {pageState === 'ERROR' && (
                <div className="w-full bg-white border border-rose-200 rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Question generation failed</h3>
                  <p className="text-sm text-slate-600 max-w-sm mb-8 leading-relaxed">
                    Dokumen berhasil di-upload, tetapi pertanyaan belum dapat dibuat. Silakan coba lagi.
                  </p>
                  <Button 
                    onClick={startGeneration} 
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-5 rounded-xl shadow-md text-sm font-bold"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeMode === 'DEMO1' && pageState === 'QUESTION_READY' && (
            <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header Info */}
              <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded shadow-sm border border-red-100 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Source Document</h3>
                    <div className="text-sm font-bold text-slate-800">{selectedFile?.name || 'LPI_Pit_J_Agustus_2026.pdf'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">24 pages</div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowRegenerateConfirm(true)}
                  className="shrink-0 bg-white text-xs font-bold text-slate-700 shadow-sm h-9 px-4 hover:text-indigo-600 hover:border-indigo-200"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                  Regenerate
                </Button>
              </div>

              {/* Editor Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800">
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800">
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <div className={cn("w-1.5 h-1.5 rounded-full", saveStatus === 'Saved' ? 'bg-emerald-500' : 'bg-amber-500')} />
                    {saveStatus}
                  </div>
                  <div>
                    <span className="text-slate-800">{questionCount}</span> Questions
                  </div>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 relative overflow-hidden bg-white">
                <Textarea 
                  value={markdownText}
                  onChange={handleTextChange}
                  className="w-full h-full resize-none border-0 p-6 sm:p-8 focus-visible:ring-0 text-[14px] sm:text-[15px] leading-relaxed text-slate-800 font-mono custom-scrollbar rounded-none"
                  placeholder="Ketik markdown di sini..."
                  spellCheck={false}
                />
              </div>
            </div>
          )}

        </main>
      </SidebarInset>

      <Dialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="p-6 bg-slate-50/80 border-b border-slate-100">
            <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">Regenerate Question Bank?</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Hasil baru akan menggantikan teks Question Bank yang sedang digunakan.<br/><br/>
              Perubahan manual pada versi ini akan hilang.
            </p>
          </div>
          <DialogFooter className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRegenerateConfirm(false)} className="h-10 px-5 text-sm font-semibold border-slate-200">
              Cancel
            </Button>
            <Button onClick={confirmRegenerate} className="h-10 px-5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white">
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
