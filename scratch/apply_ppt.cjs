const fs = require('fs');
const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

const anchorStart = '{/* FLOATING DETAIL PANEL';
const targetIndex = text.indexOf(anchorStart);
const endIndex = text.indexOf('    </div>\n  );\n}function ReportsTab() {');

if (targetIndex >= 0 && endIndex > targetIndex) {
   const replacementStr = fs.readFileSync('scratch/replacement.txt', 'utf8');
   
   // Insert replacement plus closing divs
   let newText = text.slice(0, targetIndex) + replacementStr + '\n      </div>\n    </div>\n  );\n}';
   // Note: endIndex points to `    </div>\n  );\n}function ReportsTab() {` which starts with spaces. We will append the remaining text from `function ReportsTab` onwards.
   // Wait, if I slice `text.slice(endIndex)` it starts with `    </div>...` and I just added it. So I should slice starting exactly after `}` of AnalysisTab!
   
   const closingTags = '    </div>\n  );\n}';
   const actualEndIndex = endIndex + closingTags.length;
   
   newText = text.slice(0, targetIndex) + replacementStr + '\n      </div>\n    </div>\n  );\n}' + text.slice(actualEndIndex);
   
   fs.writeFileSync(CACHE_FILE, newText);
   console.log('Success completely replacing floating modal via txt file');
} else {
   console.log('Could not find anchor or end');
}
