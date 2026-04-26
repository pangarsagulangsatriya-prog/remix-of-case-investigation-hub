import sys

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the redundant parenthesis error
content = content.replace('SECTION_DESCRIPTIONS[title] || "Forensic modality analysis section.")}', 'SECTION_DESCRIPTIONS[title] || "Forensic modality analysis section."}')
content = content.replace('SECTION_DESCRIPTIONS[title] || "Primary case information section.")}', 'SECTION_DESCRIPTIONS[title] || "Primary case information section."}')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed syntax error in tooltips")
