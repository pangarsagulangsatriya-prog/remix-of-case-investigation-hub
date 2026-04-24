import sys

def fix_file():
    path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find line 4140 and 4141 (1-indexed) -> 4139 and 4140 (0-indexed)
    # Check if they match our expectation
    if "p-8" in lines[4139] and "slides[activeSlide]?.title" in lines[4140]:
        lines[4139] = '                                     <div className="flex flex-col h-full">\n'
        del lines[4140]
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Success")
    else:
        print(f"Mismatch at 4139: {repr(lines[4139])}")
        print(f"Mismatch at 4140: {repr(lines[4140])}")

if __name__ == "__main__":
    fix_file()
