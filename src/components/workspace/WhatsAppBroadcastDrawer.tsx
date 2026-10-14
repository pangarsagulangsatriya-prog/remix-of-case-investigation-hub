import React, { useState, useRef, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Copy, 
  Check, 
  RotateCcw, 
  Pencil, 
  Eye, 
  MessageSquare, 
  Phone, 
  Video, 
  MoreVertical, 
  CheckCheck, 
  Info, 
  CheckCircle2, 
  FileText, 
  Maximize2, 
  X,
  ChevronLeft,
  Wifi,
  Battery,
  Smile,
  Paperclip,
  Camera,
  Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SafetyAlertPoster } from "@/components/workspace/SafetyAlertPoster";

export interface WhatsAppAlertData {
  code: string;
  title: string;
  category: string;
  categoryBadge: string;
  releaseDate: string;
  incidentDate: string;
  location: string;
  company: string;
  posterThumbUrl: string;
  summaryText: string;
  checklistTitle: string;
  checklists: string[];
  fieldCheckArea: string;
  lessonTitle: string;
  lessonQuote: string;
}

// Single active Safety Alert for the campaign
export const ACTIVE_CAMPAIGN_ALERT: WhatsAppAlertData = {
  code: "SA-004/IX/2026",
  title: "TRACK DOZER AMBLAS SAAT BRUSHING DI AREA TITIK LEMBEK",
  category: "NEAR MISS",
  categoryBadge: "NEAR MISS",
  releaseDate: "08 SEPTEMBER 2026",
  incidentDate: "Senin, 31 Agustus 2026 | 13:50 WITA",
  location: "WMP 21, Blok 7 - BMO 2",
  company: "PT Bandang Mining Coal",
  posterThumbUrl: "/images/dozer_stuck.jpg",
  summaryText: "Kejadian track dozer amblas saat brushing di area titik lembek menjadi pengingat bahwa area kerja yang belum teridentifikasi batas amblasnya dapat membahayakan operator dan unit seketika.",
  checklistTitle: "Pastikan sebelum beroperasi di area lembek:",
  checklists: [
    "Pastikan batas area kerja sudah berpatok (boundary tim survey) sebelum brushing atau dozing.",
    "Kenali bekas parit maupun genangan air di sekitar lokasi kerja.",
    "Wajib mengisi FTW (Fit To Work) awal shift dan diperiksa oleh pengawas.",
    "Jika permukaan terasa lembek atau unit mulai turun: Hentikan unit segera dan laporkan ke pengawas!",
    "Pastikan setiap aktifitas pekerjaan telah dibuatkan DOP dan MPRP pembuatan saluran."
  ],
  fieldCheckArea: "Observasi Lapangan & Inspeksi Titik Lembek WMP",
  lessonTitle: "TANAH LEMBEK TIDAK MEMBERI PERINGATAN SEBELUM AMBLAS.",
  lessonQuote: "Sekali track turun, unit dan operator sudah berada dalam risiko. Batas area kerja yang jelas dan inspeksi yang tercatat adalah pengaman utamanya."
};

export const PRESET_ALERTS = [ACTIVE_CAMPAIGN_ALERT];

export function buildWhatsAppMessage(data: WhatsAppAlertData = ACTIVE_CAMPAIGN_ALERT, useBoldMarkers = true): string {
  const b = (text: string) => (useBoldMarkers ? `*${text}*` : text);
  const checklistLines = data.checklists.map(c => `✓ ${c}`).join("\n");

  return `📢 ${b(`SAFETY ALERT ${data.code} | LEARN & TAKE ACTION`)}

Rekan-rekan,

${data.summaryText}

Mohon Safety Alert ini disosialisasikan melalui P5M/Toolbox Meeting/Safety Talk dan ditindaklanjuti di area kerja masing-masing.

${b(data.checklistTitle)}
${checklistLines}

⚠️ ${b(`Jangan hanya disosialisasikan — cek kondisi di lapangan (${data.fieldCheckArea}) serta pastikan tindakan perbaikannya dilaksanakan.`)}
(${b("Dokumentasikan kedalam aplikasi BEATS")})

“${b(data.lessonTitle)}
${data.lessonQuote}”`;
}

interface WhatsAppBroadcastDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCaseCode?: string;
}

