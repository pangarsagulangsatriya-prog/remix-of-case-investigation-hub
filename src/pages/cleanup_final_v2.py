import sys

file_path = r'c:\\Users\\Feedloop\\OneDrive\\Desktop\\Demo File\\remix-of-case-investigation-hub\\src\\pages\\CaseWorkspacePage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i in range(len(lines) - 10):
    if '</div>' in lines[i] and '</td>' in lines[i+1] and '</tr>' in lines[i+2]:
        start_idx = i
        break

if start_idx != -1:
    print(f"Found mess start at line {start_idx + 1}")
    
    end_idx = -1
    for i in range(start_idx, len(lines)):
        if "selectedAgentId === 'prev' ? (" in lines[i]:
            end_idx = i
            break
            
    if end_idx != -1:
        # We want to keep lines up to start_idx (the first </div>), then jump to end_idx.
        final_lines = lines[:start_idx + 1] + lines[end_idx:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(final_lines)
        print("Successfully cleaned up mess.")
    else:
        print("Could not find end of mess.")
        sys.exit(1)
else:
    print("Could not find start of mess.")
    sys.exit(1)
