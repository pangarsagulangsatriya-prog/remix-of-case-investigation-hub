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

  // Also replace any manually added user/brain/pen badges inside the table rows if they aren't using renderProvenanceBadge
  
  // E.g. in FactChronologyModule around line 2539: {(!item.provenanceType || item.provenanceType === 'AI_GENERATED') && (
  // Actually, we can just replace all remaining usages of <Brain className="..." /> AI with something hidden by cleanMode.
  
  content = content.replace(/<span className="inline-flex items-center justify-center h-\[18px\].*?<\/span>/gs, (match) => {
    if (match.includes("TooltipTrigger") || match.includes("cleanMode")) return match; // Already handled by renderProvenanceBadge which returns null
    return `{cleanMode ? null : (${match})}`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log("Done");
