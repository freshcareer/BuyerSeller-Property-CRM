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
    <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
      
      {/* ── Main Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl max-w-md mx-auto shadow-sm border border-slate-200/60 mb-6 sm:mb-10 relative">
        <button
          type="button"
          onClick={() => setActiveTab('buyer')}
          className={`flex-1 py-3 text-center font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 rounded-xl relative z-10 ${
            activeTab === 'buyer'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> Buy Property
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seller')}
          className={`flex-1 py-3 text-center font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 rounded-xl relative z-10 ${
            activeTab === 'seller'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Sell Property
        </button>
      </div>

      {/* ── Buyer View ─────────────────────────────────────────────────────── */}
      {activeTab === 'buyer' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PropertyListings listings={listings} dbOptions={options} />
        </div>
      )}

      {/* ── Seller View ────────────────────────────────────────────────────── */}
      {activeTab === 'seller' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
            
            {/* Left Side: Value Prop (Text) */}
            <div className="lg:col-span-5 lg:pt-8 space-y-6 text-center lg:text-left bg-gradient-to-br from-indigo-50 to-blue-50 p-6 sm:p-8 rounded-3xl border border-indigo-100/50 shadow-sm">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                Fast & Secure
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                List Your Property, Find the Right Buyer
              </h1>
              <p className="text-slate-600 text-sm font-medium max-w-sm mx-auto lg:mx-0 leading-relaxed">
                Your property will be visible directly on our platform. However, your name and contact details will remain 100% private to prevent spam.
              </p>

              <div className="space-y-4 pt-4 text-left max-w-sm mx-auto lg:mx-0">
                <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">100% Contact Privacy</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Contact numbers and exact addresses are never made public.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Verified Matchmaking</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">We connect you exclusively with verified, genuine buyers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Lead Form (Sell Tab) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl shadow-xl shadow-indigo-900/5 border border-slate-100 overflow-hidden">
                <LeadForms options={options} defaultTab="sell" hideTabs={true} />
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
