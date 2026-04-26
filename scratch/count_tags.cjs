const fs = require('fs');
const content = fs.readFileSync('d:/mutantmodz/src/pages/ProductDetails.tsx', 'utf8');
const openDivs = (content.match(/<div/g) || []).length;
const closeDivs = (content.match(/<\/div>/g) || []).length;
const openBraces = (content.match(/{/g) || []).length;
const closeBraces = (content.match(/}/g) || []).length;
console.log(`Divs: ${openDivs} / ${closeDivs}`);
console.log(`Braces: ${openBraces} / ${closeBraces}`);
