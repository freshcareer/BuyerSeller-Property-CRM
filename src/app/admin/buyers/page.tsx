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
  RefreshCw
} from 'lucide-react';

export default function BuyersDemand() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Matching panel state
  const [selectedBuyer, setSelectedBuyer] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ id: string; status: 'success' | 'error' | null }>({ id: '', status: null });

  const fetchBuyersData = async () => {
    try {
      setLoading(true);
      
      // Fetch buyers
      const { data: buyersData, error: buyersErr } = await supabase
        .from('buyers_demand')
        .select('*')
        .order('created_at', { ascending: false });

      if (buyersErr) throw buyersErr;
      setBuyers(buyersData || []);

      // Fetch dynamic statuses
      const { data: statusData, error: statusErr } = await supabase
        .from('system_settings')
        .select('value, display_name')
        .eq('category', 'lead_status')
        .order('sort_order', { ascending: true });

      if (statusErr) throw statusErr;
      setStatuses(statusData || []);

    } catch (err) {
      console.error('Error fetching buyers demand list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyersData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionStatus({ id, status: null });
    try {
      const { error } = await supabase
        .from('buyers_demand')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setBuyers(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      setActionStatus({ id, status: 'success' });
      setTimeout(() => setActionStatus({ id: '', status: null }), 2000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setActionStatus({ id, status: 'error' });
    }
  };

  const handleFindMatches = async (buyer: any) => {
    setSelectedBuyer(buyer);
    setLoadingMatches(true);
    setMatches([]);
    
    try {
      // Find matching seller inventories
      // Matching criteria: Area exact match, Property Type exact match
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

  const filteredBuyers = buyers.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.phone.includes(searchQuery) ||
    b.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.property_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-screen pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" /> Buyers Demand
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage buyer leads, log interactions, and perform direct matchmaking.
          </p>
        </div>
        <button 
          onClick={fetchBuyersData}
          className="self-start sm:self-center px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4 text-blue-600" /> Refresh Data
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3">
        <Search className="w-5 h-5 text-slate-400 mr-3" />
        <input
          type="text"
          placeholder="Filter by name, phone, area, or property type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm outline-none w-full"
        />
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">Fetching buyers demand list...</p>
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="text-center py-20 text-slate-500 space-y-2">
            <p className="text-lg font-bold">No buyer requirements found.</p>
            <p className="text-sm font-medium">New leads submitted from the homepage will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wide text-xs">
                  <th className="px-6 py-4">Client Detail</th>
                  <th className="px-6 py-4">Preferred Area</th>
                  <th className="px-6 py-4">Property Type</th>
                  <th className="px-6 py-4">Budget Range</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-slate-50 transition-colors">
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
                    
                    {/* Preferred Area */}
                    <td className="px-6 py-4 capitalize font-bold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {buyer.area.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Property Type */}
                    <td className="px-6 py-4 capitalize text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-slate-400" />
                        {buyer.property_type.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Budget Range */}
                    <td className="px-6 py-4 text-emerald-700 font-bold">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {buyer.budget.replace('_', ' ').replace('under ', '< ').replace('plus', '+')}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={buyer.status}
                          onChange={(e) => handleStatusChange(buyer.id, e.target.value)}
                          className={`bg-white border text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none transition-all duration-300 cursor-pointer shadow-sm ${
                            buyer.status === 'new_lead' ? 'border-blue-200 text-blue-700 focus:ring-2 focus:ring-blue-100' :
                            buyer.status === 'contacted' ? 'border-amber-200 text-amber-700 focus:ring-2 focus:ring-amber-100' :
                            buyer.status === 'closed_won' ? 'border-emerald-200 text-emerald-700 focus:ring-2 focus:ring-emerald-100' :
                            'border-slate-200 text-slate-700 focus:ring-2 focus:ring-slate-100'
                          }`}
                        >
                          {statuses.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.display_name}
                            </option>
                          ))}
                        </select>
                        {actionStatus.id === buyer.id && (
                          <span className="text-xs">
                            {actionStatus.status === 'success' && <Check className="w-4 h-4 text-emerald-600" />}
                            {actionStatus.status === 'error' && <span className="text-rose-500">❌</span>}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleFindMatches(buyer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-all duration-300"
                      >
                        <GitCompare className="w-3.5 h-3.5" /> Match
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Matchmaking Slide-over Panel (Drawer) */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-350">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-blue-600" /> Matchmaker Panel
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Matches found for buyer requirement <strong className="text-slate-700">{selectedBuyer.name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedBuyer(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer Criteria Summary */}
            <div className="p-6 bg-white border-b border-slate-100 flex flex-wrap gap-4 text-sm shadow-sm z-10">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-bold">Area:</span>
                <span className="text-slate-900 capitalize font-bold">{selectedBuyer.area.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-bold">Property:</span>
                <span className="text-slate-900 capitalize font-bold">{selectedBuyer.property_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-700 font-bold">Budget:</span>
                <span className="text-emerald-900 font-bold">{selectedBuyer.budget.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Matches Content List */}
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
                    No active sellers are offering a {selectedBuyer.property_type.replace('_', ' ')} in {selectedBuyer.area.replace('_', ' ')}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Check className="w-4 h-4" /> {matches.length} Matches Found
                  </p>
                  
                  {matches.map((seller) => (
                    <div 
                      key={seller.id}
                      className="p-5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl space-y-4 transition-all duration-300"
                    >
                      {/* Name / Price */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">{seller.name}</h4>
                          <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold mt-1">
                            Seller Inventory
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 font-bold block">Expected Price</span>
                          <span className="text-base font-extrabold text-emerald-600 flex items-center justify-end gap-0.5 mt-0.5">
                            <DollarSign className="w-4 h-4" /> {seller.price.replace('_', ' ').replace('under ', '< ').replace('plus', '+')}
                          </span>
                        </div>
                      </div>

                      {/* Contact Box */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="space-y-1">
                          <span className="text-slate-500 font-bold block">Contact Phone</span>
                          <a href={`tel:${seller.phone}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {seller.phone}
                          </a>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 font-bold block">Contact Email</span>
                          {seller.email ? (
                            <a href={`mailto:${seller.email}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-slate-400" /> {seller.email}
                            </a>
                          ) : (
                            <span className="text-slate-400 font-medium">Not provided</span>
                          )}
                        </div>
                      </div>

                      {/* Status & Notes */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-bold">Status:</span>
                          <span className={`font-bold capitalize ${
                            seller.status === 'new_lead' ? 'text-indigo-600' :
                            seller.status === 'contacted' ? 'text-amber-600' :
                            'text-emerald-600'
                          }`}>
                            {seller.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {seller.notes && (
                          <div className="text-[11px] text-slate-600 font-medium italic max-w-[200px] truncate" title={seller.notes}>
                            Note: {seller.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-200 bg-white flex gap-4">
              <button 
                onClick={() => setSelectedBuyer(null)}
                className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold rounded-xl transition-colors text-sm shadow-sm"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
