'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Settings,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBuyers: 0,
    newBuyers: 0,
    contactedBuyers: 0,
    visitsBuyers: 0,
    totalSellers: 0,
    newSellers: 0,
    contactedSellers: 0,
    visitsSellers: 0,
  });
  const [recentBuyers, setRecentBuyers] = useState<any[]>([]);
  const [recentSellers, setRecentSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch Buyers stats
        const { data: buyers, error: buyersErr } = await supabase
          .from('buyers_demand')
          .select('status, created_at');

        // Fetch Sellers stats
        const { data: sellers, error: sellersErr } = await supabase
          .from('sellers_inventory')
          .select('status, created_at');

        if (buyersErr) throw buyersErr;
        if (sellersErr) throw sellersErr;

        const bData = buyers || [];
        const sData = sellers || [];

        setStats({
          totalBuyers: bData.length,
          newBuyers: bData.filter(b => b.status === 'new_lead').length,
          contactedBuyers: bData.filter(b => b.status === 'contacted').length,
          visitsBuyers: bData.filter(b => b.status === 'visit_done' || b.status === 'site_visit').length,
          
          totalSellers: sData.length,
          newSellers: sData.filter(s => s.status === 'new_lead').length,
          contactedSellers: sData.filter(s => s.status === 'contacted').length,
          visitsSellers: sData.filter(s => s.status === 'visit_done' || s.status === 'site_visit').length,
        });

        // Fetch 5 most recent buyers
        const { data: recBuyers } = await supabase
          .from('buyers_demand')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch 5 most recent sellers
        const { data: recSellers } = await supabase
          .from('sellers_inventory')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentBuyers(recBuyers || []);
        setRecentSellers(recSellers || []);

      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-900">
        <Clock className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading execution statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Execution Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Monitor active lead engagement stages, client communications, and site operations.
        </p>
      </div>

      {/* Grid: Buyers vs Sellers Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Buyers Demand Progress Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Buyers Requirements</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Execution tracking for active demands</p>
              </div>
            </div>
            <Link href="/admin/buyers" className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors">
              Manage Buyers <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide block">Total</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1">{stats.totalBuyers}</span>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-1">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wide block">New</span>
                <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-2xl font-extrabold text-blue-700 block mt-1">{stats.newBuyers}</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-600 font-bold uppercase tracking-wide block">Contacted</span>
              <span className="text-2xl font-extrabold text-amber-700 block mt-1">{stats.contactedBuyers}</span>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-600 font-bold uppercase tracking-wide block">Visits</span>
              <span className="text-2xl font-extrabold text-emerald-700 block mt-1">{stats.visitsBuyers}</span>
            </div>
          </div>
        </div>

        {/* Sellers Inventory Progress Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Sellers Inventories</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Execution tracking for properties</p>
              </div>
            </div>
            <Link href="/admin/sellers" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors">
              Manage Sellers <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide block">Total</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1">{stats.totalSellers}</span>
            </div>
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-1">
                <span className="text-xs text-indigo-600 font-bold uppercase tracking-wide block">New</span>
                <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="text-2xl font-extrabold text-indigo-700 block mt-1">{stats.newSellers}</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-600 font-bold uppercase tracking-wide block">Contacted</span>
              <span className="text-2xl font-extrabold text-amber-700 block mt-1">{stats.contactedSellers}</span>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-600 font-bold uppercase tracking-wide block">Visits</span>
              <span className="text-2xl font-extrabold text-emerald-700 block mt-1">{stats.visitsSellers}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/buyers" className="group p-5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Interactive Matchmaker</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Pair buyers with seller listings instantly</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link href="/admin/settings" className="group p-5 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-xl flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Dynamic Forms Options</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage Property Types, Areas & Budgets</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Operations Calendar</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">All dates driven by lead follow-up events</p>
          </div>
        </div>
      </div>

      {/* Grid: Recent Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Recent Buyers Demand */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900">Recent Buyers Requirements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wide text-xs">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Area</th>
                  <th className="pb-3">Property</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 font-medium">No buyer leads registered.</td>
                  </tr>
                ) : (
                  recentBuyers.map((buyer) => (
                    <tr key={buyer.id} className="text-slate-600 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{buyer.name}</td>
                      <td className="py-3 capitalize">{buyer.area.replace('_', ' ')}</td>
                      <td className="py-3 capitalize">{buyer.property_type.replace('_', ' ')}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                          buyer.status === 'new_lead' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          buyer.status === 'contacted' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {buyer.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sellers Inventory */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900">Recent Sellers Inventories</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wide text-xs">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Area</th>
                  <th className="pb-3">Property</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSellers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 font-medium">No seller leads registered.</td>
                  </tr>
                ) : (
                  recentSellers.map((seller) => (
                    <tr key={seller.id} className="text-slate-600 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{seller.name}</td>
                      <td className="py-3 capitalize">{seller.area.replace('_', ' ')}</td>
                      <td className="py-3 capitalize">{seller.property_type.replace('_', ' ')}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                          seller.status === 'new_lead' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          seller.status === 'contacted' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {seller.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
