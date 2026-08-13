const fs = require('fs');
const files = [
  'src/components/analysis/FactChronologyModule.tsx',
  'src/components/analysis/ActorAnalysisModule.tsx',
  'src/components/analysis/PeepoAnalysisModule.tsx',
  'src/components/analysis/IplsAnalysisModule.tsx',
  'src/components/analysis/PreventionAnalysisModule.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  // find the header div: <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4
  // and wrap it in {!readonly && (...)}
  
  // Actually, I can just replace `className="shrink-0 p-4 border-b border-slate-200 bg-white` 
  // with `className={cn("shrink-0 p-4 border-b border-slate-200 bg-white", readonly ? "hidden" : "")}`
  
  content = content.replace(
    /className="shrink-0 p-4 border-b border-slate-200 bg-white(.*?)"/g,
    'className={cn("shrink-0 p-4 border-b border-slate-200 bg-white$1", readonly ? "hidden" : "")}'
  );
  
  fs.writeFileSync(file, content);
}

