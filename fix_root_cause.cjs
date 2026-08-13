const fs = require('fs');
const path = require('path');

// ─── ROOT CAUSE FIX ──────────────────────────────────────────────────────────
// The problem: cleanMode was injected into JSX inside sub-components (TraceabilityPanel,
// EventCitationList, etc.) that DON'T have cleanMode as a prop or local variable.
// The fix: find every sub-component that uses cleanMode but doesn't define it,
// and inject a proper `const cleanMode = false;` at the START of that component.
// ─────────────────────────────────────────────────────────────────────────────

const files = [
  'FactChronologyModule.tsx',
  'ActorAnalysisModule.tsx',
  'PeepoAnalysisModule.tsx',
  'IplsAnalysisModule.tsx',
  'PreventionAnalysisModule.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'src/components/analysis', file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Step 1: Find all component/function bodies and check if cleanMode is used but not defined.
  // We parse character by character to properly track brace depth and component boundaries.
  
  const componentPattern = /^(?:export\s+)?const\s+(\w+)\s*:\s*React\.FC[^=]+=\s*\([^)]*\)\s*=>\s*\{|^(?:export\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/gm;
  
  let match;
  let insertions = []; // { position, text }
  
  while ((match = componentPattern.exec(content)) !== null) {
    const componentName = match[1] || match[2];
    const openBracePos = match.index + match[0].length - 1; // position of '{'
    
    // Find the full body of this component by matching braces
    let depth = 0;
    let bodyStart = openBracePos;
    let bodyEnd = -1;
    
    for (let i = bodyStart; i < content.length; i++) {
      if (content[i] === '{') depth++;
      if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          bodyEnd = i;
          break;
        }
      }
    }
    
    if (bodyEnd === -1) continue;
    
    const body = content.substring(bodyStart, bodyEnd + 1);
    
    // Check: does this component USE cleanMode but NOT define it?
    const usesCleanMode = /\bcleanMode\b/.test(body);
    const definesCleanMode = /\bcleanMode\s*[=,?:]/.test(match[0]) || // in props destructure
                             /const cleanMode\s*=/.test(body) ||
                             /cleanMode\s*=\s*false/.test(body) ||
                             /cleanMode\s*=\s*true/.test(body);
    
    if (usesCleanMode && !definesCleanMode) {
      // Insert `const cleanMode = false;` right after the opening brace
      const insertPos = bodyStart + 1; // right after '{'
      insertions.push({ position: insertPos, text: '\n  const cleanMode = false; // sub-component: always false\n' });
      console.log(`  ${file}: injecting cleanMode fallback into ${componentName}`);
    }
  }
  
  // Apply insertions from last to first to preserve positions
  insertions.sort((a, b) => b.position - a.position);
  insertions.forEach(({ position, text }) => {
    content = content.substring(0, position) + text + content.substring(position);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('\nDone. Root cause fixed.');
