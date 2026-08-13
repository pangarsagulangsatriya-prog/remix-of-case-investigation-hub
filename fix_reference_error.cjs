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

  // Let's find exactly the components we want.
  // export const IplsTraceabilityPanel... => {
  // export const IplsNodeDrawer... => {
  // etc.
  
  let regex = /(export const [A-Za-z]+(?:NodeDrawer|TraceabilityPanel)[\s\S]*?=>\s*\{)/g;
  content = content.replace(regex, "$1\n  const cleanMode = false; // fallback to fix ReferenceError\n");

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log("Injected cleanMode fallback into subcomponents");
