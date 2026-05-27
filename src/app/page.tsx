import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import HomeContent from '@/app/components/HomeContent';
import { ShieldCheck, ArrowUpRight, Lock, Database, User, Phone, Mail } from 'lucide-react';

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
      .select('id, property_type, city, state, area, price, notes, bedrooms, bathrooms, builtup_area, additional_spaces, possession_status, facing, parking, description, tags, furnishing, balconies, property_age, created_at')
      .in('status', ['new_lead', 'contacted', 'active'])
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) {
      console.error('Error fetching public listings:', error);
      return [];
    }
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
    <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-slate-900 flex flex-col scroll-smooth relative">
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 group cursor-default">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              PropConnect
            </span>
          </div>

          {/* Contact Details in Header */}
          <div className="hidden lg:flex items-center gap-5 text-xs text-slate-600 font-bold">
            <a href="tel:+917692885502" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <Phone className="w-4 h-4" /> +91 7692885502
            </a>
            <a href="mailto:freshcareer4@gmail.com" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <Mail className="w-4 h-4" /> freshcareer4@gmail.com
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/portal/login"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm"
            >
              <User className="w-4 h-4" /> My Account
            </Link>
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-white/50 backdrop-blur-sm border border-slate-200 hover:bg-white text-slate-700 hover:text-blue-600 hover:border-blue-200 font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow-md"
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
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto text-center space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-600 font-bold">
          <a href="tel:+917692885502" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <Phone className="w-4 h-4" /> +91 7692885502
          </a>
          <a href="mailto:freshcareer4@gmail.com" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <Mail className="w-4 h-4" /> freshcareer4@gmail.com
          </a>
        </div>
        <p className="text-sm text-slate-400 font-medium">
          © {new Date().getFullYear()} PropConnect. All rights reserved.
        </p>
        <p className="text-xs text-slate-400 font-medium">
          Seller contact details are never shown publicly &nbsp;·&nbsp;
          <Link href="/login" className="text-blue-600 hover:underline">Admin Login</Link>
        </p>
      </footer>

      {/* ── Floating Contact Button ─────────────────────────────────────── */}
      <a
        href="https://wa.me/917692885502"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/30 transition-transform hover:scale-110 duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
        </svg>
      </a>
    </div>
  );
}
