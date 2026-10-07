const fs = require('fs');
const path = './src/pages/QuestionBankPage.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/match\(\/\^\\d\+\\\.\/gm\)/g, 'match(/ANSWER:/g)');

fs.writeFileSync(path, content, 'utf8');
console.log("Updated regex!");
