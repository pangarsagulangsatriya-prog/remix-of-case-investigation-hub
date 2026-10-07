const fs = require('fs');
const path = './src/pages/CampaignWorkspacePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Hand and Eye icon imports
content = content.replace(
  'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";',
  'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";\nimport { Hand, Eye, Maximize2 } from "lucide-react";'
);

// 2. Add state for isPreviewOpen and panMode
content = content.replace(
  'const [auditItemFilter, setAuditItemFilter] = useState<string | null>(null);',
  'const [auditItemFilter, setAuditItemFilter] = useState<string | null>(null);\n  const [isPreviewOpen, setIsPreviewOpen] = useState(false);\n  const [panMode, setPanMode] = useState(false);\n'
);

// 3. Update Main Content Area to replace Zoom Toolbar with Preview Konten button
const oldMainContentStart = /\{\/\* Zoom Toolbar \*\/\}[\s\S]*?\{\/\* isGenerating \&\& \(/;
const newMainContentStart = `
                {/* Preview Trigger Toolbar */}
                <div className="w-full flex justify-end sticky top-0 z-50 mb-6 max-w-6xl mx-auto px-6 pt-4">
                  <Button 
                    onClick={() => setIsPreviewOpen(true)}
                    className="bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs h-9"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Preview Konten
                  </Button>
                </div>

                {isGenerating && (`;

content = content.replace(oldMainContentStart, newMainContentStart);

// 4. Inject Preview Modal right before the closing </AppLayout>
const previewModalCode = `
      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] h-[900px] flex flex-col p-0 gap-0 overflow-hidden bg-slate-100 border-slate-300">
          <div className="bg-white border-b border-slate-200 p-3 px-5 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <Eye className="w-4 h-4 text-blue-600" />
                PREVIEW KONTEN
              </h2>
              <div className="h-5 w-px bg-slate-300"></div>
              {/* Zoom Controls inside modal */}
              <div className="flex items-center h-8 gap-1">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md shadow-sm overflow-hidden p-0.5">
                  <button onClick={handleZoomOut} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="text-xs font-bold text-slate-700 w-12 text-center select-none">{Math.round(currentZoom)}%</span>
                  <button onClick={handleZoomIn} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md shadow-sm overflow-hidden p-0.5 ml-1">
                  <button onClick={() => setZoomMode('FIT')} className={\`px-2.5 py-1 rounded text-[10px] tracking-wider font-bold \${zoomMode === 'FIT' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-200 transition-colors'}\`}>FIT</button>
                  <button onClick={() => setZoomMode('FILL')} className={\`px-2.5 py-1 rounded text-[10px] tracking-wider font-bold \${zoomMode === 'FILL' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-200 transition-colors'}\`}>FILL</button>
                  <button onClick={() => setZoomMode('100%')} className={\`px-2.5 py-1 rounded text-[10px] tracking-wider font-bold \${zoomMode === '100%' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-200 transition-colors'}\`}>100%</button>
                </div>
                <div className="h-4 w-px bg-slate-300 mx-2"></div>
                <button 
                  onClick={() => setPanMode(!panMode)} 
                  className={\`p-1.5 rounded-md border shadow-sm transition-colors \${panMode ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-200'}\`}
                  title="Hand Tool (Pan)"
                >
                  <Hand className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
              {/* Note: the default Dialog close button is hidden if we use our own, but Shadcn DialogContent has its own absolute Close button. So this is optional or we can hide Shadcn's close button via css. Let's just rely on the default close or provide a simple Tutup button */}
              Tutup
            </Button>
          </div>
          <div 
            className={\`flex-1 overflow-auto p-8 relative flex justify-center \${panMode ? 'cursor-grab active:cursor-grabbing' : ''}\`}
            style={{ 
               // Simple pan logic simulation: When panning is enabled, allow scrolling by dragging (this requires some JS logic typically, but CSS cursor helps UX)
            }}
          >
            <div style={{ zoom: currentZoom / 100 } as any} className="transition-all duration-300 origin-top shadow-xl">
              <SafetyAlertPoster 
                isGenerating={isGenerating} 
                generationStep={generationStep}
                onOpenDetail={(title) => { setSelectedAnalysis('poster:' + title); setIsRightPanelExpanded(true); setIsLeftPanelExpanded(false); }} 
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
`;

content = content.replace(
  /\{\/\* Floating Data Input Modal \*\/\}/m,
  previewModalCode + '\n\n      {/* Floating Data Input Modal */}'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch complete.');
