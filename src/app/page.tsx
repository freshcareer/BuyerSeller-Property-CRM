import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import LeadForms from '@/app/components/LeadForms';
import PropertyListings from '@/app/components/PropertyListings';
import { ShieldCheck, ArrowUpRight, Lock, Database, Home, TrendingUp, Users } from 'lucide-react';

export const revalidate = 0;

async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('category, value, display_name')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return null;
    return data;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return null;
  }
}

async function getPublicListings() {
  try {
    const { data, error } = await supabase
      .from('sellers_inventory')
      .select('id, property_type, city, state, area, price, notes, created_at')
      .in('status', ['new_lead', 'contacted'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch listings:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Listings fetch error:', err);
    return [];
  }
}

export default async function Home() {
  const [options, listings] = await Promise.all([
    getSystemSettings(),
    getPublicListings(),
  ]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500/30">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/60 via-slate-50 to-slate-50" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              BuyerSeller CRM
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              {listings.length} Live Properties
            </div>

            <Link
              href="/login"
              className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all duration-300 flex items-center gap-1.5 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden">Admin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero + Form Section ─────────────────────────────────────────────── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-14 md:pt-14 md:pb-20">
        
        {/* Tagline row */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Home className="w-3.5 h-3.5 text-blue-500" /> Gujarat&apos;s Trusted Property Platform
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            Gujarat Property<br />
            <span className="text-blue-600">Buyers &amp; Sellers Meet.</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg mt-3 max-w-xl mx-auto font-medium">
            Apni requirement submit karein — humare admin verified matches se connect karenge. 
            Koi direct bypass nahi, privacy 100% protected.
          </p>
        </div>

        {/* Form — full width on mobile, max-2xl centered */}
        {options === null ? (
          <div className="max-w-2xl mx-auto bg-white border border-rose-200 rounded-2xl shadow-xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
              <Database className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Database Not Configured</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              The application cannot connect to the Supabase database or the tables are empty.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 border border-slate-200 text-left mt-6">
              <strong className="block mb-2 text-slate-900">How to fix this:</strong>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to your Supabase Dashboard.</li>
                <li>Open the SQL Editor.</li>
                <li>Paste and run the contents of <code>schema.sql</code>.</li>
                <li>Refresh this page.</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <LeadForms options={options} />
          </div>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Verified Admin Matching
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Contact Details 100% Private
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            No Bypass, No Commission Leak
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-white border-y border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-center text-lg font-extrabold text-slate-900 mb-6 uppercase tracking-wide">
            Kaise Kaam Karta Hai?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Apni Detail Submit Karo', desc: 'Buyer ya seller — apna requirement form mein fill karo. Contact details sirf hamare paas safe rehti hai.', color: 'blue' },
              { step: '2', title: 'Admin Match Karta Hai', desc: 'Hamari team verified buyers aur sellers ko carefully match karti hai. Koi random connection nahi.', color: 'indigo' },
              { step: '3', title: 'Direct Connect', desc: 'Match hone par admin aapko personally contact karta hai. Privacy aur trust guaranteed.', color: 'emerald' },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className={`w-10 h-10 rounded-full bg-${item.color}-100 border-2 border-${item.color}-300 text-${item.color}-700 font-extrabold text-lg flex items-center justify-center mx-auto`}>
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property Listings ───────────────────────────────────────────────── */}
      <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wide mb-3">
              <Users className="w-3.5 h-3.5" /> Live Listings
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Available Properties
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium max-w-lg">
              Neeche seller ki available properties hain. Contact details chhupe hain — interested hone par 
              &quot;I&apos;m Interested&quot; dabao, admin connect karega.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
            🔒 Phone &amp; Address Hidden for Privacy
          </div>
        </div>

        <PropertyListings listings={listings} />
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t border-slate-200 py-6 bg-white text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} BuyerSeller Property CRM. All rights reserved.</p>
        <p className="text-xs mt-1 text-slate-400">Contact details are never shared publicly. All matches are admin-verified.</p>
      </footer>
    </div>
  );
}
