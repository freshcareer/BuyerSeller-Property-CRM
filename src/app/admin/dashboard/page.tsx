/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
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
    closedBuyers: 0,
    totalSellers: 0,
    newSellers: 0,
    contactedSellers: 0,
    visitsSellers: 0,
    closedSellers: 0,
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
          closedBuyers: bData.filter(b => b.status === 'closed_won').length,
          
          totalSellers: sData.length,
          newSellers: sData.filter(s => s.status === 'new_lead').length,
          contactedSellers: sData.filter(s => s.status === 'contacted').length,
          visitsSellers: sData.filter(s => s.status === 'visit_done' || s.status === 'site_visit').length,
          closedSellers: sData.filter(s => s.status === 'closed_won').length,
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
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Execution Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1.5 font-medium">
          Monitor active lead engagement stages, client communications, and site operations.
        </p>
      </div>

      {/* Grid: Buyers vs Sellers Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Buyers Demand Progress Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">Buyers Requirements</h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">Execution tracking for active demands</p>
              </div>
            </div>
            <Link href="/admin/buyers" className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 transition-all hover:translate-x-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg">
              Manage Buyers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide block">Total</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1">{stats.totalBuyers}</span>
            </div>
            <div className={`p-4 rounded-xl border ${stats.newBuyers > 0 ? 'bg-rose-50 border-rose-200 shadow-sm shadow-rose-100' : 'bg-blue-50/50 border-blue-100'}`}>
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold uppercase tracking-wide block ${stats.newBuyers > 0 ? 'text-rose-600' : 'text-blue-600'}`}>New Leads</span>
                {stats.newBuyers > 0 && <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />}
              </div>
              <span className={`text-2xl font-extrabold block mt-1 ${stats.newBuyers > 0 ? 'text-rose-700' : 'text-blue-700'}`}>{stats.newBuyers}</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-600 font-bold uppercase tracking-wide block">Contacted</span>
              <span className="text-2xl font-extrabold text-amber-700 block mt-1">{stats.contactedBuyers}</span>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
              <span className="text-xs text-purple-600 font-bold uppercase tracking-wide block">Deals Closed</span>
              <span className="text-2xl font-extrabold text-purple-700 block mt-1">{stats.closedBuyers}</span>
            </div>
          </div>

          {/* Conversion Funnel Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Brokerage Conversion Rate</span>
              <span className="text-purple-600">{stats.totalBuyers > 0 ? Math.round((stats.closedBuyers / stats.totalBuyers) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div 
                className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${stats.totalBuyers > 0 ? Math.round((stats.closedBuyers / stats.totalBuyers) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sellers Inventory Progress Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-indigo-900/10 transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">Sellers Inventories</h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">Execution tracking for properties</p>
              </div>
            </div>
            <Link href="/admin/sellers" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 transition-all hover:translate-x-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">
              Manage Sellers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide block">Total</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1">{stats.totalSellers}</span>
            </div>
            <div className={`p-4 rounded-xl border ${stats.newSellers > 0 ? 'bg-rose-50 border-rose-200 shadow-sm shadow-rose-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold uppercase tracking-wide block ${stats.newSellers > 0 ? 'text-rose-600' : 'text-indigo-600'}`}>New Leads</span>
                {stats.newSellers > 0 && <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />}
              </div>
              <span className={`text-2xl font-extrabold block mt-1 ${stats.newSellers > 0 ? 'text-rose-700' : 'text-indigo-700'}`}>{stats.newSellers}</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-600 font-bold uppercase tracking-wide block">Contacted</span>
              <span className="text-2xl font-extrabold text-amber-700 block mt-1">{stats.contactedSellers}</span>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
              <span className="text-xs text-purple-600 font-bold uppercase tracking-wide block">Deals Closed</span>
              <span className="text-2xl font-extrabold text-purple-700 block mt-1">{stats.closedSellers}</span>
            </div>
          </div>

          {/* Conversion Funnel Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Brokerage Conversion Rate</span>
              <span className="text-purple-600">{stats.totalSellers > 0 ? Math.round((stats.closedSellers / stats.totalSellers) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div 
                className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${stats.totalSellers > 0 ? Math.round((stats.closedSellers / stats.totalSellers) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/buyers" className="group p-5 bg-white/80 backdrop-blur-md border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 rounded-2xl flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-blue-600 group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-white transition-all shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900">Interactive Matchmaker</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Pair buyers with seller listings instantly</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link href="/admin/settings" className="group p-5 bg-white/80 backdrop-blur-md border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 rounded-2xl flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl text-indigo-600 group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white transition-all shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900">Dynamic Forms Options</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage Property Types, Areas & Budgets</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link href="/admin/calendar" className="group p-5 bg-white/80 backdrop-blur-md border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 rounded-2xl flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl text-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-500 group-hover:text-white transition-all shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900">Operations Calendar</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">All dates driven by lead follow-up events</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Grid: Recent Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Recent Buyers Demand */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl shadow-slate-900/5">
          <h3 className="font-extrabold text-lg text-slate-900">Recent Buyers Requirements</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Area</th>
                  <th className="py-4 px-4">Property</th>
                  <th className="py-4 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-slate-500 font-medium">No buyer leads registered.</td>
                  </tr>
                ) : (
                  recentBuyers.map((buyer) => (
                    <tr key={buyer.id} className="text-slate-600 hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{buyer.name}</td>
                      <td className="py-3.5 px-4 capitalize font-medium">{buyer.area.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 capitalize font-medium">{buyer.property_type.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full ${
                          buyer.status === 'new_lead' ? 'bg-blue-100/50 text-blue-700 border border-blue-200/50' :
                          buyer.status === 'contacted' ? 'bg-amber-100/50 text-amber-700 border border-amber-200/50' :
                          'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50'
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
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl shadow-slate-900/5">
          <h3 className="font-extrabold text-lg text-slate-900">Recent Sellers Inventories</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Area</th>
                  <th className="py-4 px-4">Property</th>
                  <th className="py-4 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSellers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-slate-500 font-medium">No seller leads registered.</td>
                  </tr>
                ) : (
                  recentSellers.map((seller) => (
                    <tr key={seller.id} className="text-slate-600 hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{seller.name}</td>
                      <td className="py-3.5 px-4 capitalize font-medium">{seller.area.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 capitalize font-medium">{seller.property_type.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full ${
                          seller.status === 'new_lead' ? 'bg-blue-100/50 text-blue-700 border border-blue-200/50' :
                          seller.status === 'contacted' ? 'bg-amber-100/50 text-amber-700 border border-amber-200/50' :
                          'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50'
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
