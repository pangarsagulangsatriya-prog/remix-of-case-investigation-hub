import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { 
  Play,
  Pause, 
  RotateCcw,
  Brain, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Check, 
  X, 
  Search, 
  History, 
  BookText, 
  Folder, 
  ChevronDown, 
  Loader2, 
  Cpu, 
  LayoutGrid, 
  FileText, 
  Paperclip, 
  Quote, 
  Activity, 
  Users, 
  User,
  Copy, 
  FileJson,
  XCircle,
  HelpCircle,
  Database,
  Folders,
  Crosshair,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEvidence } from "@/hooks/useEvidence";
import { AgentState, AgentRunHistory, EvidenceTraceLink } from "@/types/workspace";
import { FactChronologyModule, TraceabilityPanel } from "@/components/analysis/FactChronologyModule";
import { ActorAnalysisModule, ActorDetailPanel } from "@/components/analysis/ActorAnalysisModule";

// Icons mapping for local use
const AudioIcon = Activity;
const DocIcon = FileText;

export const AgentDisplayMeta: Record<string, { nodeId: string, subtitle: string }> = {
  fact: { nodeId: 'CHR-04', subtitle: 'Reconstructing event timeline' },
  actor: { nodeId: 'ACT-02', subtitle: 'Identifying key personnel' },
  peepo: { nodeId: 'PPO-01', subtitle: 'Analyzing environmental context' },
  ipls: { nodeId: 'LYR-09', subtitle: 'Security layer validation' },
  prev: { nodeId: 'PRV-03', subtitle: 'Generating prevention plans' }
};

