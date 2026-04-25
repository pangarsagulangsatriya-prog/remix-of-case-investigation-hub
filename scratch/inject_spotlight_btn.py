import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

anchor = '          <button \n'
anchor_2 = '            onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); setHandToolActive(false); setViewMode(\'fit\'); }}\n'

target_idx = -1
for i in range(len(lines)):
    if anchor in lines[i] and anchor_2 in lines[i+1] and i > 3500:
        target_idx = i
        break

if target_idx != -1:
    # We found the Refresh button. We want to insert the Focus button BEFORE it.
    spotlight_button = [
        '          <button \n',
        '            onClick={() => { setIsSpotlightMode(!isSpotlightMode); if(!isSpotlightMode) setHandToolActive(false); }}\n',
        '            className={cn("p-1.5 rounded-sm transition-all", isSpotlightMode ? "bg-amber-500 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}\n',
        '          >\n',
        '            <Focus className="h-3.5 w-3.5" />\n',
        '          </button>\n'
    ]
    lines[target_idx : target_idx] = spotlight_button
    
    # Also need to update the Refresh button onClick to reset spotlight
    # It's now at target_idx + 6
    lines[target_idx + 7] = '            onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); setHandToolActive(false); setViewMode(\'fit\'); setSpotlightRect(null); setIsSpotlightMode(false); }}\n'

    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
        f.writelines(lines)
    print('SUCCESS: Spotlight button inserted.')
else:
    print('ERROR: Refresh button anchor not found.')
    sys.exit(1)
