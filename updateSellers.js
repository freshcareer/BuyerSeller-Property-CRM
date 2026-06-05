const fs = require('fs');
let code = fs.readFileSync('src/app/admin/sellers/page.tsx', 'utf8');

const replacement = `            </div>

            {/* Image Gallery Viewer */}
            {selectedSeller.image_urls && selectedSeller.image_urls.length > 0 && (
              <div className="p-6 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" /> Property Photos ({selectedSeller.image_urls.length})
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
                  {selectedSeller.image_urls.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 block rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:ring-2 ring-indigo-400 transition-all">
                      <img src={url} alt={\`Photo \${idx+1}\`} className="w-24 h-24 object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">`;

code = code.replace(/            <\/div>\s*<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50\/50">/, replacement);
fs.writeFileSync('src/app/admin/sellers/page.tsx', code);
console.log('sellers page updated!');
