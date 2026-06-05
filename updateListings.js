const fs = require('fs');

let code = fs.readFileSync('src/app/components/PropertyListings.tsx', 'utf8');

// 1. Grid layout change
code = code.replace(/grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2');

// 2. Remove isExpanded state
code = code.replace(/const \[isExpanded, setIsExpanded\] = useState\(false\);\n?/g, '');

// 3. Remove onClick and onKeyDown that toggle isExpanded
code = code.replace(/onClick=\{\(\) => setIsExpanded\(!isExpanded\)\}/g, '');
code = code.replace(/onKeyDown=\{\(e\) => \{ if \(e\.key === 'Enter' \|\| e\.key === ' '\) \{ e\.preventDefault\(\); setIsExpanded\(!isExpanded\); \} \}\}/g, '');

// 4. Always render the expanded content (remove `{isExpanded && (` and its closing parenthesis)
// Note: It's safer to just replace `{isExpanded && (` with `<>` and the matching `)}` with `</>` 
// Let's use string manipulation for this.

// 5. Remove the "Less/More" button block
// Search for the block starting with `<div className="mt-3 flex justify-between items-center"` and ending with `</button>` and `</div>`
code = code.replace(/<button[^>]*>\s*<span className="flex items-center gap-1 font-bold">[^<]*<\/span>\s*\{isExpanded \? 'Less' : 'More'\}\s*<ChevronRight[^>]*\/>\s*<\/button>/, '');

// Let's manually replace the {isExpanded && ( block
// The block starts near `        {isExpanded && (`
code = code.replace(/\{\s*isExpanded\s*&&\s*\(\s*/, '');

// We need to remove the closing `)}` that matches `{isExpanded && (`
// Let's find it. It's right before `{!isExpanded && <div className="h-2" /> /* Spacer when collapsed */}`
code = code.replace(/\)\}\s*\{\!isExpanded && <div className="h-2" \/> \/\* Spacer when collapsed \*\/\}/g, '');

// Wait, the "Less/More" toggle wrapper div is also there.
code = code.replace(/<div className="mt-3 flex justify-between items-center">\s*<div className="text-xs text-slate-500 font-medium">Ref: [^<]*<\/div>\s*<\/div>/g, '');

// Wait, the "Ref: " text is inside the flex box. Let's just remove the button part.

fs.writeFileSync('src/app/components/PropertyListings.tsx', code);
console.log('PropertyListings updated!');
