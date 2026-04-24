import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content_lf = content.replace('\r\n', '\n').replace('\r', '\n')

# 1. Update FileRow title weight (already done by previous tool call partially, but let's be sure)
# Actually the previous tool call SUCCESSFUL for chunk 0? 
# "The following changes were made... [diff_block_start] ... font-medium ..."
# So FileRow is done.

# 2. Update preview header h2 weight and remove chips
old_header = (
    '                       <h2 className="text-sm font-black text-slate-900 tracking-tight">{selectedFile.name}</h2>\n'
    '                    </div>\n'
    '                    <div className="h-4 w-px bg-slate-200" />\n'
    '                    <div className="flex items-center gap-3">\n'
    '                       <StatusIndicator status={selectedFile.extraction_status || \'pending\'} type="extraction" />\n'
    '                       <ConfidenceChip level="high" />\n'
    '                    </div>'
)

new_header = (
    '                       <h2 className="text-sm font-medium text-slate-900 tracking-tight">{selectedFile.name}</h2>\n'
    '                    </div>'
)

if old_header in content_lf:
    result = content_lf.replace(old_header, new_header)
    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(result)
    print('SUCCESS: Header refined.')
else:
    print('ERROR: Header anchor not found.')
    # Let's try a smaller anchor
    anchor = '<h2 className="text-sm font-black text-slate-900 tracking-tight">{selectedFile.name}</h2>'
    if anchor in content_lf:
        print('Found anchor but not full snippet. Indentation might be the issue.')
        # Replace just the h2
        result = content_lf.replace(anchor, anchor.replace('font-black', 'font-medium'))
        # And remove the chips separately
        chips = '<StatusIndicator status={selectedFile.extraction_status || \'pending\'} type="extraction" />'
        if chips in result:
             # Find the container
             import re
             result = re.sub(r'                    <div className="h-4 w-px bg-slate-200" />\n                    <div className="flex items-center gap-3">.*?</div>', '', result, flags=re.DOTALL)
        
        with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
            f.write(result)
        print('SUCCESS: Applied partial fixes via regex.')
    else:
        print('Could not find h2 anchor.')
        sys.exit(1)
