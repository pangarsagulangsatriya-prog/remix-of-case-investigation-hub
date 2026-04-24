
import os

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Goal: Remove duplicates and fix tags around lines 4377-4654
# We want the sequence: peepo -> ipls -> prev -> fallback

new_lines = []
skip = False

# We will re-build the orchestration section
# Find the start: slides[activeSlide]?.type === 'chronology_module'
# Then find the else branch (line 4139/4140)

i = 0
while i < len(lines):
    line = lines[i]
    
    # If we hit line 4377 (the duplicate IPLS), we skip until we find the good fallback or idle orchestration
    if "selectedAgentId === 'ipls' ?" in line and i > 4300:
        # Check if we already have an IPLS block
        found_previous = False
        for prev_line in reversed(new_lines[-200:]):
            if "selectedAgentId === 'ipls' ?" in prev_line:
                found_previous = True
                break
        
        if found_previous:
            print(f"Skipping duplicate IPLS at line {i+1}")
            # Skip until the next agent check or fallback
            while i < len(lines) and "selectedAgentId === 'prev' ?" not in lines[i]:
                i += 1
            continue

    if "selectedAgentId === 'prev' ?" in line and i > 4400:
        # Check if we have a duplicate or broken prev
        # The broken one is line 4460 in original
        # The good one is line 4544 in original
        
        # Let's see if the next 10 lines contain a table body that ends abruptly
        is_broken = False
        for j in range(i, min(i + 100, len(lines))):
            if "item.status" in lines[j] and ") : selectedAgentId === 'prev' ?" in lines[j+1]:
                is_broken = True
                break
        
        if is_broken:
            print(f"Skipping broken PREV at line {i+1}")
            while i < len(lines) and ") : selectedAgentId === 'prev' ?" not in lines[i]:
                i += 1
            # i now points to ") : selectedAgentId === 'prev' ?"
            # We want to keep this one as it's the good one, but we need to fix the leading ")"
            new_lines.append("                                         ) : selectedAgentId === 'prev' ? (\n")
            i += 1
            continue

    # Cleanup the messy closing tags at the end of the orchestration
    if "JSON.stringify(slides[activeSlide]?.content" in line:
        new_lines.append(line)
        i += 1
        # Skip until we find the end of the idle orchestration
        while i < len(lines) and "Orchestration Idle" not in lines[i]:
            if "</div>" in lines[i] or ")}" in lines[i] or "}" in lines[i]:
                # We'll re-add these correctly
                pass
            else:
                new_lines.append(lines[i])
            i += 1
        
        # Re-add the closing tags for the orchestration block
        new_lines.append("                                         )\n")
        new_lines.append("                                      }\n")
        new_lines.append("                                   </div>\n")
        new_lines.append("                                )}\n")
        new_lines.append("                             </div>\n")
        new_lines.append("                          </div>\n")
        new_lines.append("                       </div>\n")
        new_lines.append("                    </div>\n")
        
        # Now find the start of the Idle view
        while i < len(lines) and "Orchestration Idle" not in lines[i]:
            i += 1
        continue

    new_lines.append(line)
    i += 1

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
