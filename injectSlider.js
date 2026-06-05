const fs = require('fs');

// Update Seller Portal
let portalCode = fs.readFileSync('src/app/portal/seller/page.tsx', 'utf8');

if (!portalCode.includes('ImageSlider')) {
  portalCode = portalCode.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport ImageSlider from '@/app/components/ImageSlider';");
  
  portalCode = portalCode.replace(
    /<div key=\{prop\.id\} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">\s*<div className="flex justify-between items-start mb-4">/,
    `<div key={prop.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full">
                <ImageSlider urls={prop.image_urls || []} />
                <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">`
  );
  
  portalCode = portalCode.replace(
    /<button onClick=\{\(\) => handleDelete\(prop\.id\)\} className="p-1\.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">\s*<Trash2 className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/,
    `<button onClick={() => handleDelete(prop.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                </div>
              </div>`
  );
  fs.writeFileSync('src/app/portal/seller/page.tsx', portalCode);
}

// Update Kanban Board
let kanbanCode = fs.readFileSync('src/app/admin/sellers/KanbanBoard.tsx', 'utf8');

if (!kanbanCode.includes('ImageSlider')) {
  kanbanCode = kanbanCode.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport ImageSlider from '@/app/components/ImageSlider';");

  kanbanCode = kanbanCode.replace(
    /<div\s*ref=\{provided\.innerRef\}\s*\{\.\.\.provided\.draggableProps\}\s*\{\.\.\.provided\.dragHandleProps\}\s*className=\{`bg-white border rounded-xl shadow-sm p-3 transition-shadow \$\{snapshot\.isDragging \? 'shadow-lg border-indigo-400 rotate-2' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'\}`\}\s*>\s*<div className="flex justify-between items-start mb-2">/,
    `<div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={\`bg-white border rounded-xl shadow-sm transition-shadow \${snapshot.isDragging ? 'shadow-lg border-indigo-400 rotate-2' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}\`}
                        >
                          <div className="h-32 mb-3">
                            <ImageSlider urls={seller.image_urls || []} />
                          </div>
                          <div className="p-3 pt-0">
                          <div className="flex justify-between items-start mb-2">`
  );
  
  kanbanCode = kanbanCode.replace(
    /<\/span>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/Draggable>/g,
    `</span>
                            </div>
                          </div>
                          </div>
                        </div>
                      )}
                    </Draggable>`
  );
  fs.writeFileSync('src/app/admin/sellers/KanbanBoard.tsx', kanbanCode);
}

console.log('Cards updated!');
