const fs = require('fs');

const oldCode = fs.readFileSync('/tmp/old_ReportsTab.tsx', 'utf-8');
const newCode = fs.readFileSync('src/components/workspace/Tabs/ReportsTab.tsx', 'utf-8');

// Extract the old empty state
const emptyStateStart = oldCode.indexOf(`  if (reportStatus === 'EMPTY') {`);
const emptyStateEnd = oldCode.indexOf(`  return (`, emptyStateStart);
let oldEmptyState = oldCode.substring(emptyStateStart, emptyStateEnd);

// Replace handleGeneratePreview with handleGenerate
oldEmptyState = oldEmptyState.replace(/handleGeneratePreview/g, 'handleGenerate');
// Fix factAgent etc which are not defined outside in newCode
oldEmptyState = oldEmptyState.replace(/const totalAgents = 5;/g, 
`const totalAgents = 5;
    const factAgent = agents.find(a => a.id === "fact");
    const peepoAgent = agents.find(a => a.id === "peepo");
    const prevAgent = agents.find(a => a.id === "prev");
    const actorAgent = agents.find(a => a.id === "actor");
    const iplsAgent = agents.find(a => a.id === "ipls");
`);

// Extract new empty state
const newEmptyStateStart = newCode.indexOf(`  if (reportStatus === 'EMPTY') {`);
const newEmptyStateEnd = newCode.indexOf(`  // --- Document Workspace View ---`, newEmptyStateStart);

let patchedNewCode = newCode.substring(0, newEmptyStateStart) + oldEmptyState + `  // --- Document Workspace View ---\n` + newCode.substring(newEmptyStateEnd + `  // --- Document Workspace View ---\n`.length);

// Add generationStep state
patchedNewCode = patchedNewCode.replace(
  `const [isGenerating, setIsGenerating] = useState(false);`,
  `const [isGenerating, setIsGenerating] = useState(false);\n  const [generationStep, setGenerationStep] = useState(0);`
);

// Update handleGenerate to include step animation
const handleGenerateStart = patchedNewCode.indexOf(`const handleGenerate = () => {`);
const handleGenerateEnd = patchedNewCode.indexOf(`  const handleApprove = () => {`);
const newHandleGenerate = `const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationStep(1);
    
    setTimeout(() => setGenerationStep(2), 600);
    setTimeout(() => setGenerationStep(3), 1200);
    setTimeout(() => setGenerationStep(4), 1800);
    setTimeout(() => setGenerationStep(5), 2400);

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep(0);
      setReportStatus?.('DRAFT');
      setReportSnapshot?.({
        reportId: \`REP-\${Math.random().toString(36).substr(2, 6).toUpperCase()}\`,
        version: '1.0',
        generatedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        agentsSnapshot: JSON.parse(JSON.stringify(agents))
      });
      if (setReportAuditLogs) {
        setReportAuditLogs([{
          id: \`audit-\${Date.now()}\`, timestamp: new Date().toISOString(),
          action: 'REPORT_GENERATED', actor: 'System', version: '1.0'
        }, ...reportAuditLogs]);
      }
    }, 3000);
  };

`;
patchedNewCode = patchedNewCode.substring(0, handleGenerateStart) + newHandleGenerate + patchedNewCode.substring(handleGenerateEnd);

// Add AlertTriangle to lucide-react imports if not there
if (!patchedNewCode.includes('AlertTriangle')) {
  patchedNewCode = patchedNewCode.replace('FileText, CheckCircle2', 'FileText, CheckCircle2, AlertTriangle');
}

fs.writeFileSync('src/components/workspace/Tabs/ReportsTab.tsx', patchedNewCode);
console.log('Patched ReportsTab.tsx successfully.');
