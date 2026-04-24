import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the block around 4138
# Look for ')}' after the Actor Profile's metadata grid
found_idx = -1
for i, line in enumerate(lines):
    if 'Emergency Contact' in line: # Metadata grid end
        for j in range(i, i + 20):
            if ')}' in lines[j] and 'JSON.stringify' not in lines[j]:
                found_idx = j
                break
        if found_idx != -1:
            break

if found_idx != -1:
    # We want to replace from found_idx to the line before ') : ('
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
        print(f"Successfully fixed closing tags at index {found_idx}")
    else:
        print("Failed to find end of block")
        sys.exit(1)
else:
    print("Failed to find target line")
    sys.exit(1)
