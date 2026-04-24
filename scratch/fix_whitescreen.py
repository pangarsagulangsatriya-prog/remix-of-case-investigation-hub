import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content_lf = content.replace('\r\n', '\n').replace('\r', '\n')

# Insert currentAgentSelection after the isExpanded line (L4159)
old_snippet = (
    '                                                    const isExpanded = expandedKnowledgeFolders.includes(batch.id);\n'
    '                                                    const selectedInBatch = filesInBatch.filter(f => currentAgentSelection.includes(f.id));'
)

new_snippet = (
    '                                                    const isExpanded = expandedKnowledgeFolders.includes(batch.id);\n'
    '                                                    const currentAgentSelection = localKnowledgeSelection[agent.id] || agent.knowledgeSelection || [];\n'
    '                                                    const selectedInBatch = filesInBatch.filter(f => currentAgentSelection.includes(f.id));'
)

print('Searching for anchor...')
if old_snippet in content_lf:
    result = content_lf.replace(old_snippet, new_snippet, 1)
    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(result)
    print('SUCCESS: currentAgentSelection const injected.')
else:
    print('ERROR: Anchor not found.')
    idx = content_lf.find('const isExpanded = expandedKnowledgeFolders.includes(batch.id);')
    print(f'isExpanded line found at: {idx}')
    if idx > 0:
        print(repr(content_lf[idx-10:idx+200]))
    sys.exit(1)
