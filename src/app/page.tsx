import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import LeadForms from '@/app/components/LeadForms';
import { ShieldCheck, ArrowUpRight, Zap, Target, Lock } from 'lucide-react';

export const revalidate = 0; // Disable server rendering cache for fully dynamic options

const MOCK_FALLBACK_OPTIONS = [
  { category: 'property_type', value: 'apartment', display_name: 'Apartment / Flat' },
  { category: 'property_type', value: 'villa', display_name: 'Villa / Independent House' },
  { category: 'property_type', value: 'plot', display_name: 'Residential Plot / Land' },
  { category: 'city_area', value: 'downtown', display_name: 'Downtown / City Center' },
  { category: 'city_area', value: 'uptown', display_name: 'Uptown Heights' },
  { category: 'city_area', value: 'suburbs', display_name: 'Green Suburbs' },
  { category: 'budget_range', value: 'under_50k', display_name: 'Under $50,000' },
  { category: 'budget_range', value: '100k_250k', display_name: '$100,000 - $250,000' },
  { category: 'budget_range', value: '250k_500k', display_name: '$250,000 - $500,000' },
  { category: 'budget_range', value: '1m_plus', display_name: '$1,000,000+' }
];

async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('category, value, display_name')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Could not fetch settings from Supabase, using mock fallback settings.');
      return MOCK_FALLBACK_OPTIONS;
    }
    return data;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return MOCK_FALLBACK_OPTIONS;
  }
}

export default async function Home() {
  const options = await getSystemSettings();

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px]" />
      </div>

      {/* Header Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            BuyerSeller CRM
          </span>
        </div>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200 font-semibold rounded-xl text-sm transition-all duration-300 flex items-center gap-1.5 shadow-md"
        >
          <Lock className="w-3.5 h-3.5" /> Admin Portal <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Hero & Lead Collection Form */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Content & Selling Point */}
        <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Secure Dealmaker Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Find Your Match <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Without the Leak.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            Submit your property criteria securely. Our closed-loop CRM connects buyers and sellers directly. Absolutely zero listings or client contact information are exposed to the public.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 pt-4">
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-200">Closed Loop</h4>
                <p className="text-xs text-slate-400 mt-0.5">Only verified matches are processed by admins.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-200">Zero Bypass</h4>
                <p className="text-xs text-slate-400 mt-0.5">Contacts are never published, avoiding agent bypass.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Dynamic Lead Form */}
        <div className="lg:col-span-7 w-full flex justify-center">
          <LeadForms options={options} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-950 py-8 bg-slate-950/40 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} BuyerSeller Property CRM. All rights reserved.</p>
      </footer>
    </div>
  );
}
