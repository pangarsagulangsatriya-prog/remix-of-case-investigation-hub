
import os

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

i = 0
while i < len(lines):
    line = lines[i]
    
    # Remove the 'actor' button from evidence console
    if "setActiveEvidenceConsoleMode('actor')" in line:
        i += 1
        continue
    
    # Remove the actor evidence console block
    if "activeEvidenceConsoleMode === 'actor' ?" in line:
        # Skip until the else branch
        brace_level = 0
        while i < len(lines):
            l = lines[i]
            if "(" in l: brace_level += l.count("(")
            if ")" in l: brace_level -= l.count(")")
            
            if brace_level == 0 and " : (" in l:
                # We found the start of the next block (the 'else' branch)
                # But we want to remove the 'actor' block entirely, and make the 'else' content the main content.
                # The structure is: activeEvidenceConsoleMode === 'actor' ? (<ActorView />) : (<TraceView />)
                # We want just <TraceView />
                
                # Check if it was a ternary.
                # If so, we just need to skip the first branch and the ternary start.
                i += 1
                break
            i += 1
        continue

    # Cleanup any stray </Button> tags that were breaking things
    if "Copy Profile" in line and "</Button>" in lines[i+1]:
        print(f"Removing stray button at line {i+1}")
        i += 2
        continue

    new_lines.append(line)
    i += 1

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
