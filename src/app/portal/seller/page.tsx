'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Building2, MapPin, Tag, AlertCircle } from 'lucide-react';

export default function SellerDashboard() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      const { data } = await supabase
        .from('sellers_inventory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) setInventory(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-extrabold text-slate-900">My Listed Properties</h2>
        </div>

        {inventory.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-3xl border border-indigo-100 p-10 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />
            <div className="w-16 h-16 bg-white shadow-sm border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <Building2 className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2 relative z-10">No properties listed yet</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto relative z-10">Ready to sell? Submit your property details on the home page and we will connect you with verified buyers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((prop) => (
              <div key={prop.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-extrabold text-lg text-slate-900 capitalize">{prop.property_type.replace('_', ' ')}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    prop.status === 'new_lead' ? 'bg-amber-100 text-amber-700' :
                    prop.status === 'closed_won' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {prop.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                    <span className="font-medium text-sm">{prop.area}, {prop.city}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Tag className="w-5 h-5 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-900">{prop.price.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Listed on {new Date(prop.created_at).toLocaleDateString()}</span>
                </div>

                {prop.status === 'new_lead' && (
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <p className="text-xs text-indigo-800 font-medium leading-relaxed">Your property is under review. Our team will contact you to verify details before making it public.</p>
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
