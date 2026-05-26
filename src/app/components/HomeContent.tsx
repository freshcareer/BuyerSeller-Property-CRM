'use client';

import { useState } from 'react';
import PropertyListings from '@/app/components/PropertyListings';
import LeadForms from '@/app/components/LeadForms';
import { CheckCircle2, Building, MapPin } from 'lucide-react';

interface Listing {
  id: string;
  property_type: string;
  city: string;
  state: string;
  area: string;
  price: string;
  notes: string | null;
  created_at: string;
}

interface SettingOption {
  category: string;
  value: string;
  display_name: string;
}

interface Props {
  options: SettingOption[];
  listings: Listing[];
}

export default function HomeContent({ options, listings }: Props) {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* ── Main Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row bg-slate-100 p-1.5 rounded-2xl max-w-2xl mx-auto shadow-inner border border-slate-200 mb-8 sm:mb-10 gap-1.5 sm:gap-0">
        <button
          type="button"
          onClick={() => setActiveTab('buyer')}
          className={`flex-1 py-3.5 text-center font-bold sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
            activeTab === 'buyer'
              ? 'bg-white text-blue-700 shadow border border-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <Building className="w-5 h-5" /> Main Buyer Hun
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seller')}
          className={`flex-1 py-3.5 text-center font-bold sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
            activeTab === 'seller'
              ? 'bg-white text-blue-700 shadow border border-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <MapPin className="w-5 h-5" /> Main Seller Hun
        </button>
      </div>

      {/* ── Buyer View ─────────────────────────────────────────────────────── */}
      {activeTab === 'buyer' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Browse Available Properties
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium max-w-lg mx-auto">
              Kharidne ke liye property dhundhein. Pasand aane par &quot;Mujhe Chahiye&quot; click karein.
            </p>
          </div>
          <PropertyListings listings={listings} dbOptions={options} />
        </div>
      )}

      {/* ── Seller View ────────────────────────────────────────────────────── */}
      {activeTab === 'seller' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
            
            {/* Left Side: Value Prop (Text) */}
            <div className="lg:col-span-5 lg:pt-8 space-y-6 text-center lg:text-left bg-blue-50 p-6 sm:p-8 rounded-3xl border border-blue-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                Fast & Secure
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900">
                Apni Property List Karo, Sahi Buyer Pao
              </h1>
              <p className="text-slate-600 text-sm font-medium max-w-sm mx-auto lg:mx-0">
                Aapki property directly website par dikhegi. Lekin aapka naam aur number 100% private rahega. Koi pareshan nahi karega.
              </p>

              <div className="space-y-4 pt-4 text-left max-w-sm mx-auto lg:mx-0">
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-slate-700">100% Contact Privacy <br/><span className="text-xs font-medium text-slate-500">Number aur address public nahi hota.</span></p>
                </div>
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-slate-700">Verified Matchmaking <br/><span className="text-xs font-medium text-slate-500">Sirf genuine buyers se hi connect karenge.</span></p>
                </div>
              </div>
            </div>

            {/* Right Side: Lead Form (Sell Tab) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-200">
                <LeadForms options={options} defaultTab="sell" hideTabs={true} />
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
