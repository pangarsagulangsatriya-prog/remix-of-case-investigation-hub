const fs = require('fs');

const userUrls = [
  "https://hseautomation.beraucoal.co.id/beats2/file/15354568",
  "https://hseautomation.beraucoal.co.id/beats2/file/15340740",
  "https://hseautomation.beraucoal.co.id/beats2/file/15342551",
  "https://hseautomation.beraucoal.co.id/beats2/file/15328575",
  "https://hseautomation.beraucoal.co.id/beats2/file/15328622",
  "https://hseautomation.beraucoal.co.id/beats2/file/15345009",
  "https://hseautomation.beraucoal.co.id/beats2/file/15319327",
  "https://hseautomation.beraucoal.co.id/beats2/file/15272187",
  "https://hseautomation.beraucoal.co.id/beats2/file/15270047",
  "https://hseautomation.beraucoal.co.id/beats2/file/15267040",
  "https://hseautomation.beraucoal.co.id/beats2/file/15244471",
  "https://hseautomation.beraucoal.co.id/beats2/file/15232511",
  "https://hseautomation.beraucoal.co.id/beats2/file/15215416",
  "https://hseautomation.beraucoal.co.id/beats2/file/15193004",
  "https://hseautomation.beraucoal.co.id/beats2/file/15192930",
  "https://hseautomation.beraucoal.co.id/beats2/file/15187401",
  "https://hseautomation.beraucoal.co.id/beats2/file/15248481",
  "https://hseautomation.beraucoal.co.id/beats2/file/15168722",
  "https://hseautomation.beraucoal.co.id/beats2/file/15248573"
];

let code = fs.readFileSync('src/data/mockData.ts', 'utf8');

let urlIndex = 0;
code = code.replace(/"incidentDocumentURL":\s*("[^"]+"|null)/g, (match) => {
  if (urlIndex < userUrls.length) {
    const url = userUrls[urlIndex++];
    return `"incidentDocumentURL": "${url}"`;
  }
  return match;
});

// Also update incidentDocumentId if we have it in the URL
urlIndex = 0;
code = code.replace(/"incidentDocumentId":\s*(\d+|null)/g, (match) => {
  if (urlIndex < userUrls.length) {
    const url = userUrls[urlIndex++];
    const idMatch = url.match(/\/file\/(\d+)/);
    if (idMatch) {
      return `"incidentDocumentId": ${idMatch[1]}`;
    }
  }
  return match;
});

fs.writeFileSync('src/data/mockData.ts', code);
console.log('Updated mockData.ts URLs successfully.');
