const fs = require('fs');
const path = './src/pages/CampaignWorkspacePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
const importsToAdd = `import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
`;

content = content.replace(
  'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";',
  'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";\n' + importsToAdd
);

// 2. Replace the old activityLogs and showActivityLog state
const newActivityState = `
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [auditItemFilter, setAuditItemFilter] = useState<string | null>(null);

  const auditLogs = [
    {
      id: "a3",
      action: "DELETE",
      actorName: "Aditya Pratama",
      actorRole: "Safety Superintendent",
      actorType: "HUMAN",
      timestamp: "2026-08-05T09:04:00Z",
      versionTo: 3,
      deletionReason: "Item dihapus dari analisis aktif karena tidak relevan dengan konteks campaign.",
      changeNote: "Menghapus elemen yang kurang sesuai",
      before: {
        version: 2,
        stage: "Metadata",
        time: "14:35",
        description: "Gambar referensi amblas.",
      }
    },
    {
      id: "a2",
      action: "UPDATE",
      actorName: "Gulang Satriya",
      actorRole: "Lead Investigator",
      actorType: "HUMAN",
      timestamp: "2026-08-05T08:16:00Z",
      versionTo: 2,
      changeNote: "Penyesuaian rekomendasi perbaikan untuk pekerja lapangan",
      before: {
        version: 1,
        stage: "Lesson Learned",
        time: "14:10",
        description: "Draft awal otomatis oleh AI.",
      },
      after: {
        version: 2,
        stage: "Lesson Learned",
        time: "14:15",
        description: "Penekanan pada kewaspadaan area lembek dan checklist FTW.",
      }
    },
    {
      id: "a1",
      action: "CREATE",
      actorName: "System AI",
      actorRole: "Campaign Generator",
      actorType: "AI",
      timestamp: "2026-08-05T08:00:00Z",
      versionTo: 1,
      after: {
        version: 1,
        stage: "Poster Generation",
        time: "14:00",
        description: "Poster Campaign berhasil digenerate berdasarkan data Investigation.",
      }
    }
  ];
`;

content = content.replace(
  /const activityLogs = \[[\s\S]*?\];/m,
  newActivityState
);

// Remove showActivityLog state
content = content.replace(/const \[showActivityLog, setShowActivityLog\] = useState\(true\);\n/, '');

