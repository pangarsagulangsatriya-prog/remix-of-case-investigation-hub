import sys

def fix_file():
    path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Delete lines 4312 to 4419 (1-indexed)
    # Indices 4311 to 4419 (0-indexed)
    # This removes the duplicate 'prev' block and the orphaned tags
    
    start_idx = 4311
    end_idx = 4419
    
    del lines[start_idx:end_idx]

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

if __name__ == "__main__":
    fix_file()
