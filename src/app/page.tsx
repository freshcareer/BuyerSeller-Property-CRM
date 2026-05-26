import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PropertyListings from '@/app/components/PropertyListings';
import LeadForms from '@/app/components/LeadForms';
import { ShieldCheck, ArrowUpRight, Lock, Database, TrendingUp, CheckCircle2 } from 'lucide-react';

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
    <div className="flex-1 min-h-screen bg-white text-slate-900 flex flex-col scroll-smooth">

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
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              {listings.length} Live
            </div>
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-lg text-xs transition-all shadow-sm"
            >
              <Lock className="w-3 h-3" /> Admin <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section (99acres inspired layout) ───────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {!dbOk ? (
            <div className="max-w-lg mx-auto bg-white border border-rose-200 rounded-2xl shadow p-8 text-center space-y-4">
              <Database className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Database Not Configured</h3>
              <p className="text-slate-500 text-sm">Run <code className="bg-slate-100 px-1 rounded">schema.sql</code> in Supabase SQL editor and refresh.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Side: Value Prop (Text) */}
              <div className="lg:col-span-5 lg:pt-10 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  Fast & Secure
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                  Apni Property List Karo, Sahi Buyer Pao
                </h1>
                <p className="text-slate-600 text-sm sm:text-base font-medium max-w-md mx-auto lg:mx-0">
                  Aapki property directly website par dikhegi. Lekin aapka naam aur number 100% private rahega. Koi pareshan nahi karega.
                </p>

                <div className="space-y-4 pt-4 text-left max-w-sm mx-auto lg:mx-0">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700">100% Contact Privacy <br/><span className="text-xs font-medium text-slate-500">Number aur address public nahi hota.</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700">Verified Matchmaking <br/><span className="text-xs font-medium text-slate-500">Sirf genuine buyers se hi connect karenge.</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700">No Direct Bypass <br/><span className="text-xs font-medium text-slate-500">Aapka control hamesha aapke paas.</span></p>
                  </div>
                </div>
              </div>

              {/* Right Side: Lead Form (Sell Tab) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-200">
                  {/* Keep the tabs completely hidden by passing hideTabs={true} and force defaultTab to sell */}
                  <LeadForms options={options!} defaultTab="sell" hideTabs={true} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Listings Section (Recently Posted) ───────────────────────── */}
      {dbOk && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Recently Posted Properties
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Kharidne ke liye property dhundhein. Pasand aane par &quot;Mujhe Chahiye&quot; click karein.
            </p>
          </div>
          
          <PropertyListings listings={listings} dbOptions={options!} />
        </main>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-10 text-center">
        <p className="text-sm text-slate-400 font-medium">
          © {new Date().getFullYear()} BuyerSeller Property CRM
        </p>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Seller ka contact kabhi publicly nahi dikhaya jata &nbsp;·&nbsp;
          <Link href="/login" className="text-blue-600 hover:underline">Admin Login</Link>
        </p>
      </footer>
    </div>
  );
}
