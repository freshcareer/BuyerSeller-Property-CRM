const fs = require('fs');

// Fix portal/seller/page.tsx
let portalCode = fs.readFileSync('src/app/portal/seller/page.tsx', 'utf8');
portalCode = portalCode.replace(
  /<Trash2 className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  '<Trash2 className="w-4 h-4" />\n                    </button>\n                  </div>\n                </div>\n              </div>'
);
fs.writeFileSync('src/app/portal/seller/page.tsx', portalCode);

// Fix KanbanBoard.tsx
let kanbanCode = fs.readFileSync('src/app/admin/sellers/KanbanBoard.tsx', 'utf8');
kanbanCode = kanbanCode.replace(
  /<\/span>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/Draggable>/,
  '</span>\n                            </div>\n                          </div>\n                        </div>\n                      )}\n                    </Draggable>'
);
fs.writeFileSync('src/app/admin/sellers/KanbanBoard.tsx', kanbanCode);

console.log('Fixed syntax errors');
