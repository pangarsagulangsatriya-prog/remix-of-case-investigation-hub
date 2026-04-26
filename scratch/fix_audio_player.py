import sys

file_path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

target_h48 = '           <div className="h-48 relative bg-black/40">\n'
target_canvas = '              <canvas ref={waveformCanvasRef} width={800} height={192} className="w-full h-full" />\n'
target_label = '              <div className="absolute top-3 left-3 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Temporal Amplitude (Time-Domain)</div>\n'

new_lines = []
skip = 0
for i in range(len(lines)):
    if skip > 0:
        skip -= 1
        continue
    
    if i + 2 < len(lines) and lines[i] == target_h48 and lines[i+1] == target_canvas and lines[i+2] == target_label:
        new_lines.append('           <div className="flex-1 relative bg-black/40">\n')
        new_lines.append(lines[i+1])
        skip = 2
    else:
        new_lines.append(lines[i])

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
