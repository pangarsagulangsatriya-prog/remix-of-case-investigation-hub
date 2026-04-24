import sys

def fix_file():
    path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the corrupted block
    # Lines 4154 to 4157 (1-indexed) -> 4153 to 4156 (0-indexed)
    
    start_idx = 4153
    end_idx = 4157
    
    # Check if it matches the corrupted pattern
    if "Coverage" in lines[start_idx] and ")}" in lines[end_idx-1]:
        del lines[start_idx:end_idx]
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Success")
    else:
        print(f"Mismatch at 4153: {repr(lines[start_idx])}")
        print(f"Mismatch at 4156: {repr(lines[end_idx-1])}")

if __name__ == "__main__":
    fix_file()
