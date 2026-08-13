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

  // Let's just fix the variable name inside renderProvenanceBadge
  // We can just replace `{cleanMode ? null : ` with `{isCleanMode ? null : ` globally in the file?
  // No, because inside the component itself, it's called `cleanMode` and might be used properly.
  // Wait, did my `hide_extra_labels.cjs` add `{cleanMode ? null : ` anywhere ELSE besides renderProvenanceBadge?
  // Let's check `hide_extra_labels.cjs`:
  // It matched `<span className="inline-flex items-center justify-center h-[18px]...` 
  // Did that match anything outside `renderProvenanceBadge`?
  // If it didn't, then I can safely just replace `{cleanMode ? null : ` with `{isCleanMode ? null : ` 
  // ONLY inside `renderProvenanceBadge` function block.
  
  // Or even simpler:
  // The error is `cleanMode is not defined`. So any `{cleanMode ? null :` inside `renderProvenanceBadge` is the culprit.
  
  let functionStartRegex = /const renderProvenanceBadge = \([^)]+\) => \{/g;
  let match;
  while ((match = functionStartRegex.exec(content)) !== null) {
      let startIndex = match.index;
      // Find the end of the function (very basic block matching)
      let blockDepth = 0;
      let endIndex = -1;
      for (let i = startIndex; i < content.length; i++) {
          if (content[i] === '{') blockDepth++;
          if (content[i] === '}') {
              blockDepth--;
              if (blockDepth === 0) {
                  endIndex = i;
                  break;
              }
          }
      }
      
      if (endIndex !== -1) {
          let funcBody = content.substring(startIndex, endIndex + 1);
          // Fix cleanMode -> isCleanMode inside this function
          funcBody = funcBody.replace(/\{cleanMode \? null \:/g, "{isCleanMode ? null :");
          content = content.substring(0, startIndex) + funcBody + content.substring(endIndex + 1);
      }
  }

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log("Fixed cleanMode scope error");
