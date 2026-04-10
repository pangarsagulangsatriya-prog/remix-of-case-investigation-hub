const fs = require('fs');
const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// 1. Add missing lucide imports
const iconMatches = text.match(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["'];?/);
if (iconMatches) {
  let imports = iconMatches[0];
  const neededIcons = ['Undo', 'Redo', 'ZoomIn', 'ZoomOut', 'Maximize', 'Download', 'Bold', 'Italic', 'Underline', 'Plus', 'Move'];
  neededIcons.forEach(ic => {
    if (!imports.includes(ic)) {
      imports = imports.replace('}', `, ${ic}}`);
    }
  });
  text = text.replace(iconMatches[0], imports);
}

// 2. Add presentation editor states to AnalysisTab
const stateAnchorIndex = text.indexOf('const [selectedAgentId, setSelectedAgentId]');
if (stateAnchorIndex !== -1 && !text.includes('const [activeSlide, setActiveSlide]')) {
  // Find where this line ends
  const endOfLine = text.indexOf(';', stateAnchorIndex);
  
  const originalLine = text.substring(stateAnchorIndex, endOfLine + 1);
  const newStates = originalLine + `
  
  const [activeSlide, setActiveSlide] = React.useState(0);
  
  const slides = React.useMemo(() => {
    const agent = agents.find(a => a.id === selectedAgentId);
    if (!agent) return [];
    if (agent.id === 'fact' && agent.results) {
       return [
         {
            id: 'slide-1',
            type: 'summary',
            title: 'Chronology Summary',
            content: {
               date: agent.results.ringkasan.tanggal,
               time: agent.results.ringkasan.jam,
               location: agent.results.ringkasan.lokasi,
               incidentType: agent.results.ringkasan.jenis,
               summary: agent.results.ringkasan.deskripsi
            }
         },
         {
            id: 'slide-2',
            type: 'timeline',
            title: 'Timeline Breakdown',
            content: {
                praKontak: agent.results.timeline?.praKontak || [],
                kontak: agent.results.timeline?.kontak || [],
                pascaKontak: agent.results.timeline?.pascaKontak || [],
            }
         }
       ];
    }
    return [{
       id: 'slide-1',
       type: 'raw',
       title: 'Extraction Result',
       content: agent.results || {}
    }];
  }, [selectedAgentId, agents]);
  
  React.useEffect(() => { setActiveSlide(0); }, [selectedAgentId]);`;
  text = text.replace(originalLine, newStates);
  fs.writeFileSync(CACHE_FILE, text);
  console.log('Imports and States updated');
} else {
  console.log('Already updated or anchor not found.');
}
