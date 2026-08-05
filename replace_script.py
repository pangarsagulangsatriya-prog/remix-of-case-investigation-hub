import re

with open('src/components/analysis/FactChronologyModule.tsx', 'r') as f:
    content = f.read()

with open('new_trace_panel.tsx', 'r') as f:
    new_panel = f.read()

start_marker = "// ── Provenance & Annotation Components ─────────────────────────────────────"
end_marker = "// ── Slide View Component ───────────────────────────────────────────────────"

pattern = re.compile(re.escape(start_marker) + r".*?(?=" + re.escape(end_marker) + ")", re.DOTALL)

new_content = pattern.sub(start_marker + "\n\n" + new_panel + "\n", content)

with open('src/components/analysis/FactChronologyModule.tsx', 'w') as f:
    f.write(new_content)

print("Replaced successfully!")
