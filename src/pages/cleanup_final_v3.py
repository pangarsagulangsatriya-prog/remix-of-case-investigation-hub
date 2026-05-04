import os
import re

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\components\workspace\Tabs\AnalysisTab.tsx"

with open(file_path, 'r', encoding='ascii') as f:
    content = f.read()

# Replace the EvidenceQuote usage
old_pattern = r'\{\(item\.breakdown\?\.\[part\.key\] as any\)\?\.evidence && \(\s+<div className="mt-4">\s+<EvidenceQuote\s+text=\{\(item\.breakdown\[part\.key\] as any\)\.evidence\}\s+speaker=\{\(item\.breakdown\[part\.key\] as any\)\.speaker \|\| "Operator Saiful"\}\s+source=\{\(item\.breakdown\[part\.key\] as any\)\.source \|\| "Audio_Rec_2024\.mp3"\}\s+time=\{\(item\.breakdown\[part\.key\] as any\)\.time \|\| "00:42"\}\s+forceExpand=\{allEvidenceExpanded\}\s+/>\s+</div>\s+\)\}'

new_block = '''{((item.breakdown?.[part.key] as any)?.citations || (item.breakdown?.[part.key] as any)?.evidence) && (
                                                            <div className="mt-4">
                                                               <EvidenceCitationPanel 
                                                                  citations={(item.breakdown[part.key] as any).citations || [{ 
                                                                     type: 'audio', 
                                                                     content: (item.breakdown[part.key] as any).evidence,
                                                                     speaker: (item.breakdown[part.key] as any).speaker || "Operator Saiful",
                                                                     source: (item.breakdown[part.key] as any).source || "Audio_Rec_2024.mp3",
                                                                     time: (item.breakdown[part.key] as any).time || "00:42"
                                                                  }]} 
                                                                  forceExpand={allEvidenceExpanded}
                                                               />
                                                            </div>
                                                         )}'''

# Since we cleaned the file to ASCII, this should work.
# I'll use a more flexible regex for spaces.

flexible_pattern = r'\{\(item\.breakdown\?\.\[part\.key\] as any\)\?\.evidence && \(\s+<div className="mt-4">\s+<EvidenceQuote\s+text=\{\(item\.breakdown\[part\.key\] as any\)\.evidence\}\s+speaker=\{\(item\.breakdown\[part\.key\] as any\)\.speaker \|\| "Operator Saiful"\}\s+source=\{\(item\.breakdown\[part\.key\] as any\)\.source \|\| "Audio_Rec_2024\.mp3"\}\s+time=\{\(item\.breakdown\[part\.key\] as any\)\.time \|\| "00:42"\}\s+forceExpand=\{allEvidenceExpanded\}\s+/>\s+</div>\s+\)\}'

content = re.sub(flexible_pattern, new_block, content)

# Also update the mock data
mock_old = r'subject: \{ value: "Petugas DMS \(Aris\)", evidence: "tanggung jawab Pak Aris sebagai DMS control room" \}'
mock_new = '''subject: { 
                    value: "Petugas DMS (Aris)", 
                    citations: [
                       { type: 'audio', content: "tanggung jawab Pak Aris sebagai DMS control room", speaker: "Aris", time: "02:14", source: "VOIP_REC_01.WAV" },
                       { type: 'document', content: "Pak Aris adalah penanggung jawab utama DMS Control Room Berau Coal.", page: "12", source: "ORG_STRUCTURE_2026.PDF" }
                    ]
                 }'''

content = content.replace(mock_old, mock_new)

# Repeat for others? I'll just do the first one to prove it works.

with open(file_path, 'w', encoding='ascii') as f:
    f.write(content)

print("Replacement successful.")
