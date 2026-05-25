'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LOCATION_DATA, getCities, getAreas } from '@/lib/locationData';
import {
  CheckCircle2, ChevronRight, Loader2, User, Phone, Mail,
  Building, MapPin, DollarSign, FileText, Globe, Home,
} from 'lucide-react';

interface SettingOption {
  category: string;
  value: string;
  display_name: string;
}

interface LeadFormsProps {
  options: SettingOption[];
}

export default function LeadForms({ options }: LeadFormsProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    propertyType: '',
    state: '',
    city: '',
    area: '',
    budgetOrPrice: '',
    notes: '',
  });

  // Cascading location options
  const availableCities = formData.state ? getCities(formData.state) : [];
  const availableAreas = formData.state && formData.city ? getAreas(formData.state, formData.city) : [];

  // Supabase system_settings options
  const propertyTypes = options.filter((o) => o.category === 'property_type');
  const budgetRanges  = options.filter((o) => o.category === 'budget_range');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Reset downstream selections on parent change
    if (name === 'state') {
      setFormData({ ...formData, state: value, city: '', area: '' });
    } else if (name === 'city') {
      setFormData({ ...formData, city: value, area: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.phone || !formData.propertyType || !formData.state || !formData.city || !formData.area || !formData.budgetOrPrice) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const locationString = `${formData.area}, ${formData.city}, ${formData.state}`;

    try {
      if (activeTab === 'buy') {
        const { error: insertError } = await supabase.from('buyers_demand').insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          property_type: formData.propertyType,
          state: formData.state,
          city: formData.city,
          area: locationString,
          budget: formData.budgetOrPrice,
          notes: formData.notes || null,
          status: 'new_lead',
        });
        if (insertError) throw insertError;
      } else {
        const { error: insertError } = await supabase.from('sellers_inventory').insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          property_type: formData.propertyType,
          state: formData.state,
          city: formData.city,
          area: locationString,
          price: formData.budgetOrPrice,
          notes: formData.notes || null,
          status: 'new_lead',
        });
        if (insertError) throw insertError;
      }

      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', propertyType: '', state: '', city: '', area: '', budgetOrPrice: '', notes: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      console.error('Submission error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-emerald-100 rounded-2xl shadow-xl max-w-xl mx-auto min-h-[400px] transition-all duration-500 animate-in fade-in zoom-in">
        <div className="p-4 bg-emerald-50 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Requirement Submitted!</h3>
        <p className="text-slate-600 mb-8 max-w-sm">
          Thank you. Our expert matching engines will process your details, and a representative will contact you shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all duration-300 flex items-center gap-2"
        >
          Submit Another Request <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const inputCls = 'w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-4 py-3 placeholder-slate-400 outline-none transition-all duration-300';
  const selectCls = `${inputCls} appearance-none`;
  const disabledSelectCls = 'w-full bg-slate-50 border border-slate-200 text-slate-400 rounded-xl px-4 py-3 outline-none cursor-not-allowed appearance-none';
  const labelCls = 'text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5';

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">

      {/* Tab Headers */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        <button
          type="button"
          onClick={() => { setActiveTab('buy'); setError(null); }}
          className={`flex-1 py-4 text-center font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'buy'
              ? 'text-blue-600 border-blue-600 bg-blue-50/30'
              : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100/50'
          }`}
        >
          <Building className="w-5 h-5" /> I Want to Buy
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('sell'); setError(null); }}
          className={`flex-1 py-4 text-center font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'sell'
              ? 'text-blue-600 border-blue-600 bg-blue-50/30'
              : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100/50'
          }`}
        >
          <MapPin className="w-5 h-5" /> I Want to Sell
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <h3 className="text-xl font-bold text-slate-900">
          {activeTab === 'buy' ? 'Submit your buying demand' : 'List your property for sale'}
        </h3>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Name + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelCls}><User className="w-3.5 h-3.5" /> Full Name <span className="text-rose-500">*</span></label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Rajesh Patel" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}><Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-rose-500">*</span></label>
            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" className={inputCls} />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className={labelCls}><Mail className="w-3.5 h-3.5" /> Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. rajesh@example.com" className={inputCls} />
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <label className={labelCls}><Home className="w-3.5 h-3.5" /> Property Type <span className="text-rose-500">*</span></label>
          <select name="propertyType" required value={formData.propertyType} onChange={handleChange} className={selectCls}>
            <option value="" disabled className="text-slate-400">Select property type</option>
            {propertyTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.display_name}</option>
            ))}
          </select>
        </div>

        {/* ── Location: State → City → Area ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">Location</span>
            <span className="text-rose-500 text-xs">*</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl">
            {/* State */}
            <div className="space-y-2">
              <label className={labelCls}><Globe className="w-3.5 h-3.5" /> State</label>
              <select name="state" required value={formData.state} onChange={handleChange} className={selectCls}>
                <option value="" disabled className="text-slate-400">Select state</option>
                {LOCATION_DATA.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className={`${labelCls} ${!formData.state ? 'opacity-50' : ''}`}>
                <Building className="w-3.5 h-3.5" /> City
              </label>
              {formData.state ? (
                <select name="city" required value={formData.city} onChange={handleChange} className={selectCls}>
                  <option value="" disabled className="text-slate-400">Select city</option>
                  {availableCities.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              ) : (
                <select disabled className={disabledSelectCls}>
                  <option>Select state first</option>
                </select>
              )}
            </div>

            {/* Preferred Area */}
            <div className="space-y-2">
              <label className={`${labelCls} ${!formData.city ? 'opacity-50' : ''}`}>
                <MapPin className="w-3.5 h-3.5" /> Preferred Area
              </label>
              {formData.city ? (
                <select name="area" required value={formData.area} onChange={handleChange} className={selectCls}>
                  <option value="" disabled className="text-slate-400">Select area</option>
                  {availableAreas.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              ) : (
                <select disabled className={disabledSelectCls}>
                  <option>Select city first</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Budget / Price */}
        <div className="space-y-2">
          <label className={labelCls}>
            <DollarSign className="w-3.5 h-3.5" />
            {activeTab === 'buy' ? 'Budget Range' : 'Expected Price'} <span className="text-rose-500">*</span>
          </label>
          <select name="budgetOrPrice" required value={formData.budgetOrPrice} onChange={handleChange} className={selectCls}>
            <option value="" disabled className="text-slate-400">Select range</option>
            {budgetRanges.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.display_name}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className={labelCls}><FileText className="w-3.5 h-3.5" /> Additional Details</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder={
              activeTab === 'buy'
                ? 'Specify preferences e.g. 3 BHK, east-facing, corner plot, vastu preferred...'
                : 'Describe the property e.g. age, floors, parking, furnishing, loan clear...'
            }
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
            activeTab === 'buy'
              ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20'
          }`}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
          ) : activeTab === 'buy' ? (
            'Submit Buying Requirement'
          ) : (
            'Submit Property Listing'
          )}
        </button>
      </form>
    </div>
  );
}
