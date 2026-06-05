const fs = require('fs');
let code = fs.readFileSync('src/app/components/LeadForms.tsx', 'utf8');

const stateVars = `  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // ImgBB API Key should be set in .env.local
    const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!IMGBB_API_KEY) {
      setImageUploadError('ImgBB API key is missing. Add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local file.');
      return;
    }

    setUploadingImages(true);
    setImageUploadError(null);
    const files = Array.from(e.target.files);
    
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const formDataPayload = new FormData();
        formDataPayload.append('image', file);
        
        const response = await fetch(\`https://api.imgbb.com/1/upload?key=\${IMGBB_API_KEY}\`, {
          method: 'POST',
          body: formDataPayload,
        });
        
        const data = await response.json();
        if (data.success) {
          newUrls.push(data.data.url);
        } else {
          throw new Error(data.error?.message || 'Failed to upload image');
        }
      }
      
      if (newUrls.length > 0) {
        const currentUrls = formData.imageUrls ? formData.imageUrls.split(',').map(s => s.trim()).filter(Boolean) : [];
        setFormData(prev => ({ ...prev, imageUrls: [...currentUrls, ...newUrls].join(', ') }));
      }
    } catch (err: any) {
      setImageUploadError(err.message || 'Error uploading images. Please try again.');
    } finally {
      setUploadingImages(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    const urls = formData.imageUrls ? formData.imageUrls.split(',').map(s => s.trim()).filter(Boolean) : [];
    const updated = urls.filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({ ...prev, imageUrls: updated.join(', ') }));
  };`;

code = code.replace(/const \[isAdvancedOpen, setIsAdvancedOpen\] = useState\(false\);/, 'const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);\n\n' + stateVars);

const imageUploadUI = `
        {/* Image Upload for Sellers */}
        {activeTab === 'sell' && (
          <div className="space-y-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 md:col-span-2 lg:col-span-1">
            <label className={labelCls}>
              <ImageIcon className="w-4 h-4 text-indigo-500" /> Property Photos (Optional)
            </label>
            <p className="text-xs text-slate-500">Upload photos of your property to attract more clients. Maximum 10 images.</p>
            
            {imageUploadError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {imageUploadError}
              </div>
            )}
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {formData.imageUrls && formData.imageUrls.split(',').map(s => s.trim()).filter(Boolean).map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                  <img src={url} alt={\`Property \${idx+1}\`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              
              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-colors text-indigo-500 hover:text-indigo-600">
                {uploadingImages ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
              </label>
            </div>
          </div>
        )}
`;

code = code.replace(/\{renderFieldError\('propertyType'\)\}\n          <\/div>/, '{renderFieldError(\'propertyType\')}\n          </div>\n' + imageUploadUI);

fs.writeFileSync('src/app/components/LeadForms.tsx', code);
console.log('LeadForms.tsx updated successfully');
