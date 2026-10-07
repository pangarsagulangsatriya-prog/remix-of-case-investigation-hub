import React, { useState, useRef, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Undo, 
  Redo, 
  FileSearch,
  Search,
  ChevronDown
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { QuestionBankApiMode } from '@/components/question-bank/QuestionBankApiMode';

type PageState = 'EMPTY' | 'GENERATING' | 'ERROR' | 'QUESTION_READY';
type DemoMode = 'upload' | 'search' | 'api';
type SearchState = 'idle' | 'loading' | 'success' | 'not_found' | 'no_pdf';

const MOCK_GENERATED_MARKDOWN = `# Question Bank

Source: {SOURCE_NAME}

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

10. Kondisi peralatan apa yang tercatat dalam dokumen?

### Environment

11. Kondisi lingkungan apa yang relevan terhadap kejadian?

### Process

12. Prosedur apa yang digunakan saat pekerjaan berlangsung?

### Organization

13. Faktor organisasi apa yang tercatat dalam hasil investigasi?

## IPLS

14. Faktor penyebab apa yang tercatat dalam analisis IPLS?
15. Bagaimana hubungan penyebab langsung dan penyebab dasar?

## Prevention

16. Tindakan apa yang direkomendasikan untuk mencegah kejadian serupa?`;

export default function QuestionBankPage() {
  // Demo Mode
  const [demoMode, setDemoMode] = useState<DemoMode>('upload');
  const [pendingDemoMode, setPendingDemoMode] = useState<DemoMode | null>(null);
  
  // Right Panel State
  const [pageState, setPageState] = useState<PageState>('EMPTY');
  
  // Left Panel - Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Left Panel - Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResult, setSearchResult] = useState<any>(null);

  // Generating states
  const [generationStep, setGenerationStep] = useState(0); 
  
  // Editor state
  const [markdownText, setMarkdownText] = useState("");
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...'>('Saved');
  
  // Modals
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showModeChangeConfirm, setShowModeChangeConfirm] = useState(false);

  // Derived source info
  const hasValidSource = (demoMode === 'upload' && selectedFile) || (demoMode === 'search' && searchState === 'success');
  const activeSourceName = demoMode === 'upload' ? selectedFile?.name : searchResult?.filename;

  // --- Upload Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert("Mohon upload file PDF");
      }
    }
  };

  // --- Search Handlers ---
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchState('loading');
    
    setTimeout(() => {
      const q = searchQuery.trim().toUpperCase();
      if (q === '323' || q === 'INC-323' || q === 'LPI-323') {
        setSearchResult({
          filename: 'LPI_323_Investigation.pdf',
          pages: 24,
          incidentId: '323',
          category: 'Near Miss',
          company: 'PT Bumi Tambang Nusantara',
          site: 'GMO',
          location: 'Pit J',
          detailLocation: 'Area Loading'
        });
        setSearchState('success');
      } else if (q === '324' || q === 'INC-324') {
        setSearchState('no_pdf');
      } else {
        setSearchState('not_found');
      }
    }, 800);
  };

  // --- Mode Change Handlers ---
  const handleModeSelect = (mode: DemoMode) => {
    if (mode === demoMode) return;
    
    // If there's already generated content, confirm first
    if (pageState === 'QUESTION_READY' || pageState === 'ERROR') {
      setPendingDemoMode(mode);
      setShowModeChangeConfirm(true);
    } else {
      applyModeChange(mode);
    }
  };

  const applyModeChange = (mode: DemoMode) => {
    setDemoMode(mode);
    // Reset left panel states
    setSelectedFile(null);
    setSearchQuery('');
    setSearchState('idle');
    setSearchResult(null);
    
    // Do NOT reset right panel immediately (spec says: Your generated Question Bank will remain until you generate a new one)
    setShowModeChangeConfirm(false);
    setPendingDemoMode(null);
  };

  // --- Generation Handlers ---
  const startGeneration = () => {
    setPageState('GENERATING');
    setGenerationStep(0);
    
    setTimeout(() => setGenerationStep(1), 1500);
    setTimeout(() => setGenerationStep(2), 3000);
    setTimeout(() => {
      const name = activeSourceName || 'LPI_Pit_J_Agustus_2026.pdf';
      setMarkdownText(MOCK_GENERATED_MARKDOWN.replace('{SOURCE_NAME}', name));
      setPageState('QUESTION_READY');
    }, 4500);
  };

  const confirmRegenerate = () => {
    setShowRegenerateConfirm(false);
    startGeneration();
  };

  // --- Editor Handlers ---
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

  const downloadFile = (format: 'md' | 'txt') => {
    const defaultName = activeSourceName?.replace('.pdf', '') || 'LPI';
    const filename = `Question_Bank_${defaultName}.${format}`;
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
      <SidebarInset className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 shrink-0 flex flex-col justify-center px-6 lg:px-8 border-b border-slate-200 bg-white shadow-sm z-10 relative">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-800" />
              <div className="h-5 w-px bg-slate-200" />
              <div>
                <h1 className="font-bold text-[16px] text-slate-900 flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-indigo-600" />
                  Question Bank
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">Generate editable investigation questions from an LPI document.</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 text-xs font-semibold border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100">
                  {demoMode === 'upload' ? 'Demo 1 — Upload PDF' : demoMode === 'search' ? 'Demo 2 — Search by ID' : 'Demo 3 — API Integration'}
                  <ChevronDown className="w-3.5 h-3.5 ml-2 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleModeSelect('upload')} className="text-xs font-medium cursor-pointer">
                  Demo 1 — Upload PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('search')} className="text-xs font-medium cursor-pointer">
                  Demo 2 — Search by ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('api')} className="text-xs font-medium cursor-pointer">
                  Demo 3 — API Integration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* MAIN WORKSPACE */}
        <main className={cn("flex-1 flex overflow-hidden w-full mx-auto p-4 md:p-6", demoMode === 'api' ? "max-w-7xl flex-col" : "max-w-[1600px] flex-col md:flex-row gap-6")}>
          
          {demoMode === 'api' ? (
            <QuestionBankApiMode />
          ) : (
            <>
              {/* LEFT PANEL - SOURCE */}
              <div className="w-full md:w-[32%] lg:w-[30%] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden shrink-0 h-full">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Source Document</h2>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                  
                  {/* DEMO 1: UPLOAD PDF */}
                  {demoMode === 'upload' && (
                    <div className="flex flex-col h-full">
                      {!selectedFile ? (
                        <div className="flex-1 flex flex-col">
                          <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                            Upload an LPI PDF to generate investigation questions.
                          </p>
                          <div 
                            className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-indigo-50/30 group"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors mb-4" />
                            <h3 className="text-sm font-bold text-slate-800 mb-1">Upload LPI PDF</h3>
                            <p className="text-[11px] text-slate-500 mb-4 text-center">Drop PDF here or Browse File</p>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                              PDF &bull; Max 25 MB
                            </div>
                            <input 
                              type="file" 
                              accept=".pdf" 
                              className="hidden" 
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col">
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-4 mb-6">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-red-50 rounded-md flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                                <FileText className="w-5 h-5 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[13px] font-bold text-slate-800 break-words leading-snug">{selectedFile.name}</h3>
                                <div className="text-[11px] text-slate-500 mt-1">24 pages</div>
                                <div className="text-[11px] text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 h-7 text-[11px] font-semibold"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Replace
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 h-7 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                onClick={() => setSelectedFile(null)}
                              >
                                Remove
                              </Button>
                            </div>
                            <input 
                              type="file" 
                              accept=".pdf" 
                              className="hidden" 
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DEMO 2: SEARCH BY ID */}
                  {demoMode === 'search' && (
                    <div className="flex flex-col h-full">
                      {!searchResult ? (
                        <div className="flex-1 flex flex-col space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Investigation / LPI ID</label>
                            <div className="flex gap-2">
                              <Input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter ID..."
                                className="h-9 text-sm"
                              />
                              <Button 
                                onClick={handleSearch}
                                disabled={searchState === 'loading'}
                                className="h-9 bg-slate-900 hover:bg-slate-800 text-white px-4 shrink-0"
                              >
                                {searchState === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>

                          {searchState === 'idle' && (
                            <p className="text-[12px] text-slate-500 mt-2">
                              Enter an Investigation or LPI ID to find its LPI document.
                            </p>
                          )}

                          {searchState === 'loading' && (
                            <div className="flex items-center gap-2 text-[12px] text-slate-600 mt-2">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                              Searching Investigation...
                            </div>
                          )}

                          {searchState === 'not_found' && (
                            <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 mt-2">
                              <h4 className="text-[13px] font-bold text-rose-800 mb-1">ID not found.</h4>
                              <p className="text-[12px] text-rose-600 mb-3">Please check the Investigation / LPI ID.</p>
                              <Button variant="outline" size="sm" onClick={() => setSearchState('idle')} className="h-8 text-xs border-rose-200 text-rose-700 bg-white">
                                Try Again
                              </Button>
                            </div>
                          )}

                          {searchState === 'no_pdf' && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mt-2">
                              <h4 className="text-[13px] font-bold text-amber-800 mb-1">Incident {searchQuery} found.</h4>
                              <p className="text-[12px] text-amber-700">LPI PDF is not available for this incident.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col">
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-4 mb-6 relative overflow-hidden">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-slate-700"
                              onClick={() => {
                                setSearchResult(null);
                                setSearchState('idle');
                              }}
                            >
                              <Undo className="w-3.5 h-3.5" />
                            </Button>

                            <div className="flex items-start gap-3 pr-6">
                              <div className="w-10 h-10 bg-red-50 rounded-md flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                                <FileText className="w-5 h-5 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[13px] font-bold text-slate-800 break-words leading-snug">{searchResult.filename}</h3>
                                <div className="text-[11px] text-slate-500 mt-1">{searchResult.pages} pages</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-slate-200/60 mt-1">
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Incident ID</div>
                                <div className="text-[11px] font-medium text-slate-800">{searchResult.incidentId}</div>
                              </div>
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Category</div>
                                <div className="text-[11px] font-medium text-slate-800">{searchResult.category}</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Company</div>
                                <div className="text-[11px] font-medium text-slate-800">{searchResult.company}</div>
                              </div>
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Site</div>
                                <div className="text-[11px] font-medium text-slate-800">{searchResult.site}</div>
                              </div>
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</div>
                                <div className="text-[11px] font-medium text-slate-800">{searchResult.location}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GENERATE BUTTON (Pinned to bottom of left panel) */}
                  <div className="mt-auto pt-4">
                    <Button 
                      onClick={startGeneration}
                      disabled={!hasValidSource || pageState === 'GENERATING'}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {pageState === 'GENERATING' ? 'Processing...' : 'Generate Questions'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL - QUESTION BANK */}
              <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
                
                {/* Header Right */}
                <div className="px-5 h-[53px] border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Bank</h2>
                  
                  {pageState === 'QUESTION_READY' && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 mr-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", saveStatus === 'Saved' ? 'bg-emerald-500' : 'bg-amber-500')} />
                        <span className="text-[11px] font-bold text-slate-500">{saveStatus}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 mr-2">
                        {questionCount} Questions
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowRegenerateConfirm(true)}
                        className="h-7 text-[11px] px-3 border-slate-200 text-slate-600 bg-white"
                      >
                        Regenerate
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="h-7 text-[11px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-1">
                            <Download className="w-3 h-3" /> Download ▾
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => downloadFile('md')} className="text-xs font-medium cursor-pointer">
                            Markdown (.md)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadFile('txt')} className="text-xs font-medium cursor-pointer">
                            Plain Text (.txt)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Content Right */}
                <div className="flex-1 relative overflow-hidden bg-white">
                  
                  {/* STATE: EMPTY */}
                  {pageState === 'EMPTY' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <FileSearch className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-[13px] text-slate-500 font-medium">Select a source document and generate questions.</p>
                    </div>
                  )}

                  {/* STATE: GENERATING */}
                  {pageState === 'GENERATING' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50/30">
                      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                        <h3 className="text-base font-bold text-slate-900 mb-6 text-center">Generating Question Bank</h3>
                        
                        <div className="space-y-4 mb-8">
                          <div className={cn("flex items-center gap-3 transition-opacity", generationStep >= 0 ? "opacity-100" : "opacity-40")}>
                            {generationStep > 0 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                            )}
                            <span className="text-sm font-medium text-slate-700">Reading PDF</span>
                          </div>
                          
                          <div className={cn("flex items-center gap-3 transition-opacity", generationStep >= 1 ? "opacity-100" : "opacity-40")}>
                            {generationStep > 1 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : generationStep === 1 ? (
                              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                            )}
                            <span className="text-sm font-medium text-slate-700">Extracting LPI content</span>
                          </div>
                          
                          <div className={cn("flex items-center gap-3 transition-opacity", generationStep >= 2 ? "opacity-100" : "opacity-40")}>
                            {generationStep > 2 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : generationStep === 2 ? (
                              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                            )}
                            <span className="text-sm font-medium text-slate-700">Generating questions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STATE: ERROR */}
                  {pageState === 'ERROR' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50/30 text-center">
                      <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100">
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                      </div>
                      <h3 className="text-[15px] font-bold text-slate-900 mb-2">Question generation failed.</h3>
                      <p className="text-[13px] text-slate-600 max-w-sm mb-6 leading-relaxed">
                        The source document is still available.<br/>
                        Try generating the questions again.
                      </p>
                      <Button 
                        onClick={startGeneration} 
                        className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-6 text-xs font-bold"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* STATE: QUESTION READY */}
                  {pageState === 'QUESTION_READY' && (
                    <div className="absolute inset-0 flex flex-col">
                      <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-white shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                          <Undo className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                          <Redo className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Textarea 
                        value={markdownText}
                        onChange={handleTextChange}
                        className="flex-1 w-full resize-none border-0 p-6 md:p-8 focus-visible:ring-0 text-[13px] md:text-[14px] leading-relaxed text-slate-800 font-mono custom-scrollbar rounded-none bg-white"
                        placeholder="Ketik markdown di sini..."
                        spellCheck={false}
                      />
                    </div>
                  )}

                </div>
              </div>
            </>
          )}       </main>
      </SidebarInset>

      {/* REGENERATE CONFIRMATION */}
      <Dialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-0 rounded-xl shadow-xl">
          <DialogHeader className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100">
            <DialogTitle className="text-[15px] font-bold text-slate-900">Regenerate Question Bank?</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              A new Question Bank will be generated from:<br/>
              <span className="font-bold text-slate-800">{activeSourceName}</span>
            </p>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              The current generated text and manual edits will be replaced.
            </p>
          </div>
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRegenerateConfirm(false)} className="h-9 px-4 text-xs font-semibold border-slate-200">
              Cancel
            </Button>
            <Button onClick={confirmRegenerate} className="h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODE CHANGE CONFIRMATION */}
      <Dialog open={showModeChangeConfirm} onOpenChange={setShowModeChangeConfirm}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-0 rounded-xl shadow-xl">
          <DialogHeader className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100">
            <DialogTitle className="text-[15px] font-bold text-slate-900">Change source method?</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Changing the source method will clear the current source selection.
            </p>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Your generated Question Bank will remain until you generate a new one.
            </p>
          </div>
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModeChangeConfirm(false)} className="h-9 px-4 text-xs font-semibold border-slate-200">
              Cancel
            </Button>
            <Button onClick={() => pendingDemoMode && applyModeChange(pendingDemoMode)} className="h-9 px-4 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white">
              Change Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  );
}
