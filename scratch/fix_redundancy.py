import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Look for the redundancy
# 4229: )
# 4230:
# 4231: )}
found = False
for i in range(len(lines) - 2):
    if lines[i].strip() == ')' and lines[i+1].strip() == '' and lines[i+2].strip() == ')}':
        print(f"Found redundancy at line {i+1}")
        del lines[i:i+2]
        found = True
        break

if found:
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully removed redundant closures")
else:
    print("Could not find redundancy")
    sys.exit(1)
