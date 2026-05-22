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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-indigo-400" /> Settings Manager
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Dynamically configure dropdown lists, forms, and lead status categories. No hardcoded choices.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/10 p-1.5 rounded-xl gap-2 max-w-2xl">
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
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-650 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{getCategoryLabel(cat)}</span>
              <span className="sm:hidden capitalize">{cat.split('_')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm max-w-3xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm max-w-3xl flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Main settings manager interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl items-start">
        
        {/* Left Side: Options List */}
        <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">Active {getCategoryLabel(activeTab)}</h3>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {filteredSettings.length} Options
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Loading options...</p>
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="font-semibold text-sm">No options configured in this category.</p>
              <p className="text-xs mt-1">Use the panel on the right to add options.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-850 max-h-[450px] overflow-y-auto pr-2 space-y-1">
              {filteredSettings.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 hover:bg-slate-900/20 rounded px-2 transition-all group">
                  <div className="space-y-1">
                    <span className="text-slate-200 font-semibold">{item.display_name}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Value key: <code className="text-indigo-400/80 bg-slate-900/60 px-1 py-0.5 rounded">{item.value}</code></span>
                      <span>Order: <code className="text-slate-400">{item.sort_order}</code></span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSetting(item.id, item.display_name)}
                    className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300"
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
        <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Add New Option</h3>
            <p className="text-xs text-slate-500 mt-1">
              This choice will instantly show up in the public forms and admin drop-downs.
            </p>
          </div>

          <form onSubmit={handleAddSetting} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="e.g. Waterfront Apartment"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 placeholder-slate-655 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Custom Value Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Value Key (Optional)
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. waterfront_apt (auto-generated if empty)"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 placeholder-slate-650 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Sort Order (Index)
              </label>
              <input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(parseInt(e.target.value) || 0)}
                placeholder="e.g. 1"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 placeholder-slate-650 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Warn message */}
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-lg flex items-start gap-2.5 text-xs text-indigo-300">
              <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>Ensure values are spelled correctly. Deleting settings while active leads use them can lead to display issues.</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-605 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
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