const initialAgentsState: AgentState[] = [
  { 
     id: 'fact', 
     name: 'Fakta & Kronologi', 
     icon: Clock, 
     purpose: 'Merekonstruksi urutan kejadian dari bukti-bukti mentah.', 
     status: 'completed', 
     dependencies: [],
     runCount: 3,
     lastRunTimestamp: "Today, 10:42 AM",
     tokenEstimate: 2500,
     actualTokenUsage: 2140,
     durationMs: 4200,
     history: [
       { run_id: "r-101", agent_id: "fact", started_at: "2026-04-20T09:00:00Z", ended_at: "2026-04-20T09:00:05Z", triggered_by: "System", status: "completed", token_usage: 2050, duration_ms: 5000, summary: "Initial extraction" },
       { run_id: "r-102", agent_id: "fact", started_at: "2026-04-20T10:42:00Z", ended_at: "2026-04-20T10:42:04Z", triggered_by: "Current User", status: "completed", token_usage: 2140, duration_ms: 4200, summary: "Rerun after evidence update" }
     ],
     backendCapabilities: { canPause: false, canResume: false, canStop: true, canRerun: true },
     knowledgeSelection: ['Audio Recording', 'Internal Document', 'External Document', 'Photos & Media'],
     results: {
        ringkasan: {
           tanggal: "05 November 2024",
           jam: "22:15 - 01:35",
           lokasi: "KM 12 & KM 7 Hauling Road",
           jenis: "Fatigue Validation Failure & Comms Failure",
           deskripsi: "Kegagalan validasi intervensi kelelahan dan hambatan komunikasi radio berujung pada kecelakaan tunggal Operator Saiful.",
           departemen: "Mining Operations / DMS Control Room",
           sumber_bukti: "DMS Recap, WhatsApp, Radio, Video DMS",
           severity: "Critical"
        },
        chronology_items: [
           { 
             id: 'chrono-saiful-001', 
             phase: 'pre_contact', 
             time_label: "Minggu 10-41",
             description: "Pada Minggu 10-41, Petugas DMS (Aris) mengidentifikasi riwayat deviasi kelelahan pada profil Operator Saiful dalam proses investigasi dengan pemantauan intensif.", 
             chronology_text: "Pada Minggu 10-41, Petugas DMS (Aris) mengidentifikasi riwayat deviasi kelelahan pada profil Operator Saiful dalam proses investigasi dengan pemantauan intensif.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Petugas DMS (Aris)", evidence: "tanggung jawab Pak Aris sebagai DMS control room" },
                action: { 
                    value: "mengidentifikasi riwayat deviasi kelelahan", 
                    citations: [
                       { type: 'document', content: "ada juga banyak di rekapan juga sampai dari week 10 sampai week 41 itu 41 kali", page: "04", source: "DMS_RECAP_WEEKLY.XLSX" },
                       { type: 'image', content: "Screenshot dashboard DMS menunjukkan lonjakan deviasi pada profil Saiful.", source: "DMS_ALERT_SS_01.PNG", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200" }
                    ]
                 },
                object: { 
                    value: "profil Operator Saiful", 
                    citations: [
                       { type: 'audio', content: "catatannya banyak fatigue, ah itu biasa kami sering intens... mengontrol mereka", speaker: "Aris", time: "02:16", source: "VOIP_REC_01.WAV" },
                       { type: 'video', content: "Rekaman CCTV menunjukkan operator Saiful terlihat kelelahan saat memasuki unit.", time: "22:05", source: "CCTV_GATE_A.MP4", thumbnail: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=200" }
                    ]
                 },
                location: { value: "profil Operator Saiful" },
                time: "Minggu 10-41",
                why: { value: "dalam proses investigasi" },
                source_system: { 
                    value: "Rekapitulasi Data DMS", 
                    citations: [
                       { type: 'document', content: "laporan temuan deviasi fatigue itu ada yang kami catat tuh Pak di rekap itu", page: "08", source: "DMS_RECAP_WEEKLY.XLSX" }
                    ]
                 },
                condition: { 
                    value: "pemantauan intensif", 
                    citations: [
                       { type: 'audio', content: "kalau misalnya dari orang ini eh catatannya banyak fatigue, ah itu biasa kami sering intens", speaker: "Aris", time: "02:18", source: "VOIP_REC_01.WAV" }
                    ]
                 }
             }
           },
           { 
             id: 'chrono-saiful-002', 
             phase: 'pre_contact', 
             time_label: "22:15 WITA",
             description: "Pada 22:15 WITA, Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful untuk operasional malam hari dalam proses investigasi.", 
             chronology_text: "Pada 22:15 WITA, Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful untuk operasional malam hari dalam proses investigasi.",
             confidence: "high",
             status: "completed",
             verification_status: "ai_generated",
             annotated_by_human: false,
             breakdown: {
                subject: { value: "Sistem DMS", evidence: "kalau di klik DMS dua, kalau di Gimo satu" },
                action: { value: "memicu peringatan kritis kategori Lockdown", evidence: "Yang pertama itu eh Lockdown, itu di jam 22:15" },
                object: { value: "unit yang sedang dioperasikan oleh Operator Saiful", evidence: "Jam 22:15 ada alert lockdown-nya Pak Saiful ya" },
                location: { value: "unit yang sedang dioperasikan oleh Operator Saiful" },
                time: "22:15 WITA",
                why: { value: "dalam proses investigasi" },
                source_system: { value: "Dashboard Control Room", evidence: "Terus saya pantau lagi di klik DMS" },
                condition: { value: "operasional malam hari", evidence: "pengawas room yang bertugas pada malam hari itu" }
             }
           },
           { 
             id: 'chrono-saiful-003', 
             phase: 'pre_contact', 
             time_label: "Pasca 22:15",
             description: "Pasca 22:15, Pengawas Fatur mengonfirmasi kondisi operator dalam keadaan baik secara verbal melalui aplikasi WhatsApp tanpa bukti visual dalam proses investigasi.", 
             chronology_text: "Pasca 22:15, Pengawas Fatur mengonfirmasi kondisi operator dalam keadaan baik secara verbal melalui aplikasi WhatsApp tanpa bukti visual dalam proses investigasi.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Pengawas Fatur", evidence: "dia lapor kondisi beliau yang kondisinya baik-baik saja" },
                action: { value: "mengonfirmasi kondisi operator dalam keadaan baik secara verbal", evidence: "Minta evidence lanjut? Enggak. Karena saya yakin chat itu sudah memastikan" },
                object: { value: "Kondisi Operator", evidence: "Sudah diintervensi komunikasi dua arah sama Pak Saiful... beliau baik-baik saja" },
                location: { value: "aplikasi WhatsApp", evidence: "Komunikasi japri lewat WA ke pengawas room" },
                time: "Pasca 22:15",
                why: { value: "dalam proses investigasi" },
                source_system: { value: "Aplikasi WhatsApp", evidence: "Komunikasi japri lewat WA ke pengawas room" },
                condition: { value: "tanpa bukti visual", evidence: "Aris did not request photo evidence of the intervention, relying on the text message" }
             }
           },
           { 
             id: 'chrono-saiful-004', 
             phase: 'contact', 
             time_label: "01:35 WITA",
             description: "Pada 01:35 WITA, Unit Operator Saiful mengalami kecelakaan tunggal yang teramati melalui video surveillance DMS pada saat shift kritis dalam proses investigasi.", 
             chronology_text: "Pada 01:35 WITA, Unit Operator Saiful mengalami kecelakaan tunggal yang teramati melalui video surveillance DMS pada saat shift kritis dalam proses investigasi.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Unit Operator Saiful", evidence: "Pak Saiful itu alertnya di mana... kecelakaan tunggal" },
                action: { value: "mengalami kecelakaan tunggal", evidence: "itu masuk pas di nonton pas di pertengahan video itu sudah kecelakaan tunggal" },
                object: { value: "Fasilitas Operasional", evidence: "sudah kecelakaan tunggal jam 01:35" },
                location: { value: "video surveillance DMS" },
                time: "01:35 WITA",
                why: { value: "dalam proses investigasi" },
                source_system: { value: "Video Surveillance DMS", evidence: "pas di nonton pas di pertengahan video" },
                condition: { value: "shift kritis", evidence: "pada saat shift kritis Pak di hari Jumat" }
             }
           },
           { 
             id: 'chrono-saiful-005', 
             phase: 'post_contact', 
             time_label: "Pasca 01:35",
             description: "Pasca 01:35, infrastruktur komunikasi mengalami gangguan sinyal pada KM 12 dan KM 7 yang menghambat koordinasi jalur radio karena radio tidak nyampe.", 
             chronology_text: "Pasca 01:35, infrastruktur komunikasi mengalami gangguan sinyal pada KM 12 dan KM 7 yang menghambat koordinasi jalur radio karena radio tidak nyampe.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "infrastruktur komunikasi", evidence: "radio enggak nyampe. KM 12 ke hauling enggak nyampe radio" },
                action: { value: "mengalami gangguan sinyal", evidence: "Komunikasi via radio sama pengawas di jalur safety itu... radio enggak nyampe" },
                object: { value: "Koordinasi Jalur Radio", evidence: "jalur komunikasi sama pengawas radio" },
                location: { value: "KM 12 dan KM 7" },
                time: "Pasca 01:35",
                why: { value: "radio tidak nyampe" },
                source_system: { value: "Perangkat Radio Lapangan", evidence: "ada di KM 12 dan KM 7 itu radio enggak nyampe" },
                condition: { value: "menghambat koordinasi jalur radio", evidence: "Radio communication dead zones are identified at KM 12 and KM 7" }
             }
           },
           { 
             id: 'chrono-saiful-006', 
             phase: 'post_contact', 
             time_label: "Pasca 01:35",
             description: "Pasca 01:35, Petugas Control Room (Aris) dengan monitoring standby memfokuskan pemantauan pada jalur emergency dikarenakan respons pengawas lapangan terbatas.", 
             chronology_text: "Pasca 01:35, Petugas Control Room (Aris) dengan monitoring standby memfokuskan pemantauan pada jalur emergency dikarenakan respons pengawas lapangan terbatas.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Petugas Control Room (Aris)", evidence: "Saya monitor stanby di jalur emergency saja fokusnya" },
                action: { value: "memfokuskan pemantauan", evidence: "sudah enggak kepikiran lagi hubungi beliau... monitor stanby di jalur emergency" },
                object: { value: "Jalur Emergency", evidence: "TC nya sudah kecelakaan tunggal... monitor stanby di jalur emergency" },
                location: { value: "jalur emergency" },
                time: "Pasca 01:35",
                why: { value: "respons pengawas lapangan terbatas" },
                source_system: { value: "Monitoring System", evidence: "Aris focused on the emergency channel rather than further operator contact" },
                condition: { value: "monitoring standby", evidence: "Pak Fatur cuma balas Allahuakbar gitu aja di WA. Habis itu enggak ditanya lagi" }
             }
           }
        ]
     }
  },
  { 
     id: 'actor', 
     name: 'Analisis Aktor', 
     icon: User, 
     purpose: 'Mengidentifikasi dan menganalisis peran, tanggung jawab, dan hubungan aktor utama.', 
     status: 'completed', 
     dependencies: ['fact'],
     runCount: 1,
     lastRunTimestamp: "Yesterday, 4:18 PM",
     tokenEstimate: 2800,
     history: [],
     backendCapabilities: { canPause: true, canResume: true, canStop: true, canRerun: true },
     results: {
        actor_registry_status: {
           total_ccr_actors: 8,
           total_fact_chronology_actors: 11,
           total_system_actors: 3,
           matched_actors: 6,
           unmatched_ccr_actors: 2,
           missing_from_ccr: 2,
           predicted_actor_type_count: 1,
           recommended_for_review_count: 2,
           downstream_allowed_count: 5,
           downstream_hold_for_review_count: 3,
           confidence: "High"
        },
        crosscheck_findings: {
           missing_from_ccr: [],
           listed_in_ccr_not_found_in_chronology: [],
           role_conflicts: [],
           duplicate_candidates: [],
           weak_identity_matches: [],
           predicted_roles_needing_review: []
        },
        actor_registry: [
           {
              actor_id: "a-001",
              beid: "BE-7654",
              name: "Operator Saiful",
              company: "PT KMB",
              ccr_category: "Korban / Terlibat Langsung",
              jabatan_struktural: "Operator Hauler",
              involvement_level: "primary_involved_worker",
              actor_type_assignments: [],
              linked_events: [
                 { event_id: "e1", phase: "PRA_KONTAK", time: "22:15 WITA", action_summary: "Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful" },
                 { event_id: "e2", phase: "KONTAK", time: "01:35 WITA", action_summary: "Unit Operator Saiful mengalami kecelakaan tunggal yang teramati melalui video surveillance DMS" }
              ],
              identity_decomposition: {
                 subject: { value: "Operator Saiful (BE-7654)" },
                 action: { value: "Mengemudikan unit secara aman sesuai prosedur keselamatan kerja" },
                 object: { value: "Unit Hauling" },
                 source_system: { value: "DMS System & CCR Database" },
                 condition: { value: "Tercatat mengalami deviasi fatigue 41 kali dalam proses investigasi" }
              },
              role_crosscheck_decomposition: {
                 ccr_role_claim: { value: "Operator Hauler (Korban / Terlibat Langsung)" },
                 chronology_role_observation: { value: "Mengoperasikan unit dan mengalami fatigue lockdown sebelum kecelakaan tunggal" },
                 match_result: { value: "Matched" }
              },
              review_recommendation: {
                 recommended_for_review: false,
                 review_priority: "None",
                 review_reason: null,
                 downstream_usage: "allowed",
                 downstream_note: null
              }
           },
           {
              actor_id: "a-002",
              beid: "BE-9182",
              name: "Pengawas Fatur",
              company: "PT KMB",
              ccr_category: "Pengawas Lapangan",
              jabatan_struktural: "Supervisor Hauling",
              involvement_level: "direct_supervisor",
              actor_type_assignments: [],
              linked_events: [
                 { event_id: "e3", phase: "PRA_KONTAK", time: "Pasca 22:15", action_summary: "Pengawas Fatur mengonfirmasi kondisi operator dalam keadaan baik secara verbal melalui aplikasi WhatsApp tanpa bukti visual" }
              ],
              identity_decomposition: {
                 subject: { value: "Pengawas Fatur (BE-9182)" },
                 action: { value: "Melakukan pengawasan & validasi kelelahan kru di lapangan" },
                 object: { value: "Kru Hauling (Saiful)" },
                 source_system: { value: "Log WhatsApp & BAP Investigasi" },
                 condition: { value: "Tugas jaga malam / Shift Kritis" }
              },
              role_crosscheck_decomposition: {
                 ccr_role_claim: { value: "Pengawas Lapangan" },
                 chronology_role_observation: { value: "Hanya melakukan validasi verbal via chat WhatsApp tanpa bukti visual" },
                 match_result: { value: "Role Conflict" }
              },
              review_recommendation: {
                 recommended_for_review: true,
                 review_priority: "Medium",
                 review_reason: "Validasi pengawasan tidak sesuai prosedur standar",
                 downstream_usage: "allowed_with_note",
                 downstream_note: "Pengawasan dilakukan dengan deviasi (tanpa visual)"
              }
           },
           {
              actor_id: "a-003",
              beid: "BE-5511",
              name: "Petugas Aris",
              company: "PT Berau Coal",
              ccr_category: "DMS Control Room Operator",
              jabatan_struktural: "Petugas CCR",
              involvement_level: "system_actor",
              actor_type_assignments: [],
              linked_events: [
                 { event_id: "e4", phase: "PASCA_KONTAK", time: "Pasca 01:35", action_summary: "Petugas Control Room (Aris) dengan monitoring standby memfokuskan pemantauan pada jalur emergency dikarenakan respons pengawas lapangan terbatas" }
              ],
              identity_decomposition: {
                 subject: { value: "Petugas Aris (BE-5511)" },
                 action: { value: "Memantau alert fatigue pada sistem DMS & mengoordinasikan intervensi" },
                 object: { value: "Sistem DMS (Dashboard)" },
                 source_system: { value: "Log Radio & BAP" },
                 condition: { value: "Memfokuskan pada jalur emergency pasca-kejadian" }
              },
              role_crosscheck_decomposition: {
                 ccr_role_claim: { value: "DMS Control Room Operator" },
                 chronology_role_observation: { value: "Memantau alert dan merespons melalui radio/DMS" },
                 match_result: { value: "Matched" }
              },
              review_recommendation: {
                 recommended_for_review: false,
                 review_priority: "None",
                 review_reason: null,
                 downstream_usage: "allowed",
                 downstream_note: null
              }
           }
        ]
     }
  },
  { 
     id: 'peepo', 
     name: 'Faktor PEEPO', 
     icon: Users, 
     purpose: 'Mensintesis faktor Manusia, Peralatan, Lingkungan, Prosedur, dan Organisasi.', 
     status: 'completed', 
     dependencies: ['actor'],
     runCount: 1,
     lastRunTimestamp: "Yesterday, 4:15 PM",
     tokenEstimate: 4500,
     history: [],
     backendCapabilities: { canPause: true, canResume: true, canStop: true, canRerun: true },
     results: {
        people: [
          {
            id: "peepo-p1",
            chronology_text: "Sdr Ade Lukmanul Hakim tidak langsung mengaktifkan tombol Emergency Shut Down Engine Saat melihat indikasi awal adanya Fire Case di Area Engine WA 500- 3 MIJ 1001 dikarenakan panik",
            status: "human_verified",
            breakdown: {
              subject:  { value: "Sdr Ade Lukmanul Hakim", citations: [] },
              action:   { value: "tidak langsung mengaktifkan tombol Emergency Shut Down Engine", citations: [] },
              location: { value: "Area Engine WA 500- 3 MIJ 1001", citations: [] },
              condition:{ value: "Saat melihat indikasi awal adanya Fire Case", citations: [] },
              why:      { value: "dikarenakan panik", citations: [] }
            }
          },
          {
            id: "peepo-p2",
            chronology_text: "Operator Wheel Loader belum memahami sepenuhnya prosedur penggunaan Fire Suppression sistem otomatis saat kejadian berlangsung",
            status: "needs_review",
            breakdown: {
              subject:  { value: "Operator Wheel Loader", citations: [] },
              action:   { value: "belum memahami sepenuhnya prosedur penggunaan Fire Suppression sistem otomatis", citations: [] },
              condition:{ value: "saat kejadian berlangsung", citations: [] }
            }
          },
          {
            id: "peepo-p3",
            chronology_text: "Pengawas area tidak berada di lokasi saat indikasi awal api muncul sehingga instruksi tanggap darurat tertunda",
            status: "ai_generated",
            breakdown: {
              subject:  { value: "Pengawas area", citations: [] },
              action:   { value: "tidak berada di lokasi", citations: [] },
              condition:{ value: "saat indikasi awal api muncul", citations: [] },
              why:      { value: "instruksi tanggap darurat tertunda", citations: [] }
            }
          }
        ],
        environment: [
          {
            id: "peepo-e1",
            chronology_text: "Terdapat material batu bara / fine Coal yang menumpuk pada bagian atas fuel tank sisi kiri dan kanan , yang menyelip anatar hose oli cooler transmisi dan Hydraulic ( Pembersihan yang dilakukan tidak menyeluruh pada semua bagian atas Fuel Tank , bagian yang dibersihkan hanya yang terlihat dari luar / bagian bawah oil pan )",
            status: "ai_generated",
            breakdown: {
              object:   { value: "material batu bara / fine Coal", citations: [] },
              action:   { value: "menumpuk pada bagian atas fuel tank sisi kiri dan kanan , yang menyelip anatar hose oli cooler transmisi dan Hydraulic", citations: [] },
              condition:{ value: "Pembersihan yang dilakukan tidak menyeluruh pada semua bagian atas Fuel Tank", citations: [] },
              why:      { value: "bagian yang dibersihkan hanya yang terlihat dari luar / bagian bawah oil pan", citations: [] }
            }
          },
          {
            id: "peepo-e2",
            chronology_text: "Suhu ruang mesin yang tinggi dipicu oleh sirkulasi udara yang kurang baik di area terowongan blok C",
            status: "ai_generated",
            breakdown: {
              object:   { value: "Suhu ruang mesin", citations: [] },
              action:   { value: "tinggi dipicu oleh sirkulasi udara yang kurang baik", citations: [] },
              location: { value: "area terowongan blok C", citations: [] }
            }
          },
          {
            id: "peepo-e3",
            chronology_text: "Terdapat paparan debu tebal yang menutupi sensor panas, sehingga alarm dini terlambat berbunyi",
            status: "partially_supported",
            breakdown: {
              object:   { value: "paparan debu tebal", citations: [] },
              action:   { value: "menutupi sensor panas", citations: [] },
              why:      { value: "alarm dini terlambat berbunyi", citations: [] }
            }
          }
        ],
        equipment: [
          {
            id: "peepo-eq1",
            chronology_text: "Tidak ada indikasi Fire Supporession aktif saat operator menekan tombol manual yang ada di luar cabin ( tombol yang berada di tangga bagian kanan )",
            status: "ai_generated",
            breakdown: {
              action:   { value: "Tidak ada indikasi Fire Supporession aktif", citations: [] },
              subject:  { value: "operator", citations: [] },
              object:   { value: "tombol manual", citations: [] },
              location: { value: "di luar cabin ( tombol yang berada di tangga bagian kanan )", citations: [] }
            }
          },
          {
            id: "peepo-eq2",
            chronology_text: "Fire Suppression yang terpasang pada unit WA 500-3 MIJ 1001 belum dilakukan perawatan Rutin setiap minimal 6 bulan sekali , pemeriksaan dan perbaikan terakhir di tanggal 10 Agustus 2024",
            status: "human_verified",
            breakdown: {
              object:   { value: "Fire Suppression", citations: [] },
              location: { value: "unit WA 500-3 MIJ 1001", citations: [] },
              action:   { value: "belum dilakukan perawatan Rutin setiap minimal 6 bulan sekali", citations: [] },
              condition:{ value: "pemeriksaan dan perbaikan terakhir di tanggal 10 Agustus 2024", citations: [] }
            }
          },
          {
            id: "peepo-eq3",
            chronology_text: "Hose hidrolik yang berdekatan dengan fuel tank mengalami penipisan akibat gesekan terus-menerus dengan chasis unit",
            status: "ai_generated",
            breakdown: {
              object:   { value: "Hose hidrolik", citations: [] },
              location: { value: "berdekatan dengan fuel tank", citations: [] },
              action:   { value: "mengalami penipisan", citations: [] },
              why:      { value: "akibat gesekan terus-menerus dengan chasis unit", citations: [] }
            }
          }
        ],
        procedures: [
          {
            id: "peepo-pr1",
            chronology_text: "Proses pencucian unit pada area engine belum diatur dengan detail dan terukur , sehingga saat dilakukan pencucian unit Whelloader material Fine coal hanya yang berada diatas fuel Tank hanya pada area yang kelihatan dari luar , bagian sisi kanan dan kiri dekat chasis masih terdapat sisa fine coal",
            status: "needs_review",
            breakdown: {
              object:   { value: "Proses pencucian unit", citations: [] },
              location: { value: "area engine", citations: [] },
              action:   { value: "belum diatur dengan detail dan terukur", citations: [] },
              condition:{ value: "material Fine coal hanya yang berada diatas fuel Tank hanya pada area yang kelihatan dari luar", citations: [] },
              why:      { value: "bagian sisi kanan dan kiri dekat chasis masih terdapat sisa fine coal", citations: [] }
            }
          },
          {
            id: "peepo-pr2",
            chronology_text: "Belum ada schedule Drill Penangganan Fire Case , sehingga berpotensi Operator belum bisa mengatasi cara penangganan Tanggap darurat dengan benar",
            status: "ai_generated",
            breakdown: {
              action:   { value: "Belum ada schedule Drill Penangganan Fire Case", citations: [] },
              subject:  { value: "Operator", citations: [] },
              why:      { value: "berpotensi Operator belum bisa mengatasi cara penangganan Tanggap darurat dengan benar", citations: [] }
            }
          },
          {
            id: "peepo-pr3",
            chronology_text: "Protokol pelaporan insiden kebakaran tidak memiliki matriks eskalasi yang jelas untuk menghubungi tim pemadam eksternal",
            status: "ai_generated",
            breakdown: {
              object:   { value: "Protokol pelaporan insiden kebakaran", citations: [] },
              action:   { value: "tidak memiliki matriks eskalasi yang jelas", citations: [] },
              why:      { value: "untuk menghubungi tim pemadam eksternal", citations: [] }
            }
          }
        ],
        organisation: [
          {
            id: "peepo-o1",
            chronology_text: "Dalam Pemenuhan Tindakan Perbaikan dan pecegahan atas Rekomendasi Investigasi hanya data terkait pihak atau unit yang terlibat saja yang dimasukan dalam penginputan di system Talkslist Tindakan perbaikan , sehingga masih menungkinkan beberapa hal terlewat ditindaklanjuti dengam penuh",
            status: "ai_generated",
            breakdown: {
              object:   { value: "Tindakan Perbaikan dan pecegahan atas Rekomendasi Investigasi", citations: [] },
              action:   { value: "hanya data terkait pihak atau unit yang terlibat saja yang dimasukan dalam penginputan", citations: [] },
              location: { value: "system Talkslist Tindakan perbaikan", citations: [] },
              why:      { value: "masih menungkinkan beberapa hal terlewat ditindaklanjuti dengam penuh", citations: [] }
            }
          },
          {
            id: "peepo-o2",
            chronology_text: "Petugas / Whasing man belum diberikan Job Desc yang detail terkait hasil pencucian unit yang baik",
            status: "partially_supported",
            breakdown: {
              subject:  { value: "Petugas / Whasing man", citations: [] },
              action:   { value: "belum diberikan Job Desc yang detail", citations: [] },
              condition:{ value: "terkait hasil pencucian unit yang baik", citations: [] }
            }
          },
          {
            id: "peepo-o3",
            chronology_text: "Manajemen site belum mengalokasikan anggaran khusus untuk peremajaan sistem Fire Suppression otomatis pada unit lama",
            status: "needs_review",
            breakdown: {
              subject:  { value: "Manajemen site", citations: [] },
              action:   { value: "belum mengalokasikan anggaran khusus", citations: [] },
              object:   { value: "sistem Fire Suppression otomatis", citations: [] },
              condition:{ value: "pada unit lama", citations: [] }
            }
          }
        ],
        ringkasan: "Multiple systemic failures across all PEEPO categories contributed to the belt rupture.",
        synthesis: "CRITICAL: The interplay between equipment fatigue and procedural gaps created a window for failure."
     }
  },
  { 
     id: 'ipls', 
     name: 'Lapisan IPLS', 
     icon: LayoutGrid, 
     purpose: 'Mengevaluasi Lapisan Perlindungan Awal terhadap bahaya yang teridentifikasi.', 
     status: 'completed', 
     dependencies: ['actor'],
     runCount: 1,
     lastRunTimestamp: "Yesterday, 4:20 PM",
     tokenEstimate: 3200,
     history: [],
     backendCapabilities: { canPause: true, canResume: true, canStop: true, canRerun: true },
     results: {
        layers: [
           { id: 1, title: "Hardware/Equipment Barriers", items: [{ id: 'l1-1', label: "Vibration sensors functional but delayed", status: "non-conformity" }] },
           { id: 2, title: "Procedural Barriers", items: [{ id: 'l2-1', label: "Checklist 404 not followed by operator", status: "rootcause" }] },
           { id: 3, title: "Personnel Barriers", items: [{ id: 'l3-1', label: "Competency certified for current role", status: "conformity" }] }
        ]
     }
  },
  { 
     id: 'prev', 
     name: 'Rencana Pencegahan', 
     icon: Brain, 
     purpose: 'Membuat rencana tindakan perbaikan dan pencegahan.', 
     status: 'completed', 
     dependencies: ['ipls'],
     runCount: 1,
     lastRunTimestamp: "Yesterday, 4:25 PM",
     tokenEstimate: 5000,
     history: [],
     backendCapabilities: { canPause: true, canResume: true, canStop: true, canRerun: true },
     results: {
        root_cause_actions: [
           { id: 'rc-1', no: 1, layer: "II", hierarchy: "Administrative", action: "Retraining on Checklist 404", pic: "Training Dept", due_date: "2026-05-01", status: "OPEN" }
        ],
        non_conformity_actions: [
           { id: 'nc-1', no: 2, layer: "I", hierarchy: "Engineering", action: "Recalibrate vibration sensors", pic: "Maint Dept", due_date: "2026-04-25", status: "PROGRESS" }
        ],
        improvement_actions: [
           { id: 'imp-1', no: 3, layer: "V", hierarchy: "Organisational", action: "Review staffing levels", pic: "HR Site", due_date: "2026-06-01", status: "OPEN" }
        ]
     }
  }
];

