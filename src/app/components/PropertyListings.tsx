'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  MapPin, Building, DollarSign, Search, Filter, X,
  CheckCircle2, Loader2, Phone, ChevronRight, Home,
  Layers, ArrowDown, User, Globe, Bed, Bath, Expand,
  Key, Compass, Tag, Car, Heart
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  property_type: string;
  city: string;
  state: string;
  area: string;
  price: string;
  notes: string | null;
  bedrooms?: string | null;
  bathrooms?: string | null;
  builtup_area?: string | null;
  additional_spaces?: string | null;
  possession_status?: string | null;
  facing?: string | null;
  parking?: string | null;
  furnishing?: string | null;
  balconies?: string | null;
  property_age?: string | null;
  description?: string | null;
  tags?: string | null;
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
  pg_guest_house: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        setName(session.user.user_metadata?.full_name || '');
        if (session.user.user_metadata?.phone || session.user.phone) {
          setPhone(session.user.user_metadata?.phone || session.user.phone || '');
        }
      }
    });
  }, []);

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
        user_id: userId,
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

            {err && <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-2">{err}</p>}

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

function PropertyCard({ listing, onInterest, dbOptions, isWatchlisted, onToggleWatchlist }: { listing: Listing; onInterest: () => void; dbOptions: SettingOption[]; isWatchlisted: boolean; onToggleWatchlist: (e: React.MouseEvent) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const color = typeColors[listing.property_type] || defaultColor;

  const getOptionName = (cat: string, val: string | null | undefined) => {
    if (!val) return null;
    const opt = dbOptions.find(o => o.category === cat && o.value === val);
    return opt ? opt.display_name : val;
  };

  const beds = getOptionName('bedrooms', listing.bedrooms);
  const baths = getOptionName('bathrooms', listing.bathrooms);
  const facing = getOptionName('facing', listing.facing);
  const poss = getOptionName('possession_status', listing.possession_status);
  const furnishing = getOptionName('furnishing', listing.furnishing);
  const balconies = getOptionName('balconies', listing.balconies);
  const propertyAge = getOptionName('property_age', listing.property_age);

  // Time ago formatter
  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    return `${diff} days ago`;
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsExpanded(!isExpanded); } }}
      className="group w-full text-left bg-white border border-slate-100 hover:border-indigo-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
    >
      {/* Color top bar */}
      <div className={`h-1.5 w-full ${color.dot} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Type badge */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>
            <Building className="w-3 h-3" />
            {fmtPropType(listing.property_type)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">🔒 Private</span>
            <button
              onClick={onToggleWatchlist}
              className={`p-1.5 rounded-full transition-colors ${isWatchlisted ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Save to Watchlist'}
            >
              <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title / Description */}
        <div>
          <p className="font-bold text-slate-800 text-sm leading-snug">
            {listing.builtup_area && `${listing.builtup_area} `}
            {beds && `${beds} Bedroom `}
            {fmtPropType(listing.property_type)} in {fmtArea(listing.area)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 flex justify-between items-center">
            <span>Listing ID: #{listing.id.substring(0, 8).toUpperCase()}</span>
            <span>Updated {timeAgo(listing.created_at)}</span>
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-extrabold text-emerald-700 text-sm">{fmtPrice(listing.price)}</span>
          </div>
          {poss && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{poss}</span>}
        </div>

        {/* Highlight Tags */}
        {listing.tags && (
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
              <span key={t} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> {t}
              </span>
            ))}
          </div>
        )}

        {/* Advanced Grid (Hidden by default) */}
        {isExpanded && (beds || baths || listing.builtup_area || listing.additional_spaces || facing || listing.parking || furnishing || balconies || propertyAge) && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
            {listing.builtup_area && (
              <div className="flex items-start gap-1.5">
                <Expand className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Area</p>
                  <p className="text-xs font-medium text-slate-700">{listing.builtup_area}</p>
                </div>
              </div>
            )}
            {beds && (
              <div className="flex items-start gap-1.5">
                <Bed className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Bedroom</p>
                  <p className="text-xs font-medium text-slate-700">{beds}</p>
                </div>
              </div>
            )}
            {baths && (
              <div className="flex items-start gap-1.5">
                <Bath className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Bath</p>
                  <p className="text-xs font-medium text-slate-700">{baths}</p>
                </div>
              </div>
            )}
            {listing.additional_spaces && (
              <div className="flex items-start gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Add. Spaces</p>
                  <p className="text-xs font-medium text-slate-700">{listing.additional_spaces}</p>
                </div>
              </div>
            )}
            {facing && (
              <div className="flex items-start gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">View/Facing</p>
                  <p className="text-xs font-medium text-slate-700">{facing}</p>
                </div>
              </div>
            )}
            {listing.parking && (
              <div className="flex items-start gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Parking</p>
                  <p className="text-xs font-medium text-slate-700">{listing.parking}</p>
                </div>
              </div>
            )}
            {furnishing && (
              <div className="flex items-start gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Furnishing</p>
                  <p className="text-xs font-medium text-slate-700">{furnishing}</p>
                </div>
              </div>
            )}
            {balconies && (
              <div className="flex items-start gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Balconies</p>
                  <p className="text-xs font-medium text-slate-700">{balconies}</p>
                </div>
              </div>
            )}
            {propertyAge && (
              <div className="flex items-start gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Age</p>
                  <p className="text-xs font-medium text-slate-700">{propertyAge}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description / Notes (Hidden by default) */}
        {isExpanded && (listing.description || listing.notes) && (
          <p className="text-xs text-slate-500 line-clamp-3 italic font-medium flex-1 pt-2 animate-in fade-in duration-300">
            {listing.description || listing.notes}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          {!isExpanded && (beds || baths || listing.builtup_area || listing.additional_spaces || facing || listing.parking || furnishing || balconies || propertyAge) && (
            <div className="text-[10px] text-center font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
              Click to quick view advanced details ▼
            </div>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onInterest(); }}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-600/20"
          >
            I am Interested <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
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

  // Location database variables
  const [dbStates, setDbStates] = useState<{ id: string; name: string }[]>([]);
  const [dbCities, setDbCities] = useState<{ id: string; name: string }[]>([]);
  const [dbAreas, setDbAreas] = useState<{ id: string; name: string }[]>([]);

  const propertyTypes = dbOptions.filter(o => o.category === 'property_type');
  const budgetRanges = dbOptions.filter(o => o.category === 'budget_range');

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const { data, error } = await supabase
          .from('states')
          .select('id, name')
          .order('name');
        if (!error && data) setDbStates(data);
      } catch (e) {
        console.error('Error loading states:', e);
      }
    };
    loadStates();
  }, []);

  // Load cities on state change
  useEffect(() => {
    if (!state) {
      setDbCities([]);
      setDbAreas([]);
      return;
    }
    const loadCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name')
          .eq('state_id', state)
          .order('name');
        if (!error && data) {
          setDbCities(data);
          setCity('');
          setArea('');
        }
      } catch (e) {
        console.error('Error loading cities:', e);
      }
    };
    loadCities();
  }, [state]);

  // Load areas on city change
  useEffect(() => {
    if (!city) {
      setDbAreas([]);
      return;
    }
    const loadAreas = async () => {
      try {
        const { data, error } = await supabase
          .from('areas')
          .select('id, name')
          .eq('city_id', city)
          .order('name');
        if (!error && data) {
          setDbAreas(data);
          setArea('');
        }
      } catch (e) {
        console.error('Error loading areas:', e);
      }
    };
    loadAreas();
  }, [city]);

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

    const selectedStateName = dbStates.find(s => s.id === state)?.name || '';
    const selectedCityName = dbCities.find(c => c.id === city)?.name || '';
    const selectedAreaName = dbAreas.find(a => a.id === area)?.name || '';
    const locationString = `${selectedAreaName}, ${selectedCityName}, ${selectedStateName}`;

    setLoading(true);
    try {
      const { error } = await supabase.from('buyers_demand').insert({
        name: name.trim(),
        phone: phone.trim(),
        property_type: propType || 'any',
        state: selectedStateName,
        city: selectedCityName,
        area: locationString,
        budget: budget || 'any',
        notes: `Help needed: Looking for ${propType || 'any'} in ${selectedAreaName}, ${selectedCityName}, ${selectedStateName}. Budget: ${budget || 'flexible'}.`,
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
    const selectedCityName = dbCities.find(c => c.id === city)?.name || '';
    return (
      <div className="text-center py-8 space-y-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h4 className="font-extrabold text-slate-900 text-lg">Request Received! ✅</h4>
        <p className="text-slate-500 text-sm font-medium">
          Our team will find the best properties for you in {selectedCityName} and contact you shortly.
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
        <div>
          <input
            type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Full Name *"
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 sm:py-4 text-sm outline-none transition-all font-medium bg-white"
          />
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel" required value={phone}
            onChange={e => { setPhone(e.target.value.replace(/[^\d+\s-]/g, '')); setPhoneErr(''); }}
            placeholder="Phone Number *"
            inputMode="numeric" maxLength={15}
            className={`w-full border rounded-xl px-4 py-3 sm:py-4 text-sm outline-none transition-all font-medium bg-white ${
              phoneErr ? 'border-rose-400' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
          />
          {phoneErr && <p className="text-xs text-rose-600 font-medium mt-1">{phoneErr}</p>}
        </div>

        {/* Property Type */}
        <div>
          <select
            value={propType} onChange={e => setPropType(e.target.value)}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 sm:py-4 text-sm outline-none transition-all font-medium bg-white appearance-none"
          >
            <option value="">Property Type (Optional)</option>
            {propertyTypes.map(o => <option key={o.value} value={o.value}>{o.display_name}</option>)}
          </select>
        </div>

        {/* Budget */}
        <div>
          <select
            value={budget} onChange={e => setBudget(e.target.value)}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 sm:py-4 text-sm outline-none transition-all font-medium bg-white appearance-none"
          >
            <option value="">Budget (Flexible)</option>
            {budgetRanges.map(o => <option key={o.value} value={o.value}>{o.display_name}</option>)}
          </select>
        </div>
      </div>

      {/* ── Row 2: Location & Button ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* State */}
        <div>
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 sm:py-4 text-sm outline-none transition-all font-medium bg-white appearance-none disabled:opacity-50"
          >
            <option value="">State *</option>
            {dbStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* City */}
        <div>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            disabled={!state}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 sm:py-4 text-sm outline-none transition-all font-medium bg-white appearance-none disabled:opacity-50 disabled:bg-slate-50"
          >
            <option value="">City *</option>
            {dbCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Area */}
        <div>
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            disabled={!city}
            className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 sm:py-4 text-sm outline-none transition-all font-medium bg-white appearance-none disabled:opacity-50 disabled:bg-slate-50"
          >
            <option value="">Area *</option>
            {dbAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 text-sm h-full max-h-[52px]"
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
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      
      const { data } = await supabase
        .from('buyer_watchlists')
        .select('property_id')
        .eq('user_id', session.user.id);
        
      if (data) {
        setWatchlistIds(new Set(data.map(d => d.property_id)));
      }
    };
    fetchWatchlist();
  }, []);

  const handleToggleWatchlist = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    if (!userId) {
      window.location.href = '/portal/login';
      return;
    }

    if (watchlistIds.has(propertyId)) {
      // Remove
      await supabase.from('buyer_watchlists').delete().match({ user_id: userId, property_id: propertyId });
      setWatchlistIds(prev => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
    } else {
      // Add
      await supabase.from('buyer_watchlists').insert({ user_id: userId, property_id: propertyId });
      setWatchlistIds(prev => {
        const next = new Set(prev);
        next.add(propertyId);
        return next;
      });
    }
  };

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
        <div className="text-center py-20 bg-gradient-to-b from-white to-blue-50/30 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
          <Home className="w-16 h-16 text-blue-300 mx-auto mb-5 relative z-10" />
          <h3 className="text-2xl font-extrabold text-slate-900 mb-3 relative z-10">We'll find it for you!</h3>
          <p className="text-slate-600 font-medium max-w-md mx-auto leading-relaxed relative z-10">There are no public listings yet, but our offline network is huge. Submit your requirement below and we will contact you with matching properties.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 mb-6 shadow-sm">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No exact matches found.</h3>
          <p className="text-slate-500 font-medium mb-5 max-w-sm mx-auto">We might have offline properties that match your filters! Submit a custom request.</p>
          <button onClick={clearFilters} className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl transition-colors">
            View all available properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filtered.map(l => (
            <PropertyCard 
              key={l.id} 
              listing={l} 
              dbOptions={dbOptions} 
              onInterest={() => setActiveListing(l)} 
              isWatchlisted={watchlistIds.has(l.id)}
              onToggleWatchlist={(e) => handleToggleWatchlist(e, l.id)}
            />
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
