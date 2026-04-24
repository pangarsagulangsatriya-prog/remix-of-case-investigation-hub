import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Look for the redundancy
# 4435: )
# 4436:
# 4437: )}
found = False
for i in range(len(lines) - 2):
    if lines[i].strip() == ')' and lines[i+1].strip() == '' and lines[i+2].strip() == ')}':
        print(f"Found redundancy at line {i+1}")
        lines[i+2] = lines[i+2].replace(')}', '}')
        found = True
        break

if found:
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully fixed final closure")
else:
    print("Could not find redundancy")
    sys.exit(1)
