import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import LeadForms from '@/app/components/LeadForms';
import { ShieldCheck, ArrowUpRight, Zap, Target, Lock, Database } from 'lucide-react';

export const revalidate = 0; // Disable server rendering cache for fully dynamic options

async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('category, value, display_name')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return null; // Database not seeded
    }
    return data;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return null;
  }
}

export default async function Home() {
  const options = await getSystemSettings();

  return (
    <div className="flex-1 min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500/30">
      {/* Light Professional Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50" />

      {/* Header Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-200 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-600/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            BuyerSeller CRM
          </span>
        </div>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all duration-300 flex items-center gap-1.5 shadow-sm"
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" /> Admin Portal <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Hero & Lead Collection Form */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Content & Selling Point */}
        <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-500" /> Trusted Dealmaker Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Gujarat Property<br />
            <span className="text-blue-600">
              Buyers &amp; Sellers Meet.
            </span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            Property khareedni ya bechni hai? Ahmedabad, Surat, Vadodara aur dusre cities mein apni requirement submit karein. Humare admin aapko verified matches se connect karenge.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 pt-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-900">Closed Loop</h4>
                <p className="text-xs text-slate-500 mt-0.5">Only verified matches are processed by our experts.</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-900">Zero Bypass</h4>
                <p className="text-xs text-slate-500 mt-0.5">Your contacts remain strictly private and secure.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Dynamic Lead Form */}
        <div className="lg:col-span-7 w-full flex justify-center">
          {options === null ? (
            <div className="w-full max-w-2xl bg-white border border-rose-200 rounded-2xl shadow-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Database Not Configured</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                The application cannot connect to the Supabase database or the tables are empty. We have strictly disabled mock data.
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
            <LeadForms options={options} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200 py-8 bg-white text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} BuyerSeller Property CRM. All rights reserved.</p>
      </footer>
    </div>
  );
}
