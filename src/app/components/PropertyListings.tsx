'use client';

import { useState, useMemo } from 'react';
import {
  MapPin, Building, DollarSign, Search, Filter,
  CheckCircle2, X, Loader2, Phone, ChevronRight,
  Home, Layers, Tag,
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
  created_at: string;
}

interface Props {
  listings: Listing[];
}

// Property type → icon color mapping
const propTypeColor: Record<string, string> = {
  apartment:     'bg-blue-100 text-blue-700 border-blue-200',
  villa:         'bg-purple-100 text-purple-700 border-purple-200',
  plot:          'bg-amber-100 text-amber-700 border-amber-200',
  commercial:    'bg-slate-100 text-slate-700 border-slate-200',
  farmhouse:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  bungalow:      'bg-rose-100 text-rose-700 border-rose-200',
};
const defaultChip = 'bg-indigo-100 text-indigo-700 border-indigo-200';

function formatArea(area: string) {
  // area is stored as "locality, city, state" — show only locality + city
  const parts = area.split(',').map(p => p.trim());
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
  return area;
}

function formatPrice(price: string) {
  return price.replace(/_/g, ' ').replace('under ', 'Under ').replace('plus', '+').replace('cr', ' Cr').replace('lakh', ' Lakh');
}

function formatPropType(pt: string) {
  return pt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Interest Modal ───────────────────────────────────────────────────────────

interface ModalProps {
  listing: Listing;
  onClose: () => void;
}

function InterestedModal({ listing, onClose }: ModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const validate = () => {
    const digits = phone.replace(/\D/g, '');
    if (!name.trim()) { setErr('Name is required.'); return false; }
    if (digits.length !== 10 && !(digits.length === 12 && digits.startsWith('91'))) {
      setPhoneError('Enter a valid 10-digit mobile number.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setPhoneError('');
    if (!validate()) return;

    setLoading(true);
    try {
      // Store buyer interest as a new buyer_demand lead referencing the listing
      const { error: insertError } = await supabase.from('buyers_demand').insert({
        name: name.trim(),
        phone: phone.trim(),
        property_type: listing.property_type,
        state: listing.state,
        city: listing.city,
        area: listing.area,
        budget: listing.price,
        notes: `Interested in seller listing ID: ${listing.id}. Area: ${listing.area}.`,
        status: 'new_lead',
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h3 className="font-extrabold text-slate-900">I&apos;m Interested</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {formatPropType(listing.property_type)} · {formatArea(listing.area)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Request Sent!</h4>
              <p className="text-slate-600 text-sm font-medium max-w-sm mx-auto">
                Hamari team aapko jald hi contact karegi. Property ka poora detail aur seller se connect kiya jayega.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors mt-2"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Property summary */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm space-y-1">
                <p className="font-bold text-slate-800">
                  🏠 {formatPropType(listing.property_type)}
                </p>
                <p className="text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  {formatArea(listing.area)}
                </p>
                <p className="text-emerald-700 font-bold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 shrink-0" />
                  {formatPrice(listing.price)}
                </p>
              </div>

              <p className="text-xs text-slate-500 font-medium bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                📞 Seller ka contact directly nahi milega — admin verify karke aapko connect karega.
              </p>

              {err && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                  {err}
                </p>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rajesh Patel"
                  className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/[^\d+\s-]/g, '')); setPhoneError(''); }}
                    placeholder="e.g. 9876543210"
                    inputMode="numeric"
                    maxLength={15}
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ${
                      phoneError ? 'border-rose-400 focus:ring-rose-100 bg-rose-50/30' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {phoneError && <p className="text-xs text-rose-600 font-medium">{phoneError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <>Send Interest Request <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Property Card ─────────────────────────────────────────────────────────────

function PropertyCard({ listing, onInterest }: { listing: Listing; onInterest: () => void }) {
  const chipCls = propTypeColor[listing.property_type] || defaultChip;

  return (
    <div className="group bg-white border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Card Top — colored strip with property type */}
      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300" />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Property Type Chip + Privacy Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${chipCls}`}>
            <Building className="w-3 h-3" />
            {formatPropType(listing.property_type)}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full border border-slate-200">
            🔒 Contact Hidden
          </span>
        </div>

        {/* Location */}
        <div className="space-y-1">
          <div className="flex items-start gap-2 text-slate-800">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm leading-snug">{formatArea(listing.area)}</p>
              <p className="text-xs text-slate-400 font-medium">{listing.city}, {listing.state}</p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="font-extrabold text-emerald-700 text-sm">{formatPrice(listing.price)}</p>
        </div>

        {/* Notes preview (if any, truncated) */}
        {listing.notes && (
          <p className="text-xs text-slate-500 italic line-clamp-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 font-medium">
            📝 {listing.notes}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={onInterest}
          className="mt-auto w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md group-hover:shadow-blue-200"
        >
          I&apos;m Interested <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main PropertyListings Component ─────────────────────────────────────────

export default function PropertyListings({ listings }: Props) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [interestedListing, setInterestedListing] = useState<Listing | null>(null);

  // Derive unique filter options from listings
  const allTypes = useMemo(() => [...new Set(listings.map(l => l.property_type))].sort(), [listings]);
  const allCities = useMemo(() => [...new Set(listings.map(l => l.city))].sort(), [listings]);
  const allPrices = useMemo(() => [...new Set(listings.map(l => l.price))].sort(), [listings]);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      const matchSearch = !search.trim() ||
        l.property_type.toLowerCase().includes(search.toLowerCase()) ||
        l.area.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase()) ||
        l.price.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || l.property_type === filterType;
      const matchCity = filterCity === 'all' || l.city === filterCity;
      const matchPrice = filterPrice === 'all' || l.price === filterPrice;
      return matchSearch && matchType && matchCity && matchPrice;
    });
  }, [listings, search, filterType, filterCity, filterPrice]);

  if (listings.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Listings Yet</h3>
        <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
          Abhi koi seller listing available nahi hai. &quot;I Want to Sell&quot; form bhar ke pehle seller bano!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by area, property type, city..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer shrink-0 transition-all"
          >
            <option value="all">All Types</option>
            {allTypes.map(t => (
              <option key={t} value={t}>{formatPropType(t)}</option>
            ))}
          </select>

          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer shrink-0 transition-all"
          >
            <option value="all">All Cities</option>
            {allCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterPrice}
            onChange={e => setFilterPrice(e.target.value)}
            className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer shrink-0 transition-all"
          >
            <option value="all">All Prices</option>
            {allPrices.map(p => (
              <option key={p} value={p}>{formatPrice(p)}</option>
            ))}
          </select>

          {/* Clear filters */}
          {(search || filterType !== 'all' || filterCity !== 'all' || filterPrice !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterType('all'); setFilterCity('all'); setFilterPrice('all'); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-all shrink-0"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          {/* Result count */}
          <span className="ml-auto shrink-0 text-xs text-slate-500 font-bold whitespace-nowrap">
            {filtered.length} / {listings.length}
          </span>
        </div>
      </div>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">Koi listing match nahi mili.</p>
          <button
            onClick={() => { setSearch(''); setFilterType('all'); setFilterCity('all'); setFilterPrice('all'); }}
            className="mt-3 text-blue-600 text-sm font-bold underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {filtered.map(listing => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              onInterest={() => setInterestedListing(listing)}
            />
          ))}
        </div>
      )}

      {/* Privacy notice */}
      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-700">🔒 Privacy Policy:</span> Seller ka naam, phone number, email aur exact address 
          kabhi bhi publicly nahi dikhaya jata. Hamare admin ke through hi verified buyers se connect kiya jata hai.
        </p>
      </div>

      {/* Interest Modal */}
      {interestedListing && (
        <InterestedModal
          listing={interestedListing}
          onClose={() => setInterestedListing(null)}
        />
      )}

      {/* Scroll-to-form floating button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105"
      >
        <Tag className="w-4 h-4" />
        <span className="hidden sm:inline">List My Property</span>
        <span className="sm:hidden">Sell</span>
      </button>
    </>
  );
}
