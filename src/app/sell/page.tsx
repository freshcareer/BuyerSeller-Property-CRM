import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import LeadForms from '@/app/components/LeadForms';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

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

export default async function SellPage() {
  const options = await getSystemSettings();

  return (
    <div className="flex-1 min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow shadow-blue-600/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
              BuyerSeller CRM
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Apni Property List Karo
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium max-w-md mx-auto">
            Apni property ki details submit karein. Aapka contact directly kisi buyer ko nahi dikhega, 
            sirf admin ke through verified buyers se hi connect hoga.
          </p>
        </div>

        {options ? (
          <LeadForms options={options} defaultTab="sell" hideTabs={true} />
        ) : (
          <div className="bg-white border border-rose-200 rounded-2xl shadow p-8 text-center">
            <h3 className="text-xl font-bold text-slate-900">Database Error</h3>
            <p className="text-slate-500 text-sm mt-2">System settings could not be loaded. Please try again later.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center mt-auto">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} BuyerSeller Property CRM &nbsp;·&nbsp; Privacy 100% Guaranteed
        </p>
      </footer>
    </div>
  );
}
