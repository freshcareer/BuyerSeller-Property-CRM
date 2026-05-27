const fs = require('fs');

let content = fs.readFileSync('src/app/admin/sellers/page.tsx', 'utf8');

// 1. Add Icons
content = content.replace(
  /Search, Filter, CheckCircle2, ChevronRight, Download, Users, Plus, Edit, Trash2, X, FileText, ArrowRight, Activity, MapPin, Building, MessageCircle, AlertCircle, Calendar, CalendarClock, CreditCard/,
  \Search, Filter, CheckCircle2, ChevronRight, Download, Users, Plus, Edit, Trash2, X, FileText, ArrowRight, Activity, MapPin, Building, MessageCircle, AlertCircle, Calendar, CalendarClock, CreditCard, Bed, Bath, Compass, Key, Expand, Car, Tag\
);

// 2. Update Seller Interface
content = content.replace(
  /price: string;\s*notes: string;/,
  \price: string;
  notes: string;
  bedrooms?: string;
  bathrooms?: string;
  builtup_area?: string;
  additional_spaces?: string;
  possession_status?: string;
  facing?: string;
  parking?: string;
  description?: string;
  tags?: string;\
);

// 3. Update addForm state
content = content.replace(
  /price: '',\s*notes: '',\s*\}\);/,
  \price: '',
    bedrooms: '',
    bathrooms: '',
    builtupArea: '',
    additionalSpaces: '',
    possessionStatus: '',
    facing: '',
    parking: '',
    description: '',
    tags: '',
    notes: '',
  });\
);

// 4. Update editForm state
content = content.replace(
  /notes: '',\s*follow_up_date: '',\s*\}\);/,
  \
otes: '',
    follow_up_date: '',
    bedrooms: '',
    bathrooms: '',
    builtupArea: '',
    additionalSpaces: '',
    possessionStatus: '',
    facing: '',
    parking: '',
    description: '',
    tags: '',
  });\
);

// 5. Add options states
content = content.replace(
  /const \[budgets, setBudgets\] = useState<SettingOption\[\]>\(\[\]\);/,
  \const [budgets, setBudgets] = useState<SettingOption[]>([]);
  const [bedroomOptions, setBedroomOptions] = useState<SettingOption[]>([]);
  const [bathroomOptions, setBathroomOptions] = useState<SettingOption[]>([]);
  const [facingOptions, setFacingOptions] = useState<SettingOption[]>([]);
  const [possessionOptions, setPossessionOptions] = useState<SettingOption[]>([]);\
);

// 6. Update fetch
content = content.replace(
  /\{ data: areasData \}\s*\] = await Promise.all\(\[/,
  \{ data: areasData },
        { data: bedData },
        { data: bathData },
        { data: faceData },
        { data: possData }
      ] = await Promise.all([\
);

content = content.replace(
  /supabase\.from\('areas'\)\.select\('id, name, city_id'\)\.order\('name'\),\s*\]\);/,
  \supabase.from('areas').select('id, name, city_id').order('name'),
        supabase.from('system_settings').select('value,display_name').eq('category', 'bedrooms').order('sort_order'),
        supabase.from('system_settings').select('value,display_name').eq('category', 'bathrooms').order('sort_order'),
        supabase.from('system_settings').select('value,display_name').eq('category', 'facing').order('sort_order'),
        supabase.from('system_settings').select('value,display_name').eq('category', 'possession_status').order('sort_order'),
      ]);\
);

content = content.replace(
  /setBudgets\(budgetData \|\| \[\]\);/,
  \setBudgets(budgetData || []);
      setBedroomOptions(bedData || []);
      setBathroomOptions(bathData || []);
      setFacingOptions(faceData || []);
      setPossessionOptions(possData || []);\
);

// 7. Update addForm submission
content = content.replace(
  /price: addForm\.price,\s*notes: addForm\.notes \|\| null,/,
  \price: addForm.price,
        bedrooms: addForm.bedrooms || null,
        bathrooms: addForm.bathrooms || null,
        builtup_area: addForm.builtupArea.trim() || null,
        additional_spaces: addForm.additionalSpaces.trim() || null,
        possession_status: addForm.possessionStatus || null,
        facing: addForm.facing || null,
        parking: addForm.parking.trim() || null,
        description: addForm.description.trim() || null,
        tags: addForm.tags.trim() || null,
        notes: addForm.notes || null,\
);

