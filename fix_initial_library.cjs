const fs = require('fs');
const path = './src/pages/QuestionBankPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const updatedDoc2Content = `'# Question Bank\\n\\nSource: LPI_Dumping_Area_Incident.pdf\\n\\n## Kejadian\\n\\nQuestion 1\\nA) A\\nB) B\\nANSWER: A\\n\\nQuestion 2\\nA) A\\nB) B\\nANSWER: B'`;
const updatedDoc4Content = `'# Question Bank\\n\\nSource: LPI_Workshop_Inspection.pdf\\n\\n## Inspeksi\\n\\nBagian mana yang diinspeksi?\\nA) Atap\\nB) Lantai\\nANSWER: A'`;

content = content.replace(
  /content:\s*'# Question Bank\\n\\nSource: LPI_Dumping_Area_Incident\.pdf\\n\\n## Kejadian\\n\\n1\. Question 1\\n2\. Question 2'/g,
  `content: ${updatedDoc2Content}`
);

content = content.replace(
  /content:\s*'# Question Bank\\n\\nSource: LPI_Workshop_Inspection\.pdf\\n\\n## Inspeksi\\n\\n1\. Bagian mana yang diinspeksi\?'/g,
  `content: ${updatedDoc4Content}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed Initial Library");
