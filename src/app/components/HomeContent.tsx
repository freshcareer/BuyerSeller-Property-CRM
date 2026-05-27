'use client';

import { useState } from 'react';
import PropertyListings from '@/app/components/PropertyListings';
import LeadForms from '@/app/components/LeadForms';
import { CheckCircle2, Building, MapPin, Star, UserCircle2, ArrowRight, Search, FileText, Handshake } from 'lucide-react';

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
      
      {/* ── Premium Hero Section ─────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 pt-8 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Star className="w-4 h-4 fill-blue-600 text-blue-600" /> Gujarat's Most Trusted Property Network
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
          Finding a house is easy. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Finding a Home is hard.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          We know that buying or selling a property is one of the biggest emotional and financial decisions of your life. Let us guide you through the entire journey, completely stress-free. <strong className="text-slate-800">Zero upfront fees.</strong>
        </p>
      </div>

      {/* ── Main Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl max-w-md mx-auto shadow-sm border border-slate-200/60 mb-6 sm:mb-10 relative animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
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

            {/* Right Side: Form Component */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <LeadForms options={options} defaultTab="sell" hideTabs={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Trust Building Section (Why Choose Us) ─────────────────────────── */}
      <div className="mt-24 mb-12 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">Why Choose PropConnect?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">We believe in complete transparency and end-to-end assistance. Zero upfront fees, you only pay a fair commission when your deal successfully closes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">100% Verified Leads</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">No spam, no window shoppers. We use both <strong>social media marketing</strong> and <strong>physical groundwork</strong> to verify every buyer and seller before connecting you.</p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full -z-10" />
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">End-to-End Assistance</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">From property visits to negotiating the best price, legal paperwork, and loan assistance, we handle everything.</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Fair Success Fee</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">Zero registration charges, zero hidden costs. You only pay a transparent, mutually agreed <strong>fair commission</strong> if the deal successfully closes. No success, no fee.</p>
          </div>
        </div>
      </div>

      {/* ── How It Works Section ─────────────────────────────────────────── */}
      <div className="mb-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">A seamless, stress-free process designed to close deals faster.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-100 -z-10" />
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-slate-100 shadow-sm text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">1. Share Details</h3>
            <p className="text-sm text-slate-600">Fill out our quick form to let us know your exact requirements.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-slate-100 shadow-sm text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">2. We Verify & Match</h3>
            <p className="text-sm text-slate-600">We personally verify the properties or buyers and find the perfect match.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-slate-100 shadow-sm text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <Building className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">3. Site Visit & Legal</h3>
            <p className="text-sm text-slate-600">We arrange visits and handle all negotiations and legal paperwork.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-slate-100 shadow-sm text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <Handshake className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">4. Deal Closes</h3>
            <p className="text-sm text-slate-600">You only pay our transparent commission once the deal is 100% closed.</p>
          </div>
        </div>
      </div>

      {/* ── Client Testimonials ─────────────────────────────────────────── */}
      <div className="mb-24 max-w-6xl mx-auto px-4 bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">What Our Clients Say</h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">Real stories from people who found their dream property or perfect buyer with PropConnect.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-700">
            <div className="flex gap-1 mb-4 text-amber-400">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">"I was so stressed about selling my father's old house. It held so many memories. PropConnect didn't just sell it; they found a lovely family who will cherish it. They held my hand through the entire emotional process."</p>
            <div className="flex items-center gap-3">
              <UserCircle2 className="w-10 h-10 text-slate-500" />
              <div>
                <p className="text-white font-bold text-sm">Rajesh Patel</p>
                <p className="text-slate-400 text-xs">Seller, South Bopal</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-700">
            <div className="flex gap-1 mb-4 text-amber-400">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">"We had been looking for a safe, beautiful home for our growing family for 6 months and were exhausted by fake listings. PropConnect understood our emotions. They found us our dream home and we felt so safe with them."</p>
            <div className="flex items-center gap-3">
              <UserCircle2 className="w-10 h-10 text-slate-500" />
              <div>
                <p className="text-white font-bold text-sm">Amit Shah</p>
                <p className="text-slate-400 text-xs">Buyer, Satellite</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-700">
            <div className="flex gap-1 mb-4 text-amber-400">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">"The 'Pay Only on Success' model is great, but what I loved most was how much they cared. They treated my property like it was their own. The dedicated manager was like a family member taking care of everything."</p>
            <div className="flex items-center gap-3">
              <UserCircle2 className="w-10 h-10 text-slate-500" />
              <div>
                <p className="text-white font-bold text-sm">Neha Desai</p>
                <p className="text-slate-400 text-xs">Seller, Thaltej</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Our Personal Promise ─────────────────────────────────────────── */}
      <div className="mb-24 max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-[2rem] p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
          
          <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
            <Handshake className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 relative z-10">Our Personal Promise to You</h2>
          <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto relative z-10">
            "We know that buying or selling a property isn't just a transaction—it is one of the biggest emotional and financial decisions of your life. You shouldn't have to deal with spam calls, shady brokers, or endless stress. 
            <br/><br/>
            My personal promise to you is that we will treat your property journey as if it were our own family's. We will protect your privacy, negotiate fiercely on your behalf, and hold your hand until you are safely in your new home."
          </p>
          <div className="mt-8 pt-6 border-t border-blue-200/50 inline-block relative z-10">
            <p className="font-bold text-slate-900">Founder, PropConnect</p>
            <p className="text-slate-500 text-sm">Your Trusted Property Partner</p>
          </div>
        </div>
      </div>

    </main>
  );
}
