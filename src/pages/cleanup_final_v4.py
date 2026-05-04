import os
import re

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\components\workspace\Tabs\AnalysisTab.tsx"

with open(file_path, 'r', encoding='ascii') as f:
    content = f.read()

# 1. Update the EvidenceCitationPanel content rendering to support thumbnails
old_cite_content = r'               <p className="text-\[11px\] font-medium text-slate-700 leading-relaxed italic mb-4">\s+"\{cite\.content \|\| cite\.text\}"\s+</p>'

new_cite_content = '''               <div className="flex gap-4 mb-4">
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
               </div>'''

content = re.sub(old_cite_content, new_cite_content, content)

# 2. Update mock data with rich multiple citations
# Chrono-001 already partially updated, let's do the rest of 001 and 002

mock_updates = {
    'action: { value: "Mengidentifikasi riwayat deviasi", evidence: "ada juga banyak di rekapan juga sampai dari week 10 sampai week 41 itu 41 kali" }': 
    '''action: { 
                    value: "Mengidentifikasi riwayat deviasi", 
                    citations: [
                       { type: 'document', content: "ada juga banyak di rekapan juga sampai dari week 10 sampai week 41 itu 41 kali", page: "04", source: "DMS_RECAP_WEEKLY.XLSX" },
                       { type: 'image', content: "Screenshot dashboard DMS menunjukkan lonjakan deviasi pada profil Saiful.", source: "DMS_ALERT_SS_01.PNG", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200" }
                    ]
                 }''',
    'object: { value: "Profil Operator Saiful", evidence: "catatannya banyak fatigue, ah itu biasa kami sering intens... mengontrol mereka" }':
    '''object: { 
                    value: "Profil Operator Saiful", 
                    citations: [
                       { type: 'audio', content: "catatannya banyak fatigue, ah itu biasa kami sering intens... mengontrol mereka", speaker: "Aris", time: "02:16", source: "VOIP_REC_01.WAV" },
                       { type: 'video', content: "Rekaman CCTV menunjukkan operator Saiful terlihat kelelahan saat memasuki unit.", time: "22:05", source: "CCTV_GATE_A.MP4", thumbnail: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=200" }
                    ]
                 }''',
    'source_system: { value: "Rekapitulasi Data DMS", evidence: "laporan temuan deviasi fatigue itu ada yang kami catat tuh Pak di rekap itu" }':
    '''source_system: { 
                    value: "Rekapitulasi Data DMS", 
                    citations: [
                       { type: 'document', content: "laporan temuan deviasi fatigue itu ada yang kami catat tuh Pak di rekap itu", page: "08", source: "DMS_RECAP_WEEKLY.XLSX" }
                    ]
                 }''',
    'condition: { value: "Pemantauan Intensif", evidence: "kalau misalnya dari orang ini eh catatannya banyak fatigue, ah itu biasa kami sering intens" }':
    '''condition: { 
                    value: "Pemantauan Intensif", 
                    citations: [
                       { type: 'audio', content: "kalau misalnya dari orang ini eh catatannya banyak fatigue, ah itu biasa kami sering intens", speaker: "Aris", time: "02:18", source: "VOIP_REC_01.WAV" }
                    ]
                 }'''
}

for old, new in mock_updates.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='ascii') as f:
    f.write(content)

print("Batch update successful.")