content = content.replace(
  /setAddForm\(\{ name: '', phone: '', email: '', propertyType: '', state: '', city: '', area: '', price: '', notes: '' \}\);/,
  \setAddForm({ name: '', phone: '', email: '', propertyType: '', state: '', city: '', area: '', price: '', bedrooms: '', bathrooms: '', builtupArea: '', additionalSpaces: '', possessionStatus: '', facing: '', parking: '', description: '', tags: '', notes: '' });\
);

// 8. Update edit open logic
content = content.replace(
  /price: seller\.price,\s*status: seller\.status,\s*notes: seller\.notes \|\| '',\s*follow_up_date: seller\.follow_up_date \|\| '',/,
  \price: seller.price,
      status: seller.status,
      notes: seller.notes || '',
      follow_up_date: seller.follow_up_date || '',
      bedrooms: seller.bedrooms || '',
      bathrooms: seller.bathrooms || '',
      builtupArea: seller.builtup_area || '',
      additionalSpaces: seller.additional_spaces || '',
      possessionStatus: seller.possession_status || '',
      facing: seller.facing || '',
      parking: seller.parking || '',
      description: seller.description || '',
      tags: seller.tags || '',\
);

// 9. Update edit save logic
content = content.replace(
  /price: editForm\.price,\s*status: editForm\.status,\s*notes: editForm\.notes \|\| null,\s*follow_up_date: editForm\.follow_up_date \|\| null,/,
  \price: editForm.price,
        status: editForm.status,
        notes: editForm.notes || null,
        follow_up_date: editForm.follow_up_date || null,
        bedrooms: editForm.bedrooms || null,
        bathrooms: editForm.bathrooms || null,
        builtup_area: editForm.builtupArea.trim() || null,
        additional_spaces: editForm.additionalSpaces.trim() || null,
        possession_status: editForm.possessionStatus || null,
        facing: editForm.facing || null,
        parking: editForm.parking.trim() || null,
        description: editForm.description.trim() || null,
        tags: editForm.tags.trim() || null,\
);

