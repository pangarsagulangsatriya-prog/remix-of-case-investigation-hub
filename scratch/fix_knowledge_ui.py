import sys

def fix_file():
    path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the Settings button block
    # Lines 4088 to 4093 (1-indexed) -> 4087 to 4093 (0-indexed)
    
    start_idx = 4087
    end_idx = 4093
    
    # Check if it's the right block
    if "Settings" in lines[4091]:
        new_content = [
            '                                     <Button \n',
            '                                        variant="outline" \n',
            '                                        onClick={(e) => { e.stopPropagation(); setKnowledgeAgentId(knowledgeAgentId === agent.id ? null : agent.id); }}\n',
            '                                        className={cn(\n',
            '                                           "flex-1 h-10 border-slate-200 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm transition-all",\n',
            '                                           knowledgeAgentId === agent.id ? "bg-slate-900 text-emerald-400 border-slate-900 shadow-lg" : "bg-white text-slate-500 hover:bg-slate-50"\n',
            '                                        )}\n',
            '                                     >\n',
            '                                        <Book className="h-4 w-4" />\n',
            '                                     </Button>\n'
        ]
        lines[start_idx:end_idx] = new_content
        
        # Now add the selector after the buttons div (which ends at 4094, now shifted)
        # The div end was at index 4093. With our 10 lines replacement for 6 lines, it shifted by 4.
        # So new index for div end is 4093 + 4 = 4097.
        # Wait, let's just find the line that has "</div>" after the button we just replaced.
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Step 1 Success")
    else:
        print(f"Mismatch at 4091: {repr(lines[4091])}")

if __name__ == "__main__":
    fix_file()
