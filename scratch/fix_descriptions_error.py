import sys

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Add the SECTION_DESCRIPTIONS constant at the top after imports (around line 112)
descriptions_const = [
    "\n",
    "const SECTION_DESCRIPTIONS: Record<string, string> = {\n",
    '    "Case Summary": "Primary information regarding the current investigation.",\n',
    '    "Evidence Overview": "Aggregated view of all digital assets and forensic status.",\n',
    '    "Forensic Actors": "Key individuals and entities identified during scanning.",\n',
    '    "General Detection": "AI identification of primary subjects and objects.",\n',
    '    "Environment & PPE": "Contextual analysis of safety equipment and hazards.",\n',
    '    "AI Extraction Metadata": "Technical logs regarding model performance.",\n',
    '    "Entity Extraction": "Specific nouns and organizations discovered.",\n',
    '    "Semantic Summary": "Deep contextual understanding of the document.",\n',
    '    "Forensic Metadata": "Technical integrity data and OCR confidence.",\n',
    '    "Audio Properties": "Metadata regarding the capture quality and source.",\n',
    '    "Speaker Profiles": "Detailed analysis of unique voices found.",\n',
    '    "Communication Events": "Key conversational milestones and interactions.",\n',
    '    "Timeline & Facts": "Chronological event extraction for case build-up.",\n',
    '    "Risks, Gaps, Review": "Procedural anomalies and potential blockers.",\n',
    '    "Video Session Meta": "Integrity and session data for the video stream.",\n',
    '    "Scene Timeline": "Temporal segmentation of visual events detected."\n',
    "};\n",
    "\n"
]

# Find where to insert (after imports)
insert_idx = 0
for i, line in enumerate(lines):
    if "const DocIcon" in line:
        insert_idx = i
        break

lines[insert_idx:insert_idx] = descriptions_const

# Replace descriptions.get(title, ...) with SECTION_DESCRIPTIONS[title]
content = "".join(lines)
content = content.replace("descriptions.get(title, ", "SECTION_DESCRIPTIONS[title] || ")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed SECTION_DESCRIPTIONS reference error")
