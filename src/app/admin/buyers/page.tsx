/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Search,
  GitCompare,
  Phone,
  Mail,
  MapPin,
  Building,
  DollarSign,
  Check,
  Loader2,
  X,
  RefreshCw,
  Pencil,
  Trash2,
  MessageCircle,
  Send,
  CheckSquare,
  Square,
  AlertTriangle,
  ChevronDown,
  Download,
  Plus,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const buildWaLink = (phone: string, message: string) =>
  `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(message)}`;

const DEFAULT_BUYER_MSG = (b: any) =>
  `Namaste ${b.name}! 🏠\n\nAapki ${b.property_type.replace(/_/g, ' ')} ki requirement ke liye hamare paas ${b.area.replace(/_/g, ' ')} mein kuch excellent options hain.\n\nKya aap ek site visit ke liye available hain? Please reply karen.\n\n- Property CRM Team`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Buyer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  property_type: string;
  state: string;
  city: string;
  area: string;
  budget: string;
  status: string;
  notes?: string;
  follow_up_date?: string | null;
  created_at: string;
}

interface SettingOption {
  value: string;
  display_name: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuyersDemand() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [statuses, setStatuses] = useState<SettingOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<SettingOption[]>([]);
  const [areas, setAreas] = useState<SettingOption[]>([]);
  const [budgets, setBudgets] = useState<SettingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [filterPropertyType, setFilterPropertyType] = useState('all');
  const [filterBudget, setFilterBudget] = useState('all');

  // Status update micro-state
  const [actionStatus, setActionStatus] = useState<{ id: string; status: 'success' | 'error' | null }>({ id: '', status: null });

  // Matchmaking drawer
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Edit modal
  const [editBuyer, setEditBuyer] = useState<Buyer | null>(null);
  const [editForm, setEditForm] = useState<Partial<Buyer>>({});
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

