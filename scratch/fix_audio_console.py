import sys

with open(r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if '{activeTab === "Analysis" && (' in line and '</div>' in lines[i+1] and ')}' in lines[i+2] and '</div>' in lines[i+3] and ')}' in lines[i+4]:
        start_idx = i
        break

if start_idx != -1:
    new_logic = [
        '         {activeTab === "Analysis" && (\n',
        '            <div className="flex flex-col min-h-full">\n',
        '               <div className="flex-1">\n',
        '                  {viewMode === "Structured" ? (\n',
        '                     <AudioExtractionStructured data={normalizedExtraction} onJump={onJump} />\n',
        '                  ) : (\n',
        '                     <div className="p-4 bg-[#0d1117] min-h-full">\n',
        '                        <pre className="text-[10.5px] font-mono text-[#79c0ff] bg-[#0d1117] p-6 leading-relaxed overflow-auto custom-scrollbar">\n',
        '                           {JSON.stringify(normalizedExtraction, null, 2)}\n',
        '                        </pre>\n',
        '                     </div>\n',
        '                  )}\n',
        '               </div>\n',
        '            </div>\n',
        '         )}\n'
    ]
    lines[start_idx : start_idx + 5] = new_logic
    with open(r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx", "w", encoding="utf-8") as f:
        f.writelines(lines)
    print("Fixed corrupted AudioExtractionConsole")
else:
    print("Could not find the corrupted block")
