import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PropertyListings from '@/app/components/PropertyListings';
import { ShieldCheck, ArrowUpRight, Lock, Database, TrendingUp, PlusCircle } from 'lucide-react';

export const revalidate = 0;

async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('category, value, display_name')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data;
  } catch { return null; }
}

async function getPublicListings() {
  try {
    const { data, error } = await supabase
      .from('sellers_inventory')
      .select('id, property_type, city, state, area, price, notes, created_at')
      .in('status', ['new_lead', 'contacted'])
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) return [];
    return data || [];
  } catch { return []; }
}

export default async function Home() {
  const [options, listings] = await Promise.all([
    getSystemSettings(),
    getPublicListings(),
  ]);

  const dbOk = options !== null;

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow shadow-blue-600/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
              BuyerSeller CRM
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Live count pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              {listings.length} Live
            </div>

            {/* Sell button — navigates to /sell page */}
            {dbOk && (
              <Link
                href="/sell"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow shadow-blue-600/30"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Apni Property List Karo</span>
                <span className="sm:hidden">Sell</span>
              </Link>
            )}

            {/* Admin */}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-lg text-xs transition-all shadow-sm"
            >
              <Lock className="w-3 h-3" /> Admin <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero strip ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Gujarat Property — Browse &amp; Buy
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mt-2 font-medium max-w-lg mx-auto">
            Pasand ki property pe click karo, sirf naam aur number dalo — hamari team connect karegi.
            Seller ka number kabhi nahi milega directly. 🔒
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur border border-white/20 rounded-full text-xs font-bold">
              ✅ Sirf naam + number
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur border border-white/20 rounded-full text-xs font-bold">
              🔒 Contact 100% private
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur border border-white/20 rounded-full text-xs font-bold">
              ⚡ Admin verified match
            </span>
          </div>
        </div>
      </div>

      {/* ── Listings ────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!dbOk ? (
          <div className="max-w-lg mx-auto bg-white border border-rose-200 rounded-2xl shadow p-8 text-center space-y-4">
            <Database className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Database Not Configured</h3>
            <p className="text-slate-500 text-sm">Run <code className="bg-slate-100 px-1 rounded">schema.sql</code> in Supabase SQL editor and refresh.</p>
          </div>
        ) : (
          <PropertyListings listings={listings} dbOptions={options!} />
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} BuyerSeller Property CRM &nbsp;·&nbsp;
          Seller ka contact kabhi publicly nahi dikhaya jata &nbsp;·&nbsp;
          <Link href="/login" className="text-blue-600 hover:underline">Admin</Link>
        </p>
      </footer>
    </div>
  );
}
