const fs = require('fs');
const file = 'src/components/analysis/FactChronologyModule.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Force table view in cleanMode
code = code.replace(
  "const [displayFormat, setDisplayFormat] = useState<'timeline' | 'table' | 'flow'>('timeline');",
  "const [displayFormat, setDisplayFormat] = useState<'timeline' | 'table' | 'flow'>(cleanMode ? 'table' : 'timeline');"
);

// 2. Hide top header in cleanMode
code = code.replace(
  '<div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">',
  '{!cleanMode && (\n        <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">'
);
code = code.replace(
  '         </div>\n        </div>\n\n        <div className="flex-1 overflow-hidden">',
  '         </div>\n        </div>\n        )}\n\n        <div className="flex-1 overflow-hidden">'
);

// 3. Remove grey/white wrappers in FactTableView
code = code.replace(
  '<div className="w-full h-full overflow-auto bg-slate-50 p-8 flex justify-center scrollbar-thin">',
  '<div className={cn("w-full h-full overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-8 scrollbar-thin")}>'
);
code = code.replace(
  '<div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16 h-fit shrink-0">',
  '<div className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8 pb-16")}>'
);

// Import cn if it is missing in the file. Wait, cn is already imported in FactChronologyModule.tsx

fs.writeFileSync(file, code);
