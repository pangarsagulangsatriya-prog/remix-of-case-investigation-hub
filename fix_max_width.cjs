const fs = require('fs');

function replaceInFile(file, search, replace) {
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes(search)) {
        console.log(`Warning: Could not find ${search} in ${file}`);
    }
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
}

replaceInFile('src/components/analysis/FactChronologyModule.tsx', 
    'className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-4 sm:p-8 pb-16 space-y-8")}',
    'className={cn("w-full h-fit shrink-0", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-4 sm:p-8 pb-16 space-y-8")}'
);

replaceInFile('src/components/analysis/FactChronologyModule.tsx', 
    'className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8 pb-16")}',
    'className={cn("w-full h-fit shrink-0", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16")}'
);

replaceInFile('src/components/analysis/ActorAnalysisModule.tsx',
    'className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8")}',
    'className={cn("w-full h-fit shrink-0", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8")}'
);

replaceInFile('src/components/analysis/PeepoAnalysisModule.tsx',
    'className={cn("w-full max-w-[1300px] h-fit shrink-0 space-y-8 animate-in fade-in duration-200", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8 pb-16")}',
    'className={cn("w-full h-fit shrink-0 space-y-8 animate-in fade-in duration-200", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16")}'
);

replaceInFile('src/components/analysis/PeepoAnalysisModule.tsx',
    'className={cn("w-full max-w-[1300px] h-fit shrink-0 space-y-6 animate-in fade-in duration-200", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8 pb-16")}',
    'className={cn("w-full h-fit shrink-0 space-y-6 animate-in fade-in duration-200", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16")}'
);

replaceInFile('src/components/analysis/IplsAnalysisModule.tsx',
    'className={cn("w-full max-w-[1300px] h-fit shrink-0 overflow-x-auto", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8")}',
    'className={cn("w-full h-fit shrink-0 overflow-x-auto", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8")}'
);

replaceInFile('src/components/analysis/PreventionAnalysisModule.tsx',
    'className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8 pb-16")}',
    'className={cn("w-full h-fit shrink-0", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16")}'
);
console.log('Finished updating max-width in wrappers.');
