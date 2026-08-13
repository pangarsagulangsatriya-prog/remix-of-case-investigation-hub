const fs = require('fs');
const path = require('path');

const files = [
  'FactChronologyModule.tsx',
  'ActorAnalysisModule.tsx',
  'PeepoAnalysisModule.tsx',
  'IplsAnalysisModule.tsx',
  'PreventionAnalysisModule.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'src/components/analysis', file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the broken replacement
  // We have:
  // {cleanMode ? null : (<span className="inline-flex items-center justify-center h-[18px] px-1.5 rounded bg-slate-100 text-slate-500 border border-slate-200 cursor-help transition-colors hover:bg-slate-200">
  //               <span className="font-black text-[9px] uppercase tracking-wider">AI</span>)}
  //             </span>
  
  // It's better to just revert and redo it properly.
  // Actually, since there are only a few places, I can just replace the malformed part.
  
  content = content.replace(/\{cleanMode \? null \: \((<span className="inline-flex items-center justify-center h-\[18px\][^>]*>[\s\S]*?)<span className="font-black text-\[9px\] uppercase tracking-wider">AI<\/span>\)\}\s*<\/span>/g, 
  "{cleanMode ? null : ($1<span className=\"font-black text-[9px] uppercase tracking-wider\">AI</span></span>)}");
  
  content = content.replace(/\{cleanMode \? null \: \((<span className="inline-flex items-center justify-center h-\[18px\][^>]*>[\s\S]*?)<User className="h-3 w-3" strokeWidth=\{2\.5\} \/>\)\}\s*<\/span>/g,
  "{cleanMode ? null : ($1<User className=\"h-3 w-3\" strokeWidth={2.5} /></span>)}");

  content = content.replace(/\{cleanMode \? null \: \((<span className="inline-flex items-center justify-center h-\[18px\][^>]*>[\s\S]*?)<Pencil className="h-3 w-3" strokeWidth=\{2\.5\} \/>\)\}\s*<\/span>/g,
  "{cleanMode ? null : ($1<Pencil className=\"h-3 w-3\" strokeWidth={2.5} /></span>)}");

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log("Fixed JSX");
