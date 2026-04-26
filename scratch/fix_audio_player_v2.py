import sys

file_path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_h48 = 'className="h-48 relative bg-black/40">'
target_label = 'Temporal Amplitude (Time-Domain)'

# Use a more robust search
if target_h48 in content and target_label in content:
    content = content.replace('className="h-48 relative bg-black/40">', 'className="flex-1 relative bg-black/40">')
    # Remove the label div
    import re
    content = re.sub(r'<div className="absolute top-3 left-3 text-\[9px\].*?Temporal Amplitude \(Time-Domain\).*?</div>', '', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Target not found")
