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
  
  // Add cleanMode to Props interface
  content = content.replace(/readonly\?:\s*boolean;?/, "readonly?: boolean;\n  cleanMode?: boolean;");
  
  // Add cleanMode to component destructured args
  if (file === 'FactChronologyModule.tsx') {
    content = content.replace(/readonly = false\s*\}/, "readonly = false,\n  cleanMode = false\n}");
  } else {
    // Other modules have different prop signatures
    content = content.replace(/readonly\s*=\s*false([,\s]*)(?=\})/, "readonly = false,\n  cleanMode = false$1");
  }

  // Update renderProvenanceBadge definition
  content = content.replace(/const renderProvenanceBadge = \(item:(.*?)\) => \{/g, 
    "const renderProvenanceBadge = (item: $1, isCleanMode?: boolean) => {\n  if (isCleanMode) return null;");
    
  // Update renderProvenanceBadge calls to pass cleanMode
  content = content.replace(/renderProvenanceBadge\(([^,)]+)\)/g, "renderProvenanceBadge($1, cleanMode)");
  
  // Hide specific AI/HUMAN text blocks based on cleanMode
  // "VERSI {currentVersion} &middot; " -> wrap in {!cleanMode && (...)}
  // Instead of complex AST, let's just find common patterns for "AI Generated" text or "Ditambahkan Manual" and hide them if cleanMode is true
  
  // Let's replace the `AI` badge rendering inside the modules too. For example, some modules render a `Brain` icon manually.
  content = content.replace(/\{item\?.provenanceType === 'HUMAN_MANUAL' \? 'PERNYATAAN AWAL' : 'PERNYATAAN AI GENERATED'\}/g, 
    "{cleanMode ? 'PERNYATAAN' : (item?.provenanceType === 'HUMAN_MANUAL' ? 'PERNYATAAN AWAL' : 'PERNYATAAN AI GENERATED')}");
  
  content = content.replace(/\{item\?.provenanceType === 'HUMAN_MANUAL' \? 'TINDAKAN AWAL' : 'TINDAKAN AI GENERATED'\}/g, 
    "{cleanMode ? 'TINDAKAN' : (item?.provenanceType === 'HUMAN_MANUAL' ? 'TINDAKAN AWAL' : 'TINDAKAN AI GENERATED')}");
    
  content = content.replace(/\{item\?.provenanceType === 'HUMAN_MANUAL' \? 'DESKRIPSI KEJADIAN AWAL' : 'DESKRIPSI AI GENERATED'\}/g, 
    "{cleanMode ? 'DESKRIPSI KEJADIAN' : (item?.provenanceType === 'HUMAN_MANUAL' ? 'DESKRIPSI KEJADIAN AWAL' : 'DESKRIPSI AI GENERATED')}");
    
  // Hide the AI label near the Brain icon
  content = content.replace(/<Brain className="([^"]+)" \/> AI/g, 
    "{!cleanMode && <><Brain className=\"$1\" /> AI</>}");
    
  // In IPLS / PEEPO / Prevention, there is a block:
  // {((item?.provenanceType === 'HUMAN_MANUAL' && (item?.manualRevisionCount || 0) > 0) || item?.provenanceType === 'AI_HUMAN_ANNOTATED') && ( ... )}
  // Let's just wrap it with `!cleanMode &&`
  content = content.replace(/\{\(\(item\?\.provenanceType === 'HUMAN_MANUAL'/g, 
    "{!cleanMode && ((item?.provenanceType === 'HUMAN_MANUAL'");
    
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
