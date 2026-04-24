import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the end of the main toolbar
anchor = '          <RefreshCcw className="h-3.5 w-3.5" />'
target_idx = -1
for i, line in enumerate(lines):
    if anchor in line and i > 3400:
        target_idx = i
        break

if target_idx != -1:
    # We found the button inside the toolbar. We need to go 2 lines down to be after the </button> and </div>
    # lines[target_idx]: icon
    # lines[target_idx+1]: </button>
    # lines[target_idx+2]: </div>
    
    # 1. Add Wand2 button before the </div>
    lines.insert(target_idx + 2, '        <div className="w-px h-4 bg-slate-100 mx-1" />\n')
    lines.insert(target_idx + 3, '        <button \n')
    lines.insert(target_idx + 4, '          onClick={() => setIsForensicOpen(!isForensicOpen)}\n')
    lines.insert(target_idx + 5, '          className={cn("p-1.5 rounded-sm transition-all", isForensicOpen ? "bg-indigo-500 text-white shadow-inner" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}\n')
    lines.insert(target_idx + 6, '        >\n')
    lines.insert(target_idx + 7, '          <Wand2 className="h-3.5 w-3.5" />\n')
    lines.insert(target_idx + 8, '        </button>\n')
    
    # 2. Add Forensic Toolbar after the </div>
    # The </div> for the main toolbar is now at target_idx + 9
    insertion_idx = target_idx + 10
    
    forensic_ui = [
        '      </div>\n',
        '\n',
        '      {isForensicOpen && (\n',
        '        <div className="flex items-center justify-center shrink-0 -mt-1 scale-95 animate-in slide-in-from-top-2 duration-200">\n',
        '           <div className="flex items-center gap-4 p-1.5 bg-white border border-slate-200 rounded-sm shadow-sm">\n',
        '              <div className="flex items-center gap-1 border-r pr-3 border-slate-100">\n',
        '                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-2">Presets</span>\n',
        '                 {[\n',
        '                   { id: "natural", label: "Original" },\n',
        '                   { id: "high-contrast", label: "Hi-Contrast" },\n',
        '                   { id: "low-light", label: "Low-Light" },\n',
        '                   { id: "dust-cut", label: "Clarity" },\n',
        '                   { id: "grayscale", label: "B&W" },\n',
        '                   { id: "invert", label: "Invert" },\n',
        '                   { id: "infra", label: "Thermal-P" }\n',
        '                 ].map(p => (\n',
        '                   <button \n',
        '                    key={p.id}\n',
        '                    onClick={() => applyPreset(p.id)}\n',
        '                    className="px-2 py-1 text-[8px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-sm uppercase tracking-tighter"\n',
        '                   >\n',
        '                     {p.label}\n',
        '                   </button>\n',
        '                 ))}\n',
        '              </div>\n',
        '\n',
        '              <div className="flex items-center gap-4">\n',
        '                 {[\n',
        '                   { id: "exposure", label: "EXP", icon: Sun, min: 50, max: 200 },\n',
        '                   { id: "contrast", label: "CON", icon: Contrast, min: 50, max: 200 },\n',
        '                   { id: "saturate", label: "SAT", icon: Zap, min: 0, max: 200 }\n',
        '                 ].map(s => (\n',
        '                   <div key={s.id} className="flex items-center gap-2">\n',
        '                      <s.icon className="h-3 w-3 text-slate-400" />\n',
        '                      <input \n',
        '                        type="range" \n',
        '                        min={s.min} \n',
        '                        max={s.max} \n',
        '                        value={(enhancements as any)[s.id]}\n',
        '                        onChange={(e) => setEnhancements(prev => ({ ...prev, [s.id]: parseInt(e.target.value) }))}\n',
        '                        className="w-16 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-500"\n',
        '                      />\n',
        '                   </div>\n',
        '                 ))}\n',
        '                 <button \n',
        '                  onClick={() => setEnhancements({ exposure: 100, contrast: 100, saturate: 100, invert: 0, grayscale: 0, sepia: 0, hue: 0 })}\n',
        '                  className="p-1 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded transition-all"\n',
        '                 >\n',
        '                   <RefreshCcw className="h-3 w-3" />\n',
        '                 </button>\n',
        '              </div>\n',
        '           </div>\n',
        '        </div>\n',
        '      )}\n'
    ]
    
    # Replace the existing closing div for the main toolbar and add the forensic one
    # Note: we already added buttons before lines[target_idx+9], so let's be careful.
    # Original lines[target_idx+2] was the </div>. After 7 inserts, it is now at target_idx+9.
    lines[target_idx + 9] = forensic_ui[0]
    lines[target_idx + 10 : target_idx + 10] = forensic_ui[1:]

    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
        f.writelines(lines)
    print('SUCCESS: Forensic Toolbar injected.')
else:
    print('ERROR: Anchor not found.')
    sys.exit(1)
