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
  ChevronRight,
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
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-400" /> Buyers Demand
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage buyer leads, log interactions, and perform direct matchmaking.
          </p>
        </div>
        <button 
          onClick={fetchBuyersData}
          className="self-start sm:self-center px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-sm font-semibold text-slate-300 flex items-center gap-2 transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3">
        <Search className="w-5 h-5 text-slate-500 mr-3" />
        <input
          type="text"
          placeholder="Filter by name, phone, area, or property type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-white placeholder-slate-500 text-sm outline-none w-full"
        />
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Fetching buyers demand list...</p>
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="text-center py-20 text-slate-500 space-y-2">
            <p className="text-lg font-semibold">No buyer requirements found.</p>
            <p className="text-sm">New leads submitted from the homepage will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4">Client Detail</th>
                  <th className="px-6 py-4">Preferred Area</th>
                  <th className="px-6 py-4">Property Type</th>
                  <th className="px-6 py-4">Budget Range</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-slate-900/30 transition-colors">
                    {/* Client Detail */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{buyer.name}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-slate-450 mt-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {buyer.phone}</span>
                        {buyer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {buyer.email}</span>}
                      </div>
                      {buyer.notes && (
                        <div className="text-xs text-slate-500 mt-2 italic bg-slate-900/60 p-2 rounded border border-slate-800/40 max-w-xs">
                          Note: {buyer.notes}
                        </div>
                      )}
                    </td>
                    
                    {/* Preferred Area */}
                    <td className="px-6 py-4 capitalize font-medium text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-550" />
                        {buyer.area.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Property Type */}
                    <td className="px-6 py-4 capitalize text-slate-350">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-slate-550" />
                        {buyer.property_type.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Budget Range */}
                    <td className="px-6 py-4 text-slate-300 font-semibold">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        {buyer.budget.replace('_', ' ').replace('under ', '< ').replace('plus', '+')}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={buyer.status}
                          onChange={(e) => handleStatusChange(buyer.id, e.target.value)}
                          className={`bg-slate-900 border text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none transition-all duration-300 cursor-pointer ${
                            buyer.status === 'new_lead' ? 'border-indigo-500/35 text-indigo-400 focus:ring-1 focus:ring-indigo-500' :
                            buyer.status === 'contacted' ? 'border-amber-500/35 text-amber-400 focus:ring-1 focus:ring-amber-500' :
                            buyer.status === 'closed_won' ? 'border-emerald-500/35 text-emerald-400 focus:ring-1 focus:ring-emerald-500' :
                            'border-slate-800 text-slate-300 focus:ring-1 focus:ring-slate-500'
                          }`}
                        >
                          {statuses.map((s) => (
                            <option key={s.value} value={s.value} className="bg-slate-900 text-slate-200">
                              {s.display_name}
                            </option>
                          ))}
                        </select>
                        {actionStatus.id === buyer.id && (
                          <span className="text-xs">
                            {actionStatus.status === 'success' && <Check className="w-4 h-4 text-emerald-450" />}
                            {actionStatus.status === 'error' && <span className="text-rose-500">❌</span>}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleFindMatches(buyer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow hover:shadow-indigo-500/20 transition-all duration-300"
                      >
                        <GitCompare className="w-3.5 h-3.5" /> Match Inventory
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
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-350">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-indigo-400" /> Matchmaker Panel
                </h3>
                <p className="text-xs text-slate-500">
                  Matches found for buyer requirement <strong>{selectedBuyer.name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedBuyer(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer Criteria Summary */}
            <div className="p-6 bg-slate-950/20 border-b border-slate-850 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-slate-450 font-medium">Area:</span>
                <span className="text-white capitalize font-semibold">{selectedBuyer.area.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <Building className="w-4 h-4 text-slate-500" />
                <span className="text-slate-450 font-medium">Property:</span>
                <span className="text-white capitalize font-semibold">{selectedBuyer.property_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-slate-450 font-medium">Budget:</span>
                <span className="text-white font-semibold">{selectedBuyer.budget.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Matches Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMatches ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                  <p className="text-slate-450 text-sm">Searching inventories...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed border-slate-800 rounded-2xl">
                  <Building className="w-12 h-12 text-slate-700 mb-3" />
                  <h4 className="font-bold text-white mb-1">No Matching Properties Found</h4>
                  <p className="text-slate-500 text-sm max-w-xs">
                    No active sellers are offering a {selectedBuyer.property_type.replace('_', ' ')} in {selectedBuyer.area.replace('_', ' ')}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-emerald-450 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Check className="w-4 h-4" /> {matches.length} Matches Found
                  </p>
                  
                  {matches.map((seller) => (
                    <div 
                      key={seller.id}
                      className="p-5 bg-slate-950/40 border border-slate-800 hover:border-indigo-500/40 rounded-xl space-y-4 transition-all duration-300"
                    >
                      {/* Name / Price */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white text-base">{seller.name}</h4>
                          <span className="inline-block px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-bold mt-1">
                            Seller Inventory
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Expected Price</span>
                          <span className="text-base font-bold text-emerald-400 flex items-center justify-end gap-0.5 mt-0.5">
                            <DollarSign className="w-4 h-4" /> {seller.price.replace('_', ' ').replace('under ', '< ').replace('plus', '+')}
                          </span>
                        </div>
                      </div>

                      {/* Contact Box */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                        <div className="space-y-1">
                          <span className="text-slate-500 block">Contact Phone</span>
                          <a href={`tel:${seller.phone}`} className="font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {seller.phone}
                          </a>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 block">Contact Email</span>
                          {seller.email ? (
                            <a href={`mailto:${seller.email}`} className="font-semibold text-white hover:text-indigo-400 transition-colors flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3" /> {seller.email}
                            </a>
                          ) : (
                            <span className="text-slate-600">Not provided</span>
                          )}
                        </div>
                      </div>

                      {/* Status & Notes */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Status:</span>
                          <span className={`font-semibold capitalize ${
                            seller.status === 'new_lead' ? 'text-violet-400' :
                            seller.status === 'contacted' ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {seller.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {seller.notes && (
                          <div className="text-[11px] text-slate-500 italic max-w-[200px] truncate" title={seller.notes}>
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
            <div className="p-6 border-t border-slate-800 bg-slate-950/20 flex gap-4">
              <button 
                onClick={() => setSelectedBuyer(null)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 font-bold rounded-lg transition-colors text-sm"
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
