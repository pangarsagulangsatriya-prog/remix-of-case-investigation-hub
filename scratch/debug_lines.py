import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8')
content_lf = content.replace('\r\n', '\n').replace('\r', '\n')

lines = content_lf.split('\n')

# Print lines 4248-4255 (0-indexed: 4247-4254) with repr to see exact chars
for i in range(4247, 4256):
    if i < len(lines):
        print(f'Line {i+1}: {repr(lines[i][:80])}')
