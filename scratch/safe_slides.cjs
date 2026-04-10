const fs = require('fs');
const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// The original state definition had safe defaults but just in case, let's make it bulletproof
const anchorStart = `const [activeSlide, setActiveSlide] = React.useState(0);
  
  const slides = React.useMemo(() => {`;
const anchorEnd = `}, [selectedAgentId, agents]);
  
  React.useEffect(() => { setActiveSlide(0); }, [selectedAgentId]);`;

const startIdx = text.indexOf('const [activeSlide, setActiveSlide] = React.useState(0);');
const endIdx = text.indexOf('React.useEffect(() => { setActiveSlide(0); }, [selectedAgentId]);');

if (startIdx !== -1 && endIdx !== -1) {
    const fullEndIdx = endIdx + 'React.useEffect(() => { setActiveSlide(0); }, [selectedAgentId]);'.length;
    
    const saferState = `const [activeSlide, setActiveSlide] = React.useState(0);
  
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
               date: agent.results.ringkasan?.tanggal || "Unknown Date",
               time: agent.results.ringkasan?.jam || "Unknown Time",
               location: agent.results.ringkasan?.lokasi || "Unknown Location",
               incidentType: agent.results.ringkasan?.jenis || "Unknown Type",
               summary: agent.results.ringkasan?.deskripsi || "No summary available."
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

    const newText = text.slice(0, startIdx) + saferState + text.slice(fullEndIdx);
    fs.writeFileSync(CACHE_FILE, newText);
    console.log('Made slides creation safer');
} else {
    console.log('Could not find activeSlide block bounds.');
}
