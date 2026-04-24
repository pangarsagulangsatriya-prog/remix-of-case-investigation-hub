import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content_lf = content.replace('\r\n', '\n').replace('\r', '\n')
lines = content_lf.split('\n')

# Print full lines around the issue
for i in range(4154, 4168):
    print(f'L{i+1}: {repr(lines[i])}')
