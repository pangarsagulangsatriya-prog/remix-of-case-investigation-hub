const fs = require('fs');
let code = fs.readFileSync('src/components/workspace/Tabs/ReportsTab.tsx', 'utf-8');

code = code.replace(/const TOTAL_PAGES = 6;/, 'const TOTAL_PAGES = 5;');
code = code.replace(/<ReportCoverPage[\s\S]*?\/>/, '');

// Shift currentPage references
code = code.replace(/currentPage === 2/g, 'currentPage === 1');
code = code.replace(/currentPage === 3/g, 'currentPage === 2');
code = code.replace(/currentPage === 4/g, 'currentPage === 3');
code = code.replace(/currentPage === 5/g, 'currentPage === 4');
code = code.replace(/currentPage === 6/g, 'currentPage === 5');

code = code.replace(/pageNumber={2}/g, 'pageNumber={1}');
code = code.replace(/pageNumber={3}/g, 'pageNumber={2}');
code = code.replace(/pageNumber={4}/g, 'pageNumber={3}');
code = code.replace(/pageNumber={5}/g, 'pageNumber={4}');
code = code.replace(/pageNumber={6}/g, 'pageNumber={5}');

fs.writeFileSync('src/components/workspace/Tabs/ReportsTab.tsx', code);