// 3. Replace the Riwayat Perubahan block in the left panel with just a button
const oldRiwayatBlock = /{[\s\S]*?Riwayat Perubahan \*\/\s*<div className="border-b border-slate-100">[\s\S]*?<\/div>\n\s*<\/div>/m;
const newRiwayatBlock = `
            {/* Riwayat Perubahan */}
            <div className="p-5 border-b border-slate-100">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-9 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200"
                onClick={() => setIsAuditDrawerOpen(true)}
              >
                <History className="h-4 w-4 text-slate-500" />
                Riwayat Perubahan &middot; {auditLogs.length} aktivitas
              </Button>
            </div>
          </div>
`;

content = content.replace(
  /\{\/\* Riwayat Perubahan \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Main Content Area \*\/\}/m,
  newRiwayatBlock + "\n\n          {/* Main Content Area */}"
);


// 4. Inject the Drawer at the bottom
const drawerCode = `
      {/* Audit Log Drawer */}
      <Sheet open={isAuditDrawerOpen} onOpenChange={setIsAuditDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col bg-slate-50 border-l border-slate-300 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-600" />
                  RIWAYAT PERUBAHAN
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {auditItemFilter ? (
                    <span className="flex items-center gap-2">
                      <button onClick={() => setAuditItemFilter(null)} className="text-blue-600 hover:underline">← Semua Perubahan</button>
                      <span>&middot;</span>
                      Riwayat Item
                    </span>
                  ) : (
                    \`Campaign Generator · \${auditLogs.length} aktivitas\`
                  )}
                </div>
              </div>
            </div>
            
            {!auditItemFilter && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="Cari waktu, pengguna, atau isi perubahan..."
                    className="pl-8 h-9 text-xs bg-slate-50 border-slate-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300 flex-1 shadow-none">
                      <SelectValue placeholder="Semua Aksi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="CREATE">Dibuat</SelectItem>
                      <SelectItem value="UPDATE">Diubah</SelectItem>
                      <SelectItem value="DELETE">Dihapus</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300 flex-1 shadow-none">
                      <SelectValue placeholder="Semua Pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pengguna</SelectItem>
                      <SelectItem value="HUMAN">Human</SelectItem>
                      <SelectItem value="AI">AI/System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 bg-slate-50/50 p-6">
            <div className="relative border-l border-slate-200 ml-4 pb-4 space-y-8">
              {auditLogs.filter(log => !auditItemFilter || log.id === auditItemFilter).length === 0 && (
                <div className="ml-6 mt-4 text-sm text-slate-500 bg-white p-4 rounded-md border border-slate-200 text-center">
                  <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">Belum ada perubahan</p>
                  <p className="text-xs mt-1">Aktivitas create, edit, dan delete pada agent ini akan muncul di sini.</p>
                </div>
              )}
              {auditLogs.filter(log => !auditItemFilter || log.id === auditItemFilter).length > 0 && (
                auditLogs
                  .filter(log => !auditItemFilter || log.id === auditItemFilter)
                  .map((log) => {
                  const isCreate = log.action === 'CREATE';
                  const isUpdate = log.action === 'UPDATE';
                  const isDelete = log.action === 'DELETE';
                  
                  const phaseLabel = log.after?.stage || log.before?.stage || "Campaign";
                  const timeLabel = log.after?.time || log.before?.time || "";
                  const previewText = log.after?.description || log.before?.description;

                  return (
                    <div key={log.id} className="relative pl-8">
                      <div className={cn(
                        "absolute -left-2.5 top-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                        isCreate && "bg-emerald-500",
                        isUpdate && "bg-blue-500",
                        isDelete && "bg-rose-500"
                      )}>
                        {isCreate && <Check className="h-3 w-3 text-white" />}
                        {isUpdate && <Pencil className="h-3 w-3 text-white" />}
                        {isDelete && <Trash2 className="h-3 w-3 text-white" />}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden group">
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
                            isCreate && "bg-emerald-100 text-emerald-700",
                            isUpdate && "bg-blue-100 text-blue-700",
                            isDelete && "bg-rose-100 text-rose-700"
                          )}>
                            {isCreate && "DIBUAT"}
                            {isUpdate && "DIUBAH"}
                            {isDelete && "DIHAPUS"}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(log.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span 
                              className="text-xs font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors"
                            >
                              {phaseLabel} &middot; {timeLabel}
                            </span>
                          </div>

                          {isDelete && log.deletionReason && (
                            <p className="text-xs text-slate-600 mb-3 bg-rose-50 p-2 rounded border border-rose-100">
                              <span className="font-bold block mb-1">Alasan Penghapusan:</span>
                              {log.deletionReason}
                            </p>
                          )}

                          {(isCreate || isUpdate) && (
                            <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                              "{isUpdate && log.after ? log.after.description : previewText}"
                            </div>
                          )}

                          {isUpdate && log.before && log.after && (
                            <details className="group">
                              <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                                <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                                <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                              </summary>
                              
                              <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                                {log.changeNote && (
                                  <div>
                                    <div className="text-[9px] font-bold text-slate-400 mb-1">CATATAN ANOTASI</div>
                                    <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{log.changeNote}</div>
                                  </div>
                                )}
                                
                                <div>
                                  <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                                  <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">
                                    {log.before.time && <span className="font-bold mr-1">{log.before.time} -</span>}
                                    {log.before.description}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                                  <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">
                                    {log.after.time && <span className="font-bold mr-1">{log.after.time} -</span>}
                                    {log.after.description}
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] text-slate-500 font-medium">Actor</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-700">{log.actorName}</span>
                                <span className="text-[10px] text-slate-400">&middot; {log.actorRole}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1">
                                {log.actorType === 'AI' && <Brain className="h-3 w-3 text-purple-500" />}
                                {log.actorType !== 'AI' && <User className="h-3 w-3 text-blue-500" />}
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  {log.actorType === 'AI' ? 'AI GENERATED' : log.actorType === 'SYSTEM' ? 'SYSTEM' : 'HUMAN'}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                Versi {log.versionTo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
`;

content = content.replace(
  /\{\/\* Floating Data Input Modal \*\/\}/m,
  drawerCode + "\n\n      {/* Floating Data Input Modal */}"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched CampaignWorkspacePage.tsx');