  const fetchBuyersData = async () => {
    try {
      setLoading(true);
      const [{ data: buyersData }, { data: statusData }, { data: propData }, { data: areaData }, { data: budgetData }] =
        await Promise.all([
          supabase.from('buyers_demand').select('*').order('created_at', { ascending: false }),
          supabase.from('system_settings').select('value,display_name').eq('category', 'lead_status').order('sort_order'),
          supabase.from('system_settings').select('value,display_name').eq('category', 'property_type').order('sort_order'),
          supabase.from('system_settings').select('value,display_name').eq('category', 'city_area').order('sort_order'),
          supabase.from('system_settings').select('value,display_name').eq('category', 'budget_range').order('sort_order'),
        ]);
      setBuyers(buyersData || []);
      setStatuses(statusData || []);
      setPropertyTypes(propData || []);
      setAreas(areaData || []);
      setBudgets(budgetData || []);
    } catch (err) {
      console.error('Error fetching buyers data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuyersData(); }, []);

  // ── Status Change ──────────────────────────────────────────────────────────

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionStatus({ id, status: null });
    try {
      const { error } = await supabase.from('buyers_demand').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setBuyers(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
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
      const { error } = await supabase.from('buyers_demand').delete().eq('id', id);
      if (error) throw error;
      setBuyers(prev => prev.filter(b => b.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } catch (err) {
      console.error('Failed to delete buyer:', err);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const openEdit = (buyer: Buyer) => {
    setEditBuyer(buyer);
    setEditForm({ ...buyer });
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (!editBuyer) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase
        .from('buyers_demand')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          email: editForm.email || null,
          property_type: editForm.property_type,
          state: editForm.state,
          city: editForm.city,
          area: editForm.area,
          budget: editForm.budget,
          status: editForm.status,
          notes: editForm.notes || null,
        })
        .eq('id', editBuyer.id);
      if (error) throw error;
      setBuyers(prev => prev.map(b => b.id === editBuyer.id ? { ...b, ...editForm } as Buyer : b));
      setEditBuyer(null);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Matchmaking ────────────────────────────────────────────────────────────

  const handleFindMatches = async (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setLoadingMatches(true);
    setMatches([]);
    try {
      const { data, error } = await supabase
        .from('sellers_inventory')
        .select('*')
        .eq('area', buyer.area)
        .eq('property_type', buyer.property_type);
      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error('Failed to search seller matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // ── Multi-select ───────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBuyers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBuyers.map(b => b.id)));
    }
  };

  // ── WhatsApp Blast ─────────────────────────────────────────────────────────

  const openBlast = () => {
    const selected = filteredBuyers.filter(b => selectedIds.has(b.id));
    if (selected.length === 1) {
      setBlastMessage(DEFAULT_BUYER_MSG(selected[0]));
    } else {
      setBlastMessage(
        `Namaste! 🏠\n\nHamare paas aapki property requirements ke liye excellent options hain.\n\nKya aap ek site visit ke liye available hain? Please reply karen.\n\n- Property CRM Team`
      );
    }
    setBlastOpen(true);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filteredBuyers = buyers.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.phone.includes(searchQuery) ||
                          b.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.property_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesArea = filterArea === 'all' || b.area === filterArea;
    const matchesProp = filterPropertyType === 'all' || b.property_type === filterPropertyType;
    const matchesBudget = filterBudget === 'all' || b.budget === filterBudget;

    return matchesSearch && matchesStatus && matchesArea && matchesProp && matchesBudget;
  });

  const selectedCount = selectedIds.size;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-screen pb-32">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" /> Buyers Demand
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage buyer leads, edit details, log interactions, and send WhatsApp messages.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </a>
          <button
            onClick={() => {
              const headers = ['Name', 'Phone', 'Email', 'Area', 'Property Type', 'Budget', 'Status', 'Notes', 'Date Added'];
              const rows = filteredBuyers.map(b => [
                `"${b.name}"`,
                `"${b.phone}"`,
                `"${b.email || ''}"`,
                `"${b.area.replace(/_/g, ' ')}"`,
                `"${b.property_type.replace(/_/g, ' ')}"`,
                `"${b.budget.replace(/_/g, ' ')}"`,
                `"${b.status}"`,
                `"${(b.notes || '').replace(/"/g, '""')}"`,
                `"${new Date(b.created_at).toLocaleDateString()}"`
              ]);
              const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `buyers_export_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg text-sm font-bold text-slate-700 flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={fetchBuyersData}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg text-sm font-bold text-slate-700 flex items-center justify-center gap-2 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, phone, area, or property type..."
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

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-bold shadow-sm outline-none hover:border-blue-300 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.display_name}</option>)}
          </select>
          
          <select 
            value={filterArea} 
            onChange={e => setFilterArea(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-bold shadow-sm outline-none hover:border-blue-300 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Areas</option>
            {areas.map(a => <option key={a.value} value={a.value}>{a.display_name}</option>)}
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
            <option value="all">All Budgets</option>
            {budgets.map(b => <option key={b.value} value={b.value}>{b.display_name}</option>)}
          </select>

          {(filterStatus !== 'all' || filterArea !== 'all' || filterPropertyType !== 'all' || filterBudget !== 'all') && (
            <button 
              onClick={() => { setFilterStatus('all'); setFilterArea('all'); setFilterPropertyType('all'); setFilterBudget('all'); }} 
              className="text-xs text-blue-600 font-bold px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors border border-transparent"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Main Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">Fetching buyers demand list...</p>
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-4 bg-blue-50 rounded-full mb-4 border border-blue-100 shadow-inner">
               <Users className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No buyer leads found</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">
              It looks a little quiet here. Adjust your search filters or wait for new leads to be submitted from the homepage.
            </p>
            {(filterStatus !== 'all' || filterArea !== 'all' || filterPropertyType !== 'all' || filterBudget !== 'all' || searchQuery !== '') ? (
              <button 
                onClick={() => { setFilterStatus('all'); setFilterArea('all'); setFilterPropertyType('all'); setFilterBudget('all'); setSearchQuery(''); }}
                className="mt-6 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 shadow-md font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Clear All Filters
              </button>
            ) : (
              <a 
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add First Lead
              </a>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wide text-xs">
                  {/* Select All */}
                  <th className="px-4 py-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Select All"
                    >
                      {selectedIds.size === filteredBuyers.length && filteredBuyers.length > 0
                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-6 py-4">Client Detail</th>
                  <th className="px-6 py-4">Preferred Area</th>
                  <th className="px-6 py-4">Property Type</th>
                  <th className="px-6 py-4">Budget Range</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBuyers.map((buyer) => (
                  <tr
                    key={buyer.id}
                    className={`hover:bg-slate-50 transition-colors ${selectedIds.has(buyer.id) ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(buyer.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {selectedIds.has(buyer.id)
                          ? <CheckSquare className="w-4 h-4 text-blue-600" />
                          : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Client Detail */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{buyer.name}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-slate-500 mt-1 font-medium">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {buyer.phone}</span>
                        {buyer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {buyer.email}</span>}
                      </div>
                      {buyer.notes && (
                        <div className="text-xs text-slate-600 mt-2 italic bg-amber-50 p-2 rounded border border-amber-100 max-w-xs">
                          Note: {buyer.notes}
                        </div>
                      )}
                    </td>

                    {/* Area */}
                    <td className="px-6 py-4 capitalize font-bold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {buyer.area.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{buyer.city}, {buyer.state}</div>
                    </td>

                    {/* Property Type */}
                    <td className="px-6 py-4 capitalize text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-slate-400" />
                        {buyer.property_type.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="px-6 py-4 text-emerald-700 font-bold">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {buyer.budget.replace(/_/g, ' ').replace('under ', '< ').replace('plus', '+')}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <select
                            value={buyer.status}
                            onChange={(e) => handleStatusChange(buyer.id, e.target.value)}
                            className={`appearance-none bg-white border text-xs font-bold rounded-lg pl-2.5 pr-7 py-1.5 outline-none transition-all duration-300 cursor-pointer shadow-sm ${
                              buyer.status === 'new_lead' ? 'border-blue-200 text-blue-700' :
                              buyer.status === 'contacted' ? 'border-amber-200 text-amber-700' :
                              buyer.status === 'closed_won' ? 'border-emerald-200 text-emerald-700' :
                              buyer.status === 'closed_lost' ? 'border-rose-200 text-rose-700' :
                              'border-slate-200 text-slate-700'
                            }`}
                          >
                            {statuses.map((s) => (
                              <option key={s.value} value={s.value}>{s.display_name}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                        {actionStatus.id === buyer.id && (
                          <span className="text-xs">
                            {actionStatus.status === 'success' && <Check className="w-4 h-4 text-emerald-600" />}
                            {actionStatus.status === 'error' && <span className="text-rose-500">❌</span>}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* WhatsApp */}
                        <a
                          href={buildWaLink(buyer.phone, DEFAULT_BUYER_MSG(buyer))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold rounded-lg transition-all duration-300"
                          title="Send WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WA
                        </a>

                        {/* Match */}
                        <button
                          onClick={() => handleFindMatches(buyer)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-all duration-300"
                          title="Find Matches"
                        >
                          <GitCompare className="w-3.5 h-3.5" /> Match
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(buyer)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg transition-all duration-300"
                          title="Edit Buyer"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>

                        {/* Delete */}
                        {deleteConfirmId === buyer.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(buyer.id)}
                              disabled={deletingId === buyer.id}
                              className="px-2.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-1"
                            >
                              {deletingId === buyer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(buyer.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-lg transition-all duration-300"
                            title="Delete Buyer"
                          >
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

      {/* ── WhatsApp Blast Bottom Bar ── */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 px-4 pointer-events-none">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-4 px-6 py-4 pointer-events-auto border border-slate-700 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-extrabold">
                {selectedCount}
              </div>
              <span className="font-bold text-sm">buyer{selectedCount > 1 ? 's' : ''} selected</span>
            </div>
            <div className="h-6 w-px bg-slate-600" />
            <button
              onClick={openBlast}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Blast
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── WhatsApp Blast Modal ── */}
      {blastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-emerald-50 rounded-t-2xl">
              <div>
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  WhatsApp Blast
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedCount} buyer{selectedCount > 1 ? 's' : ''} selected — message bhejne ke liye ready
                </p>
              </div>
              <button onClick={() => setBlastOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Textarea */}
            <div className="p-6 border-b border-slate-100 bg-white space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Message Template (Edit before sending)
              </label>
              <textarea
                value={blastMessage}
                onChange={e => setBlastMessage(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-900 font-medium text-sm rounded-xl px-4 py-3 outline-none transition-all resize-none"
                placeholder="Apna message likhen..."
              />
            </div>

            {/* Selected Contacts List */}
            <div className="p-6 flex-1 overflow-y-auto space-y-3 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Click "Send WA" for each contact</p>
                 <span className="text-xs font-bold text-emerald-600">{selectedCount} Contacts</span>
              </div>
              
              <div className="space-y-2">
                {filteredBuyers.filter(b => selectedIds.has(b.id)).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-slate-400" /> {b.phone}</span>
                    </div>
                    <a
                      href={buildWaLink(b.phone, blastMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-md border border-emerald-200 text-xs font-bold rounded-lg transition-all duration-300"
                    >
                      <Send className="w-3.5 h-3.5" /> Send WA
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-200 flex bg-white">
              <button
                onClick={() => setBlastOpen(false)}
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-extrabold rounded-xl text-sm transition-colors hover:bg-slate-50 shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Buyer Modal ── */}
      {editBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-blue-50 rounded-t-2xl">
              <div>
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-blue-600" /> Edit Buyer
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {editBuyer.name} ka record update karein
                </p>
              </div>
              <button onClick={() => setEditBuyer(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {saveError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name *</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone *</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>
                {/* State */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    value={editForm.state || ''}
                    onChange={e => setEditForm(p => ({ ...p, state: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>
                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>
                {/* Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Area *</label>
                  <select
                    value={editForm.area || ''}
                    onChange={e => setEditForm(p => ({ ...p, area: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  >
                    {areas.map(a => <option key={a.value} value={a.value}>{a.display_name}</option>)}
                  </select>
                </div>
                {/* Property Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Type *</label>
                  <select
                    value={editForm.property_type || ''}
                    onChange={e => setEditForm(p => ({ ...p, property_type: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  >
                    {propertyTypes.map(pt => <option key={pt.value} value={pt.value}>{pt.display_name}</option>)}
                  </select>
                </div>
                {/* Budget */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Range *</label>
                  <select
                    value={editForm.budget || ''}
                    onChange={e => setEditForm(p => ({ ...p, budget: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  >
                    {budgets.map(b => <option key={b.value} value={b.value}>{b.display_name}</option>)}
                  </select>
                </div>
                {/* Status */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Status</label>
                  <select
                    value={editForm.status || ''}
                    onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  >
                    {statuses.map(s => <option key={s.value} value={s.value}>{s.display_name}</option>)}
                  </select>
                </div>
                {/* Notes */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                  <textarea
                    value={editForm.notes || ''}
                    onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all resize-none"
                    placeholder="Internal notes..."
                  />
                </div>
                {/* Follow Up Date */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow Up Date</label>
                  <input
                    type="date"
                    value={editForm.follow_up_date ? new Date(editForm.follow_up_date).toISOString().split('T')[0] : ''}
                    onChange={e => setEditForm(p => ({ ...p, follow_up_date: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setEditBuyer(null)}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-extrabold rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Matchmaking Drawer ── */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-350">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-blue-600" /> Matchmaker Panel
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Matches found for buyer <strong className="text-slate-700">{selectedBuyer.name}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedBuyer(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white border-b border-slate-100 flex flex-wrap gap-4 text-sm shadow-sm">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-bold">Area:</span>
                <span className="text-slate-900 capitalize font-bold">{selectedBuyer.area.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-bold">Property:</span>
                <span className="text-slate-900 capitalize font-bold">{selectedBuyer.property_type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-700 font-bold">Budget:</span>
                <span className="text-emerald-900 font-bold">{selectedBuyer.budget.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {loadingMatches ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-slate-500 text-sm font-medium">Searching inventories...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                  <Building className="w-12 h-12 text-slate-300 mb-3" />
                  <h4 className="font-extrabold text-slate-900 mb-1">No Matching Properties Found</h4>
                  <p className="text-slate-500 text-sm max-w-xs font-medium">
                    No active sellers are offering a {selectedBuyer.property_type.replace(/_/g, ' ')} in {selectedBuyer.area.replace(/_/g, ' ')}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Check className="w-4 h-4" /> {matches.length} Matches Found
                  </p>
                  {matches.map((seller) => (
                    <div key={seller.id} className="p-5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl space-y-4 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">{seller.name}</h4>
                          <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold mt-1">Seller Inventory</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 font-bold block">Expected Price</span>
                          <span className="text-base font-extrabold text-emerald-600 flex items-center justify-end gap-0.5 mt-0.5">
                            <DollarSign className="w-4 h-4" /> {seller.price.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="space-y-1">
                          <span className="text-slate-500 font-bold block">Phone</span>
                          <a href={`tel:${seller.phone}`} className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {seller.phone}
                          </a>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 font-bold block">WhatsApp</span>
                          <a
                            href={buildWaLink(seller.phone, `Namaste ${seller.name}! Aapki property ke liye ek interested buyer hai. Kya hum discuss kar sakte hain?`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-emerald-700 hover:text-emerald-600 flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-white flex gap-4">
              <button onClick={() => setSelectedBuyer(null)} className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold rounded-xl transition-colors text-sm shadow-sm">
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
