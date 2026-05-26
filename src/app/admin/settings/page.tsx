/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
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
  AlertTriangle,
  Pencil,
  X,
  Save,
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

  // Add New form state
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSortOrder, setNewSortOrder] = useState<number>(0);

  // Edit state — which item is being edited
  const [editingItem, setEditingItem] = useState<SettingItem | null>(null);
  const [editForm, setEditForm] = useState({ display_name: '', value: '', sort_order: 0 });
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // ── Add New ─────────────────────────────────────────────────────────────────

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newDisplayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setSaving(true);

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

  // ── Edit ────────────────────────────────────────────────────────────────────

  const openEdit = (item: SettingItem) => {
    setEditingItem(item);
    setEditForm({ display_name: item.display_name, value: item.value, sort_order: item.sort_order });
    setError(null);
    setSuccess(null);
    setDeleteConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({ display_name: '', value: '', sort_order: 0 });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editForm.display_name.trim()) {
      setError('Display name cannot be empty.');
      return;
    }

    setError(null);
    setSuccess(null);
    setEditSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('system_settings')
        .update({
          display_name: editForm.display_name.trim(),
          value: editForm.value.trim().toLowerCase().replace(/\s+/g, '_') || editingItem.value,
          sort_order: editForm.sort_order,
        })
        .eq('id', editingItem.id);

      if (updateError) throw updateError;

      setSuccess(`Successfully updated "${editForm.display_name}".`);
      cancelEdit();
      await fetchSettings();
    } catch (err: any) {
      console.error('Failed to update setting:', err);
      setError(err.message || 'Failed to update option.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDeleteSetting = async (id: string, name: string) => {
    setError(null);
    setSuccess(null);
    setDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSuccess(`Successfully deleted option "${name}".`);
      setDeleteConfirmId(null);
      if (editingItem?.id === id) cancelEdit();
      await fetchSettings();
    } catch (err: any) {
      console.error('Failed to delete setting:', err);
      setError(err.message || 'Failed to delete option.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

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

  const inputCls = 'w-full bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 placeholder-slate-400 text-sm outline-none transition-all duration-200';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" /> Settings Manager
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Dynamically configure dropdown lists, forms, and lead status categories. No hardcoded choices.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 sm:gap-2 shadow-inner border border-slate-200/60 overflow-x-auto">
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
                cancelEdit();
                setDeleteConfirmId(null);
              }}
              className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="hidden sm:inline">{getCategoryLabel(cat)}</span>
              <span className="sm:hidden capitalize">{cat.split('_')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-medium rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium rounded-lg text-sm flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" /> {success}
        </div>
      )}

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Options List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                {activeTab === 'property_type' && <Building className="w-5 h-5" />}
                {activeTab === 'city_area' && <MapPin className="w-5 h-5" />}
                {activeTab === 'budget_range' && <DollarSign className="w-5 h-5" />}
                {activeTab === 'lead_status' && <Activity className="w-5 h-5" />}
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Active {getCategoryLabel(activeTab)}</h3>
            </div>
            <span className="text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider border border-blue-100 shadow-sm">
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
            <div className="max-h-[520px] overflow-y-auto pr-1 space-y-2.5 pt-1">
              {filteredSettings.map((item) => {
                const isEditing = editingItem?.id === item.id;
                const isDeleteConfirm = deleteConfirmId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-xl transition-all duration-200 ${
                      isEditing
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      {/* Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isEditing ? 'bg-blue-500' : 'bg-blue-400'}`} />
                          <span className="text-slate-900 font-extrabold text-sm truncate">{item.display_name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium pl-5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                            Key: <code className="text-blue-700 font-bold">{item.value}</code>
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                            Order: <code className="text-slate-900 font-bold">{item.sort_order}</code>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isDeleteConfirm ? (
                          /* Delete confirm buttons */
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteSetting(item.id, item.display_name)}
                              disabled={deleting}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                            >
                              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-lg transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Edit Button */}
                            <button
                              onClick={() => isEditing ? cancelEdit() : openEdit(item)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                isEditing
                                  ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              }`}
                              title={isEditing ? 'Cancel edit' : 'Edit option'}
                            >
                              {isEditing ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Pencil className="w-3.5 h-3.5" /> Edit</>}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => { setDeleteConfirmId(item.id); if (isEditing) cancelEdit(); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-lg transition-all"
                              title="Delete option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Add New OR Edit Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">

          {/* Panel Header — switches between Add and Edit */}
          <div className={`p-5 border-b border-slate-100 ${editingItem ? 'bg-blue-50' : 'bg-white'}`}>
            {editingItem ? (
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-blue-600" /> Edit Option
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Editing: <span className="text-blue-700 font-bold">{editingItem.display_name}</span>
                  </p>
                </div>
                <button
                  onClick={cancelEdit}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" /> Add New Option
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  This choice will instantly show up in the public forms and admin drop-downs.
                </p>
              </div>
            )}
          </div>

          <div className="p-5">
            {editingItem ? (
              /* ── Edit Form ── */
              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.display_name}
                    onChange={(e) => setEditForm(p => ({ ...p, display_name: e.target.value }))}
                    placeholder="e.g. Waterfront Apartment"
                    className={inputCls}
                  />
                </div>

                {/* Value Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Value Key
                  </label>
                  <input
                    type="text"
                    value={editForm.value}
                    onChange={(e) => setEditForm(p => ({ ...p, value: e.target.value }))}
                    placeholder="e.g. waterfront_apt"
                    className={inputCls}
                  />
                  <p className="text-xs text-amber-700 font-medium flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />
                    Changing the value key may break existing leads using this option.
                  </p>
                </div>

                {/* Sort Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Sort Order (Index)
                  </label>
                  <input
                    type="number"
                    value={editForm.sort_order}
                    onChange={(e) => setEditForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    className={inputCls}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                  >
                    {editSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* ── Add New Form ── */
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
                    className={inputCls}
                  />
                </div>

                {/* Value Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Value Key (Optional)
                  </label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. waterfront_apt (auto-generated if empty)"
                    className={inputCls}
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
                    className={inputCls}
                  />
                </div>

                {/* Warning */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Ensure values are spelled correctly. Deleting settings while active leads use them can lead to display issues.</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Add Option</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
