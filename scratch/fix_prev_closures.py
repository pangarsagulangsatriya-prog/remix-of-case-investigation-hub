import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Look for the redundancy at the end of the orchestration block
# We want to find the pattern of multiple closing parentheses
found = False
for i in range(len(lines) - 5):
    if 'JSON.stringify(slides[activeSlide]?.content, null, 2)' in lines[i]:
        # We are at the end of the fallback block
        # Look for the sequence of closures
        for j in range(i, i + 20):
            if lines[j].strip() == ')' and lines[j+1].strip() == '' and lines[j+2].strip() == ')':
                print(f"Found double closure at line {j+1}")
                del lines[j:j+2]
                found = True
                break
        if found: break

if found:
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully removed redundant closures")
else:
    print("Could not find redundancy")
    sys.exit(1)