function EvidenceCitationPanel({ citations, forceExpand }: { citations: any[], forceExpand?: boolean }) {
  const [localExpanded, setLocalExpanded] = useState<boolean | null>(null);
  
  // Reset local override when global state changes
  useEffect(() => {
    setLocalExpanded(null);
  }, [forceExpand]);

  const isExpanded = localExpanded ?? forceExpand ?? false;

  if (!citations || citations.length === 0) return null;

  return (
    <div className="space-y-4">
      {!isExpanded ? (
        <button 
          onClick={() => setLocalExpanded(true)}
          className="flex items-center gap-3 group/expand"
        >
          <div className="flex -space-x-2">
            {citations.slice(0, 3).map((c, i) => (
              <div key={i} className="h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover/expand:border-indigo-300 transition-colors">
                {c.type === 'audio' ? <Activity className="h-3 w-3 text-emerald-500" /> : 
                 c.type === 'document' ? <FileText className="h-3 w-3 text-blue-500" /> :
                 c.type === 'video' ? <Play className="h-3 w-3 text-rose-500" /> :
                 <Paperclip className="h-3 w-3 text-slate-400" />}
              </div>
            ))}
            {citations.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">
                +{citations.length - 3}
              </div>
            )}
          </div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover/expand:text-indigo-800 flex items-center gap-1.5">
            View {citations.length} Evidence Traces
            <ChevronDown className="h-2.5 w-2.5" />
          </span>
        </button>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {citations.map((cite, idx) => (
            <div key={idx} className="bg-indigo-50/40 p-4 rounded-sm border-l-2 border-indigo-400 group/cite relative">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                     <div className="p-1 bg-white rounded-sm border border-indigo-100">
                        {cite.type === 'audio' ? <Activity className="h-3 w-3 text-emerald-500" /> : 
                         cite.type === 'document' ? <FileText className="h-3 w-3 text-blue-500" /> :
                         cite.type === 'video' ? <Play className="h-3 w-3 text-rose-500" /> :
                         <Paperclip className="h-3 w-3 text-slate-400" />}
                     </div>
                     <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{cite.type} Evidence</span>
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">REF #{idx + 1}</div>
               </div>

               <div className="flex gap-4 mb-4">
                  {(cite.type === 'image' || cite.type === 'video') && cite.thumbnail && (
                    <div className="h-16 w-24 shrink-0 border border-indigo-200 bg-slate-900 overflow-hidden rounded-sm relative group/thumb">
                       <img src={cite.thumbnail} className="h-full w-full object-cover opacity-60 group-hover/thumb:opacity-100 transition-opacity" />
                       {cite.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                             <Play className="h-4 w-4 text-white fill-current" />
                          </div>
                       )}
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic">
                    "{cite.content || cite.text}"
                  </p>
               </div>

               <div className="flex flex-wrap gap-2 pt-3 border-t border-indigo-100/50">
                  {cite.speaker && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-indigo-100 rounded-sm text-[9px] font-bold text-indigo-600">
                       <Users className="h-3 w-3" />
                       <span>{cite.speaker}</span>
                    </div>
                  )}
                  {cite.time && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded-sm text-[9px] font-mono font-black text-slate-900">
                       <Clock className="h-3 w-3 text-amber-600" />
                       <span>{cite.time}</span>
                    </div>
                  )}
                  {cite.page && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-sm text-[9px] font-black text-blue-700">
                       <FileText className="h-3 w-3" />
                       <span>PAGE {cite.page}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-sm text-[9px] font-bold text-slate-500">
                     <Paperclip className="h-3 w-3" />
                     <span className="truncate max-w-[150px]">{cite.source}</span>
                  </div>
               </div>
               
               {idx === 0 && (
                  <button 
                    onClick={() => setLocalExpanded(false)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <ChevronDown className="h-3 w-3 rotate-180" />
                  </button>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalysisTab() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: evidence } = useEvidence(caseId!);
  const evidenceFiles = evidence?.files || [];
  const batches = evidence?.batches || [];

  const [agents, setAgents] = useState<AgentState[]>(initialAgentsState);
  const [factViewMode, setFactViewMode] = useState<'slide' | 'default'>('default');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [allEvidenceExpanded, setAllEvidenceExpanded] = useState(false);

  const [activeEvidenceType, setActiveEvidenceType] = useState('audio_diarization');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['audio', 'document']);
  const [execMode, setExecMode] = useState<"idle" | "full" | "manual">("idle");
  const [globalStatus, setGlobalStatus] = useState<"idle" | "running" | "blocked" | "completed" | "stopped" | "failed">("idle");
  const [chainQueue, setChainQueue] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canvasZoom, setCanvasZoom] = useState(85);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preRunAgentId, setPreRunAgentId] = useState<string | null>(null);
  const [historyAgentId, setHistoryAgentId] = useState<string | null>(null);
  const [knowledgeAgentId, setKnowledgeAgentId] = useState<string | null>(null);
  const [expandedKnowledgeFolders, setExpandedKnowledgeFolders] = useState<string[]>([]);
  const [localKnowledgeSelection, setLocalKnowledgeSelection] = useState<Record<string, string[]>>({});
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // NEW: Fact Trace States
  const [activeEvidenceConsoleMode, setActiveEvidenceConsoleMode] = useState<"trace" | "diarization" | "analysis">("trace");
  const [selectedEvidenceLinkId, setSelectedEvidenceLinkId] = useState<string | null>(null);
  const [draftDescription, setDraftDescription] = useState("");
  const [expandedEvidenceGroups, setExpandedEvidenceGroups] = useState<string[]>(['audio', 'document']);
  const [focusedPreview, setFocusedPreview] = useState<EvidenceTraceLink | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);
  const [expandedEntityRows, setExpandedEntityRows] = useState<string[]>([]);
  const [payloadDrawer, setPayloadDrawer] = useState<any | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-initialize knowledge selection if empty
  useEffect(() => {
    if (evidenceFiles.length > 0 && agents.length > 0) {
      setAgents(prev => {
        const needsUpdate = prev.some(a => !a.knowledgeSelection || a.knowledgeSelection.length === 0);
        if (!needsUpdate) return prev;
        
        return prev.map(a => 
          (!a.knowledgeSelection || a.knowledgeSelection.length === 0) 
          ? { ...a, knowledgeSelection: evidenceFiles.map(f => f.id) } 
          : a
        );
      });
    }
  }, [evidenceFiles.length, agents.length]);

  const isAnyAgentRunning = useMemo(() => {
    return globalStatus === "running" || agents.some(a => a.status === "running");
  }, [globalStatus, agents]);

  useEffect(() => {
    if (isAnyAgentRunning) {
      localStorage.setItem(`analysis_running_${caseId}`, "true");
    } else {
      localStorage.removeItem(`analysis_running_${caseId}`);
    }
    return () => {
      localStorage.removeItem(`analysis_running_${caseId}`);
    };
  }, [isAnyAgentRunning, caseId]);

  const handleSaveKnowledge = (agentId: string) => {
    const selection = localKnowledgeSelection[agentId];
    if (selection) {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, knowledgeSelection: selection } : a));
      toast.success("Knowledge sources updated.");
    }
  };

  const handleSelectRow = (id: string | null) => {
    setSelectedRowId(id);
    if (id) {
      setActiveEvidenceConsoleMode("trace");
      const factAgent = agents.find(a => a.id === 'fact');
      const item = factAgent?.results?.chronology_items?.find((i: any) => i.id === id);
      if (item) {
        setDraftDescription(item.description || item.chronology_text || "");
        setValidationError(null);
      }
      setSelectedEvidenceLinkId(null);
      setFocusedPreview(null);
    }
  };

  const fitToWorkspace = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth - 40; 
    const ch = containerRef.current.clientHeight - 80;
    const scaleW = cw / 1024;
    const scaleH = ch / 576;
    const newZoom = Math.floor(Math.min(scaleW, scaleH) * 100);
    setCanvasZoom(Math.min(newZoom, 110));
  };

  useEffect(() => {
    if (selectedAgentId) {
      setTimeout(fitToWorkspace, 100);
      setActiveSlide(0);
    }
  }, [selectedAgentId]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const selectedFactItem = useMemo(() => {
    if (!selectedRowId) return null;
    const factAgent = agents.find(a => a.id === 'fact');
    return factAgent?.results?.chronology_items?.find((i: any) => i.id === selectedRowId) || null;
  }, [selectedRowId, agents]);
  
  const slides = React.useMemo(() => {
    const agent = agents.find(a => a.id === selectedAgentId);
    if (!agent) return [];

     if (agent.id === 'fact' && agent.results) {
        return [
           {
              id: 'fact-1',
              type: 'chronology_module',
              title: 'Fact & Chronology',
              subtitle: 'Overview Incident',
              caseCode: 'CS-2026-0147',
              content: {
                 summary: agent.results.ringkasan?.deskripsi || "No summary available.",
                 metadata: {
                    incidentDate: agent.results.ringkasan?.tanggal || "---",
                    incidentTime: agent.results.ringkasan?.jam || "---",
                    location: agent.results.ringkasan?.lokasi || "---",
                    incidentType: agent.results.ringkasan?.jenis || "---",
                    department: agent.results.ringkasan?.departemen || "---",
                    evidenceSource: agent.results.ringkasan?.sumber_bukti || "---",
                    severity: agent.results.ringkasan?.severity || "---",
                    summary: agent.results.ringkasan?.deskripsi || "---",
                    caseCode: 'CS-2026-0147'
                 },
                 items: agent.results.chronology_items || []
              }
           }
        ];
     }
    
    return [{
       id: 'slide-1',
       type: 'raw',
       title: agent.name,
       content: agent.results || {}
    }];
  }, [selectedAgentId, agents]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === "ArrowLeft") {
        setActiveSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveSlide(prev => Math.min(slides.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  useEffect(() => {
    if (globalStatus === 'running' && !activeTask && chainQueue.length > 0) {
      const nextId = chainQueue[0];
      const agent = agents.find(a => a.id === nextId)!;
      
      const depsFailedOrBlocked = agent.dependencies.some(dId => {
        const d = agents.find(x => x.id === dId)!;
        return d.status === 'failed' || d.status === 'blocked';
      });

      if (depsFailedOrBlocked && (execMode === "full" || execMode === "manual")) {
        setGlobalStatus('blocked');
        setAgents(prev => prev.map(a => a.id === nextId ? { ...a, status: 'blocked', dependencyState: 'Blocked', microStatus: 'Waiting for upstream...' } : a));
        return;
      }

      setActiveTask(nextId);
      if (execMode === 'full') {
          setSelectedAgentId(nextId);
      }
      setAgents(prev => prev.map(a => a.id === nextId ? { 
          ...a, 
          status: 'running', 
          microStatus: `Analyzing ${a.knowledgeSelection?.length || 0} evidence assets...`, 
          triggeredBy: execMode === 'full' ? 'System' : 'Current User' 
      } : a));

      const stages = [
          'Reading evidence batches...',
          'Mapping involved entities...',
          'Synthesizing workspace findings...',
          'Applying industrial safety logic...',
          'Finalizing output schema...'
      ];
      stages.forEach((msg, idx) => {
          setTimeout(() => {
              setAgents(prev => prev.map(a => a.id === nextId ? { ...a, microStatus: msg } : a));
          }, (idx + 1) * 700);
      });

      setTimeout(() => {
        const d = new Date();
        setAgents(prev => {
          const a = prev.find(x => x.id === nextId);
          if (a?.status === 'running') {
            return prev.map(x => x.id === nextId ? { 
              ...x, 
              status: 'completed', 
              lastRunTimestamp: d.toLocaleTimeString(),
              lastUpdatedTimestamp: d.toLocaleTimeString(),
              confidence: (85 + Math.floor(Math.random() * 10)) + "%",
              dependencyState: 'Resolved',
              microStatus: 'Synthesis complete.'
            } : x);
          }
          return prev;
        });

        setChainQueue(q => q.slice(1));
        setActiveTask(null);
      }, 4000);
    } else if (globalStatus === 'running' && chainQueue.length === 0 && !activeTask) {
      setGlobalStatus('completed');
    }
  }, [globalStatus, chainQueue, activeTask, agents, execMode]);

  const runSingleAgent = (agentId: string, isRerun: boolean = false) => {
    setPreRunAgentId(null);
    setSelectedAgentId(agentId);
    setExecMode("manual");
    
    setAgents(prev => prev.map(a => a.id === agentId ? { 
      ...a, 
      status: 'running', 
      microStatus: isRerun ? `Reprocessing with ${a.knowledgeSelection?.length || 0} evidence assets...` : `Analyzing ${a.knowledgeSelection?.length || 0} evidence assets...`,
      triggeredBy: 'Current User'
    } : a));
    
    // Simulate backend execution
    setTimeout(() => {
      setAgents(prev => prev.map(a => {
        if (a.id === agentId) {
          const actualTokens = (a.tokenEstimate || 1000) * (0.8 + Math.random() * 0.4);
          const duration = 3000 + Math.random() * 2000;
          const newRun: AgentRunHistory = {
            run_id: `run-${Math.random().toString(36).substr(2, 9)}`,
            agent_id: agentId,
            started_at: new Date().toISOString(),
            ended_at: new Date().toISOString(),
            triggered_by: "Current User",
            status: "completed",
            token_usage: Math.floor(actualTokens),
            duration_ms: Math.floor(duration),
            summary: isRerun ? "Re-analysis triggered by user request." : "Initial analysis completed successfully."
          };

          return { 
            ...a, 
            status: 'completed', 
            runCount: a.runCount + 1,
            lastRunTimestamp: "Just now",
            actualTokenUsage: Math.floor(actualTokens),
            durationMs: Math.floor(duration),
            history: [newRun, ...a.history]
          };
        }
        return a;
      }));
      const agentName = agents.find(ag => ag.id === agentId)?.name;
      const knowledgeCount = agents.find(ag => ag.id === agentId)?.knowledgeSelection?.length;
      toast.success(`${agentName} finished using ${knowledgeCount} evidence assets.`);
    }, 4000);
  };

  const stopSingleAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'stopped' } : a));
    toast.error("Agent execution terminated.");
  };

  const startFullChain = () => {
    setExecMode("full");
    setGlobalStatus("running");
    setAgents(prev => prev.map(a => ({ 
        ...a, 
        status: 'queued', 
        dependencyState: a.dependencies.length === 0 ? 'Ready' : `Wait: ${a.dependencies[0]}`
    })));
    setChainQueue(["fact", "actor", "peepo", "ipls", "prev"]);
  };

  const stopChain = () => {
    setGlobalStatus("stopped");
    setAgents(prev => prev.map(a => a.status === 'queued' || a.status === 'running' ? { ...a, status: 'cancelled' } : a));
    setChainQueue([]);
    setActiveTask(null);
  };

  return (
    <div className="flex h-full bg-[#f0f2f4] overflow-hidden animate-in fade-in duration-500">
         <div className="w-[320px] border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 z-20 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
            <div className="flex-1 overflow-y-auto custom-scrollbar relative p-6 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
               
               {/* Floating Actions */}
               <div className="sticky top-0 right-0 z-50 flex justify-end gap-2 mb-4 -mt-2 -mr-2">
                  <Button 
                     onClick={stopChain} 
                     disabled={globalStatus !== 'running'}
                     size="icon"
                     title="Jeda / Hentikan"
                     className="h-8 w-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm transition-all"
                  >
                     <Pause className="h-4 w-4" />
                  </Button>
                  <Button 
                     onClick={startFullChain} 
                     disabled={globalStatus === 'running'}
                     size="icon"
                     title="Jalankan Semua Agen"
                     className="h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all"
                  >
                     <Play className="h-4 w-4 fill-current ml-0.5" />
                  </Button>
               </div>

               {/* Start Node */}
               <div className="flex flex-col items-center mb-0 relative z-10">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                     <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">Start</span>
               </div>
               
               {/* Connector Line from Start to First Node */}
               <div className="flex justify-center items-center h-6 relative z-10">
                  <div className="w-px h-full bg-emerald-300" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-1.5 w-1.5 rotate-45 border-b border-r border-emerald-400" />
               </div>

               <div className="space-y-0 relative z-10">
                  {agents.map((agent, index) => {
                     const isActive = selectedAgentId === agent.id;
                     const meta = AgentDisplayMeta[agent.id] || { nodeId: `AGT-0${index}`, subtitle: 'Processing node' };
                     
                     // Styling logic based on status and active state
                     const isCompleted = agent.status === 'completed';
                     const isRunning = agent.status === 'running';
                     const isPaused = agent.status === 'stopped' || agent.status === 'paused';
                     const isWaiting = agent.status === 'queued' || (!isCompleted && !isRunning && !isPaused);
                     
                     const cardBorder = isActive 
                        ? 'border-emerald-500 shadow-sm bg-white' 
                        : (isRunning ? 'border-blue-400 ring-4 ring-blue-500/20 bg-white scale-[1.02] shadow-md z-10'
                        : (isCompleted ? 'border-emerald-500 bg-white' 
                        : (isWaiting ? 'border-slate-100 bg-slate-50/50 opacity-60' 
                        : 'border-slate-200 bg-white')));
                     
                     const iconBg = (isActive || isCompleted || isRunning) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400';
                     const badgeStyle = isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        isRunning ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' :
                                        isPaused ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                        'bg-slate-100 text-slate-400 border-slate-200';
                     const badgeText = isPaused ? 'PAUSED' : isWaiting ? 'WAITING' : agent.status.toUpperCase();

                     return (
                        <div key={agent.id} className="relative">
                           <div 
                              onClick={() => setSelectedAgentId(agent.id)}
                              className={`
                                 group flex flex-col p-4 rounded-sm border transition-all duration-300 cursor-pointer relative overflow-hidden
                                 ${cardBorder}
                              `}
                           >
                              {isRunning && (
                                 <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-blue-500 animate-pulse w-full origin-left" />
                                 </div>
                              )}
                              
                              <div className="flex items-center justify-between mb-3">
                                 <div className="flex items-center gap-2">
                                    <div className={`h-6 w-6 rounded-sm flex items-center justify-center transition-colors ${iconBg}`}>
                                       <agent.icon className={`h-3 w-3 ${isRunning ? 'animate-bounce' : ''}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest">{meta.nodeId}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    {(isCompleted || isPaused) ? (
                                        <button 
                                           onClick={(e) => { e.stopPropagation(); setPreRunAgentId(agent.id); }}
                                           className="text-slate-400 hover:text-slate-900 transition-colors"
                                        >
                                           <Play className="h-3.5 w-3.5 hover:scale-110 transition-transform" />
                                        </button>
                                    ) : (
                                       <Play className={`h-3 w-3 text-slate-300 ${isRunning ? 'text-blue-400 animate-pulse' : ''}`} />
                                    )}
                                    <div className={`px-2 py-0.5 rounded-full text-[7px] font-black tracking-widest border transition-colors ${badgeStyle}`}>
                                       {badgeText}
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex flex-col">
                                 <h4 className={`text-[12px] font-black tracking-tight mb-0.5 transition-colors ${isWaiting ? 'text-slate-400' : 'text-slate-800'}`}>{agent.name}</h4>
                                 <p className="text-[10px] font-medium text-slate-400 leading-snug">{meta.subtitle}</p>
                              </div>
                           </div>

                           {/* Connector Line to Next Node (always render to connect to the next one or End node) */}
                           <div className="flex justify-center items-center h-8 relative">
                              {/* Solid line for path leading to/from active or completed, dashed for waiting/paused */}
                              <div className={`w-px h-full transition-colors ${
                                 (isCompleted || isRunning) ? 'bg-emerald-300' : 'border-l border-dashed border-slate-300'
                              }`} />
                              
                              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-1.5 w-1.5 rotate-45 border-b border-r transition-colors ${
                                 (isCompleted || isRunning) ? 'border-emerald-400' : 'border-slate-300'
                              }`} />
                           </div>
                        </div>
                     );
                  })}
               </div>

               {/* End Node */}
               <div className="flex flex-col items-center mt-0 mb-4 relative z-10">
                  <div className="h-5 w-5 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                     <div className="h-2 w-2 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">End</span>
               </div>
            </div>
         </div>

         <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="flex-1 flex overflow-hidden">
               <div ref={containerRef} className="flex-1 relative overflow-auto custom-scrollbar flex items-start justify-center">
                  {selectedAgentId ? (
                     <div className="bg-white flex-1 flex flex-col relative transition-all duration-300 origin-center overflow-hidden w-full h-full">
                        <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                           {selectedAgent?.status === 'running' ? (
                              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 bg-slate-50/50">
                                 <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse rounded-full w-32 h-32" />
                                    <div className="h-20 w-20 bg-white rounded-full border border-blue-100 shadow-xl flex items-center justify-center relative z-10">
                                       <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-center space-y-3">
                                    <span className="text-[20px] font-black uppercase tracking-[0.2em] text-slate-800">{selectedAgent.microStatus || "Memproses Matriks..."}</span>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                                       <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                                       <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">AI Sedang Bekerja</span>
                                    </div>
                                 </div>
                              </div>
                           ) : !selectedAgent?.results ? (
                              <div className="flex flex-col h-full items-center justify-center text-center opacity-30 grayscale pointer-events-none space-y-6">
                                 <Cpu className="h-12 w-12 text-slate-300" />
                                 <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-400">Agen Siaga</h2>
                              </div>
                           ) : (
                              <div className="flex-1 animate-in fade-in duration-500 overflow-hidden">
                                 {slides[activeSlide]?.type === 'chronology_module' ? (
                                    <FactChronologyModule 
                                       initialItems={slides[activeSlide]?.content?.items || []}
                                       metadata={slides[activeSlide]?.content?.metadata}
                                       viewMode={factViewMode}
                                       onViewModeChange={setFactViewMode}
                                       selectedItemId={selectedRowId || undefined}
                                       onSelectItem={handleSelectRow}
                                       onSync={(newItems) => {
                                          setAgents(prev => prev.map(a => a.id === 'fact' ? {
                                             ...a,
                                             results: {
                                                ...a.results,
                                                chronology_items: newItems
                                             }
                                          } : a));
                                          toast.success("Chronology successfully synced to case intelligence.");
                                       }}
                                    />
                                 ) : (
                                     <div className="flex flex-col h-full">
                                        {selectedAgentId === 'peepo' ? (
                                            <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                               <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Lembar Analisis Faktor PEEPO</h2>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Sintesis Selesai</span>
                                                  </div>
                                               </div>
                                               
                                               <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                  <div className="max-w-5xl mx-auto space-y-8 pb-12">
                                                     {[
                                                        { id: 'people', label: 'People (Individu)' },
                                                        { id: 'environment', label: 'Environment (Lingkungan)' },
                                                        { id: 'equipment', label: 'Equipment (Peralatan)' },
                                                        { id: 'procedures', label: 'Procedures (Prosedur)' },
                                                        { id: 'organisation', label: 'Organisation (Organisasi)' },
                                                     ].map((section) => (
                                                        <div key={section.id} className="space-y-3">
                                                           <div className="flex items-center gap-3">
                                                              <span className="px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest bg-slate-900">
                                                                 {section.label}
                                                              </span>
                                                              <div className="h-px flex-1 bg-slate-200" />
                                                           </div>
                                                           <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                                                              <table className="w-full text-left border-collapse">
                                                                 <thead>
                                                                    <tr className="bg-slate-50/80">
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">TEMUAN</th>
                                                                    </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                    {(selectedAgent?.results?.[section.id] || []).map((item: any, idx: number) => {
                                                                       const isSelected = selectedRowId === (item.id || item);
                                                                       return (
                                                                          <tr 
                                                                             key={item.id || idx} 
                                                                             onClick={() => handleSelectRow(item.id || item)}
                                                                             className={cn(
                                                                                "group transition-all cursor-pointer",
                                                                                isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                             )}
                                                                          >
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <p className={cn(
                                                                                   "text-[11px] font-bold leading-relaxed pr-8",
                                                                                   isSelected ? "text-slate-900" : "text-slate-700"
                                                                                )}>
                                                                                   {item.chronology_text || item.label || item}
                                                                                </p>
                                                                             </td>
                                                                          </tr>
                                                                       );
                                                                    })}
                                                                 </tbody>
                                                              </table>
                                                           </div>
                                                        </div>
                                                     ))}

                                                     {/* Summary & Synthesis Indicator */}
                                                     <div className="grid grid-cols-2 gap-6 pt-4">
                                                        <div className="bg-white border-l border-t border-slate-200 p-6 shadow-sm rounded-sm">
                                                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ringkasan Analisis</span>
                                                           <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"{selectedAgent?.results?.ringkasan}"</p>
                                                        </div>
                                                        <div className="bg-slate-900 p-6 shadow-sm border border-slate-800 rounded-sm">
                                                           <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest block mb-2">Kecerdasan Sintesis</span>
                                                           <p className="text-[11px] font-black text-white uppercase tracking-tight leading-relaxed">{selectedAgent?.results?.synthesis}</p>
                                                        </div>
                                                     </div>
                                                  </div>
                                               </div>
                                            </div>
                                         ) : selectedAgentId === 'actor' ? (
                                            <ActorAnalysisModule 
                                               data={selectedAgent?.results as any}
                                               onSelectActor={handleSelectRow}
                                               selectedActorId={selectedRowId}
                                            />
                                         ) : selectedAgentId === 'ipls' ? (
                                            <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                               <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Lembar Lapisan Profil Terintegrasi (IPLS)</h2>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Audit Defensif Selesai</span>
                                                  </div>
                                               </div>
                                               
                                               <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                  <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
                                                     {(selectedAgent?.results?.layers || []).map((layer: any) => (
                                                        <div key={layer.id} className="space-y-3">
                                                           <div className="flex items-center gap-3">
                                                              <span className="px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest bg-slate-900">
                                                                 Layer {["I", "II", "III", "IV", "V"][layer.id - 1]}: {layer.title}
                                                              </span>
                                                              <div className="h-px flex-1 bg-slate-200" />
                                                           </div>
                                                           <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                                                              <table className="w-full text-left border-collapse">
                                                                 <thead>
                                                                    <tr className="bg-slate-50/80">
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">STATUS</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Poin Audit Defensif</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">Keterlacakan</th>
                                                                    </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                    {layer.items.map((item: any, idx: number) => {
                                                                       const isSelected = selectedRowId === item.id;
                                                                       return (
                                                                          <tr 
                                                                             key={item.id || idx} 
                                                                             onClick={() => handleSelectRow(item.id)}
                                                                             className={cn(
                                                                                "group transition-all cursor-pointer",
                                                                                isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                             )}
                                                                          >
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <div className="flex justify-center">
                                                                                   {item.status === 'rootcause' ? (
                                                                                      <div className="h-4 w-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                                                                                         <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                                                      </div>
                                                                                   ) : item.status === 'non-conformity' ? (
                                                                                      <div className="h-4 w-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                                                                                         <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                                      </div>
                                                                                   ) : (
                                                                                      <div className="h-4 w-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                                                                                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                                      </div>
                                                                                   )}
                                                                                </div>
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <p className={cn(
                                                                                   "text-[11px] font-bold leading-relaxed pr-8",
                                                                                   isSelected ? "text-slate-900" : "text-slate-700"
                                                                                )}>
                                                                                   {item.label}
                                                                                </p>
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center">
                                                                                <Search className={cn("h-3.5 w-3.5 mx-auto", isSelected ? "text-slate-900" : "text-slate-300")} />
                                                                             </td>
                                                                          </tr>
                                                                       );
                                                                    })}
                                                                 </tbody>
                                                              </table>
                                                           </div>
                                                        </div>
                                                     ))}
                                                  </div>
                                               </div>
                                            </div>
                                         ) : selectedAgentId === 'prev' ? (
                                            <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                               <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Lembar Rencana Tindakan Pencegahan</h2>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Rencana Difinalisasi</span>
                                                  </div>
                                               </div>
                                               
                                               <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                  <div className="max-w-[1600px] mx-auto space-y-10 pb-12">
                                                     {[
                                                        { id: 'root', title: 'Tindakan Akar Masalah', color: 'bg-red-500', data: selectedAgent?.results?.root_cause_actions },
                                                        { id: 'nc', title: 'Tindakan Ketidaksesuaian', color: 'bg-amber-500', data: selectedAgent?.results?.non_conformity_actions },
                                                        { id: 'imp', title: 'Tindakan Perbaikan', color: 'bg-emerald-500', data: selectedAgent?.results?.improvement_actions },
                                                     ].map((section) => (
                                                        <div key={section.id} className="space-y-3">
                                                           <div className="flex items-center gap-3">
                                                              <span className={cn("px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest", section.color)}>
                                                                 {section.title}
                                                              </span>
                                                              <div className="h-px flex-1 bg-slate-200" />
                                                           </div>
                                                           <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                                                              <table className="w-full text-left border-collapse">
                                                                 <thead>
                                                                    <tr className="bg-slate-50/80">
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-12 border-r border-b border-slate-200 bg-slate-50/30">NO</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">LAYER</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">CONTROL</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Tindakan Pencegahan</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">PIC</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">DUE DATE</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-b border-slate-200 bg-slate-50/30 text-center">STATUS</th>
                                                                    </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                    {(section.data || []).map((item: any, idx: number) => {
                                                                       const isSelected = selectedRowId === item.id;
                                                                       return (
                                                                          <tr 
                                                                             key={item.id || idx} 
                                                                             onClick={() => handleSelectRow(item.id)}
                                                                             className={cn(
                                                                                "group transition-all cursor-pointer",
                                                                                isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                             )}
                                                                          >
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[11px] font-mono font-black text-slate-400">
                                                                                {item.no}
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-black text-slate-500 uppercase">
                                                                                {item.layer}
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                                                                {item.hierarchy}
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <p className={cn(
                                                                                   "text-[11px] font-bold leading-relaxed pr-8 uppercase tracking-tight",
                                                                                   isSelected ? "text-slate-900" : "text-slate-700"
                                                                                )}>
                                                                                   {item.action}
                                                                                </p>
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-bold text-slate-600">
                                                                                {item.pic}
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-mono text-slate-500">
                                                                                {item.due_date}
                                                                             </td>
                                                                             <td className="p-0 border-b border-slate-200">
                                                                                <div className={cn(
                                                                                   "h-12 flex items-center justify-center text-[9px] font-black tracking-widest uppercase",
                                                                                   item.status === 'OPEN' ? "bg-red-50 text-red-600" :
                                                                                   item.status === 'PROGRESS' ? "bg-amber-50 text-amber-600" :
                                                                                   "bg-emerald-50 text-emerald-600"
                                                                                )}>
                                                                                   {item.status}
                                                                                </div>
                                                                             </td>
                                                                          </tr>
                                                                       );
                                                                    })}
                                                                 </tbody>
                                                              </table>
                                                           </div>
                                                        </div>
                                                     ))}
                                                  </div>
                                               </div>
                                            </div>
                                        ) : (
                                           <div className="flex-1 bg-[#1a1c23] rounded-sm p-6 overflow-hidden border border-slate-700 relative">
                                              <pre className="text-[12px] font-mono text-emerald-400/90 leading-tight h-full overflow-auto custom-scrollbar">
                                                 {JSON.stringify(slides[activeSlide]?.content, null, 2)}
                                              </pre>
                                           </div>
                                        )}
                                     </div>
                                  )}
                               </div>
                            )}
                         </div>
                      </div>
                   ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                         <Brain className="h-12 w-12 mb-4 opacity-20" />
                         <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-400">Orchestration Idle</h2>
                         <p className="text-[10px] mt-2 opacity-50 font-bold uppercase">Select a node to view intelligence results</p>
                      </div>
                   )}
               </div>

               {selectedRowId && selectedAgentId === 'actor' && (() => {
                  const actorAgent = agents.find(a => a.id === 'actor');
                  const actor = actorAgent?.results?.actor_registry?.find((a: any) => a.actor_id === selectedRowId);
                  
                  if (!actor) return null;
                  return <ActorDetailPanel actor={actor} onClose={() => setSelectedRowId(null)} />;
               })()}

               {selectedRowId && selectedAgentId === 'peepo' && (() => {
                  const peepoAgent = agents.find(a => a.id === 'peepo');
                  const sections = ['people', 'environment', 'equipment', 'procedures', 'organisation'];
                  const item = sections
                     .flatMap(section => peepoAgent?.results?.[section] || [])
                     .find((i: any) => i.id === selectedRowId);

                  if (!item) return null;

                  return (
                     <div className="w-[420px] shrink-0 border-l border-slate-200 bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20 flex flex-col animate-in slide-in-from-right duration-300">
                        <TraceabilityPanel
                           key={item.id}
                           item={item}
                           onClose={() => setSelectedRowId(null)}
                           onUpdateStatus={(status) => {
                              setAgents(prev => prev.map(a => {
                                 if (a.id !== 'peepo') return a;
                                 const updatedResults = { ...a.results };
                                 sections.forEach(sec => {
                                    if (updatedResults[sec]) {
                                       updatedResults[sec] = updatedResults[sec].map((i: any) => i.id === selectedRowId ? { ...i, status } : i);
                                    }
                                 });
                                 return { ...a, results: updatedResults };
                              }));
                              toast.success("Status PEEPO updated");
                           }}
                           onUpdateBreakdown={(newBreakdown) => {
                              setAgents(prev => prev.map(a => {
                                 if (a.id !== 'peepo') return a;
                                 const updatedResults = { ...a.results };
                                 sections.forEach(sec => {
                                    if (updatedResults[sec]) {
                                       updatedResults[sec] = updatedResults[sec].map((i: any) => i.id === selectedRowId ? { ...i, breakdown: newBreakdown, annotated_by_human: true } : i);
                                    }
                                 });
                                 return { ...a, results: updatedResults };
                              }));
                              toast.success("Dekomposisi PEEPO updated");
                           }}
                           onUpdateChronologyText={(newText) => {
                              setAgents(prev => prev.map(a => {
                                 if (a.id !== 'peepo') return a;
                                 const updatedResults = { ...a.results };
                                 sections.forEach(sec => {
                                    if (updatedResults[sec]) {
                                       updatedResults[sec] = updatedResults[sec].map((i: any) => i.id === selectedRowId ? { ...i, chronology_text: newText, annotated_by_human: true } : i);
                                    }
                                 });
                                 return { ...a, results: updatedResults };
                              }));
                              toast.success("Temuan PEEPO updated");
                           }}
                           onEdit={() => {}}
                        />
                     </div>
                  );
               })()}

               {selectedRowId && selectedAgentId !== 'fact' && selectedAgentId !== 'peepo' && selectedAgentId !== 'actor' && (
                  <div className="w-[420px] shrink-0 border-l border-slate-200 bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20 flex flex-col animate-in slide-in-from-right duration-300">
                     <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-2">
                           <Brain className="h-4 w-4 text-primary" />
                           <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Evidence Console</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="flex bg-slate-200 p-0.5 rounded-sm">
                              <button onClick={() => setActiveEvidenceConsoleMode('trace')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'trace' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Trace</button>
                              <button onClick={() => setActiveEvidenceConsoleMode('analysis')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'analysis' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Actor</button>
                              <button onClick={() => setActiveEvidenceConsoleMode('diarization')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'diarization' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Diar</button>
                           </div>
                           <Button variant="ghost" size="sm" onClick={() => setSelectedRowId(null)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                              <X className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                     <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-50/30">
                        {activeEvidenceConsoleMode === 'trace' && (
                           <div className="space-y-6">
                              <div className="flex items-center gap-2">
                                 <Activity className="h-4 w-4 text-slate-400" />
                                 <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Traceability Analysis</span>
                              </div>
                              <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm space-y-4">
                                 <p className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                    Detail traceability for row <span className="font-mono text-blue-500">{selectedRowId}</span> is currently isolated from this node.
                                 </p>
                                 <div className="h-px bg-slate-100 w-full" />
                                 <div className="flex gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <div className="px-2 py-1 bg-slate-100 rounded">No Direct Evidence Links</div>
                                 </div>
                              </div>
                           </div>
                        )}
                        {activeEvidenceConsoleMode === 'analysis' && (
                           <div className="flex flex-col items-center justify-center text-center py-20 opacity-40">
                              <Search className="h-12 w-12 text-slate-400 mb-4" />
                              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Actor analysis unavailable</span>
                           </div>
                        )}
                        {activeEvidenceConsoleMode === 'diarization' && (
                           <div className="flex flex-col items-center justify-center text-center py-20 opacity-40">
                              <Mic className="h-12 w-12 text-slate-400 mb-4" />
                              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">No diarization linked</span>
                           </div>
                        )}
                     </div>
                  </div>
               )}

            </div>
         </div>

         {preRunAgentId && (
            <PreRunModal 
               agent={agents.find(a => a.id === preRunAgentId)!}
               onClose={() => setPreRunAgentId(null)}
               onRun={(rerun) => runSingleAgent(preRunAgentId, rerun)}
            />
         )}

         {historyAgentId && (
            <AgentHistoryPanel 
               agent={agents.find(a => a.id === historyAgentId)!}
               onClose={() => setHistoryAgentId(null)}
            />
         )}
      </div>
  );
}

function PreRunModal({ agent, onClose, onRun }: { agent: AgentState, onClose: () => void, onRun: (isRerun: boolean) => void }) {
  const isRerun = agent.status === 'completed' || agent.status === 'failed' || agent.status === 'cancelled';
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-sm  overflow-hidden border border-slate-200">
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-sm bg-slate-900 text-white flex items-center justify-center  shadow-slate-900/10">
                <agent.icon className="h-4 w-4" />
             </div>
             <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 leading-none">Execute Node</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Configuration & Cost Warning</span>
             </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 text-slate-400">
             <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-sm p-5 border border-slate-100 space-y-4">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase mb-2">Agent Context</span>
                <span className="text-[14px] font-black text-slate-900 uppercase tracking-tight leading-none">{agent.name}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Execution Mode</span>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${isRerun ? "text-amber-600" : "text-emerald-600"}`}>
                      {isRerun ? "Rerun / Re-analysis" : "Fresh Execution"}
                   </span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Last Run</span>
                   <span className="text-[10px] font-black text-slate-800 uppercase tabular-nums">{agent.lastRunTimestamp || "Never"}</span>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                   <Database className="h-3 w-3 text-slate-400" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Estimate</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white border border-slate-100 rounded-sm ">
                   <div className="text-[18px] font-black text-slate-900 leading-none">{agent.tokenEstimate?.toLocaleString()}</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                      Est. Tokens <HelpCircle className="h-2.5 w-2.5" />
                   </div>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-sm ">
                   <div className="text-[18px] font-black text-slate-900 leading-none">12</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Source Evidence</div>
                </div>
             </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 border-dashed rounded-sm p-4 flex gap-3">
             <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
             <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase block tracking-wider">Token Consumption Warning</span>
                <p className="text-[11px] font-black text-amber-900 leading-snug opacity-70">
                   Running this agent will consume cloud inference tokens. Cost will be billed to the Case ID budget.
                </p>
             </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 text-[11px] font-black uppercase tracking-widest rounded-sm">
             Cancel
          </Button>
          <Button onClick={() => onRun(isRerun)} className="flex-1 h-11 bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-sm  shadow-slate-900/10">
             {isRerun ? "Confirm Rerun" : "Confirm Execute"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AgentHistoryPanel({ agent, onClose }: { agent: AgentState, onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-slate-200 z-[100]  flex flex-col animate-in slide-in-from-right duration-300">
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
        <div className="flex items-center gap-3">
           <History className="h-5 w-5 text-slate-400" />
           <div className="flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Run History</h3>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{agent.name}</span>
           </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 rounded-full hover:bg-slate-200 text-slate-400 transition-all">
           <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {agent.history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-12">
             <Activity className="h-12 w-12 text-slate-300 mb-6" />
             <h4 className="text-[12px] font-black uppercase tracking-[0.2em]">No History Found</h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">This agent has not been executed yet.</p>
          </div>
        ) : (
          agent.history.map((run, i) => (
            <div key={run.run_id} className="relative pl-6 pb-8 last:pb-0">
               {i !== agent.history.length - 1 && (
                  <div className="absolute left-[7px] top-4 bottom-0 w-px bg-slate-100" />
               )}
               <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                  <div className={`h-1.5 w-1.5 rounded-full ${run.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
               </div>
               
               <div className="bg-white border border-slate-100 rounded-sm p-4  hover:border-slate-300 transition-all cursor-default">
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</span>
                        <span className="text-[11px] font-black text-slate-800 tabular-nums">
                           {new Date(run.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${run.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                        {run.status}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Token Usage</div>
                        <div className="text-[12px] font-black text-slate-900 tabular-nums">{run.token_usage?.toLocaleString() || "---"}</div>
                     </div>
                     <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Duration</div>
                        <div className="text-[12px] font-black text-slate-900 tabular-nums">{(run.duration_ms! / 1000).toFixed(2)}s</div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                     <Users className="h-3 w-3 text-slate-300" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Triggered by: <span className="text-slate-800">{run.triggered_by}</span></span>
                  </div>

                  <div className="bg-slate-50/50 rounded-sm p-3 border border-slate-50">
                     <p className="text-[11px] font-bold text-slate-500 leading-snug italic">
                        "{run.summary || "No summary provided for this run."}"
                     </p>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Metrics</span>
           <span className="text-[10px] font-black text-slate-900 uppercase">{agent.runCount} Total Runs</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-3 rounded-sm border ">
              <div className="text-[14px] font-black text-slate-900 leading-none">
                 {agent.history.reduce((a, b) => a + (b.token_usage || 0), 0).toLocaleString()}
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Tokens</div>
           </div>
           <div className="bg-white p-3 rounded-sm border ">
              <div className="text-[14px] font-black text-slate-900 leading-none">
                 {(agent.history.reduce((a, b) => a + (b.duration_ms || 0), 0) / 1000).toFixed(1)}s
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Compute</div>
           </div>
        </div>
      </div>
    </div>
  );
}
