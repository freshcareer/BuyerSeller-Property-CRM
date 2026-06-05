const fs = require('fs');
let code = fs.readFileSync('src/app/components/LeadForms.tsx', 'utf8');

code = code.replace(/        customBudget: '',\r?\n    imageUrls: '',\r?\n        bedrooms:/g, "        customBudget: '',\n        bedrooms:");

fs.writeFileSync('src/app/components/LeadForms.tsx', code);
console.log('Duplicate imageUrls removed!');
