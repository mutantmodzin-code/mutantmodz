const fs = require('fs');
const content = fs.readFileSync('d:/mutantmodz/src/pages/ProductDetails.tsx', 'utf8');
const lines = content.split('\n');
let c = 0;
lines.forEach((line, i) => {
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    c += opens;
    c -= closes;
    if (c < 0) {
        console.log(`Line ${i + 1} closes more than opened: ${line}`);
    }
});
console.log(`Final count: ${c}`);
