import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Fix the main toolbar buttons (Measure button)
anchor = '<Focus className="h-3.5 w-3.5" />'
target_idx = -1
for i, line in enumerate(lines):
    if anchor in line and i > 3500:
        target_idx = i
        break

if target_idx != -1:
    # After </button> of Focus
    btn_insert_idx = target_idx + 2
    
    measure_btns = [
        '        <button \n',
        '          onClick={() => { setIsMeasureMode(!isMeasureMode); if(!isMeasureMode) setHandToolActive(false); setIsSpotlightMode(false); }}\n',
        '          className={cn("p-1.5 rounded-sm transition-all", isMeasureMode ? "bg-blue-600 text-white shadow-inner" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}\n',
        '        >\n',
        '          <Ruler className="h-3.5 w-3.5" />\n',
        '        </button>\n'
    ]
    lines[btn_insert_idx : btn_insert_idx] = measure_btns
    
    # Update Refresh button to reset measurement state
    # After the new button, Refresh button starts at btn_insert_idx + 6
    lines[btn_insert_idx + 7] = '            onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); setHandToolActive(false); setViewMode(\'fit\'); setSpotlightRect(null); setIsSpotlightMode(false); setIsMeasureMode(false); setMeasurements([]); setShowGrid(false); }}\n'

    # 2. Add Measurement Sub-Toolbar
    # Find the end of the Forensic toolbar block
    subtoolbar_anchor = '{isForensicOpen && ('
    subtoolbar_insert_idx = -1
    for i in range(len(lines)):
        if subtoolbar_anchor in lines[i] and i > 3500:
            # Skip until the end of this block
            count = 0
            for j in range(i, len(lines)):
                if '{' in lines[j]: count += lines[j].count('{')
                if '}' in lines[j]: count -= lines[j].count('}')
                if count == 0 and j > i:
                    subtoolbar_insert_idx = j + 1
                    break
            break
    
    if subtoolbar_insert_idx != -1:
        subtoolbar_ui = [
            '\n',
            '      {isMeasureMode && (\n',
            '        <div className="flex items-center justify-center shrink-0 -mt-1 scale-95 animate-in slide-in-from-top-2 duration-200">\n',
            '           <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-sm shadow-sm">\n',
            '              <div className="flex items-center gap-1 border-r pr-2 border-slate-100 mr-1">\n',
            '                <button \n',
            '                  onClick={() => { setMeasureMode("distance"); setTempPoints([]); }}\n',
            '                  className={cn("px-2 py-1 text-[9px] font-bold rounded-sm transition-all uppercase tracking-tight", measureMode === "distance" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50")}\n',
            '                >Distance</button>\n',
            '                <button \n',
            '                  onClick={() => { setMeasureMode("angle"); setTempPoints([]); }}\n',
            '                  className={cn("px-2 py-1 text-[9px] font-bold rounded-sm transition-all uppercase tracking-tight", measureMode === "angle" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50")}\n',
            '                >Angle</button>\n',
            '              </div>\n',
            '              <div className="flex items-center gap-1">\n',
            '                <button \n',
            '                  onClick={() => setShowGrid(!showGrid)}\n',
            '                  className={cn("p-1.5 rounded-sm transition-all", showGrid ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}\n',
            '                ><Grid3X3 className="h-3.5 w-3.5" /></button>\n',
            '                <button \n',
            '                  onClick={() => { setMeasurements([]); setTempPoints([]); }}\n',
            '                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-sm transition-all"\n',
            '                ><X className="h-3.5 w-3.5" /></button>\n',
            '              </div>\n',
            '           </div>\n',
            '        </div>\n',
            '      )}\n'
        ]
        lines[subtoolbar_insert_idx : subtoolbar_insert_idx] = subtoolbar_ui

    # 3. Add SVG Overlay and Grid
    img_anchor = '<img '
    img_idx = -1
    for i, line in enumerate(lines):
        if img_anchor in line and i > 3600:
            img_idx = i
            break
    
    if img_idx != -1:
        overlay_ui = [
            '\n',
            '          {/* Forensic Grid */}\n',
            '          {showGrid && (\n',
            '            <div \n',
            '              className="absolute inset-0 pointer-events-none opacity-20"\n',
            '              style={{\n',
            '                backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,\n',
            '                backgroundSize: `${gridSize}px ${gridSize}px`\n',
            '              }}\n',
            '            />\n',
            '          )}\n',
            '\n',
            '          {/* Measurement Layer */}\n',
            '          <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: "100%", height: "100%" }}>\n',
            '            {measurements.map((m, i) => (\n',
            '              <g key={i}>\n',
            '                {m.type === "distance" && (\n',
            '                  <>\n',
            '                    <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[1].x} y2={m.points[1].y} stroke="#2563eb" strokeWidth="1.5" />\n',
            '                    <circle cx={m.points[0].x} cy={m.points[0].y} r="3" fill="#2563eb" />\n',
            '                    <circle cx={m.points[1].x} cy={m.points[1].y} r="3" fill="#2563eb" />\n',
            '                    <text x={(m.points[0].x + m.points[1].x)/2} y={(m.points[0].y + m.points[1].y)/2 - 10} fill="#2563eb" fontSize="10" fontWeight="bold" textAnchor="middle" className="drop-shadow-sm">{m.label}</text>\n',
            '                  </>\n',
            '                )}\n',
            '                {m.type === "angle" && (\n',
            '                  <>\n',
            '                    <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[1].x} y2={m.points[1].y} stroke="#ea580c" strokeWidth="1.5" />\n',
            '                    <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[2].x} y2={m.points[2].y} stroke="#ea580c" strokeWidth="1.5" />\n',
            '                    <circle cx={m.points[0].x} cy={m.points[0].y} r="3" fill="#ea580c" />\n',
            '                    <text x={m.points[0].x} y={m.points[0].y - 15} fill="#ea580c" fontSize="10" fontWeight="bold" textAnchor="middle" className="drop-shadow-sm">{m.label}</text>\n',
            '                  </>\n',
            '                )}\n',
            '              </g>\n',
            '            ))}\n',
            '            {tempPoints.map((p, i) => (\n',
            '              <circle key={i} cx={p.x} cy={p.y} r="3" fill={measureMode === "distance" ? "#2563eb" : "#ea580c"} />\n',
            '            ))}\n',
            '          </svg>\n'
        ]
        # Insert before the image
        lines[img_idx : img_idx] = overlay_ui

    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
        f.writelines(lines)
    print('SUCCESS: Measurement Toolkit fully integrated.')
else:
    print('ERROR: Anchor not found.')
    sys.exit(1)
