import sys

def fix_file():
    path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Lines 4141 to 4207 in the file (1-indexed)
    # correspond to indices 4140 to 4207 (0-indexed)
    # We want to replace this block.
    
    start_idx = 4140
    end_idx = 4207
    
    new_content = [
        '                                        <h2 className="text-[32px] font-black text-slate-800 mb-8 tracking-tighter uppercase">{slides[activeSlide]?.title}</h2>\n',
        '                                        {selectedAgentId === \'peepo\' ? (\n'
    ]
    
    lines[start_idx:end_idx] = new_content

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

if __name__ == "__main__":
    fix_file()
