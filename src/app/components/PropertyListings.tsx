'use client';

import { useState, useMemo } from 'react';
import {
  MapPin, Building, DollarSign, Search, Filter, X,
  CheckCircle2, Loader2, Phone, ChevronRight, Home,
  Layers, ArrowDown, User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LOCATION_DATA, getCities, getAreas } from '@/lib/locationData';

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

interface SettingOption { category: string; value: string; display_name: string; }

interface Props {
  listings: Listing[];
  dbOptions: SettingOption[];
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtPropType(pt: string) {
  return pt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function fmtPrice(p: string) {
  return p.replace(/_/g, ' ').replace('under ', 'Under ').replace('plus', '+');
}
function fmtArea(area: string) {
  // "locality, city, state" → show "locality, city" only
  const parts = area.split(',').map(s => s.trim());
  return parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : area;
}

const typeColors: Record<string, { bg: string; text: string; dot: string }> = {
  apartment:  { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500'   },
  villa:      { bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-500' },
  plot:       { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500'  },
  commercial: { bg: 'bg-slate-100',  text: 'text-slate-700',  dot: 'bg-slate-500'  },
  farmhouse:  { bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-500'},
  bungalow:   { bg: 'bg-rose-50',    text: 'text-rose-700',   dot: 'bg-rose-500'   },
};
const defaultColor = { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' };

// ── Interest Modal (auto-filled, only name + phone) ───────────────────────────

function InterestModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setPhoneErr('');

    if (!name.trim()) { setErr('Please enter your name.'); return; }
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10 && !(digits.length === 12 && digits.startsWith('91'))) {
      setPhoneErr('Please enter a valid 10-digit number.'); return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('buyers_demand').insert({
        name: name.trim(),
        phone: phone.trim(),
        property_type: listing.property_type,
        state: listing.state,
        city: listing.city,
        area: listing.area,
        budget: listing.price,
        notes: `Interested in listing: ${fmtPropType(listing.property_type)} at ${fmtArea(listing.area)}. Listing ID: ${listing.id}`,
        status: 'new_lead',
      });
      if (error) throw error;
      setDone(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const color = typeColors[listing.property_type] || defaultColor;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {done ? (
          /* ── Success ── */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Request Sent! ✅</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">
                Our team will contact you soon. You will be connected once a verified match is found with the seller.
              </p>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
              Okay
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={submit} className="p-5 space-y-4">
            {/* Property summary chip */}
            <div className={`${color.bg} rounded-2xl p-4 space-y-2`}>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                <span className={`font-extrabold text-sm ${color.text}`}>
                  {fmtPropType(listing.property_type)}
                </span>
                <span className="ml-auto text-xs text-slate-400 font-medium">Auto-filled ✓</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {fmtArea(listing.area)}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-700">
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                {fmtPrice(listing.price)}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium text-center">
              Just enter your name and number — everything else is auto-filled ✅
            </p>

            {err && <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2.5">{err}</p>}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <User className="w-3 h-3" /> Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rajesh Patel"
                className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm outline-none transition-all font-medium"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/[^\d+\s-]/g, '')); setPhoneErr(''); }}
                placeholder="e.g. 9876543210"
                inputMode="numeric"
                maxLength={15}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all font-medium ${
                  phoneErr ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {phoneErr && <p className="text-xs text-rose-600 font-medium">{phoneErr}</p>}
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-none px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  : <>Contact Me <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 font-medium">
              🔒 Seller contact details are kept private. Our team will verify and connect you.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Property Card ─────────────────────────────────────────────────────────────

function PropertyCard({ listing, onInterest }: { listing: Listing; onInterest: () => void }) {
  const color = typeColors[listing.property_type] || defaultColor;

  return (
    <button
      onClick={onInterest}
      className="group w-full text-left bg-white border border-slate-100 hover:border-indigo-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {/* Color top bar */}
      <div className={`h-1.5 w-full ${color.dot} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Type badge */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>
            <Building className="w-3 h-3" />
            {fmtPropType(listing.property_type)}
          </span>
          <span className="text-xs text-slate-400 font-medium">🔒 Private</span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 text-sm leading-snug">{fmtArea(listing.area)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{listing.city}, {listing.state}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-extrabold text-emerald-700 text-sm">{fmtPrice(listing.price)}</span>
        </div>

        {/* Notes preview */}
        {listing.notes && (
          <p className="text-xs text-slate-500 line-clamp-2 italic font-medium flex-1">
            {listing.notes}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <div className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-700 group-hover:to-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow-md group-hover:shadow-indigo-600/20">
            I am Interested <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </button>
  );
}

// ── "Can't Find" Request Form ─────────────────────────────────────────────────

function CantFindForm({ dbOptions }: { dbOptions: SettingOption[] }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [propType, setPropType] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');

  const propertyTypes = dbOptions.filter(o => o.category === 'property_type');
  const budgetRanges = dbOptions.filter(o => o.category === 'budget_range');

  const availableCities = state ? getCities(state) : [];
  const availableAreas = state && city ? getAreas(state, city) : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setPhoneErr('');

    if (!name.trim()) { setErr('Name is required.'); return; }
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10 && !(digits.length === 12 && digits.startsWith('91'))) {
      setPhoneErr('A valid 10-digit number is required.'); return;
    }
    if (!state) { setErr('Please select a state.'); return; }
    if (!city) { setErr('Please select a city.'); return; }
    if (!area) { setErr('Please select an area.'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from('buyers_demand').insert({
        name: name.trim(),
        phone: phone.trim(),
        property_type: propType || 'any',
        state: state,
        city: city,
        area: `${area}, ${city}, ${state}`,
        budget: budget || 'any',
        notes: `Help needed: Looking for ${propType || 'any'} in ${area}, ${city}, ${state}. Budget: ${budget || 'flexible'}.`,
        status: 'new_lead',
      });
      if (error) throw error;
      setDone(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-8 space-y-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h4 className="font-extrabold text-slate-900 text-lg">Request Received! ✅</h4>
        <p className="text-slate-500 text-sm font-medium">
          Our team will find the best properties for you in {city} and contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      {err && <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-4">{err}</p>}

      {/* ── Row 1: Profile & Preferences ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Amit Shah"
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm outline-none transition-all font-medium bg-white"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel" required value={phone}
            onChange={e => { setPhone(e.target.value.replace(/[^\d+\s-]/g, '')); setPhoneErr(''); }}
            placeholder="9876543210"
            inputMode="numeric" maxLength={15}
            className={`w-full border rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all font-medium bg-white ${
              phoneErr ? 'border-rose-400' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
          />
          {phoneErr && <p className="text-xs text-rose-600 font-medium">{phoneErr}</p>}
        </div>

        {/* Property Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Property Type <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <select
            value={propType} onChange={e => setPropType(e.target.value)}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all font-medium bg-white appearance-none"
          >
            <option value="">Any type</option>
            {propertyTypes.map(o => <option key={o.value} value={o.value}>{o.display_name}</option>)}
          </select>
        </div>

        {/* Budget */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Budget <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <select
            value={budget} onChange={e => setBudget(e.target.value)}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all font-medium bg-white appearance-none"
          >
            <option value="">Flexible</option>
            {budgetRanges.map(o => <option key={o.value} value={o.value}>{o.display_name}</option>)}
          </select>
        </div>
      </div>

      {/* ── Row 2: Location & Button ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* State */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            State <span className="text-rose-500">*</span>
          </label>
          <select
            value={state}
            onChange={e => { setState(e.target.value); setCity(''); setArea(''); }}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all font-medium bg-white appearance-none disabled:opacity-50"
          >
            <option value="">State</option>
            {LOCATION_DATA.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            City <span className="text-rose-500">*</span>
          </label>
          <select
            value={city}
            onChange={e => { setCity(e.target.value); setArea(''); }}
            disabled={!state}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all font-medium bg-white appearance-none disabled:opacity-50 disabled:bg-slate-50"
          >
            <option value="">City</option>
            {availableCities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Area <span className="text-rose-500">*</span>
          </label>
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            disabled={!city}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all font-medium bg-white appearance-none disabled:opacity-50 disabled:bg-slate-50"
          >
            <option value="">Area</option>
            {availableAreas.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 text-sm h-[42px] sm:h-[46px]"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              : <>Help Me Find a Property <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PropertyListings({ listings, dbOptions }: Props) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  const allTypes = useMemo(() => [...new Set(listings.map(l => l.property_type))].sort(), [listings]);
  const allCities = useMemo(() => [...new Set(listings.map(l => l.city))].sort(), [listings]);
  const allPrices = useMemo(() => [...new Set(listings.map(l => l.price))].sort(), [listings]);

  const filtered = useMemo(() => listings.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.property_type.includes(q) || l.area.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.price.includes(q);
    return matchSearch
      && (filterType === 'all' || l.property_type === filterType)
      && (filterCity === 'all' || l.city === filterCity)
      && (filterPrice === 'all' || l.price === filterPrice);
  }), [listings, search, filterType, filterCity, filterPrice]);

  const hasFilters = search || filterType !== 'all' || filterCity !== 'all' || filterPrice !== 'all';
  const clearFilters = () => { setSearch(''); setFilterType('all'); setFilterCity('all'); setFilterPrice('all'); };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50/50 border border-indigo-100/70 rounded-3xl p-5 sm:p-6 shadow-xl shadow-indigo-900/5 mb-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 p-32 bg-blue-200/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 p-24 bg-indigo-200/20 rounded-full blur-2xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
            🔍 Find Your Perfect Property
          </h2>
          <p className="text-slate-600 text-sm mt-2 font-medium max-w-2xl mx-auto leading-relaxed">
            Browse available properties below, <strong>OR</strong> share your requirements—we&apos;ll find the perfect match and connect you.
          </p>
        </div>
        <div className="relative z-10">
          <CantFindForm dbOptions={dbOptions} />
        </div>
      </div>

      {/* Divider with arrow */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-slate-200" />
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <ArrowDown className="w-4 h-4 animate-bounce" />
          <span className="text-xs font-bold whitespace-nowrap text-center">Or browse available listings below</span>
        </div>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-5 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by area, city, or property type..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 outline-none transition-all"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          {[
            { label: 'Type', val: filterType, set: setFilterType, opts: allTypes.map(t => ({ v: t, l: fmtPropType(t) })) },
            { label: 'City', val: filterCity, set: setFilterCity, opts: allCities.map(c => ({ v: c, l: c })) },
            { label: 'Price', val: filterPrice, set: setFilterPrice, opts: allPrices.map(p => ({ v: p, l: fmtPrice(p) })) },
          ].map(({ label, val, set, opts }) => (
            <select key={label} value={val} onChange={e => set(e.target.value)}
              className="w-full sm:w-auto bg-white border border-slate-200 hover:border-blue-300 rounded-lg px-2 py-2 sm:py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-all appearance-none text-center sm:text-left"
            >
              <option value="all">{label === 'City' ? 'All Cities' : `All ${label}s`}</option>
              {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          ))}
          {hasFilters && (
            <button onClick={clearFilters} className="col-span-2 sm:col-span-1 w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-all mt-1 sm:mt-0">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <span className="col-span-2 sm:col-span-1 w-full sm:w-auto text-center sm:text-left sm:ml-auto text-xs text-slate-400 font-bold mt-1 sm:mt-0">
            {filtered.length} properties
          </span>
        </div>
      </div>

      {/* Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Listings Available Yet</h3>
          <p className="text-slate-500 text-sm font-medium">Submit your requirement below, and we&apos;ll find the best match for you!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 mb-6">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold mb-1">No listings found in this area.</p>
          <p className="text-slate-400 text-sm font-medium mb-4">Submit a request below—we&apos;ll find it for you!</p>
          <button onClick={clearFilters} className="text-blue-600 text-sm font-bold underline underline-offset-2">
            View all properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filtered.map(l => (
            <PropertyCard key={l.id} listing={l} onInterest={() => setActiveListing(l)} />
          ))}
        </div>
      )}



      {/* Interest Modal */}
      {activeListing && (
        <InterestModal listing={activeListing} onClose={() => setActiveListing(null)} />
      )}
    </>
  );
}
