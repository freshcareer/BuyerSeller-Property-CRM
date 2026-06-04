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
  Globe,
  Bed,
  Bath,
  Compass,
  Key,
  Armchair,
  Layers,
  Clock,
  Eye,
} from 'lucide-react';

interface SettingItem {
  id: string;
  category: string;
  value: string;
  display_name: string;
  sort_order: number;
}

interface LocationSettingsManagerProps {
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

function LocationSettingsManager({ setError, setSuccess }: LocationSettingsManagerProps) {
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [newStateName, setNewStateName] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newAreaName, setNewAreaName] = useState('');

  // Editing state
  const [editingStateId, setEditingStateId] = useState<string | null>(null);
  const [editingStateName, setEditingStateName] = useState('');
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [editingCityName, setEditingCityName] = useState('');
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editingAreaName, setEditingAreaName] = useState('');

  // Delete confirmations
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<'state' | 'city' | 'area' | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [savingState, setSavingState] = useState(false);
  const [savingCity, setSavingCity] = useState(false);
  const [savingArea, setSavingArea] = useState(false);

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedStateId) {
      fetchCities(selectedStateId);
      setSelectedCityId(null);
      setAreas([]);
    } else {
      setCities([]);
      setSelectedCityId(null);
      setAreas([]);
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedCityId) {
      fetchAreas(selectedCityId);
    } else {
      setAreas([]);
    }
  }, [selectedCityId]);

  const fetchStates = async () => {
    setLoadingStates(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setStates(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch states: ' + (err.message || err));
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId: string) => {
    setLoadingCities(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('state_id', stateId)
        .order('name', { ascending: true });
      if (error) throw error;
      setCities(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch cities: ' + (err.message || err));
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchAreas = async (cityId: string) => {
    setLoadingAreas(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('city_id', cityId)
        .order('name', { ascending: true });
      if (error) throw error;
      setAreas(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch areas: ' + (err.message || err));
    } finally {
      setLoadingAreas(false);
    }
  };

  // State actions
  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim()) return;
    setError(null);
    setSuccess(null);
    setSavingState(true);
    try {
      const { data, error } = await supabase
        .from('states')
        .insert({ name: newStateName.trim() })
        .select()
        .single();
      if (error) throw error;
      setNewStateName('');
      setStates(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setSuccess(`State "${newStateName.trim()}" added successfully.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message?.includes('duplicate key')
        ? 'A state with this name already exists.'
        : err.message || 'Failed to add state.');
    } finally {
      setSavingState(false);
    }
  };

  const handleUpdateState = async (id: string) => {
    if (!editingStateName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from('states')
        .update({ name: editingStateName.trim() })
        .eq('id', id);
      if (error) throw error;
      setStates(prev => prev.map(s => s.id === id ? { ...s, name: editingStateName.trim() } : s));
      setEditingStateId(null);
      setSuccess(`State updated to "${editingStateName.trim()}".`);
    } catch (err: any) {
      console.error(err);
      setError(err.message?.includes('duplicate key')
        ? 'A state with this name already exists.'
        : err.message || 'Failed to update state.');
    }
  };

  const handleDeleteState = async (id: string, name: string) => {
    setError(null);
    setSuccess(null);
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('states')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setStates(prev => prev.filter(s => s.id !== id));
      if (selectedStateId === id) {
        setSelectedStateId(null);
      }
      setDeleteConfirmId(null);
      setDeleteConfirmType(null);
      setSuccess(`State "${name}" and all its cities/areas deleted successfully.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete state.');
    } finally {
      setDeleting(false);
    }
  };

  // City actions
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStateId || !newCityName.trim()) return;
    setError(null);
    setSuccess(null);
    setSavingCity(true);
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert({ name: newCityName.trim(), state_id: selectedStateId })
        .select()
        .single();
      if (error) throw error;
      setNewCityName('');
      setCities(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setSuccess(`City "${newCityName.trim()}" added successfully.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message?.includes('duplicate key')
        ? 'A city with this name already exists in this state.'
        : err.message || 'Failed to add city.');
    } finally {
      setSavingCity(false);
    }
  };

  const handleUpdateCity = async (id: string) => {
    if (!editingCityName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from('cities')
        .update({ name: editingCityName.trim() })
        .eq('id', id);
      if (error) throw error;
      setCities(prev => prev.map(c => c.id === id ? { ...c, name: editingCityName.trim() } : c));
      setEditingCityId(null);
      setSuccess(`City updated to "${editingCityName.trim()}".`);
    } catch (err: any) {
      console.error(err);
      setError(err.message?.includes('duplicate key')
        ? 'A city with this name already exists in this state.'
        : err.message || 'Failed to update city.');
    }
  };

  const handleDeleteCity = async (id: string, name: string) => {
    setError(null);
    setSuccess(null);
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCities(prev => prev.filter(c => c.id !== id));
      if (selectedCityId === id) {
        setSelectedCityId(null);
      }
      setDeleteConfirmId(null);
      setDeleteConfirmType(null);
      setSuccess(`City "${name}" and all its areas deleted successfully.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete city.');
    } finally {
      setDeleting(false);
    }
  };

  // Area actions
  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId || !newAreaName.trim()) return;
    setError(null);
    setSuccess(null);
    setSavingArea(true);
    try {
      const { data, error } = await supabase
        .from('areas')
        .insert({ name: newAreaName.trim(), city_id: selectedCityId })
        .select()
        .single();
      if (error) throw error;
      setNewAreaName('');
      setAreas(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setSuccess(`Area "${newAreaName.trim()}" added successfully.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message?.includes('duplicate key')
        ? 'An area with this name already exists in this city.'
        : err.message || 'Failed to add area.');
    } finally {
      setSavingArea(false);
    }
  };

  const handleUpdateArea = async (id: string) => {
    if (!editingAreaName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from('areas')
        .update({ name: editingAreaName.trim() })
        .eq('id', id);
      if (error) throw error;
      setAreas(prev => prev.map(a => a.id === id ? { ...a, name: editingAreaName.trim() } : a));
      setEditingAreaId(null);
      setSuccess(`Area updated to "${editingAreaName.trim()}".`);
    } catch (err: any) {
      console.error(err);
      setError(err.message?.includes('duplicate key')
        ? 'An area with this name already exists in this city.'
        : err.message || 'Failed to update area.');
    }
  };

  const handleDeleteArea = async (id: string, name: string) => {
    setError(null);
    setSuccess(null);
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAreas(prev => prev.filter(a => a.id !== id));
      setDeleteConfirmId(null);
      setDeleteConfirmType(null);
      setSuccess(`Area "${name}" deleted successfully.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete area.');
    } finally {
      setDeleting(false);
    }
  };

  const selectedState = states.find(s => s.id === selectedStateId);
  const selectedCity = cities.find(c => c.id === selectedCityId);

  const cardCls = 'bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-900/5 rounded-3xl p-5 flex flex-col h-[560px] relative overflow-hidden';
  const listContainerCls = 'flex-1 overflow-y-auto pr-1 space-y-1.5 py-2';
  const itemCls = 'p-3 border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all duration-200';
  const inputCls = 'w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-semibold rounded-lg px-3 py-2 text-sm outline-none transition-all';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-in fade-in duration-300">
      {/* 1. States column */}
      <div className={cardCls}>
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">1. States</h3>
          </div>
          <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full shrink-0">
            {states.length} total
          </span>
        </div>

        {loadingStates ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
            <p className="text-slate-400 text-xs font-semibold">Loading states...</p>
          </div>
        ) : (
          <div className={listContainerCls}>
            {states.map(state => {
              const isSelected = selectedStateId === state.id;
              const isEditing = editingStateId === state.id;
              const isConfirmDelete = deleteConfirmId === state.id && deleteConfirmType === 'state';

              return (
                <div
                  key={state.id}
                  onClick={() => {
                    if (!isEditing && !isConfirmDelete) {
                      setSelectedStateId(state.id);
                    }
                  }}
                  className={`${itemCls} ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingStateName}
                        onChange={e => setEditingStateName(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs border border-blue-400 focus:outline-none rounded font-semibold bg-white text-slate-900"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleUpdateState(state.id);
                          if (e.key === 'Escape') setEditingStateId(null);
                        }}
                      />
                      <button
                        onClick={() => handleUpdateState(state.id)}
                        className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingStateId(null)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : isConfirmDelete ? (
                    <div className="flex-1 flex items-center justify-between gap-1" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] text-rose-600 font-extrabold uppercase animate-pulse">Delete?</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteState(state.id, state.name)}
                          disabled={deleting}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded transition-all"
                        >
                          {deleting ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmId(null);
                            setDeleteConfirmType(null);
                          }}
                          className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-extrabold rounded transition-all"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                        {state.name}
                      </span>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingStateId(state.id);
                            setEditingStateName(state.name);
                            setDeleteConfirmId(null);
                            setDeleteConfirmType(null);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmId(state.id);
                            setDeleteConfirmType('state');
                            setEditingStateId(null);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {states.length === 0 && (
              <p className="text-center py-8 text-slate-400 text-xs font-medium">No states added yet.</p>
            )}
          </div>
        )}

        <form onSubmit={handleAddState} className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
          <input
            type="text"
            required
            placeholder="New State (e.g. Gujarat)"
            value={newStateName}
            onChange={e => setNewStateName(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={savingState}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shrink-0 shadow-sm"
          >
            {savingState ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* 2. Cities column */}
      <div className={cardCls}>
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedStateId ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase truncate">
              2. Cities {selectedState ? `(${selectedState.name})` : ''}
            </h3>
          </div>
          {selectedStateId && (
            <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full shrink-0">
              {cities.length} total
            </span>
          )}
        </div>

        {!selectedStateId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400 mb-3 shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-bold">No State Selected</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Select a state from the first column to manage its cities.</p>
          </div>
        ) : loadingCities ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
            <p className="text-slate-400 text-xs font-semibold">Loading cities...</p>
          </div>
        ) : (
          <>
            <div className={listContainerCls}>
              {cities.map(city => {
                const isSelected = selectedCityId === city.id;
                const isEditing = editingCityId === city.id;
                const isConfirmDelete = deleteConfirmId === city.id && deleteConfirmType === 'city';

                return (
                  <div
                    key={city.id}
                    onClick={() => {
                      if (!isEditing && !isConfirmDelete) {
                        setSelectedCityId(city.id);
                      }
                    }}
                    className={`${itemCls} ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingCityName}
                          onChange={e => setEditingCityName(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-indigo-400 focus:outline-none rounded font-semibold bg-white text-slate-900"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleUpdateCity(city.id);
                            if (e.key === 'Escape') setEditingCityId(null);
                          }}
                        />
                        <button
                          onClick={() => handleUpdateCity(city.id)}
                          className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCityId(null)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : isConfirmDelete ? (
                      <div className="flex-1 flex items-center justify-between gap-1" onClick={e => e.stopPropagation()}>
                        <span className="text-[10px] text-rose-600 font-extrabold uppercase animate-pulse">Delete?</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteCity(city.id, city.name)}
                            disabled={deleting}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded transition-all"
                          >
                            {deleting ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmId(null);
                              setDeleteConfirmType(null);
                            }}
                            className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-extrabold rounded transition-all"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-800' : 'text-slate-700'}`}>
                          {city.name}
                        </span>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingCityId(city.id);
                              setEditingCityName(city.name);
                              setDeleteConfirmId(null);
                              setDeleteConfirmType(null);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmId(city.id);
                              setDeleteConfirmType('city');
                              setEditingCityId(null);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {cities.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-xs font-medium">No cities added in this state yet.</p>
              )}
            </div>

            <form onSubmit={handleAddCity} className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
              <input
                type="text"
                required
                placeholder="New City (e.g. Ahmedabad)"
                value={newCityName}
                onChange={e => setNewCityName(e.target.value)}
                className={inputCls}
              />
              <button
                type="submit"
                disabled={savingCity}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shrink-0 shadow-sm"
              >
                {savingCity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </div>

      {/* 3. Areas column */}
      <div className={cardCls}>
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedCityId ? 'bg-violet-600 animate-pulse' : 'bg-slate-300'}`} />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase truncate">
              3. Areas {selectedCity ? `(${selectedCity.name})` : ''}
            </h3>
          </div>
          {selectedCityId && (
            <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full shrink-0">
              {areas.length} total
            </span>
          )}
        </div>

        {!selectedCityId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400 mb-3 shadow-inner">
              <Building className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-bold">No City Selected</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Select a city from the second column to manage its areas.</p>
          </div>
        ) : loadingAreas ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-violet-600 animate-spin mb-2" />
            <p className="text-slate-400 text-xs font-semibold">Loading areas...</p>
          </div>
        ) : (
          <>
            <div className={listContainerCls}>
              {areas.map(area => {
                const isEditing = editingAreaId === area.id;
                const isConfirmDelete = deleteConfirmId === area.id && deleteConfirmType === 'area';

                return (
                  <div
                    key={area.id}
                    className={`${itemCls} bg-white hover:bg-slate-50 border-slate-200 cursor-default`}
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingAreaName}
                          onChange={e => setEditingAreaName(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-violet-400 focus:outline-none rounded font-semibold bg-white text-slate-900"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleUpdateArea(area.id);
                            if (e.key === 'Escape') setEditingAreaId(null);
                          }}
                        />
                        <button
                          onClick={() => handleUpdateArea(area.id)}
                          className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingAreaId(null)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : isConfirmDelete ? (
                      <div className="flex-1 flex items-center justify-between gap-1" onClick={e => e.stopPropagation()}>
                        <span className="text-[10px] text-rose-600 font-extrabold uppercase animate-pulse">Delete?</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteArea(area.id, area.name)}
                            disabled={deleting}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded transition-all"
                          >
                            {deleting ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmId(null);
                              setDeleteConfirmType(null);
                            }}
                            className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-extrabold rounded transition-all"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold truncate text-slate-700">
                          {area.name}
                        </span>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingAreaId(area.id);
                              setEditingAreaName(area.name);
                              setDeleteConfirmId(null);
                              setDeleteConfirmType(null);
                            }}
                            className="p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmId(area.id);
                              setDeleteConfirmType('area');
                              setEditingAreaId(null);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {areas.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-xs font-medium">No areas added in this city yet.</p>
              )}
            </div>

            <form onSubmit={handleAddArea} className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
              <input
                type="text"
                required
                placeholder="New Area (e.g. Satellite)"
                value={newAreaName}
                onChange={e => setNewAreaName(e.target.value)}
                className={inputCls}
              />
              <button
                type="submit"
                disabled={savingArea}
                className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all shrink-0 shadow-sm"
              >
                {savingArea ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

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
      case 'budget_range': return 'Budget / Price Ranges';
      case 'lead_status': return 'Lead Statuses';
      case 'location_settings': return 'Location Settings';
      case 'bedrooms': return 'Bedrooms';
      case 'bathrooms': return 'Bathrooms';
      case 'facing': return 'Facing Options';
      case 'possession_status': return 'Possession Status';
      case 'furnishing': return 'Furnishing';
      case 'balconies': return 'Balconies';
      case 'property_age': return 'Property Age';
      case 'card_visibility': return 'Card Visibility';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'property_type': return Building;
      case 'budget_range': return DollarSign;
      case 'lead_status': return Activity;
      case 'location_settings': return Globe;
      case 'bedrooms': return Bed;
      case 'bathrooms': return Bath;
      case 'facing': return Compass;
      case 'possession_status': return Key;
      case 'furnishing': return Armchair;
      case 'balconies': return Layers;
      case 'property_age': return Clock;
      case 'card_visibility': return Eye;
      default: return Settings;
    }
  };

  const filteredSettings = settingsList.filter(s => s.category === activeTab);
  const categories = ['property_type', 'budget_range', 'lead_status', 'location_settings', 'card_visibility', 'bedrooms', 'bathrooms', 'facing', 'possession_status', 'furnishing', 'balconies', 'property_age'];

  const inputCls = 'w-full bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 placeholder-slate-400 text-sm outline-none transition-all duration-200';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
              <Settings className="w-7 h-7 sm:w-9 sm:h-9 text-blue-100" />
            </div>
            Settings Manager
          </h1>
          <p className="text-blue-200 text-sm sm:text-base mt-4 font-medium max-w-2xl leading-relaxed">
            Configure dropdown lists, forms, and system parameters dynamically. Your changes will reflect instantly across the public platform and admin dashboards.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-2xl text-sm flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-2xl text-sm flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" /> {success}
        </div>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full relative">
        
        {/* Left Sidebar: Navigation */}
        <div className="w-full lg:w-72 shrink-0 bg-white/70 backdrop-blur-2xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 rounded-3xl p-4 sticky top-24 flex flex-col gap-1.5 z-20">
          <div className="px-4 py-3 mb-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Configuration</h3>
          </div>
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
                className={`w-full text-left px-4 py-3.5 font-bold text-sm transition-all duration-300 flex items-center gap-3 rounded-2xl group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-1 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200 text-slate-500'}`}>
                   <Icon className="w-4 h-4 shrink-0" />
                </div>
                <span className="truncate">{getCategoryLabel(cat)}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 w-full space-y-6 min-w-0 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === 'location_settings' ? (
            <LocationSettingsManager setError={setError} setSuccess={setSuccess} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Options List */}
              <div className="xl:col-span-7 bg-white/80 backdrop-blur-2xl border border-slate-200/80 shadow-2xl shadow-slate-200/40 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm text-blue-600">
                      {activeTab === 'property_type' && <Building className="w-6 h-6" />}
                      {activeTab === 'budget_range' && <DollarSign className="w-6 h-6" />}
                      {activeTab === 'lead_status' && <Activity className="w-6 h-6" />}
                      {activeTab === 'bedrooms' && <Bed className="w-6 h-6" />}
                      {activeTab === 'bathrooms' && <Bath className="w-6 h-6" />}
                      {activeTab === 'facing' && <Compass className="w-6 h-6" />}
                      {activeTab === 'possession_status' && <Key className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-xl">{getCategoryLabel(activeTab)}</h3>
                      <p className="text-slate-500 text-xs font-bold mt-1 tracking-wide uppercase">Active Options</p>
                    </div>
                  </div>
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                    {filteredSettings.length} Items
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-bold text-sm">Loading options...</p>
                  </div>
                ) : filteredSettings.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Settings className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-black text-slate-700 text-lg">No options configured</p>
                    <p className="text-sm mt-2 font-medium text-slate-500 max-w-xs mx-auto">Use the panel on the right to add your first option to this category.</p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3 pt-2 custom-scrollbar">
                    {filteredSettings.map((item) => {
                      const isEditing = editingItem?.id === item.id;
                      const isDeleteConfirm = deleteConfirmId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`p-5 rounded-2xl transition-all duration-300 border ${
                            isEditing
                              ? 'bg-blue-50/50 border-blue-400 shadow-lg shadow-blue-100/50 scale-[1.02]'
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Info */}
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full shrink-0 shadow-inner ${isEditing ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className="text-slate-900 font-black text-base truncate">{item.display_name}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold pl-6">
                                <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-500 border border-slate-200 shadow-sm">
                                  KEY <span className="text-blue-600 font-mono ml-1">{item.value}</span>
                                </span>
                                <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-500 border border-slate-200 shadow-sm">
                                  SORT <span className="text-slate-900 ml-1">{item.sort_order}</span>
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {isDeleteConfirm ? (
                                <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-xl border border-rose-100">
                                  <button
                                    onClick={() => handleDeleteSetting(item.id, item.display_name)}
                                    disabled={deleting}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-rose-200"
                                  >
                                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-all"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => isEditing ? cancelEdit() : openEdit(item)}
                                    className={`flex items-center justify-center p-2 rounded-xl transition-all ${
                                      isEditing
                                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    }`}
                                    title={isEditing ? 'Cancel edit' : 'Edit option'}
                                  >
                                    {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => { setDeleteConfirmId(item.id); if (isEditing) cancelEdit(); }}
                                    className="flex items-center justify-center p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Delete option"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right panel: Add/Edit Form */}
              <div className="xl:col-span-5 bg-white/80 backdrop-blur-2xl border border-slate-200/80 shadow-2xl shadow-slate-200/40 rounded-3xl overflow-hidden sticky top-24">
                
                {/* Panel Header */}
                <div className={`p-6 border-b border-slate-100 ${editingItem ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-white'}`}>
                  {editingItem ? (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-blue-900 text-lg flex items-center gap-2.5">
                          <Pencil className="w-5 h-5 text-blue-600" /> Edit Option
                        </h3>
                        <p className="text-xs text-blue-600/70 mt-1.5 font-bold uppercase tracking-widest">
                          Editing: <span className="text-blue-800">{editingItem.display_name}</span>
                        </p>
                      </div>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-white/60 hover:bg-white rounded-xl text-slate-400 transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-black text-slate-900 text-lg flex items-center gap-2.5">
                        <Plus className="w-5 h-5 text-indigo-600 bg-indigo-50 p-1 rounded-lg" /> Create Option
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                        Add a new item to this category. Changes apply immediately.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {editingItem ? (
                    /* ── Edit Form ── */
                    <form onSubmit={handleSaveEdit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
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

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                          Value Key
                        </label>
                        <input
                          type="text"
                          value={editForm.value}
                          onChange={(e) => setEditForm(p => ({ ...p, value: e.target.value }))}
                          placeholder="e.g. waterfront_apt"
                          className={inputCls}
                        />
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 mt-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                          <p className="text-xs text-amber-800 font-bold leading-relaxed">
                            Warning: Modifying the value key may disconnect this option from existing records.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                          Sort Order (Index)
                        </label>
                        <input
                          type="number"
                          value={editForm.sort_order}
                          onChange={(e) => setEditForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                          className={inputCls}
                        />
                      </div>

                      <div className="flex gap-3 pt-3">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editSaving}
                          className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95"
                        >
                          {editSaving ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Saving</>
                          ) : (
                            <><Save className="w-5 h-5" /> Save Changes</>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ── Add New Form ── */
                    <form onSubmit={handleAddSetting} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
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

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                          Value Key (Optional)
                        </label>
                        <input
                          type="text"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="Auto-generated if empty"
                          className={inputCls}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
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

                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full mt-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95"
                      >
                        {saving ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                        ) : (
                          <><Plus className="w-5 h-5" /> Add Option</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
