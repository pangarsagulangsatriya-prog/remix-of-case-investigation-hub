const fs = require('fs');
let content = fs.readFileSync('src/pages/CaseListPage.tsx', 'utf8');

// 1. Add metadata_form to items
content = content.replace(
  /    items = \[\r?\n      \{\r?\n        id: incMeta\?\.incidentDocumentId/g,
  `    items = [\n      {\n        id: "metadata_form",\n        file: null,\n        name: "Detail Form Insiden",\n        category: "Form" as const,\n        size: 0,\n        relativePath: "Form Metadata",\n        groupId: "__loose__",\n        groupName: "Individual Files",\n        displayUrl: "",\n        previewUrl: ""\n      },\n      {\n        id: incMeta?.incidentDocumentId`
);

// 2. Add icon to left pane
content = content.replace(
  /                    \{fileObj\.category === "Image" \? \(\r?\n                      <ImageIcon className="h-3\.5 w-3\.5 text-emerald-500" \/>\r?\n                    \) : \(\r?\n                      <FileText className="h-3\.5 w-3\.5 text-blue-500" \/>\r?\n                    \)\}/g,
  `                    {fileObj.category === "Image" ? (\n                      <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />\n                    ) : fileObj.category === "Form" ? (\n                      <LayoutGrid className="h-3.5 w-3.5 text-indigo-500" />\n                    ) : (\n                      <FileText className="h-3.5 w-3.5 text-blue-500" />\n                    )}`
);

// 3. Add icon to header tab
content = content.replace(
  /                  \{selectedFile\.category === "Audio" \? \(\r?\n                    <AudioIcon className="h-3\.5 w-3\.5 text-amber-500" \/>\r?\n                  \) : selectedFile\.category === "Image" \? \(\r?\n                    <ImageIcon className="h-3\.5 w-3\.5 text-emerald-500" \/>\r?\n                  \) : \(\r?\n                    <FileText className="h-3\.5 w-3\.5 text-blue-500" \/>\r?\n                  \)\}/g,
  `                  {selectedFile.category === "Audio" ? (\n                    <AudioIcon className="h-3.5 w-3.5 text-amber-500" />\n                  ) : selectedFile.category === "Image" ? (\n                    <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />\n                  ) : selectedFile.category === "Form" ? (\n                    <LayoutGrid className="h-3.5 w-3.5 text-indigo-500" />\n                  ) : (\n                    <FileText className="h-3.5 w-3.5 text-blue-500" />\n                  )}`
);

// 4. Extract Incident Information Panel
const startIdx = content.indexOf('        {/* Incident Information Panel - Spreadsheet Style */}');
const endIdx = content.indexOf('        {/* Split pane body */}');
const panelContent = content.substring(startIdx, endIdx);

// Remove it from the top layout
content = content.substring(0, startIdx) + content.substring(endIdx);

// 5. Inject it into the preview pane
const previewStartStr = '<div className="flex-1 overflow-auto p-6 flex flex-col gap-6 bg-slate-50/20 custom-scrollbar">';

const r1 = content.indexOf('                </div>\\r\\n              </>\\r\\n            ) : (');
const r2 = content.indexOf('                </div>\n              </>\n            ) : (');
const endMatchStr = r1 !== -1 ? '                </div>\r\n              </>\r\n            ) : (' : '                </div>\n              </>\n            ) : (';

const innerPreviewPane = content.substring(
  content.indexOf(previewStartStr) + previewStartStr.length,
  content.indexOf(endMatchStr)
);

const panelContentIndented = panelContent.trim().split('\\n').map(line => line.startsWith('        ') ? line.substring(8) : line).join('\\n                        ');

const newPreviewPane = `
                  {selectedFile.category === "Form" ? (
                    <div className="flex-1 relative overflow-auto custom-scrollbar">
                      <div className="absolute inset-0 p-6 max-w-6xl mx-auto space-y-4">
                        ${panelContentIndented}
                      </div>
                    </div>
                  ) : (
                    <>
${innerPreviewPane.replace(/^\\s+|\\s+$/g, '')}
                    </>
                  )}`;

content = content.replace(
  innerPreviewPane,
  '\\n' + newPreviewPane + '\\n                '
);

fs.writeFileSync('src/pages/CaseListPage.tsx', content);
