const fs = require('fs');
const content = fs.readFileSync('d:/mutantmodz/src/pages/ProductDetails.tsx', 'utf8');
const lines = content.split('\n');
let c = 0;
lines.forEach((line, i) => {
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    c += opens;
    c -= closes;
    console.log(`${(i + 1).toString().padStart(3)} | ${c} | ${line.trim()}`);
});
