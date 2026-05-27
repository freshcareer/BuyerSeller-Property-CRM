const fs = require('fs');

let content = fs.readFileSync('src/app/components/LeadForms.tsx', 'utf8');

// 1. Add Icons
content = content.replace(
  /CheckCircle2, ChevronRight, Loader2, User, Phone, Mail,[\s\S]*?Building, MapPin, DollarSign, FileText, Globe, Home, AlertCircle, Edit, Trash2,/,
  \CheckCircle2, ChevronRight, Loader2, User, Phone, Mail,
  Building, MapPin, DollarSign, FileText, Globe, Home, AlertCircle, Edit, Trash2,
  Bed, Bath, Compass, Key, Tag, Car, Expand,\
);

// 2. Update formData state
content = content.replace(
  /budgetOrPrice: '',\s*notes: '',/,
  \udgetOrPrice: '',
    bedrooms: '',
    bathrooms: '',
    builtupArea: '',
    additionalSpaces: '',
    possessionStatus: '',
    facing: '',
    parking: '',
    description: '',
    tags: '',
    notes: '',\
);

// 3. Update cancelEdit
content = content.replace(
  /setFormData\(\{ name: '', phone: '', email: '', propertyType: '', state: '', city: '', area: '', budgetOrPrice: '', notes: '' \}\);/g,
  \setFormData({ name: '', phone: '', email: '', propertyType: '', state: '', city: '', area: '', budgetOrPrice: '', bedrooms: '', bathrooms: '', builtupArea: '', additionalSpaces: '', possessionStatus: '', facing: '', parking: '', description: '', tags: '', notes: '' });\
);

// 4. Update system_settings options filtering
content = content.replace(
  /const budgetRanges = options\.filter\(\(o\) => o\.category === 'budget_range'\);/,
  \const budgetRanges = options.filter((o) => o.category === 'budget_range');
  const bedroomOptions = options.filter((o) => o.category === 'bedrooms');
  const bathroomOptions = options.filter((o) => o.category === 'bathrooms');
  const facingOptions = options.filter((o) => o.category === 'facing');
  const possessionOptions = options.filter((o) => o.category === 'possession_status');\
);

// 5. Update payload construction
content = content.replace(
  /budget: formData\.budgetOrPrice,\s*notes: formData\.notes\.trim\(\) \|\| null,/g,
  \udget: formData.budgetOrPrice,
          bedrooms: formData.bedrooms || null,
          bathrooms: formData.bathrooms || null,
          builtup_area: formData.builtupArea.trim() || null,
          additional_spaces: formData.additionalSpaces.trim() || null,
          possession_status: formData.possessionStatus || null,
          facing: formData.facing || null,
          parking: formData.parking.trim() || null,
          description: formData.description.trim() || null,
          tags: formData.tags.trim() || null,
          notes: formData.notes.trim() || null,\
);

content = content.replace(
  /price: formData\.budgetOrPrice,\s*notes: formData\.notes\.trim\(\) \|\| null,/g,
  \price: formData.budgetOrPrice,
          bedrooms: formData.bedrooms || null,
          bathrooms: formData.bathrooms || null,
          builtup_area: formData.builtupArea.trim() || null,
          additional_spaces: formData.additionalSpaces.trim() || null,
          possession_status: formData.possessionStatus || null,
          facing: formData.facing || null,
          parking: formData.parking.trim() || null,
          description: formData.description.trim() || null,
          tags: formData.tags.trim() || null,
          notes: formData.notes.trim() || null,\
);

// 6. Update handleEditClick to load new fields
content = content.replace(
  /budgetOrPrice: item\.price \|\| item\.budget,\s*notes: item\.notes \|\| '',/g,
  \udgetOrPrice: item.price || item.budget,
        bedrooms: item.bedrooms || '',
        bathrooms: item.bathrooms || '',
        builtupArea: item.builtup_area || '',
        additionalSpaces: item.additional_spaces || '',
        possessionStatus: item.possession_status || '',
        facing: item.facing || '',
        parking: item.parking || '',
        description: item.description || '',
        tags: item.tags || '',
        notes: item.notes || '',\
);

// 7. Insert the new UI blocks right before the Notes block.
const advancedDetailsBlock = \
        {/* Advanced Property Details */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-extrabold text-slate-800">Property Details</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className={labelCls}><Bed className="w-3.5 h-3.5" /> Bedrooms</label>
              <select name="bedrooms" value={formData.bedrooms} onChange={handleChange} className={getSelectCls('bedrooms' as any)}>
                <option value="">Any / Not Applicable</option>
                {bedroomOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Bath className="w-3.5 h-3.5" /> Bathrooms</label>
              <select name="bathrooms" value={formData.bathrooms} onChange={handleChange} className={getSelectCls('bathrooms' as any)}>
                <option value="">Any / Not Applicable</option>
                {bathroomOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Expand className="w-3.5 h-3.5" /> Built-up Area</label>
              <input type="text" name="builtupArea" value={formData.builtupArea} onChange={handleChange} placeholder="e.g. 520 Sq.Yd." className={getInputCls('builtupArea' as any)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Compass className="w-3.5 h-3.5" /> Facing</label>
              <select name="facing" value={formData.facing} onChange={handleChange} className={getSelectCls('facing' as any)}>
                <option value="">Any / Not Applicable</option>
                {facingOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Key className="w-3.5 h-3.5" /> Possession Status</label>
              <select name="possessionStatus" value={formData.possessionStatus} onChange={handleChange} className={getSelectCls('possessionStatus' as any)}>
                <option value="">Any / Not Applicable</option>
                {possessionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Car className="w-3.5 h-3.5" /> Parking</label>
              <input type="text" name="parking" value={formData.parking} onChange={handleChange} placeholder="e.g. 2 Covered Cars" className={getInputCls('parking' as any)} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className={labelCls}><Home className="w-3.5 h-3.5" /> Additional Spaces</label>
               <input type="text" name="additionalSpaces" value={formData.additionalSpaces} onChange={handleChange} placeholder="e.g. Pooja Room, Servant Room" className={getInputCls('additionalSpaces' as any)} />
             </div>
             <div className="space-y-1">
               <label className={labelCls}><Tag className="w-3.5 h-3.5" /> Highlight Tags</label>
               <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. Vastu Compliant, Safe Locality" className={getInputCls('tags' as any)} />
             </div>
          </div>
          
          <div className="space-y-1">
            <label className={labelCls}><FileText className="w-3.5 h-3.5" /> Public Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Write a detailed description of the property to show on the public listing..." className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-4 py-3 placeholder-slate-400 outline-none transition-all duration-200 resize-none" />
          </div>
        </div>
\n        {/* Notes */}\n;

content = content.replace(/\s*\{\/\* Notes \*\/\}/, advancedDetailsBlock);

fs.writeFileSync('src/app/components/LeadForms.tsx', content);
console.log('LeadForms updated!');