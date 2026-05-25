'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Settings, 
  Building, 
  MapPin, 
  DollarSign, 
  Activity, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface SettingItem {
  id: string;
  category: string;
  value: string;
  display_name: string;
  sort_order: number;
}

export default function SettingsManager() {
  const [settingsList, setSettingsList] = useState<SettingItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('property_type');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New setting item form state
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSortOrder, setNewSortOrder] = useState<number>(0);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSettingsList(data || []);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newDisplayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setSaving(true);

    // Auto-generate value key if empty (e.g. "Villa / House" -> "villa_house")
    const generatedValue = newValue.trim() 
      ? newValue.trim().toLowerCase().replace(/\s+/g, '_')
      : newDisplayName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');

    try {
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert({
          category: activeTab,
          value: generatedValue,
          display_name: newDisplayName.trim(),
          sort_order: newSortOrder,
        });

      if (insertError) throw insertError;

      setSuccess(`Successfully added "${newDisplayName}" to ${getCategoryLabel(activeTab)}.`);
      setNewDisplayName('');
      setNewValue('');
      setNewSortOrder(0);
      
      // Refresh options
      await fetchSettings();
    } catch (err: any) {
      console.error('Failed to add setting:', err);
      setError(err.message?.includes('duplicate key') 
        ? 'An option with this value key already exists.' 
        : err.message || 'Failed to insert option.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSetting = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This could cause mismatches if current leads are using it.`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const { error: deleteError } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSuccess(`Successfully deleted option "${name}".`);
      await fetchSettings();
    } catch (err: any) {
      console.error('Failed to delete setting:', err);
      setError(err.message || 'Failed to delete option.');
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'property_type': return 'Property Types';
      case 'city_area': return 'City Areas';
      case 'budget_range': return 'Budget / Price Ranges';
      case 'lead_status': return 'Lead Statuses';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'property_type': return Building;
      case 'city_area': return MapPin;
      case 'budget_range': return DollarSign;
      case 'lead_status': return Activity;
      default: return Settings;
    }
  };

  const filteredSettings = settingsList.filter(s => s.category === activeTab);
  const categories = ['property_type', 'city_area', 'budget_range', 'lead_status'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-8 h-8 text-blue-600" /> Settings Manager
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Dynamically configure dropdown lists, forms, and lead status categories. No hardcoded choices.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2 max-w-3xl shadow-inner border border-slate-200/60">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat);
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="hidden sm:inline">{getCategoryLabel(cat)}</span>
              <span className="sm:hidden capitalize">{cat.split('_')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-medium rounded-lg text-sm max-w-3xl flex items-start gap-2">
           <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium rounded-lg text-sm max-w-3xl flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" /> {success}
        </div>
      )}

      {/* Main settings manager interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Options List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">Active {getCategoryLabel(activeTab)}</h3>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {filteredSettings.length} Options
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-slate-500 font-medium text-sm">Loading options...</p>
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="font-bold text-sm">No options configured in this category.</p>
              <p className="text-xs mt-1 font-medium">Use the panel on the right to add options.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-2 space-y-1">
              {filteredSettings.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-3 transition-colors group border border-transparent hover:border-slate-100">
                  <div className="space-y-1">
                    <span className="text-slate-900 font-bold block">{item.display_name}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">Value key: <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{item.value}</code></span>
                      <span className="flex items-center gap-1">Order: <code className="text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{item.sort_order}</code></span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSetting(item.id, item.display_name)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 border border-transparent hover:border-rose-100"
                    title="Delete Option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Add New Option Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base">Add New Option</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              This choice will instantly show up in the public forms and admin drop-downs.
            </p>
          </div>

          <form onSubmit={handleAddSetting} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="e.g. Waterfront Apartment"
                className="w-full bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 placeholder-slate-400 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Custom Value Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Value Key (Optional)
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. waterfront_apt (auto-generated if empty)"
                className="w-full bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 placeholder-slate-400 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Sort Order (Index)
              </label>
              <input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(parseInt(e.target.value) || 0)}
                placeholder="e.g. 1"
                className="w-full bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 placeholder-slate-400 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Warn message */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Ensure values are spelled correctly. Deleting settings while active leads use them can lead to display issues.</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Option
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
