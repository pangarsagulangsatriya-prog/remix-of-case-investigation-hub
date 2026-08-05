import re

# PATCH FileRow.tsx
with open("src/components/workspace/ExtractionTab/FileRow.tsx", "r") as f:
    filerow_content = f.read()

filerow_content = filerow_content.replace(
    "export function FileRow({ file, isSelected, onSelect, onMove, onDelete, onRename, onRerun, onOpenHistory, batches, isIndented, onHoverChange, compact }: any) {",
    "export function FileRow({ file, isSelected, onSelect, onMove, onDelete, onRename, onRerun, onOpenHistory, batches, isIndented, onHoverChange, compact, readinessFindings = [], onOpenFinding }: any) {"
)

# Insert the readiness indicator right after the status badge
badge_injection = """
  const renderReadinessBadge = () => {
    if (!readinessFindings || readinessFindings.length === 0) return null;
    const critical = readinessFindings.find((f: any) => f.severity === "CRITICAL");
    const warning = readinessFindings.find((f: any) => f.severity === "WARNING");
    const topFinding = critical || warning || readinessFindings[0];
    
    let badgeClass = "bg-blue-50 text-blue-600 border-blue-200";
    let Icon = AlertCircle;
    
    if (topFinding.severity === "CRITICAL") {
      badgeClass = "bg-rose-50 text-rose-600 border-rose-200";
      Icon = AlertCircle;
    } else if (topFinding.severity === "WARNING") {
      badgeClass = "bg-amber-50 text-amber-600 border-amber-200";
      Icon = AlertTriangle;
    }

    return (
      <div 
        onClick={(e) => { e.stopPropagation(); if(onOpenFinding) onOpenFinding(); }}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold cursor-pointer hover:opacity-80 ml-2 ${badgeClass}`}
        title={topFinding.title}
      >
        <Icon className="h-2 w-2" />
        <span className="max-w-[80px] truncate">{topFinding.title}</span>
      </div>
    );
  };
"""

filerow_content = filerow_content.replace(
    "const renderStatusBadge = () => (",
    badge_injection + "\n  const renderStatusBadge = () => ("
)

filerow_content = filerow_content.replace(
    "{renderStatusBadge()}",
    "{renderStatusBadge()}\n           {renderReadinessBadge()}"
)

with open("src/components/workspace/ExtractionTab/FileRow.tsx", "w") as f:
    f.write(filerow_content)


# PATCH EvidenceTab.tsx
with open("src/components/workspace/Tabs/EvidenceTab.tsx", "r") as f:
    evidence_content = f.read()

# Add imports
imports_injection = """import { useReadiness } from "@/hooks/useReadiness";
import { EvidenceReadinessDrawer } from "../EvidenceReadinessDrawer";
"""

evidence_content = evidence_content.replace(
    "export default function EvidenceTab() {",
    imports_injection + "\nexport default function EvidenceTab() {"
)

# Add hooks
hooks_injection = """
  const { triggerCheck, latestCheck, activeFindings } = useReadiness();
  const [isReadinessDrawerOpen, setIsReadinessDrawerOpen] = useState(false);
"""

evidence_content = evidence_content.replace(
    "const { currentStep: tourStep, isActive: isTourActive } = useTour();",
    "const { currentStep: tourStep, isActive: isTourActive } = useTour();" + hooks_injection
)

# Auto trigger on upload
upload_trigger = """
      await uploadEvidenceMutation.mutateAsync({ caseId: caseId!, groups });
      triggerCheck("FILE_UPLOAD", groups[0]?.files[0]?.name || "Upload");
"""
evidence_content = evidence_content.replace(
    "await uploadEvidenceMutation.mutateAsync({ caseId: caseId!, groups });",
    upload_trigger
)

# Render readiness summary panel
summary_panel = """
              {/* Evidence Readiness Summary */}
              <div className="mx-6 mt-4 p-4 rounded-md border border-slate-200 bg-white flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Kesiapan Data Investigasi</h3>
                  {latestCheck ? (
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${latestCheck.status === 'READY' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : latestCheck.status === 'NEEDS_ATTENTION' ? 'bg-amber-50 text-amber-600 border-amber-200' : latestCheck.status === 'CHECKING' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                        {latestCheck.status === 'READY' ? 'Siap Dianalisis' : latestCheck.status === 'NEEDS_ATTENTION' ? 'Perlu Perhatian' : latestCheck.status === 'CHECKING' ? 'Sedang Diperiksa' : 'Belum Siap'}
                      </span>
                      {latestCheck.status === 'CHECKING' ? (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Memeriksa kelengkapan dan kualitas data...</span>
                      ) : (
                        <span className="text-[11px] text-slate-500">{activeFindings.length} temuan aktif. {activeFindings.length > 0 ? "Data dapat dianalisis, namun beberapa kekurangan dapat menurunkan kualitas hasil." : "Kualitas data memadai."}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500">Belum ada data untuk diperiksa.</span>
                  )}
                  {latestCheck && latestCheck.status !== 'CHECKING' && (
                    <div className="text-[9px] text-slate-400 mt-2 font-medium">
                      Pemeriksaan terakhir: {new Date(latestCheck.createdAt).toLocaleString('id-ID', {day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})} WIB
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest" onClick={() => setIsReadinessDrawerOpen(true)}>Lihat Saran</Button>
                  <Button variant="default" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white" onClick={() => triggerCheck("MANUAL_RECHECK")}>Periksa Ulang</Button>
                </div>
              </div>
"""

evidence_content = evidence_content.replace(
    """<div className="flex-1 overflow-auto bg-slate-50/50">""",
    """<div className="flex-1 overflow-auto bg-slate-50/50">""" + summary_panel
)

# Update FileRow usages to pass readinessFindings
evidence_content = evidence_content.replace(
    "compact={!!activeFile}",
    "compact={!!activeFile}\n                          readinessFindings={activeFindings.filter(f => f.relatedFileName === file.name)}\n                          onOpenFinding={() => setIsReadinessDrawerOpen(true)}"
)

# Add Drawer component at the end
drawer_injection = """
      <EvidenceReadinessDrawer 
        open={isReadinessDrawerOpen} 
        onOpenChange={setIsReadinessDrawerOpen} 
      />
"""

evidence_content = evidence_content.replace(
    "</div >\n  );\n}",
    drawer_injection + "</div >\n  );\n}"
)

with open("src/components/workspace/Tabs/EvidenceTab.tsx", "w") as f:
    f.write(evidence_content)

