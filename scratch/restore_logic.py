import sys

path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the mess around 3417
# 3416:   const [drawingStart, setDrawingStart] = useState<{ x: number, y: number } | null>(null);
# 3417: 
# 3418:     });
# 3419:   }, [file.id]);

target_idx = -1
for i, line in enumerate(lines):
    if 'setDrawingStart' in line and i > 3400:
        target_idx = i
        break

if target_idx != -1:
    # Remove the broken part
    del lines[target_idx+1 : target_idx+4]
    
    # Insert the full correct logic
    correct_logic = [
        '\n',
        '  useEffect(() => {\n',
        '    // Reset on file change\n',
        '    setScale(1);\n',
        '    setPosition({ x: 0, y: 0 });\n',
        '    setViewMode("fit");\n',
        '    setHandToolActive(false);\n',
        '    setIsSpotlightMode(false);\n',
        '    setSpotlightRect(null);\n',
        '    setEnhancements({\n',
        '      exposure: 100,\n',
        '      contrast: 100,\n',
        '      saturate: 100,\n',
        '      invert: 0,\n',
        '      grayscale: 0,\n',
        '      sepia: 0,\n',
        '      hue: 0,\n',
        '    });\n',
        '  }, [file.id]);\n',
        '\n',
        '  const applyPreset = (preset: string) => {\n',
        '    const base = { exposure: 100, contrast: 100, saturate: 100, invert: 0, grayscale: 0, sepia: 0, hue: 0 };\n',
        '    switch(preset) {\n',
        '      case "high-contrast": setEnhancements({...base, contrast: 180, saturate: 120 }); break;\n',
        '      case "low-light": setEnhancements({...base, exposure: 160, contrast: 130 }); break;\n',
        '      case "dust-cut": setEnhancements({...base, contrast: 150, saturate: 80 }); break;\n',
        '      case "sepia": setEnhancements({...base, sepia: 100 }); break;\n',
        '      case "grayscale": setEnhancements({...base, grayscale: 100 }); break;\n',
        '      case "invert": setEnhancements({...base, invert: 100 }); break;\n',
        '      case "infra": setEnhancements({...base, hue: 180, contrast: 140 }); break;\n',
        '      default: setEnhancements(base);\n',
        '    }\n',
        '  };\n'
    ]
    lines[target_idx+1 : target_idx+1] = correct_logic

    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
        f.writelines(lines)
    print('SUCCESS: Restored missing logic and fixed structure.')
else:
    print('ERROR: Anchor not found.')
    sys.exit(1)
