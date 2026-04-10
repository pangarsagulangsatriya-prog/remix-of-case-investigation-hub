const fs = require('fs');

const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// 1. Add interactive states to AnalysisTab
const oldStates = `  const [activeSlide, setActiveSlide] = React.useState(0);
  
  const slides = React.useMemo(() => {`;

const newStates = `  const [activeSlide, setActiveSlide] = React.useState(0);
  const [zoom, setZoom] = React.useState(85);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleExport = () => {
     setIsExporting(true);
     setTimeout(() => {
        setIsExporting(false);
        alert("Presentation deck exported successfully as .pptx");
     }, 2000);
  };

  const handleSaveArtifact = () => {
     setIsSaving(true);
     setTimeout(() => {
        setIsSaving(false);
        alert("Artifact saved to Case Documentation");
     }, 1500);
  };
  
  const slides = React.useMemo(() => {`;

if (text.includes(oldStates)) {
   text = text.replace(oldStates, newStates);
}

// 2. Update the buttons in the editor
const oldButtons = `<Button variant="outline" size="sm" className="h-8 text-[11px] font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm"><Download className="h-3.5 w-3.5 mr-2" /> Export PPTX</Button>
                     <Button variant="default" size="sm" className="h-8 text-[11px] font-bold bg-[#1e293b] hover:bg-[#0f172a] shadow-sm text-white px-6">Save Artifact</Button>`;

const newButtons = `<Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm" className="h-8 text-[11px] font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm">
                        {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Download className="h-3.5 w-3.5 mr-2" />} 
                        {isExporting ? 'Generating...' : 'Export PPTX'}
                     </Button>
                     <Button onClick={handleSaveArtifact} disabled={isSaving} variant="default" size="sm" className="h-8 text-[11px] font-bold bg-[#1e293b] hover:bg-[#0f172a] shadow-sm text-white px-6">
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                        {isSaving ? 'Saving...' : 'Save Artifact'}
                     </Button>`;

if (text.includes(oldButtons)) {
   text = text.replace(oldButtons, newButtons);
}

// 3. Update Zoom functionality
const oldZoom = `<Button variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-600 hover:bg-white"><ZoomIn className="h-3.5 w-3.5" /></Button>
                         <span className="text-[11px] font-bold text-slate-500 w-10 text-center cursor-ns-resize hover:text-slate-800">85%</span>
                         <Button variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-600 hover:bg-white"><ZoomOut className="h-3.5 w-3.5" /></Button>`;

const newZoom = `<Button onClick={() => setZoom(Math.min(150, zoom + 10))} variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-600 hover:bg-white"><ZoomIn className="h-3.5 w-3.5" /></Button>
                         <span className="text-[11px] font-bold text-slate-500 w-10 text-center cursor-ns-resize hover:text-slate-800">{zoom}%</span>
                         <Button onClick={() => setZoom(Math.max(50, zoom - 10))} variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-600 hover:bg-white"><ZoomOut className="h-3.5 w-3.5" /></Button>`;

if (text.includes(oldZoom)) {
   text = text.replace(oldZoom, newZoom);
}

// 4. Update the scale of the canvas
const oldCanvasScale = `style={{ width: '1024px', minHeight: '576px', aspectRatio: '16/9' }}`;
const newCanvasScale = `style={{ width: '1024px', minHeight: '576px', aspectRatio: '16/9', transform: \`scale(\${zoom/100})\` }}`;

if (text.includes(oldCanvasScale)) {
   text = text.replace(oldCanvasScale, newCanvasScale);
}

// 5. Upgrade ReportsTab to be Premium
const oldReportsTab = `function ReportsTab() {
  return (
    <div className="flex h-full bg-slate-50/10">`;

const newReportsTab = `function ReportsTab() {
  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerate = () => {
     setIsGenerating(true);
     setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="flex h-full bg-[#f8fafc]">`;

if (text.includes(oldReportsTab)) {
   text = text.replace(oldReportsTab, newReportsTab);
}

// 6. Update Reports List sidebar style
const oldReportsSidebar = `<div className="w-[300px] border-r bg-white flex flex-col shrink-0">
        <div className="h-12 border-b flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reports Console</span>
           <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold gap-2 text-primary hover:bg-primary/5">
              <Folders className="h-3.5 w-3.5" /> + Create New
           </Button>
        </div>`;

const newReportsSidebar = `<div className="w-[320px] border-r bg-white flex flex-col shrink-0 shadow-[4px_0_20px_rgba(0,0,0,0.02)] relative z-10">
        <div className="h-14 border-b flex items-center justify-between px-5 shrink-0 bg-[#FCFCFD]">
           <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Investigation Repository</span>
           <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-800 border-slate-200">
              <Plus className="h-4 w-4" />
           </Button>
        </div>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input type="text" placeholder="Search reports..." className="w-full h-9 bg-white border border-slate-200 rounded-md pl-9 pr-4 text-[12px] font-medium outline-none focus:ring-1 ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
            </div>
        </div>`;

if (text.includes(oldReportsSidebar)) {
   text = text.replace(oldReportsSidebar, newReportsSidebar);
}

// 7. Update the main report editor header
const oldReportEditorHeader = `<div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border-b -mx-8 -mt-8 mb-8 shadow-sm">
               <div>
                  <h2 className="text-lg font-bold text-slate-900 border-none p-0 inline-flex items-center gap-3">
                     Initial Investigation Report <span className="text-slate-300 font-mono text-xs">V1.2</span>
                  </h2>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-9 gap-2 font-bold text-xs"><Eye className="h-3.5 w-3.5" /> Preview PDF</Button>
                  <Button className="h-9 gap-2 font-bold text-xs bg-slate-900 hover:bg-slate-800"><CheckCircle2 className="h-3.5 w-3.5" /> Finalize Build</Button>
               </div>
            </div>`;

const newReportEditorHeader = `<div className="flex items-center justify-between bg-white px-8 py-5 rounded-xl border border-slate-200 shadow-sm mb-10 group relative overflow-hidden transition-all hover:border-slate-300">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1e293b]" />
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Initial Investigation Report
                     </h2>
                     <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500 border border-slate-200">V1.28</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
                     <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Updated 2h ago by Sarah Chen</span>
                     <span className="w-1 h-1 rounded-full bg-slate-300" />
                     <span className="flex items-center gap-1.5 font-bold text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Fully Synced with Intelligence Chain</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Button onClick={handleGenerate} disabled={isGenerating} variant="outline" className="h-10 gap-2 font-bold text-[11px] border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all px-4">
                     {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5 text-blue-500" />} 
                     {isGenerating ? 'Synthesizing...' : 'Sync AI Chain'}
                  </Button>
                  <Button variant="outline" className="h-10 gap-2 font-bold text-[11px] border-slate-200 hover:bg-slate-50 px-4"><Eye className="h-3.5 w-3.5" /> Preview</Button>
                  <Button className="h-10 gap-2 font-bold text-[11px] bg-[#1e293b] hover:bg-black text-white px-6 shadow-lg shadow-slate-200">Finalize & Route</Button>
               </div>
            </div>`;

if (text.includes(oldReportEditorHeader)) {
   text = text.replace(oldReportEditorHeader, newReportEditorHeader);
}

fs.writeFileSync(CACHE_FILE, text);
console.log("Final touch-ups and ReportsTab upgrade applied!");
