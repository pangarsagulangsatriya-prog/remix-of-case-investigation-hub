const fs = require('fs');

const oldCode = fs.readFileSync('/tmp/old_ReportsTab.tsx', 'utf-8');
const brokenCode = fs.readFileSync('src/components/workspace/Tabs/ReportsTab.tsx', 'utf-8');

const emptyStateStart = oldCode.indexOf(`    return (\n      <div className="flex h-full w-full items-center justify-center bg-slate-50/10 p-4 sm:p-8">`);
const emptyStateEnd = oldCode.indexOf(`  return (\n    <div className="flex h-full w-full bg-slate-50/10 overflow-auto relative print-container">`);

// get the JSX plus the closing bracket of the if block
let emptyStateJSX = oldCode.substring(emptyStateStart, emptyStateEnd);
emptyStateJSX = emptyStateJSX.replace(/handleGeneratePreview/g, 'handleGenerate');

const replaceTarget = `    const isAllReady = readyAgents >= totalAgents;

    // --- Document Workspace View ---`;

const newReplacement = `    const isAllReady = readyAgents >= totalAgents;

${emptyStateJSX}

  // --- Document Workspace View ---`;

const fixedCode = brokenCode.replace(replaceTarget, newReplacement);
fs.writeFileSync('src/components/workspace/Tabs/ReportsTab.tsx', fixedCode);
console.log('Fixed ReportsTab.tsx successfully.');