// 10. UI Blocks Replacement for Add Modal
const advancedUiBlockAdd = \
              {/* Advanced Property Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-800">Advanced Details</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}><Bed className="w-3.5 h-3.5" /> Bedrooms</label>
                    <select value={addForm.bedrooms} onChange={e => setAddForm({...addForm, bedrooms: e.target.value})} className={getSelectCls()}>
                      <option value="">Any / N/A</option>
                      {bedroomOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Bath className="w-3.5 h-3.5" /> Bathrooms</label>
                    <select value={addForm.bathrooms} onChange={e => setAddForm({...addForm, bathrooms: e.target.value})} className={getSelectCls()}>
                      <option value="">Any / N/A</option>
                      {bathroomOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Expand className="w-3.5 h-3.5" /> Built-up Area</label>
                    <input type="text" value={addForm.builtupArea} onChange={e => setAddForm({...addForm, builtupArea: e.target.value})} placeholder="e.g. 520 Sq.Yd." className={getInputCls()} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Compass className="w-3.5 h-3.5" /> Facing</label>
                    <select value={addForm.facing} onChange={e => setAddForm({...addForm, facing: e.target.value})} className={getSelectCls()}>
                      <option value="">Any / N/A</option>
                      {facingOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Key className="w-3.5 h-3.5" /> Possession Status</label>
                    <select value={addForm.possessionStatus} onChange={e => setAddForm({...addForm, possessionStatus: e.target.value})} className={getSelectCls()}>
                      <option value="">Any / N/A</option>
                      {possessionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Car className="w-3.5 h-3.5" /> Parking</label>
                    <input type="text" value={addForm.parking} onChange={e => setAddForm({...addForm, parking: e.target.value})} placeholder="e.g. 2 Covered Cars" className={getInputCls()} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}><Home className="w-3.5 h-3.5" /> Additional Spaces</label>
                    <input type="text" value={addForm.additionalSpaces} onChange={e => setAddForm({...addForm, additionalSpaces: e.target.value})} placeholder="e.g. Pooja Room, Servant Room" className={getInputCls()} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Tag className="w-3.5 h-3.5" /> Highlight Tags</label>
                    <input type="text" value={addForm.tags} onChange={e => setAddForm({...addForm, tags: e.target.value})} placeholder="e.g. Vastu Compliant, Safe Locality" className={getInputCls()} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className={labelCls}><FileText className="w-3.5 h-3.5" /> Public Description</label>
                  <textarea value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} rows={2} placeholder="Write a description for public display..." className="w-full bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-lg px-3 py-2 outline-none resize-none text-sm" />
                </div>
              </div>
\n              <div className="space-y-1">\n                <label className={labelCls}>\n                  <FileText className="w-3.5 h-3.5" /> Internal Notes\n;

content = content.replace(
  /<div className="space-y-1">\s*<label className=\{labelCls\}>\s*<FileText className="w-3\.5 h-3\.5" \/> Notes/,
  advancedUiBlockAdd
);

// 11. UI Blocks Replacement for Edit Modal
const advancedUiBlockEdit = \
              {/* Advanced Property Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-800">Advanced Details</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}><Bed className="w-3.5 h-3.5" /> Bedrooms</label>
                    <select value={editForm.bedrooms} onChange={e => setEditForm({...editForm, bedrooms: e.target.value})} className={getSelectCls()}>
                      <option value="">Any / N/A</option>
                      {bedroomOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Bath className="w-3.5 h-3.5" /> Bathrooms</label>
                    <select value={editForm.bathrooms} onChange={e => setEditForm({...editForm, bathrooms: e.target.value})} className={getSelectCls()}>
                      <option value="">Any / N/A</option>
                      {bathroomOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Expand className="w-3.5 h-3.5" /> Built-up Area</label>
                    <input type="text" value={editForm.builtupArea} onChange={e => setEditForm({...editForm, builtupArea: e.target.value})} placeholder="e.g. 520 Sq.Yd." className={getInputCls()} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Compass className="w-3.5 h-3.5" /> Facing</label>
                    <select value={editForm.facing} onChange={e => setEditForm({...editForm, facing: e.target.value})} className={getSelectCls()}>
                      <option value="">Any / N/A</option>
                      {facingOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Key className="w-3.5 h-3.5" /> Possession Status</label>
                    <select value={editForm.possessionStatus} onChange={e => setEditForm({...editForm, possessionStatus: e.target.value})} className={getSelectCls()}>
                      <option value="">Any / N/A</option>
                      {possessionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Car className="w-3.5 h-3.5" /> Parking</label>
                    <input type="text" value={editForm.parking} onChange={e => setEditForm({...editForm, parking: e.target.value})} placeholder="e.g. 2 Covered Cars" className={getInputCls()} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}><Home className="w-3.5 h-3.5" /> Additional Spaces</label>
                    <input type="text" value={editForm.additionalSpaces} onChange={e => setEditForm({...editForm, additionalSpaces: e.target.value})} placeholder="e.g. Pooja Room, Servant Room" className={getInputCls()} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}><Tag className="w-3.5 h-3.5" /> Highlight Tags</label>
                    <input type="text" value={editForm.tags} onChange={e => setEditForm({...editForm, tags: e.target.value})} placeholder="e.g. Vastu Compliant, Safe Locality" className={getInputCls()} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className={labelCls}><FileText className="w-3.5 h-3.5" /> Public Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={2} placeholder="Write a description for public display..." className="w-full bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-lg px-3 py-2 outline-none resize-none text-sm" />
                </div>
              </div>
\n              <div className="space-y-1">\n                <label className={labelCls}>\n                  <FileText className="w-3.5 h-3.5" /> Internal Notes\n;

content = content.replace(
  /<div className="space-y-1">\s*<label className=\{labelCls\}>\s*<FileText className="w-3\.5 h-3\.5" \/> Notes/,
  advancedUiBlockEdit
);


fs.writeFileSync('src/app/admin/sellers/page.tsx', content);
console.log('sellers/page.tsx updated!');