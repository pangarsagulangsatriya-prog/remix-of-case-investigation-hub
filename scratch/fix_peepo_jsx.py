import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the block around 4231
# We are looking for the end of the PEEPO block
found_idx = -1
for i, line in enumerate(lines):
    if 'selectedAgentId === \'peepo\'' in line:
        # Found the start, now look for the end
        for j in range(i, i + 500):
            if 'JSON.stringify(slides[activeSlide]?.content, null, 2)' in lines[j]:
                for k in range(j, j + 10):
                    if ')}' in lines[k] and 'JSON.stringify' not in lines[k]:
                        found_idx = k
                        break
                if found_idx != -1:
                    break
        if found_idx != -1:
            break

if found_idx != -1:
    # Fix the closing sequence
    end_idx = -1
    for i in range(found_idx, found_idx + 20):
        if ') : (' in lines[i] and 'selectedAgentId' not in lines[i]:
            end_idx = i
            break
            
    if end_idx != -1:
        new_closing = [
            '                                        )}\n',
            '                                     </div>\n',
            '                                  )}\n',
            '                               </div>\n',
            '                            )}\n',
            '                         </div>\n',
            '                      </div>\n'
        ]
        lines[found_idx:end_idx] = new_closing
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"Successfully fixed PEEPO closing tags at index {found_idx}")
    else:
        # If we didn't find the ') : (', let's look for line indices around 4230
        print("Failed to find end index, trying fallback...")
        lines[found_idx] = '                                        )}\n'
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Fixed immediate closure")
else:
    print("Failed to find PEEPO closure")
    sys.exit(1)
