const fs = require('fs');
function replaceInFile(file, replacements) {
    let code = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of replacements) {
        if (!code.includes(search)) {
            console.log(`Warning: Could not find ${search} in ${file}`);
        }
        code = code.replace(search, replace);
    }
    fs.writeFileSync(file, code);
}

// 1. FactChronologyModule.tsx
replaceInFile('src/components/analysis/FactChronologyModule.tsx', [
    [
        "const [displayFormat, setDisplayFormat] = useState<'timeline' | 'table' | 'flow'>('timeline');",
        "const [displayFormat, setDisplayFormat] = useState<'timeline' | 'table' | 'flow'>(cleanMode ? 'table' : 'timeline');"
    ],
    [
        '<div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">',
        '{!cleanMode && (\n        <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">'
    ],
    [
        '         </div>\n        </div>\n\n        <div className="flex-1 overflow-hidden">',
        '         </div>\n        </div>\n        )}\n\n        <div className="flex-1 overflow-hidden">'
    ],
    [
        '<div className="w-full h-full overflow-auto bg-slate-50 p-8 flex justify-center scrollbar-thin">',
        '<div className={cn("w-full h-full overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-8 scrollbar-thin")}>'
    ],
    [
        '<div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16 h-fit shrink-0">',
        '<div className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8 pb-16")}>'
    ]
]);

// 2. ActorAnalysisModule.tsx
replaceInFile('src/components/analysis/ActorAnalysisModule.tsx', [
    [
        '<div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4">',
        '{!cleanMode && (\n      <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4">'
    ],
    [
        '        </div>\n      </div>\n\n      <div className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-8 flex justify-center scrollbar-thin">',
        '        </div>\n      </div>\n      )}\n\n      <div className={cn("flex-1 overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-4 lg:p-8 scrollbar-thin")}>'
    ],
    [
        '<div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 h-fit shrink-0">',
        '<div className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8")}>'
    ]
]);

// 3. PeepoAnalysisModule.tsx
replaceInFile('src/components/analysis/PeepoAnalysisModule.tsx', [
    [
        '<div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">',
        '{!cleanMode && (\n        <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">'
    ],
    [
        '         </div>\n        </div>\n\n        <div className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-8 flex justify-center scrollbar-thin">',
        '         </div>\n        </div>\n        )}\n\n        <div className={cn("flex-1 overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-4 lg:p-8 scrollbar-thin")}>'
    ],
    [
        '<div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 h-fit shrink-0">',
        '<div className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8")}>'
    ]
]);

// 4. IplsAnalysisModule.tsx
replaceInFile('src/components/analysis/IplsAnalysisModule.tsx', [
    [
        '<div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">',
        '{!cleanMode && (\n        <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">'
    ],
    [
        '         </div>\n        </div>\n\n        <div className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-8 flex justify-center scrollbar-thin">',
        '         </div>\n        </div>\n        )}\n\n        <div className={cn("flex-1 overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-4 lg:p-8 scrollbar-thin")}>'
    ],
    [
        '<div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 h-fit shrink-0">',
        '<div className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8")}>'
    ]
]);

// 5. PreventionAnalysisModule.tsx
replaceInFile('src/components/analysis/PreventionAnalysisModule.tsx', [
    [
        '<div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">',
        '{!cleanMode && (\n        <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">'
    ],
    [
        '         </div>\n        </div>\n\n        <div className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-8 flex justify-center scrollbar-thin">',
        '         </div>\n        </div>\n        )}\n\n        <div className={cn("flex-1 overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-4 lg:p-8 scrollbar-thin")}>'
    ],
    [
        '<div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 h-fit shrink-0">',
        '<div className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8")}>'
    ]
]);
console.log('Finished updating module wrappers.');
