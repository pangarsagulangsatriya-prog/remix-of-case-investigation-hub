import React, { useState, useRef, useEffect, useMemo } from 'react';
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

type PageState = 'NO_SOURCE' | 'SOURCE_NO_QB' | 'GENERATING' | 'ERROR' | 'QUESTION_READY';
type DemoMode = 'upload' | 'search' | 'api';
type SearchState = 'idle' | 'loading' | 'success' | 'not_found' | 'no_pdf';

interface LibraryItem {
  id: string;
  filename: string;
  pages: number;
  sizeMB: number;
  status: 'Not Generated' | 'Question Bank Ready';
  questionCount?: number;
  uploadedAt: string;
  updatedAt?: string;
  content?: string;
}

const MOCK_GENERATED_MARKDOWN = `# Question Bank\n\nSource: {SOURCE_NAME}\n\nApa sikap yang harus dimiliki dalam menerapkan kaidah teknik pertambangan dengan tenaga teknis yang kompeten dan peralatan yang layak?\nA) Menunggu alat rusak baru melapor\nB) Bekerja secepat mungkin tanpa memeriksa alat\nC) Memastikan kesiapan alat dan kompetensi diri sebelum mulai bekerja\nD) Memakai alat seadanya asal bisa jalan\nANSWER: C\n\nBerikut adalah nilai perusahaan PT Berau Coal, kecuali?\nA) Inovatif\nB) Progresif\nC) Kepercayaan\nD) Amanah\nANSWER: D\n\nBerikut merupakan Nilai Perusahaan pada Kebijakan Teknik Pertambangan yang Baik, kecuali?\nA) Integritas\nB) Progresif\nC) Kepercayaan\nD) Inovatif\nANSWER: A\n\nDalam briefing pagi, seorang pengawas melihat anak buahnya tidak fokus dan tampak bingung terhadap metode kerja hari itu. Ia tergoda untuk langsung mulai kegiatan agar tidak membuang waktu. Bagaimana sikap pengawas yang mencerminkan nilai “kepercayaan” dan mendukung budaya keselamatan?\nA) Langsung menjalankan pekerjaan karena teknis sudah dijelaskan kemarin\nB) Menugaskan pekerja senior sebagai pendamping tanpa evaluasi tambahan\nC) Mengulang penjelasan metode kerja, membuka ruang tanya jawab, dan memastikan semua memahami\nD) Mendorong semua langsung bekerja lalu memberi evaluasi di akhir hari\nANSWER: C\n\nDalam menjalankan misi perusahaan, bagaimana sebaiknya sikap seorang karyawan terhadap keselamatan dan lingkungan?\nA) Fokus pada target produksi terlebih dahulu\nB) Menunggu instruksi atasan baru peduli\nC) Aktif menjaga keselamatan dan kelestarian lingkungan dalam setiap pekerjaan\nD) Hanya peduli jika ada inspeksi\nANSWER: C\n\nDalam proses reklamasi, PT Berau Coal berkomitmen mengembalikan lahan bekas tambang menjadi aman dan produktif. Sikap apa yang tepat sebagai karyawan terhadap proses ini?\nA) Serahkan saja ke bagian lingkungan\nB) Ikut terlibat dan peduli terhadap hasil reklamasi\nC) Tidak perlu ikut campur karena bukan tugas saya\nD) Hanya peduli kalau ada pelatihan\nANSWER: B\n\nGambar di bawah ini menunjukkan salah satu komitmen PT BC dalam melestarikan lingkungan yang disebut Revegetasi.\nA) Salah\nB) Benar\nANSWER: B\n\nJika Anda adalah bagian dari tim inovasi, nilai perusahaan apa yang harus Anda tanamkan dalam bekerja?\nA) Menjalankan tugas seadanya\nB) Menghindari perubahan yang tidak familiar\nC) Terbuka terhadap ide baru dan berani mencoba pendekatan baru\nD) Menunggu perintah atasan\nANSWER: C\n\nKonservasi batubara tidak termasuk dalam bagian kaidah teknik pertambangan yang baik.\nA) BENAR\nB) SALAH\nANSWER: B\n\nMengapa konservasi batubara penting dalam operasional pertambangan?\nA) Agar bisa dipakai untuk proyek jangka pendek\nB) Supaya tambang terlihat bersih\nC) Untuk memastikan sumber daya alam tidak terbuang sia-sia\nD) Untuk meningkatkan jam kerja karyawan\nANSWER: C\n\nMengapa pengelolaan lingkungan hidup termasuk dalam kaidah teknik pertambangan yang baik?\nA) Karena bisa menghindari denda\nB) Karena hanya bagian dari syarat dokumen\nC) Karena menjaga lingkungan adalah bagian dari tanggung jawab sosial kita\nD) Supaya cepat mendapat sertifikasi\nANSWER: C\n\nMengapa penting bagi PT Berau Coal untuk memiliki visi “menunjang masa depan cemerlang melalui pengalih ragam energi”?\nA) Agar perusahaan terlihat modern\nB) Karena tuntutan pemerintah\nC) Karena tanggung jawab jangka panjang terhadap generasi mendatang\nD) Supaya bisa bersaing dengan perusahaan asing\nANSWER: C\n\n1. Teknis Pertambangan Batubara, 2. Keselamatan Pertambangan Batubara, 3. Pengelolaan Lingungan Hidup Pertambangan Batubara, 4. Konservasi Pertambangan Batubara, dan 5. Standarisasi dan Usaha Jasa Pertambangan Batubara. merupakan poin dari?\nA) Tujuan Spesifik PT. BC\nB) Tekad PT. BC\nC) Prioritas Pelaksanaan Kaidah Teknik Pertambangan yang Baik\nD) Komitmen PT. BC\nANSWER: C\n\nMisi PT BC adalah Mengelola sumber daya alam menjadi sumber energi dengan standar operasional yang mengutamakan keselamatan, kelestarian lingkungan dan kesejahteraan masyarakat.\nA) BENAR\nB) SALAH\nANSWER: A\n\nPT Berau Coal berkomitmen untuk menggunakan mitra kerja yang mematuhi seluruh standar dan regulasi pertambangan.\nA) BENAR\nB) SALAH\nANSWER: A\n\nSaat melakukan inspeksi area tambang, pengawas menemukan limbah padat yang belum ditangani sesuai prosedur 3R (Reduce, Reuse, Recycle). Namun, pengawas merasa ini bukan area yang menjadi tanggung jawab langsungnya. Apa tindakan terbaik yang mencerminkan sikap progresif dan bertanggung jawab sebagai pengawas?\nA) Membuat catatan internal pribadi untuk disampaikan nanti jika ditanya\nB) Menunggu evaluasi bulanan untuk memasukkannya sebagai temuan\nC) Melaporkan kondisi tersebut segera dan mendorong perbaikan langsung sesuai prosedur\nD) Membiarkan karena bukan tanggung jawab divisi yang diawasi langsung\nANSWER: C\n\nSalah satu tujuan dari kaidah teknik pertambangan yang baik adalah menciptakan budaya keselamatan tambang yang produktif dan efisien.\nA) BENAR\nB) SALAH\nANSWER: A\n\nSeorang pengawas mengetahui bahwa salah satu mitra kerja di lapangan menggunakan peralatan yang tidak sesuai standar keselamatan. Namun, karena pekerjaan sedang dikejar target, beberapa staf lain menyarankan untuk membiarkan sementara waktu. Apa sikap yang seharusnya diambil oleh pengawas sesuai nilai perusahaan dan komitmen kaidah teknik pertambangan yang baik?\nA) Menyampaikan ke atasan tapi membiarkan pekerjaan tetap berjalan\nB) Menghentikan sementara pekerjaan dan memastikan peralatan diganti sesuai standar\nC) Memberikan toleransi karena mitra kerja sudah berpengalaman\nD) Menegur secara lisan saja agar tidak menimbulkan konflik\nANSWER: B\n\nSetelah melakukan pengecekan area pascatambang, pengawas menemukan bahwa reklamasi yang dilakukan belum sesuai standar, tetapi sudah dilaporkan sebagai “selesai” dalam sistem. Apa sikap pengawas yang menunjukkan integritas serta penerapan siklus Plan-Do-Check-Action (PDCA)?\nA) Menyampaikan laporan tambahan secara informal agar tidak mempermalukan tim\nB) Meminta admin memperbaiki data tanpa melakukan koreksi lapangan\nC) Menindaklanjuti temuan, mengkaji akar masalah, dan menyusun rencana perbaikan reklamasi\nD) Mengabaikan karena laporan sudah dikunci dan divalidasi sebelumnya\nANSWER: C\n\nSiklus PDCA (Plan-Do-Check-Action) diterapkan dalam sistem Be GeMS. Sikap apa yang perlu dimiliki agar siklus ini berjalan efektif?\nA) Cuek selama hasil kerja selesai\nB) Fokus pada tugas individu saja\nC) Terbuka terhadap evaluasi dan siap memperbaiki kesalahan\nD) Takut jika ada kesalahan ditemukan\nANSWER: C\n\nVisi dari PT Berau Coal adalah?\nA) Menunjang perwujudan masa depan cemerlang melalui peran aktifnya sebagai pengalih ragam energi yang eksponensial\nB) Mengelola sumber daya alam menjadi sumber energi dengan standar operasional yang mengutamakan keselamatan, kelestarian lingkungan dan kesejahteraan masyarakat.\nC) Mendorong Batasan-Batasan yang Ada Saat Ini dan Kemudian Menciptakan Terobosan baru Melalui Sumber Daya Manusia dan Teknologi\nD) Menjadi perusahaan tambah terbaik di Kalimantan Timur\nANSWER: A`;

