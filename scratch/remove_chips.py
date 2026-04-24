import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the lines to remove
start_idx = -1
for i, line in enumerate(lines):
    if '<div className="h-4 w-px bg-slate-200" />' in line and i > 3200:
        start_idx = i
        break

if start_idx != -1:
    # We want to remove the separator and the next div block
    # line i: separator
    # line i+1: flex items-center gap-3
    # line i+2: statusindicator
    # line i+3: confidencechip
    # line i+4: </div>
    
    # Verify these lines
    if '<div className="flex items-center gap-3">' in lines[start_idx+1] and '</div>' in lines[start_idx+4]:
        del lines[start_idx : start_idx+5]
        with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
            f.writelines(lines)
        print('SUCCESS: Removed status chips.')
    else:
        print(f'ERROR: Found separator at {start_idx+1} but next lines did not match.')
        print(f'L{start_idx+2}: {repr(lines[start_idx+1])}')
        print(f'L{start_idx+5}: {repr(lines[start_idx+4])}')
        sys.exit(1)
else:
    print('ERROR: Could not find status chips separator.')
    sys.exit(1)
