with open("src/hooks/useReadiness.ts", "r") as f:
    content = f.read()

initial_check = """
const ts = new Date().toISOString();
const initialCheckId = "check-initial";
const initialDummyFindings: ReadinessFinding[] = [
  {
    id: `fnd-init-1`,
    checkId: initialCheckId,
    title: "FILE GAGAL DIPROSES",
    description: "Screenshot 2025-12-04 085746.png tidak berhasil dianalisis.",
    impact: "Data visual tidak dapat diekstrak oleh agen pengolah gambar.",
    suggestion: "Unggah ulang file atau gunakan format lain.",
    severity: "CRITICAL",
    status: "NEW",
    relatedFileName: "Screenshot 2025-12-04 085746.png",
    createdAt: ts,
    activityLog: [{
      id: `act-init-1`,
      userName: "System",
      userRole: "Evidence Readiness Agent",
      timestamp: ts,
      note: "Finding dibuat oleh Evidence Readiness Agent",
      action: "CREATED"
    }]
  },
  {
    id: `fnd-init-2`,
    checkId: initialCheckId,
    title: "BUKTI FASE KONTAK BELUM TERSEDIA",
    description: "Belum ditemukan bukti yang cukup untuk mendukung kejadian utama.",
    impact: "Urutan kejadian dan penyebab langsung dapat memiliki tingkat kepastian rendah.",
    suggestion: "Tambahkan rekaman CCTV, data perangkat, foto lokasi, atau pernyataan saksi yang relevan.",
    severity: "WARNING",
    status: "NEW",
    createdAt: ts,
    activityLog: [{
      id: `act-init-2`,
      userName: "System",
      userRole: "Evidence Readiness Agent",
      timestamp: ts,
      note: "Finding dibuat oleh Evidence Readiness Agent",
      action: "CREATED"
    }]
  },
  {
    id: `fnd-init-3`,
    checkId: initialCheckId,
    title: "KONTEKS WAKTU BELUM LENGKAP",
    description: "Beberapa file tidak memiliki informasi waktu kejadian yang dapat diverifikasi.",
    impact: "Garis waktu kronologi mungkin memiliki jeda atau urutan yang kurang akurat.",
    suggestion: "Ganti nama file dengan format waktu yang jelas atau perbarui metadata.",
    severity: "SUGGESTION",
    status: "NEW",
    createdAt: ts,
    activityLog: [{
      id: `act-init-3`,
      userName: "System",
      userRole: "Evidence Readiness Agent",
      timestamp: ts,
      note: "Finding dibuat oleh Evidence Readiness Agent",
      action: "CREATED"
    }]
  }
];

const getDefaultState = (): ReadinessState => ({
  checks: [{
    id: initialCheckId,
    version: 1,
    triggeredBy: "FILE_UPLOAD",
    triggerReference: "Screenshot 2025-12-04 085746.png",
    status: "NOT_READY",
    createdAt: ts,
    findings: initialDummyFindings
  }],
  overrides: [],
});
"""

content = content.replace(
"""const getDefaultState = (): ReadinessState => ({
  checks: [],
  overrides: [],
});""", initial_check)

with open("src/hooks/useReadiness.ts", "w") as f:
    f.write(content)
