const fs = require('fs');

let canvas = fs.readFileSync('src/components/workspace/Tabs/ReportDocumentCanvas.tsx', 'utf-8');
canvas = canvas.replace(/const PAGE_WIDTH = 1123;/g, 'const PAGE_WIDTH = 960;');
canvas = canvas.replace(/const PAGE_HEIGHT = 794;/g, 'const PAGE_HEIGHT = 540;');

// Remove border and shadow
canvas = canvas.replace(/className="absolute top-0 left-0 bg-white border border-slate-200 shadow-\[0_4px_24px_-8px_rgba\(0,0,0,0\.1\)\] flex flex-col overflow-hidden shrink-0 print:border-none print:shadow-none print:relative"/, 
'className="absolute top-0 left-0 bg-white flex flex-col overflow-hidden shrink-0 print:relative"');

fs.writeFileSync('src/components/workspace/Tabs/ReportDocumentCanvas.tsx', canvas);

let reportsTab = fs.readFileSync('src/components/workspace/Tabs/ReportsTab.tsx', 'utf-8');
reportsTab = reportsTab.replace(/className="flex-1 relative overflow-hidden bg-\[#ebeef2\]"/, 'className="flex-1 relative overflow-hidden bg-white"');
fs.writeFileSync('src/components/workspace/Tabs/ReportsTab.tsx', reportsTab);
