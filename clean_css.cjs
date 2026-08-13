const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');
const index = code.indexOf('/* ═══════════════════════════════════════════════════════════════════════════');
if (index !== -1) {
    code = code.substring(0, index);
    fs.writeFileSync('src/index.css', code.trim() + '\n');
    console.log('Cleaned index.css');
}