const INITIAL_LIBRARY: LibraryItem[] = [
  {
    id: 'doc-1',
    filename: 'LPI_Pit_J_Agustus_2026.pdf',
    pages: 24,
    sizeMB: 4.8,
    status: 'Question Bank Ready',
    questionCount: 16,
    uploadedAt: '05 Oct 2026 · 09:00 WIB',
    updatedAt: '07 Oct 2026 · 10:21 WIB',
    content: MOCK_GENERATED_MARKDOWN.replace('{SOURCE_NAME}', 'LPI_Pit_J_Agustus_2026.pdf')
  },
  {
    id: 'doc-2',
    filename: 'LPI_Dumping_Area_Incident.pdf',
    pages: 18,
    sizeMB: 3.2,
    status: 'Question Bank Ready',
    questionCount: 21,
    uploadedAt: '06 Oct 2026 · 14:00 WIB',
    updatedAt: '06 Oct 2026 · 16:34 WIB',
    content: '# Question Bank\n\nSource: LPI_Dumping_Area_Incident.pdf\n\n## Kejadian\n\nQuestion 1\nA) A\nB) B\nANSWER: A\n\nQuestion 2\nA) A\nB) B\nANSWER: B'
  },
  {
    id: 'doc-3',
    filename: 'LPI_Haul_Road_324.pdf',
    pages: 13,
    sizeMB: 2.1,
    status: 'Not Generated',
    uploadedAt: '06 Oct 2026 · 09:15 WIB'
  },
  {
    id: 'doc-4',
    filename: 'LPI_Workshop_Inspection.pdf',
    pages: 31,
    sizeMB: 6.5,
    status: 'Question Bank Ready',
    questionCount: 18,
    uploadedAt: '03 Oct 2026 · 10:00 WIB',
    updatedAt: '03 Oct 2026 · 13:42 WIB',
    content: '# Question Bank\n\nSource: LPI_Workshop_Inspection.pdf\n\n## Inspeksi\n\nBagian mana yang diinspeksi?\nA) Atap\nB) Lantai\nANSWER: A'
  }
];

