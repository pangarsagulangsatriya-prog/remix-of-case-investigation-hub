import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content_lf = content.replace('\r\n', '\n').replace('\r', '\n')

# Use exact 49-space / 52-space / 55-space / 46-space indentation as seen in debug
I49 = ' ' * 49  # base level for the progress bar div
I52 = ' ' * 52  # inner div
I55 = ' ' * 55  # attributes
I46 = ' ' * 46  # closing </div> of footer

old_snippet = (
    I49 + '<div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner mb-4">\n'
    + I52 + '<div \n'
    + I55 + 'className="h-full bg-slate-900 transition-all duration-700 ease-out" \n'
    + I55 + 'style={{ width: `${(((localKnowledgeSelection[agent.id] || []).filter(id => evidenceFiles.some(f => f.id === id)).length) / (evidenceFiles.length || 1)) * 100}%` }} \n'
    + I52 + '/>\n'
    + I49 + '</div>\n'
    + I46 + '</div>'
)

new_snippet = (
    I49 + '<div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner mb-4">\n'
    + I52 + '<div \n'
    + I55 + 'className="h-full bg-slate-900 transition-all duration-700 ease-out" \n'
    + I55 + 'style={{ width: `${(((localKnowledgeSelection[agent.id] || []).filter(id => evidenceFiles.some(f => f.id === id)).length) / (evidenceFiles.length || 1)) * 100}%` }} \n'
    + I52 + '/>\n'
    + I49 + '</div>\n'
    + I49 + '<Button\n'
    + I52 + 'onClick={(e) => {\n'
    + I55 + 'e.stopPropagation();\n'
    + I55 + 'handleSaveKnowledge(agent.id);\n'
    + I52 + '}}\n'
    + I52 + 'disabled={JSON.stringify(localKnowledgeSelection[agent.id]) === JSON.stringify(agent.knowledgeSelection)}\n'
    + I52 + 'className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-sm disabled:opacity-30 transition-all"\n'
    + I49 + '>\n'
    + I52 + 'Save Changes\n'
    + I49 + '</Button>\n'
    + I46 + '</div>'
)

print('Looking for old snippet...')
if old_snippet in content_lf:
    result = content_lf.replace(old_snippet, new_snippet, 1)
    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(result)
    print('SUCCESS: Save Changes button injected.')
else:
    print('ERROR: Exact match not found. Trying partial search...')
    # Try just the last 2 lines
    partial = I49 + '</div>\n' + I46 + '</div>'
    idx = content_lf.find(partial)
    print(f'Partial (closing divs) found at: {idx}')
    # Show what's actually at line 4249
    lines = content_lf.split('\n')
    for i in range(4247, 4257):
        print(f'  L{i+1} ({len(lines[i])} chars): {repr(lines[i][:100])}')
    sys.exit(1)
