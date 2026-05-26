import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import HomeContent from '@/app/components/HomeContent';
import { ShieldCheck, ArrowUpRight, Lock, Database } from 'lucide-react';

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
    <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-slate-900 flex flex-col scroll-smooth">
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 group cursor-default">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              BuyerSeller CRM
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 bg-white/50 backdrop-blur-sm border border-slate-200 hover:bg-white text-slate-700 hover:text-blue-600 hover:border-blue-200 font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow-md"
            >
              <Lock className="w-3 h-3" /> Admin <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Component ───────────────────────────────────── */}
      {!dbOk ? (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-lg mx-auto bg-white border border-rose-200 rounded-2xl shadow p-8 text-center space-y-4">
            <Database className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Database Not Configured</h3>
            <p className="text-slate-500 text-sm">Run <code className="bg-slate-100 px-1 rounded">schema.sql</code> in Supabase SQL editor and refresh.</p>
          </div>
        </main>
      ) : (
        <HomeContent options={options!} listings={listings} />
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto text-center">
        <p className="text-sm text-slate-400 font-medium">
          © {new Date().getFullYear()} BuyerSeller Property CRM
        </p>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Seller contact details are never shown publicly &nbsp;·&nbsp;
          <Link href="/login" className="text-blue-600 hover:underline">Admin Login</Link>
        </p>
      </footer>
    </div>
  );
}
