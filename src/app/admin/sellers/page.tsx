/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Building2, Search, GitCompare, Phone, Mail, MapPin, Building,
  DollarSign, Check, Loader2, X, RefreshCw, Pencil, Trash2,
  MessageCircle, Send, CheckSquare, Square, AlertTriangle,
  ChevronDown, Users, Download, Plus, Globe
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const buildWaLink = (phone: string, message: string) =>
  `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(message)}`;

const DEFAULT_SELLER_MSG = (s: any) =>
  `Hello ${s.name}! 🏢\n\nWe have interested buyers for your ${s.property_type.replace(/_/g, ' ')} property in ${s.area}.\n\nCould we discuss this further? Please let us know.\n\n- Property CRM Team`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Seller {
  id: string;
  name: string;
  phone: string;
  email?: string;
  property_type: string;
  state: string;
  city: string;
  area: string;
  price: string;
  status: string;
  notes?: string;
  follow_up_date?: string | null;
  created_at: string;
}

interface SettingOption {
  value: string;
  display_name: string;
}

export default function SellersInventory() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [statuses, setStatuses] = useState<SettingOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<SettingOption[]>([]);
  const [budgets, setBudgets] = useState<SettingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Location choices
  const [dbStates, setDbStates] = useState<{ id: string; name: string }[]>([]);
  const [dbCities, setDbCities] = useState<{ id: string; name: string; state_id: string }[]>([]);
  const [dbAreas, setDbAreas] = useState<{ id: string; name: string; city_id: string }[]>([]);

  // Advanced Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterPropertyType, setFilterPropertyType] = useState('all');
  const [filterBudget, setFilterBudget] = useState('all');

  // Status micro-state
  const [actionStatus, setActionStatus] = useState<{ id: string; status: 'success' | 'error' | null }>({ id: '', status: null });

  // Matchmaking drawer
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    propertyType: '',
    state: '',
    city: '',
    area: '',
    price: '',
    notes: '',
  });
  const [addCities, setAddCities] = useState<any[]>([]);
  const [addAreas, setAddAreas] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Modal State
  const [editSeller, setEditSeller] = useState<Seller | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    propertyType: '',
    state: '',
    city: '',
    area: '',
    price: '',
    status: '',
    notes: '',
    follow_up_date: '',
  });
  const [editCities, setEditCities] = useState<any[]>([]);
  const [editAreas, setEditAreas] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Multi-select + WhatsApp Blast
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [blastOpen, setBlastOpen] = useState(false);
  const [blastMessage, setBlastMessage] = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSellersData = async () => {
    try {
      setLoading(true);
      const [
        { data: sellersData },
        { data: statusData },
        { data: propData },
        { data: budgetData },
        { data: statesData },
        { data: citiesData },
        { data: areasData }
      ] = await Promise.all([
        supabase.from('sellers_inventory').select('*').order('created_at', { ascending: false }),
        supabase.from('system_settings').select('value,display_name').eq('category', 'lead_status').order('sort_order'),
        supabase.from('system_settings').select('value,display_name').eq('category', 'property_type').order('sort_order'),
        supabase.from('system_settings').select('value,display_name').eq('category', 'budget_range').order('sort_order'),
        supabase.from('states').select('id, name').order('name'),
        supabase.from('cities').select('id, name, state_id').order('name'),
        supabase.from('areas').select('id, name, city_id').order('name'),
      ]);

      setSellers(sellersData || []);
      setStatuses(statusData || []);
      setPropertyTypes(propData || []);
      setBudgets(budgetData || []);
      setDbStates(statesData || []);
      setDbCities(citiesData || []);
      setDbAreas(areasData || []);
    } catch (err) {
      console.error('Error fetching sellers data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellersData();
  }, []);

  // ── Add Cascades ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!addForm.state) {
      setAddCities([]);
      setAddAreas([]);
      return;
    }
    const filtered = dbCities.filter(c => c.state_id === addForm.state);
    setAddCities(filtered);
    setAddForm(prev => ({ ...prev, city: '', area: '' }));
  }, [addForm.state, dbCities]);

  useEffect(() => {
    if (!addForm.city) {
      setAddAreas([]);
      return;
    }
    const filtered = dbAreas.filter(a => a.city_id === addForm.city);
    setAddAreas(filtered);
    setAddForm(prev => ({ ...prev, area: '' }));
  }, [addForm.city, dbAreas]);

  // ── Edit Cascades ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!editForm.state) {
      setEditCities([]);
      setEditAreas([]);
      return;
    }
    const filtered = dbCities.filter(c => c.state_id === editForm.state);
    setEditCities(filtered);
  }, [editForm.state, dbCities]);

  useEffect(() => {
    if (!editForm.city) {
      setEditAreas([]);
      return;
    }
    const filtered = dbAreas.filter(a => a.city_id === editForm.city);
    setEditAreas(filtered);
  }, [editForm.city, dbAreas]);

  // ── Status Change ──────────────────────────────────────────────────────────

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionStatus({ id, status: null });
    try {
      const { error } = await supabase.from('sellers_inventory').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setSellers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      setActionStatus({ id, status: 'success' });
      setTimeout(() => setActionStatus({ id: '', status: null }), 2000);
    } catch {
      setActionStatus({ id, status: 'error' });
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from('sellers_inventory').delete().eq('id', id);
      if (error) throw error;
      setSellers(prev => prev.filter(s => s.id !== id));
      setSelectedIds(prev => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (err) {
      console.error('Failed to delete seller:', err);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  // ── Add Lead Submission ────────────────────────────────────────────────────

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.phone || !addForm.propertyType || !addForm.state || !addForm.city || !addForm.area || !addForm.price) {
      setAddError('All fields marked with * are required.');
      return;
    }
    setAdding(true);
    setAddError(null);

    const stateName = dbStates.find(s => s.id === addForm.state)?.name || '';
    const cityName = dbCities.find(c => c.id === addForm.city)?.name || '';
    const areaName = dbAreas.find(a => a.id === addForm.area)?.name || '';
    const locationString = `${areaName}, ${cityName}, ${stateName}`;

    try {
      const { data, error } = await supabase
        .from('sellers_inventory')
        .insert({
          name: addForm.name.trim(),
          phone: addForm.phone.trim(),
          email: addForm.email.trim() || null,
          property_type: addForm.propertyType,
          state: stateName,
          city: cityName,
          area: locationString,
          price: addForm.price,
          notes: addForm.notes.trim() || null,
          status: 'new_lead',
        })
        .select('*')
        .single();

      if (error) throw error;
      setSellers(prev => [data, ...prev]);
      setAddModalOpen(false);
      setAddForm({
        name: '',
        phone: '',
        email: '',
        propertyType: '',
        state: '',
        city: '',
        area: '',
        price: '',
        notes: '',
      });
    } catch (err: any) {
      setAddError(err.message || 'Failed to add seller lead.');
    } finally {
      setAdding(false);
    }
  };

  // ── Edit Save ───────────────────────────────────────────────────────────────

  const openEdit = (seller: Seller) => {
    // Resolve UUIDs for selected seller
    const matchedState = dbStates.find(s => s.name.toLowerCase() === seller.state.toLowerCase());
    const stateId = matchedState ? matchedState.id : '';

    const stateCities = dbCities.filter(c => c.state_id === stateId);
    const matchedCity = stateCities.find(c => c.name.toLowerCase() === seller.city.toLowerCase());
    const cityId = matchedCity ? matchedCity.id : '';

    const cityAreas = dbAreas.filter(a => a.city_id === cityId);
    const cleanArea = seller.area.split(',')[0].trim();
    const matchedArea = cityAreas.find(a => a.name.toLowerCase() === cleanArea.toLowerCase());
    const areaId = matchedArea ? matchedArea.id : '';

    setEditCities(stateCities);
    setEditAreas(cityAreas);

    setEditSeller(seller);
    setEditForm({
      name: seller.name,
      phone: seller.phone,
      email: seller.email || '',
      propertyType: seller.property_type,
      state: stateId,
      city: cityId,
      area: areaId,
      price: seller.price,
      status: seller.status,
      notes: seller.notes || '',
      follow_up_date: seller.follow_up_date ? new Date(seller.follow_up_date).toISOString().split('T')[0] : '',
    });
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (!editSeller) return;
    setSaving(true);
    setSaveError(null);

    const stateName = dbStates.find(s => s.id === editForm.state)?.name || '';
    const cityName = dbCities.find(c => c.id === editForm.city)?.name || '';
    const areaName = dbAreas.find(a => a.id === editForm.area)?.name || '';
    const locationString = `${areaName}, ${cityName}, ${stateName}`;

    try {
      const { error } = await supabase
        .from('sellers_inventory')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          email: editForm.email || null,
          property_type: editForm.propertyType,
          state: stateName,
          city: cityName,
          area: locationString,
          price: editForm.price,
          status: editForm.status,
          notes: editForm.notes || null,
          follow_up_date: editForm.follow_up_date ? new Date(editForm.follow_up_date).toISOString() : null,
        })
        .eq('id', editSeller.id);

      if (error) throw error;
      
      setSellers(prev => prev.map(s => s.id === editSeller.id ? { 
        ...s, 
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email || undefined,
        property_type: editForm.propertyType,
        state: stateName,
        city: cityName,
        area: locationString,
        price: editForm.price,
        status: editForm.status,
        notes: editForm.notes || undefined,
        follow_up_date: editForm.follow_up_date || null
      } as Seller : s));
      setEditSeller(null);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Matchmaking ────────────────────────────────────────────────────────────

  const handleFindMatches = async (seller: Seller) => {
    setSelectedSeller(seller);
    setLoadingMatches(true);
    setMatches([]);
    try {
      const cleanArea = seller.area.split(',')[0].trim();
      const { data, error } = await supabase
        .from('buyers_demand')
        .select('*')
        .eq('state', seller.state)
        .eq('city', seller.city)
        .ilike('area', `%${cleanArea}%`)
        .eq('property_type', seller.property_type);

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error('Failed to search buyer matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // ── Multi-select ───────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSellers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSellers.map(s => s.id)));
    }
  };

  // ── WhatsApp Blast ─────────────────────────────────────────────────────────

  const openBlast = () => {
    const selected = filteredSellers.filter(s => selectedIds.has(s.id));
    if (selected.length === 1) {
      setBlastMessage(DEFAULT_SELLER_MSG(selected[0]));
    } else {
      setBlastMessage(
        `Hello! 🏢\n\nWe have active buyers matching your properties listed in our CRM.\n\nCould we discuss this further? Please let us know.\n\n- Property CRM Team`
      );
    }
    setBlastOpen(true);
  };

  // ── Filters ────────────────────────────────────────────────────────────────

  const filteredSellers = sellers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.phone.includes(searchQuery) ||
                          s.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.property_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesState = filterState === 'all' || s.state.toLowerCase() === filterState.toLowerCase();
    const matchesCity = filterCity === 'all' || s.city.toLowerCase() === filterCity.toLowerCase();
    const matchesProp = filterPropertyType === 'all' || s.property_type === filterPropertyType;
    const matchesBudget = filterBudget === 'all' || s.price === filterBudget;

    return matchesSearch && matchesStatus && matchesState && matchesCity && matchesProp && matchesBudget;
  });

  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-32">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-850 to-indigo-850 flex items-center gap-3 pb-1">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl text-white shadow-lg shadow-violet-500/30">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            Sellers Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage properties, log details, update status, and match with buyers requirements.
          </p>
        </div>
        <div className="flex flex-row flex-wrap gap-2 self-start sm:self-center">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-750 shadow-md shadow-indigo-200 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
          <button
            onClick={() => {
              const headers = ['Name', 'Phone', 'Email', 'State', 'City', 'Area', 'Property Type', 'Price', 'Status', 'Notes', 'Date Added'];
              const rows = filteredSellers.map(s => [
                `"${s.name}"`,
                `"${s.phone}"`,
                `"${s.email || ''}"`,
                `"${s.state}"`,
                `"${s.city}"`,
                `"${s.area}"`,
                `"${s.property_type.replace(/_/g, ' ')}"`,
                `"${s.price.replace(/_/g, ' ')}"`,
                `"${s.status}"`,
                `"${(s.notes || '').replace(/"/g, '""')}"`,
                `"${new Date(s.created_at).toLocaleDateString()}"`
              ]);
              const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `sellers_export_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg text-sm font-bold text-slate-700 flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={fetchSellersData}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg text-sm font-bold text-slate-700 flex items-center justify-center gap-2 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 text-indigo-650" /> Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, phone, area, city, or property type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="ml-2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none">
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-bold shadow-sm outline-none hover:border-blue-300 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.display_name}</option>)}
          </select>
          
          <select 
            value={filterState} 
            onChange={e => setFilterState(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-bold shadow-sm outline-none hover:border-blue-300 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All States</option>
            {dbStates.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>

          <select 
            value={filterCity} 
            onChange={e => setFilterCity(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-bold shadow-sm outline-none hover:border-blue-300 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Cities</option>
            {dbCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          
          <select 
            value={filterPropertyType} 
            onChange={e => setFilterPropertyType(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-bold shadow-sm outline-none hover:border-blue-300 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Property Types</option>
            {propertyTypes.map(p => <option key={p.value} value={p.value}>{p.display_name}</option>)}
          </select>

          <select 
            value={filterBudget} 
            onChange={e => setFilterBudget(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-bold shadow-sm outline-none hover:border-blue-300 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Prices</option>
            {budgets.map(b => <option key={b.value} value={b.value}>{b.display_name}</option>)}
          </select>

          {(filterStatus !== 'all' || filterState !== 'all' || filterCity !== 'all' || filterPropertyType !== 'all' || filterBudget !== 'all') && (
            <button 
              onClick={() => { setFilterStatus('all'); setFilterState('all'); setFilterCity('all'); setFilterPropertyType('all'); setFilterBudget('all'); }} 
              className="text-xs text-blue-600 font-bold px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors border border-transparent"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/60 shadow-xl rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">Fetching sellers inventory list...</p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="p-4 bg-indigo-50 rounded-full mb-4 border shadow-inner">
               <Building2 className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No seller properties found</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">
              No matching properties in the system.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-650 font-bold uppercase tracking-wide text-xs">
                  <th className="px-4 py-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {selectedIds.size === filteredSellers.length && filteredSellers.length > 0
                        ? <CheckSquare className="w-4 h-4 text-indigo-500" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-6 py-4">Seller Detail</th>
                  <th className="px-6 py-4">Property Location</th>
                  <th className="px-6 py-4">Property Type</th>
                  <th className="px-6 py-4">Expected Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(seller.id) ? 'bg-indigo-50/40' : ''}`}>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(seller.id)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                        {selectedIds.has(seller.id) ? <CheckSquare className="w-4 h-4 text-indigo-500" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{seller.name}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-slate-500 mt-1 font-medium">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {seller.phone}</span>
                        {seller.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {seller.email}</span>}
                      </div>
                      {seller.notes && (
                        <div className="text-xs text-slate-600 mt-2 italic bg-amber-50 p-2 rounded border border-amber-100 max-w-xs">
                          {seller.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize font-bold text-slate-700">
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{seller.area.split(',')[0].trim()}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{seller.city}, {seller.state}</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-750 font-medium">
                      <div className="flex items-center gap-1.5"><Building className="w-4 h-4 text-slate-400" />{seller.property_type.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="px-6 py-4 text-emerald-700 font-bold">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {seller.price.replace(/_/g, ' ').replace('under ', '< ').replace('plus', '+')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <select
                            value={seller.status}
                            onChange={(e) => handleStatusChange(seller.id, e.target.value)}
                            className={`appearance-none bg-white border text-xs font-bold rounded-lg pl-2.5 pr-7 py-1.5 outline-none transition-all duration-300 cursor-pointer shadow-sm ${
                              seller.status === 'new_lead' ? 'border-indigo-200 text-indigo-700' :
                              seller.status === 'contacted' ? 'border-amber-200 text-amber-700' :
                              seller.status === 'closed_won' ? 'border-emerald-200 text-emerald-700' :
                              seller.status === 'closed_lost' ? 'border-rose-200 text-rose-700' :
                              'border-slate-200 text-slate-700'
                            }`}
                          >
                            {statuses.map((s) => (
                              <option key={s.value} value={s.value}>{s.display_name}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                        {actionStatus.id === seller.id && (
                          <span className="text-xs">
                            {actionStatus.status === 'success' && <Check className="w-4 h-4 text-emerald-605" />}
                            {actionStatus.status === 'error' && <span className="text-rose-500">❌</span>}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <a
                          href={buildWaLink(seller.phone, DEFAULT_SELLER_MSG(seller))}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold rounded-lg transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WA
                        </a>
                        <button onClick={() => handleFindMatches(seller)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-750 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold rounded-lg transition-all">
                          <GitCompare className="w-3.5 h-3.5" /> Match
                        </button>
                        <button onClick={() => openEdit(seller)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg transition-all">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        {deleteConfirmId === seller.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(seller.id)} disabled={deletingId === seller.id} className="px-2.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                              {deletingId === seller.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            </button>
                            <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1.5 bg-white border border-slate-200 text-xs rounded-lg">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(seller.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-lg transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WhatsApp Blast Bottom Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 px-3 pointer-events-none">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-4 px-6 py-4 pointer-events-auto border border-slate-700 animate-in slide-in-from-bottom duration-300">
            <span className="font-bold text-sm">{selectedCount} properties selected</span>
            <button
              onClick={openBlast}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-450 text-white font-extrabold text-sm rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Blast
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* WhatsApp Blast Modal */}
      {blastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-emerald-50 rounded-t-2xl">
              <div>
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" /> WhatsApp Blast
                </h3>
              </div>
              <button onClick={() => setBlastOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 bg-white space-y-4 flex-1 overflow-y-auto">
              <textarea
                value={blastMessage}
                onChange={e => setBlastMessage(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-900 font-medium text-sm rounded-xl px-4 py-3 outline-none transition-all resize-none"
              />
              <div className="space-y-2">
                {filteredSellers.filter(s => selectedIds.has(s.id)).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                    <span className="font-bold text-sm text-slate-900">{s.name} ({s.phone})</span>
                    <a href={buildWaLink(s.phone, blastMessage)} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-emerald-505 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                      <Send className="w-3 h-3" /> Send
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Lead Modal ── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-blue-50 rounded-t-2xl">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-650" /> Add Property Listing</h3>
              <button type="button" onClick={() => setAddModalOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {addError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-bold">{addError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">Full Name *</label>
                  <input type="text" required value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">Phone Number *</label>
                  <input type="tel" required value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" placeholder="e.g. 9876543210" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">Email Address</label>
                  <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" placeholder="e.g. email@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">Property Type *</label>
                  <select required value={addForm.propertyType} onChange={e => setAddForm(p => ({ ...p, propertyType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900">
                    <option value="">Select type</option>
                    {propertyTypes.map(p => <option key={p.value} value={p.value}>{p.display_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">State *</label>
                  <select required value={addForm.state} onChange={e => setAddForm(p => ({ ...p, state: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900">
                    <option value="">Select state</option>
                    {dbStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">City *</label>
                  <select required value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" disabled={!addForm.state}>
                    <option value="">Select city</option>
                    {addCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">Property Area *</label>
                  <select required value={addForm.area} onChange={e => setAddForm(p => ({ ...p, area: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" disabled={!addForm.city}>
                    <option value="">Select area</option>
                    {addAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">Expected Price Range *</label>
                  <select required value={addForm.price} onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900">
                    <option value="">Select range</option>
                    {budgets.map(b => <option key={b.value} value={b.value}>{b.display_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-655 uppercase tracking-wider block">Notes</label>
                  <textarea value={addForm.notes} onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" rows={2} placeholder="Property characteristics..." />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button type="button" onClick={() => setAddModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={adding} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex justify-center items-center gap-1.5">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Lead
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit Seller Modal ── */}
      {editSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-blue-50 rounded-t-2xl">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Pencil className="w-5 h-5 text-indigo-650" /> Edit Property Listing</h3>
              <button onClick={() => setEditSeller(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {saveError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-bold">{saveError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Full Name *</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Phone Number *</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Email Address</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Property Type *</label>
                  <select value={editForm.propertyType} onChange={e => setEditForm(p => ({ ...p, propertyType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900">
                    {propertyTypes.map(p => <option key={p.value} value={p.value}>{p.display_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">State *</label>
                  <select value={editForm.state} onChange={e => setEditForm(p => ({ ...p, state: e.target.value, city: '', area: '' }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900">
                    {dbStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">City *</label>
                  <select value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value, area: '' }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" disabled={!editForm.state}>
                    <option value="">Select city</option>
                    {editCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Property Area *</label>
                  <select value={editForm.area} onChange={e => setEditForm(p => ({ ...p, area: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" disabled={!editForm.city}>
                    <option value="">Select area</option>
                    {editAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Expected Price Range *</label>
                  <select value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900">
                    {budgets.map(b => <option key={b.value} value={b.value}>{b.display_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Lead Status *</label>
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900">
                    {statuses.map(s => <option key={s.value} value={s.value}>{s.display_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Follow Up Date</label>
                  <input type="date" value={editForm.follow_up_date} onChange={e => setEditForm(p => ({ ...p, follow_up_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-555 uppercase tracking-wider block">Notes</label>
                  <textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900" rows={2} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button type="button" onClick={() => setEditSeller(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-sm">Cancel</button>
              <button type="button" onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-lg text-sm flex justify-center items-center gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Matchmaking Drawer ── */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-350">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><GitCompare className="w-5 h-5 text-indigo-650" /> Matchmaker Panel</h3>
                <p className="text-xs text-slate-500 font-medium">Matches found for seller listing <strong className="text-slate-700">{selectedSeller.name}</strong></p>
              </div>
              <button onClick={() => setSelectedSeller(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 bg-white border-b border-slate-100 flex flex-wrap gap-4 text-sm shadow-sm">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-bold">Area:</span>
                <span className="text-slate-900 capitalize font-bold">{selectedSeller.area.split(',')[0].trim()}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-bold">Property:</span>
                <span className="text-slate-900 capitalize font-bold">{selectedSeller.property_type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-750 font-bold">Price:</span>
                <span className="text-emerald-900 font-bold">{selectedSeller.price.replace(/_/g, ' ')}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {loadingMatches ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-slate-500 text-sm font-medium">Searching requirements...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                  <Users className="w-12 h-12 text-slate-300 mb-3" />
                  <h4 className="font-extrabold text-slate-900 mb-1">No Matching Buyers Found</h4>
                  <p className="text-slate-500 text-sm max-w-xs font-medium">No active buyers are looking for this property listing.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((buyer) => (
                    <div key={buyer.id} className="p-5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl space-y-4 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">{buyer.name}</h4>
                          <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold mt-1">Buyer Requirement</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 font-bold block">Preferred Budget</span>
                          <span className="text-base font-extrabold text-emerald-650 flex items-center justify-end gap-0.5 mt-0.5">
                            <DollarSign className="w-4 h-4" /> {buyer.budget.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border">
                        <div>
                          <span className="text-slate-500 font-bold block">Phone</span>
                          <a href={`tel:${buyer.phone}`} className="font-bold text-slate-900 hover:text-blue-605 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {buyer.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block">WhatsApp</span>
                          <a href={buildWaLink(buyer.phone, `Hello ${buyer.name}! We have an active property listed matching your budget in ${buyer.area}.`)} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-650 hover:text-emerald-555 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-slate-400" /> Send WA
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 bg-white">
              <button type="button" onClick={() => setSelectedSeller(null)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-sm">Close Panel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