export default function QuestionBankPage() {
  // Demo Mode
  const [demoMode, setDemoMode] = useState<DemoMode>('upload');
  const [pendingDemoMode, setPendingDemoMode] = useState<DemoMode | null>(null);
  
  // Right Panel State
  const [pageState, setPageState] = useState<PageState>('NO_SOURCE');
  
  // Left Panel - Demo 1 (Library) State
  const [demo1Tab, setDemo1Tab] = useState<'upload' | 'library'>('upload');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(INITIAL_LIBRARY);
  const [activeLibraryId, setActiveLibraryId] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [duplicateFile, setDuplicateFile] = useState<LibraryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Left Panel - Demo 2 (Search) State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResult, setSearchResult] = useState<any>(null);

  // Generating states
  const [generationStep, setGenerationStep] = useState(0); 
  
  // Editor state
  const [markdownText, setMarkdownText] = useState("");
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...'>('Saved');
  
  // Modals
    const [showModeChangeConfirm, setShowModeChangeConfirm] = useState(false);

  // Derived source info
  const activeItem = useMemo(() => libraryItems.find(i => i.id === activeLibraryId) || null, [libraryItems, activeLibraryId]);
  
  const hasValidSource = (demoMode === 'upload' && activeLibraryId !== null) || (demoMode === 'search' && searchState === 'success');
  const activeSourceName = demoMode === 'upload' ? activeItem?.filename : searchResult?.filename;

  // Search filter
  const filteredLibrary = useMemo(() => {
    if (!librarySearch.trim()) return libraryItems;
    const q = librarySearch.toLowerCase();
    return libraryItems.filter(i => i.filename.toLowerCase().includes(q));
  }, [libraryItems, librarySearch]);

  // --- Demo 1 Library & Upload Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        processFile(file);
      } else {
        alert("Mohon upload file PDF");
      }
    }
  };

  const processFile = (file: File) => {
    const existing = libraryItems.find(i => i.filename === file.name);
    if (existing) {
      setDuplicateFile(existing);
    } else {
      const dateStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·') + ' WIB';
      const newItem: LibraryItem = {
        id: `doc-${Date.now()}`,
        filename: file.name,
        pages: Math.floor(Math.random() * 30) + 5,
        sizeMB: Number((file.size / 1024 / 1024).toFixed(1)),
        status: 'Not Generated',
        uploadedAt: dateStr
      };
      setLibraryItems([newItem, ...libraryItems]);
      selectLibraryItem(newItem);
    }
  };

  const selectLibraryItem = (item: LibraryItem) => {
    if (saveStatus === 'Saving...') return; // Prevent switching while autosaving
    
    setActiveLibraryId(item.id);
    if (item.status === 'Question Bank Ready' && item.content) {
      setMarkdownText(item.content);
      setPageState('QUESTION_READY');
    } else {
      setPageState('SOURCE_NO_QB');
    }
  };

  const removeActiveSource = () => {
    setActiveLibraryId(null);
    setPageState('NO_SOURCE');
  };

  // --- Demo 2 Search Handlers ---
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
        setPageState('SOURCE_NO_QB');
      } else if (q === '324' || q === 'INC-324') {
        setSearchState('no_pdf');
        setPageState('NO_SOURCE');
      } else {
        setSearchState('not_found');
        setPageState('NO_SOURCE');
      }
    }, 800);
  };

  const clearSearchSource = () => {
    setSearchResult(null);
    setSearchState('idle');
    setPageState('NO_SOURCE');
  };

  // --- Mode Change Handlers ---
  const handleModeSelect = (mode: DemoMode) => {
    if (mode === demoMode) return;
    
    if (pageState === 'QUESTION_READY' || pageState === 'ERROR' || pageState === 'SOURCE_NO_QB') {
      setPendingDemoMode(mode);
      setShowModeChangeConfirm(true);
    } else {
      applyModeChange(mode);
    }
  };

  const applyModeChange = (mode: DemoMode) => {
    setDemoMode(mode);
    // Reset left panel states
    setActiveLibraryId(null);
    setDuplicateFile(null);
    setSearchQuery('');
    setSearchState('idle');
    setSearchResult(null);
    
    setPageState('NO_SOURCE');
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
      const name = activeSourceName || 'Document.pdf';
      const newContent = MOCK_GENERATED_MARKDOWN.replace('{SOURCE_NAME}', name);
      
      if (demoMode === 'upload' && activeLibraryId) {
        const dateStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·') + ' WIB';
        const qCount = (newContent.match(/ANSWER:/g) || []).length;
        
        setLibraryItems(prev => prev.map(item => {
          if (item.id === activeLibraryId) {
            return {
              ...item,
              status: 'Question Bank Ready',
              content: newContent,
              questionCount: qCount,
              updatedAt: dateStr
            };
          }
          return item;
        }));
      }

      setMarkdownText(newContent);
      setPageState('QUESTION_READY');
      setSaveStatus('Saved');
    }, 4500);
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
        
        if (demoMode === 'upload' && activeLibraryId) {
          const dateStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·') + ' WIB';
          const qCount = (markdownText.match(/ANSWER:/g) || []).length;
          
          setLibraryItems(prev => prev.map(item => {
            if (item.id === activeLibraryId) {
              return {
                ...item,
                content: markdownText,
                questionCount: qCount,
                updatedAt: dateStr
              };
            }
            return item;
          }));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, markdownText, demoMode, activeLibraryId]);

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

  const currentQuestionCount = demoMode === 'upload' ? (activeItem?.questionCount || 0) : (markdownText.match(/ANSWER:/g) || []).length;

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
                
                {demoMode === 'upload' ? (
                  <>
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 shrink-0">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Source Document</h2>
                      </div>
                      <div className="bg-slate-200/60 p-1 rounded-lg flex items-center">
                        <button onClick={() => setDemo1Tab('upload')} className={cn("flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all", demo1Tab === 'upload' ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}>Upload PDF</button>
                        <button onClick={() => setDemo1Tab('library')} className={cn("flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all", demo1Tab === 'library' ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}>Library</button>
                      </div>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
                      {demo1Tab === 'upload' ? (
                        <div className="flex flex-col h-full">
                          {duplicateFile ? (
                            <div className="flex-1 flex flex-col">
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center shadow-sm">
                                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                <h3 className="text-[13px] font-bold text-amber-900 mb-1">Document already exists</h3>
                                <p className="text-[11px] text-amber-700 mb-5 leading-relaxed"><span className="font-semibold">{duplicateFile.filename}</span> is already available in Source Library.</p>
                                
                                <Button 
                                  onClick={() => {
                                    setDemo1Tab('library');
                                    selectLibraryItem(duplicateFile);
                                    setDuplicateFile(null);
                                  }}
                                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 font-bold mb-2 shadow-sm"
                                >
                                  {duplicateFile.status === 'Question Bank Ready' ? 'Open Question Bank' : 'Open Document'}
                                </Button>
                                <Button variant="ghost" onClick={() => setDuplicateFile(null)} className="w-full text-xs h-8 text-amber-800 font-semibold hover:bg-amber-100/50">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : !activeItem ? (
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
                            <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-red-50 rounded-md flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                                    <FileText className="w-5 h-5 text-red-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-[13px] font-bold text-slate-800 break-words leading-snug">{activeItem.filename}</h3>
                                    <div className="text-[11px] text-slate-500 mt-1">{activeItem.pages} pages</div>
                                    <div className="text-[11px] text-slate-500">{activeItem.sizeMB} MB</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 h-8 text-[11px] font-semibold bg-white"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    Replace
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 h-8 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white"
                                    onClick={removeActiveSource}
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
                      ) : (
                        <div className="flex flex-col h-full animate-in fade-in duration-200">
                          <div className="mb-4 space-y-4">
                            <p className="text-[12px] text-slate-500">
                              Dokumen LPI yang pernah digunakan untuk Question Bank.
                            </p>
                            <div className="relative">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <Input 
                                placeholder="Search documents..." 
                                value={librarySearch} 
                                onChange={e => setLibrarySearch(e.target.value)} 
                                className="h-9 text-xs pl-9 bg-slate-50 border-slate-200" 
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recently Updated</div>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar pr-1 pb-4">
                            {filteredLibrary.length === 0 ? (
                              <div className="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg">
                                <p className="text-[12px] text-slate-500 mb-2">No documents found.</p>
                                <Button variant="link" onClick={() => setDemo1Tab('upload')} className="text-xs text-indigo-600 h-auto p-0">
                                  Upload a new PDF
                                </Button>
                              </div>
                            ) : (
                              filteredLibrary.map(item => {
                                const isActive = activeLibraryId === item.id;
                                return (
                                  <div 
                                    key={item.id} 
                                    onClick={() => selectLibraryItem(item)} 
                                    className={cn("p-3 border rounded-xl cursor-pointer transition-all", isActive ? "border-indigo-400 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-400 ring-offset-0" : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50")}
                                  >
                                    <div className="flex items-start gap-3">
                                      <FileText className={cn("w-5 h-5 mt-0.5 shrink-0", isActive ? "text-indigo-600" : "text-slate-400")} />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-bold text-slate-800 truncate" title={item.filename}>{item.filename}</div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">{item.pages} pages</div>
                                        
                                        <div className="mt-3 flex items-center gap-2">
                                          {item.status === 'Question Bank Ready' ? (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                              Question Bank Ready
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                              Not Generated
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="mt-2 text-[10px] text-slate-400 font-medium">
                                          {item.status === 'Question Bank Ready' ? `Updated ${item.updatedAt} · ${item.questionCount} Questions` : `Uploaded ${item.uploadedAt}`}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* GENERATE BUTTON (Pinned) */}
                      <div className="mt-auto pt-4 border-t border-slate-100 bg-white">
                        <Button 
                          onClick={startGeneration}
                          disabled={!activeLibraryId || activeItem?.status === 'Question Bank Ready' || pageState === 'GENERATING'}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold text-[12px] h-9 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {pageState === 'GENERATING' ? 'Processing...' : 'Generate Questions'}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // DEMO 2: SEARCH BY ID
                  <>
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Source Document</h2>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
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
                              onClick={clearSearchSource}
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
                      
                      <div className="mt-auto pt-4">
                        <Button 
                          onClick={startGeneration}
                          disabled={!hasValidSource || pageState === 'GENERATING'}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 text-xs h-9"
                        >
                          {pageState === 'GENERATING' ? 'Processing...' : 'Generate Questions'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT PANEL - QUESTION BANK */}
              <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
                
                {/* Header Right */}
                <div className="px-5 h-[53px] border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Question Bank</h2>
                  
                  {pageState === 'QUESTION_READY' && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 mr-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", saveStatus === 'Saved' ? 'bg-emerald-500' : 'bg-amber-500')} />
                        <span className="text-[11px] font-bold text-slate-500">{saveStatus}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 mr-2 bg-slate-200/50 px-2.5 py-1 rounded-full border border-slate-200">
                        {currentQuestionCount} Questions
                      </div>
                      
                      
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
                  
                  {/* STATE: NO SOURCE */}
                  {pageState === 'NO_SOURCE' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <FileSearch className="w-5 h-5 text-slate-400" />
                      </div>
                      <h3 className="text-[14px] font-bold text-slate-800 mb-1">Select a source document</h3>
                      <p className="text-[12px] text-slate-500">Choose from the Library or upload a new LPI PDF.</p>
                    </div>
                  )}

                  {/* STATE: SOURCE_NO_QB */}
                  {pageState === 'SOURCE_NO_QB' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <h3 className="text-[14px] font-bold text-slate-800 mb-2">No Question Bank yet.</h3>
                      <p className="text-[12px] text-slate-500 max-w-sm mb-6">
                        This document has not been generated.<br/>
                        Click Generate Questions to analyze the LPI and create editable questions.
                      </p>
                      <Button 
                        onClick={startGeneration}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-6 text-xs font-bold"
                      >
                        Generate Questions
                      </Button>
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
                        The source document remains available in your Library.<br/>
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
          )}
        </main>
      </SidebarInset>

      

      {/* MODE SWITCH CONFIRMATION */}
      <Dialog open={showModeChangeConfirm} onOpenChange={(open) => {
        if (!open) {
          setShowModeChangeConfirm(false);
          setPendingDemoMode(null);
        }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-slate-900">Ganti Mode Demo?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-[13px] text-slate-600 leading-relaxed">
            Anda memiliki Question Bank yang sedang aktif. Konten tersebut tidak akan hilang karena sudah tersimpan di Library Anda.
            <br/><br/>
            Lanjutkan ganti mode?
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModeChangeConfirm(false)} className="h-9 px-4 text-xs font-semibold">
              Batal
            </Button>
            <Button onClick={() => pendingDemoMode && applyModeChange(pendingDemoMode)} className="h-9 px-4 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white">
              Ya, Ganti Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  );
}
