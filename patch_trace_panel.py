with open('src/components/analysis/FactChronologyModule.tsx', 'r') as f:
    content = f.read()

with open('event_citation_list.tsx', 'r') as f:
    event_list = f.read()

# Insert EventCitationList before TraceabilityPanel
content = content.replace("export const TraceabilityPanel", event_list + "\n\nexport const TraceabilityPanel", 1)

# Inject <EventCitationList item={item} /> inside TraceabilityPanel
action_btn_text = "{/* Action Button */}"
replacement = """{item.provenanceType !== 'HUMAN_MANUAL' && (
          <EventCitationList item={item} />
        )}

        {/* Action Button */}"""
content = content.replace(action_btn_text, replacement, 1)

with open('src/components/analysis/FactChronologyModule.tsx', 'w') as f:
    f.write(content)

print("Patched successfully!")