export function WhatsAppBroadcastDrawer({
  open,
  onOpenChange
}: WhatsAppBroadcastDrawerProps) {
  const alertData = ACTIVE_CAMPAIGN_ALERT;

  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState<string>(() => buildWhatsAppMessage(alertData, true));
  const [showFullPosterModal, setShowFullPosterModal] = useState(false);

  // Scaled poster dimensions in the phone screen
  const phonePosterContainerRef = useRef<HTMLDivElement>(null);
  const phonePosterInnerRef = useRef<HTMLDivElement>(null);
  const [posterScale, setPosterScale] = useState(0.33);
  const [posterHeight, setPosterHeight] = useState(290);

  useEffect(() => {
    if (!open) return;
    const updateDims = () => {
      if (!phonePosterContainerRef.current) return;
      const w = phonePosterContainerRef.current.clientWidth;
      if (w > 0) {
        const scale = w / 1000;
        setPosterScale(scale);
        const measuredH = phonePosterInnerRef.current?.offsetHeight || 880;
        setPosterHeight(Math.round(measuredH * scale));
      }
    };
    
    const timer = setTimeout(updateDims, 150);
    window.addEventListener("resize", updateDims);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDims);
    };
  }, [open, activeTab]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast.success("Pesan WhatsApp berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Gagal menyalin pesan.");
    }
  };

  const handleResetToDefault = () => {
    setMessageText(buildWhatsAppMessage(alertData, true));
    toast.info("Teks pesan di-reset ke ringkasan standar.");
  };

  // Helper to render WhatsApp bold markers (*text*) as <strong> in preview
  const renderFormattedPreview = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const parts = line.split(/(\*[^*]+\*)/g);
      return (
        <React.Fragment key={idx}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
              return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(1, -1)}</strong>;
            }
            return <span key={pIdx}>{part}</span>;
          })}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-[840px] md:max-w-[940px] lg:max-w-[1040px] max-w-[70vw] p-0 flex flex-col gap-0 border-l border-slate-200 bg-white shadow-none"
        >
          {/* Header Bar - Clean Solid White */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-sm font-black uppercase tracking-tight text-slate-900">
                    Preview Pesan WhatsApp (Safety Alert)
                  </SheetTitle>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    {alertData.code}
                  </span>
                </div>
                <SheetDescription className="text-xs text-slate-500 font-medium mt-0.5">
                  Ringkasan otomatis untuk sosialisasi P5M, Toolbox Meeting, dan koordinasi lapangan
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Toolbar: Segmented Mode Selector & Single Primary Copy Button */}
          <div className="bg-white px-6 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0 gap-3">
            {/* Segmented Mode Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded transition-all",
                  activeTab === "preview" ? "bg-white text-slate-900 shadow-none" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                Pratinjau HP
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded transition-all",
                  activeTab === "edit" ? "bg-white text-slate-900 shadow-none" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Pencil className="w-3.5 h-3.5 text-blue-600" />
                Edit Teks
              </button>
            </div>

            {/* Single Primary Action Button */}
            <Button
              onClick={handleCopy}
              className={cn(
                "h-8 px-4 text-xs font-bold gap-1.5 rounded-md shadow-none transition-all",
                copied 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                  : "bg-[#25D366] hover:bg-[#1ebd59] text-white"
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Tersalin ke Clipboard!" : "Salin Pesan (Copas)"}
            </Button>
          </div>

          {/* Main Body - Solid White Background (MoEngage / CleverTap Style) */}
          <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col gap-6">
            {activeTab === "preview" && (
              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
                
                {/* 1. SMARTPHONE DEVICE FRAME (Phone Mockup - Sleek, Flat, No Shadow) */}
                <div className="w-[420px] max-w-[94vw] min-w-[380px] h-[720px] max-h-[82vh] rounded-[42px] border-[8px] border-slate-900 bg-slate-900 shadow-none overflow-hidden flex flex-col relative shrink-0">
                  
                  {/* Dynamic Island Notch Pill */}
                  <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-end px-2 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-slate-950 border border-slate-800" />
                  </div>

                  {/* Phone Status Bar */}
                  <div className="bg-[#075e54] text-white px-7 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold shrink-0 select-none z-20">
                    <span>10:58</span>
                    <div className="flex items-center gap-1.5 text-white/90">
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* WhatsApp App Header */}
                  <div className="bg-[#075e54] text-white px-3 py-2 flex items-center justify-between shrink-0 shadow-none z-20">
                    <div className="flex items-center gap-2">
                      <ChevronLeft className="w-5 h-5 text-white/90 cursor-pointer -ml-1" />
                      <div className="w-8 h-8 rounded-full bg-emerald-200 text-[#075e54] flex items-center justify-center font-black text-xs shrink-0 border border-white/20">
                        PS
                      </div>
                      <div className="leading-tight">
                        <div className="text-xs font-bold tracking-tight truncate max-w-[130px]">~ ParliSuparli</div>
                        <div className="text-[10px] text-emerald-200/90 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          online
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-white/85">
                      <Video className="w-4 h-4 cursor-pointer hover:text-white" />
                      <Phone className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                      <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
                    </div>
                  </div>

                  {/* WhatsApp Scrollable Chat Body */}
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-[#efeae2] relative select-text custom-scrollbar">
                    {/* Background Pattern */}
                    <div 
                      className="absolute inset-0 opacity-[0.035] pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                        backgroundSize: '16px 16px'
                      }}
                    />

                    {/* Date Chip */}
                    <div className="self-center bg-white/90 shadow-none border border-slate-200/80 rounded px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest my-0.5 z-10">
                      HARI INI
                    </div>

                    {/* WhatsApp Message Bubble */}
                    <div className="self-start w-full bg-white rounded-lg rounded-tl-none shadow-none border border-slate-200/90 p-3 flex flex-col gap-2 relative z-10">
                      
                      {/* Bubble Tail */}
                      <div className="absolute -left-2 top-0 w-0 h-0 border-t-[7px] border-t-white border-l-[7px] border-l-transparent" />

                      {/* Clickable Full Campaign Poster (Image can be clicked like real WhatsApp) */}
                      <div 
                        ref={phonePosterContainerRef}
                        onClick={() => setShowFullPosterModal(true)}
                        className="relative w-full overflow-hidden rounded-md border border-slate-300 bg-white shadow-none hover:ring-2 hover:ring-emerald-500/50 transition-all cursor-pointer group"
                        style={{ height: `${posterHeight}px` }}
                        title="Klik untuk melihat poster penuh"
                      >
                        {/* Scaled Poster Element */}
                        <div 
                          ref={phonePosterInnerRef}
                          style={{ 
                            width: '1000px', 
                            transform: `scale(${posterScale})`, 
                            transformOrigin: 'top left' 
                          }}
                          className="pointer-events-none select-none bg-white origin-top-left"
                        >
                          <SafetyAlertPoster readOnly={true} />
                        </div>

                        {/* Hover Overlay Icon */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-none backdrop-blur-sm">
                            <Maximize2 className="w-3 h-3 text-emerald-400" />
                            Perbesar Poster
                          </div>
                        </div>

                        {/* Bottom Caption Bar */}
                        <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-white px-2 py-1 flex items-center justify-between text-[9px] backdrop-blur-sm border-t border-white/10 z-10">
                          <span className="font-semibold truncate max-w-[210px]">
                            Poster [{alertData.code}]
                          </span>
                          <span className="font-mono text-slate-300 text-[8px]">A4 • 1.2 MB</span>
                        </div>
                      </div>

                      {/* Message Text */}
                      <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans pt-0.5">
                        {renderFormattedPreview(messageText)}
                      </div>

                      {/* Timestamp & Read Receipt */}
                      <div className="self-end flex items-center gap-1 text-[9px] text-slate-400 pt-0.5">
                        <span>10:58 WITA</span>
                        <CheckCheck className="w-3 h-3 text-blue-500 inline" />
                      </div>
                    </div>

                    <div className="self-center text-center text-[9px] text-slate-400 py-1">
                      🔒 Pesan terformat untuk sosialisasi P5M
                    </div>
                  </div>

                  {/* WhatsApp Bottom Chat Input Bar */}
                  <div className="bg-[#f0f2f5] p-2 flex items-center gap-1.5 shrink-0 border-t border-slate-200/70 z-20">
                    <div className="flex-1 bg-white rounded-full px-2.5 py-1 flex items-center gap-2 border border-slate-200 shadow-none text-slate-400">
                      <Smile className="w-4 h-4 text-slate-500" />
                      <span className="text-[11px] text-slate-400 flex-1">Ketik pesan</span>
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#128c7e] text-white flex items-center justify-center shrink-0 shadow-none">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Phone Bottom Home Gesture Bar */}
                  <div className="bg-white pt-1 pb-1 flex justify-center shrink-0 z-20">
                    <div className="w-28 h-1 bg-slate-300 rounded-full" />
                  </div>

                </div>

                {/* 2. RIGHT SIDE: INFORMATION & ACTION PANEL (Clean Solid White Cards) */}
                <div className="flex-1 max-w-[420px] flex flex-col gap-4">
                  
                  {/* Primary Action Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-none space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Ringkasan Broadcast
                        </h3>
                      </div>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Siap Kirim
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Ringkasan pesan telah disiapkan otomatis berdasarkan poster dan hasil investigasi. Salin teks untuk langsung disosialisasikan.
                    </p>

                    <Button
                      onClick={handleCopy}
                      className={cn(
                        "w-full h-10 font-bold text-xs gap-2 shadow-none transition-all rounded-lg",
                        copied 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "bg-[#25D366] hover:bg-[#1ebd59] text-white"
                      )}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Tersalin ke Clipboard!" : "Salin Pesan (Copas)"}
                    </Button>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{messageText.length} karakter</span>
                      <span>{messageText.split(/\s+/).filter(Boolean).length} kata</span>
                    </div>
                  </div>

                  {/* SOP P5M Steps */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-none space-y-3">
                    <div className="flex items-center gap-2 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider">Langkah Sosialisasi</span>
                    </div>
                    
                    <ul className="text-[11px] text-slate-600 space-y-2 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-400">1.</span>
                        <span>Klik <strong>Salin Pesan</strong> untuk menyalin teks.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-400">2.</span>
                        <span>Tempel (paste) ke grup koordinasi pengawas lapangan.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-400">3.</span>
                        <span>Bacakan pada briefing <strong>P5M Shift 1 & 2</strong> serta dokumentasikan ke <strong>BeATS</strong>.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Case Metadata */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-none space-y-2.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                      Data Kasus Alert
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Nomor Alert</span>
                        <span className="font-bold text-slate-900 font-mono">{alertData.code}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Kategori</span>
                        <span className="font-bold text-rose-600">{alertData.category}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Tanggal Rilis</span>
                        <span className="font-medium text-slate-800">{alertData.releaseDate}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Site / Lokasi</span>
                        <span className="font-medium text-slate-800 text-right line-clamp-1">{alertData.location}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Edit Teks Tab */}
            {activeTab === "edit" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-none flex flex-col gap-4 max-w-3xl mx-auto w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sesuaikan Teks Pesan WhatsApp</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Modifikasi kalimat pembuka atau tambahkan catatan lapangan spesifik sebelum disalin.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefault}
                    className="h-8 text-xs font-bold text-slate-600 hover:text-slate-900 gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset ke Standar
                  </Button>
                </div>

                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={16}
                  className="font-mono text-xs leading-relaxed p-4 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none shadow-none resize-y"
                  placeholder="Ketik teks pesan WhatsApp di sini..."
                />

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span className="font-mono">
                    {messageText.length} karakter • {messageText.split(/\s+/).filter(Boolean).length} kata
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setActiveTab("preview")}
                      variant="outline"
                      className="h-8 text-xs font-bold"
                    >
                      Kembali ke Pratinjau HP
                    </Button>
                    <Button
                      onClick={handleCopy}
                      className="h-8 text-xs font-bold bg-[#25D366] hover:bg-[#1ebd59] text-white shadow-none gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Tersalin!" : "Simpan & Salin Teks"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Format teks tebal (*) otomatis terbaca oleh aplikasi WhatsApp.</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4"
            >
              Tutup
            </Button>
          </div>

        </SheetContent>
      </Sheet>

      {/* Full Resolution Poster View Lightbox Modal */}
      <Dialog open={showFullPosterModal} onOpenChange={setShowFullPosterModal}>
        <DialogContent className="max-w-[1080px] max-h-[92vh] overflow-y-auto p-6 bg-slate-950 border-slate-800 text-white flex flex-col items-center">
          <div className="flex items-center justify-between w-full pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <DialogTitle className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Poster Campaign Safety Alert [{alertData.code}]
              </DialogTitle>
            </div>
            <button 
              onClick={() => setShowFullPosterModal(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 rounded-sm overflow-hidden shadow-2xl bg-white text-slate-900">
            <SafetyAlertPoster readOnly={true} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
