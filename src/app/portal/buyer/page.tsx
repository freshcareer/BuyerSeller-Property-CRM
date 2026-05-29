'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Heart, Search, MapPin, Building, Calendar, AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react';

export default function BuyerDashboard() {
  const [loading, setLoading] = useState(true);
  const [demands, setDemands] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // Fetch Demands
      const { data: demandsData } = await supabase
        .from('buyers_demand')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Fetch Watchlist
      const { data: watchlistData } = await supabase
        .from('buyer_watchlists')
        .select(`
          id,
          property_id,
          sellers_inventory (
            id,
            property_type,
            city,
            state,
            area,
            price,
            status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (demandsData) setDemands(demandsData);
      if (watchlistData) setWatchlist(watchlistData.map(w => ({ ...w.sellers_inventory, watchlist_id: w.id })));
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const removeWatchlist = async (watchlistId: string) => {
    if (!confirm('Remove this property from your saved list?')) return;
    await supabase.from('buyer_watchlists').delete().eq('id', watchlistId);
    setWatchlist(prev => prev.filter(w => w.watchlist_id !== watchlistId));
  };

  const handleDeleteDemand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;
    try {
      await supabase.from('buyers_demand').delete().eq('id', id);
      setDemands(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete requirement');
    }
  };

  const handleAddRequirement = () => {
    window.location.href = '/#buy';
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Watchlist Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h2 className="text-2xl font-extrabold text-slate-900">My Saved Properties</h2>
        </div>
        
        {watchlist.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-rose-50/50 rounded-3xl border border-rose-100 p-10 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/10 rounded-full blur-2xl" />
            <div className="w-16 h-16 bg-white shadow-sm border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <Heart className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2 relative z-10">No saved properties yet</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto relative z-10">Browse our listings and click the heart icon to save your favorite properties here for easy access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((prop) => (
              <div key={prop.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg uppercase tracking-wider">
                    {prop.property_type.replace('_', ' ')}
                  </div>
                  <button 
                    onClick={() => removeWatchlist(prop.watchlist_id)}
                    className="p-1.5 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors"
                    title="Remove from Watchlist"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                    <span className="font-medium text-sm">{prop.area}, {prop.city}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Building className="w-5 h-5 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-900">{prop.price.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Demands Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-extrabold text-slate-900">My Buying Requests</h2>
          </div>
          <button 
            onClick={handleAddRequirement}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Request
          </button>
        </div>

        {demands.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl border border-blue-100 p-10 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
            <div className="w-16 h-16 bg-white shadow-sm border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <Search className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2 relative z-10">No requests submitted</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto relative z-10 mb-6">Looking for something specific? Submit a requirement and our team will find exact matches for you.</p>
            <button 
              onClick={handleAddRequirement}
              className="relative z-10 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-colors inline-flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" /> Submit a Requirement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demands.map((demand) => (
              <div key={demand.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-extrabold text-lg text-slate-900 capitalize">{demand.property_type.replace('_', ' ')} Requirement</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    demand.status === 'new_lead' ? 'bg-amber-100 text-amber-700' :
                    demand.status === 'closed_won' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {demand.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-slate-500">Location:</div>
                  <div className="font-medium text-slate-900 text-right">{demand.area}, {demand.city}</div>
                  <div className="text-slate-500">Budget:</div>
                  <div className="font-medium text-slate-900 text-right">{demand.budget.replace(/_/g, ' ')}</div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Requested on {new Date(demand.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => alert('Editing requires Admin approval. Please contact support.')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteDemand(demand.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {demand.status === 'new_lead' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">Our team is currently verifying matches for your requirement. We will contact you soon.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
