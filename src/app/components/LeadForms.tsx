'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LOCATION_DATA, getCities, getAreas } from '@/lib/locationData';
import {
  CheckCircle2, ChevronRight, Loader2, User, Phone, Mail,
  Building, MapPin, DollarSign, FileText, Globe, Home, AlertCircle,
} from 'lucide-react';

interface SettingOption {
  category: string;
  value: string;
  display_name: string;
}

interface LeadFormsProps {
  options: SettingOption[];
  defaultTab?: 'buy' | 'sell';
  hideTabs?: boolean;
}

// ── Validation Rules ──────────────────────────────────────────────────────────

const validators = {
  name: (v: string) => {
    if (!v.trim()) return 'Full name is required.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    if (v.trim().length > 255) return 'Name must be less than 255 characters.';
    if (!/^[a-zA-Z\s'.'-]+$/.test(v.trim())) return 'Name can only contain letters and spaces.';
    return '';
  },
  phone: (v: string) => {
    if (!v.trim()) return 'Phone number is required.';
    const digits = v.replace(/\D/g, '');
    if (digits.length === 10) return '';
    if (digits.length === 12 && digits.startsWith('91')) return '';
    return 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
  },
  email: (v: string) => {
    if (!v.trim()) return ''; // optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
    return '';
  },
  propertyType: (v: string) => (!v ? 'Please select a property type.' : ''),
  state: (v: string) => (!v ? 'Please select your state.' : ''),
  city: (v: string) => (!v ? 'Please select your city.' : ''),
  area: (v: string) => (!v ? 'Please select your preferred area.' : ''),
  budgetOrPrice: (v: string) => (!v ? 'Please select a budget / price range.' : ''),
};

type FieldKey = keyof typeof validators;

export default function LeadForms({ options, defaultTab, hideTabs }: LeadFormsProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>(defaultTab || 'buy');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Track which fields have been touched (interacted with)
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});

  // Computed inline errors — only show for touched fields
  const errors: Partial<Record<FieldKey, string>> = {};
  (Object.keys(validators) as FieldKey[]).forEach((key) => {
    const err = validators[key](formData[key as keyof typeof formData] || '');
    if (err) errors[key] = err;
  });

  // Cascading location options
  const availableCities = formData.state ? getCities(formData.state) : [];
  const availableAreas = formData.state && formData.city ? getAreas(formData.state, formData.city) : [];

  // Supabase system_settings options
  const propertyTypes = options.filter((o) => o.category === 'property_type');
  const budgetRanges = options.filter((o) => o.category === 'budget_range');

  const touch = (field: FieldKey) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Phone: only allow digits and +
    if (name === 'phone') {
      const filtered = value.replace(/[^\d+\s-]/g, '');
      setFormData({ ...formData, phone: filtered });
      touch('phone');
      return;
    }

    // Reset downstream selections on parent change
    if (name === 'state') {
      setFormData({ ...formData, state: value, city: '', area: '' });
      touch('state');
    } else if (name === 'city') {
      setFormData({ ...formData, city: value, area: '' });
      touch('city');
    } else {
      setFormData({ ...formData, [name]: value });
      touch(name as FieldKey);
    }
  };

  const handleBlur = (field: FieldKey) => touch(field);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Touch all required fields to show all errors at once
    const allFields: FieldKey[] = ['name', 'phone', 'email', 'propertyType', 'state', 'city', 'area', 'budgetOrPrice'];
    const allTouched: Partial<Record<FieldKey, boolean>> = {};
    allFields.forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);

    // Check for any error
    const hasErrors = (Object.keys(validators) as FieldKey[]).some(
      (key) => validators[key](formData[key as keyof typeof formData] || '') !== ''
    );
    if (hasErrors) return;

    setLoading(true);

    const locationString = `${formData.area}, ${formData.city}, ${formData.state}`;

    try {
      if (activeTab === 'buy') {
        const { error: insertError } = await supabase.from('buyers_demand').insert({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          property_type: formData.propertyType,
          state: formData.state,
          city: formData.city,
          area: locationString,
          budget: formData.budgetOrPrice,
          notes: formData.notes.trim() || null,
          status: 'new_lead',
        });
        if (insertError) throw insertError;
      } else {
        const { error: insertError } = await supabase.from('sellers_inventory').insert({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          property_type: formData.propertyType,
          state: formData.state,
          city: formData.city,
          area: locationString,
          price: formData.budgetOrPrice,
          notes: formData.notes.trim() || null,
          status: 'new_lead',
        });
        if (insertError) throw insertError;
      }

      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', propertyType: '', state: '', city: '', area: '', budgetOrPrice: '', notes: '' });
      setTouched({});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      console.error('Submission error:', err);
      setSubmitError(message);
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

  // ── Style helpers ────────────────────────────────────────────────────────────

  const getInputCls = (field: FieldKey) => {
    const base = 'w-full bg-white border rounded-xl px-4 py-3 placeholder-slate-400 outline-none transition-all duration-200 text-slate-900';
    if (touched[field] && errors[field]) {
      return `${base} border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/30`;
    }
    if (touched[field] && !errors[field] && formData[field as keyof typeof formData]) {
      return `${base} border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100`;
    }
    return `${base} border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100`;
  };

  const getSelectCls = (field: FieldKey) => `${getInputCls(field)} appearance-none`;

  const disabledSelectCls = 'w-full bg-slate-50 border border-slate-200 text-slate-400 rounded-xl px-4 py-3 outline-none cursor-not-allowed appearance-none';
  const labelCls = 'text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5';

  const renderFieldError = (field: FieldKey) =>
    touched[field] && errors[field] ? (
      <p className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className={`w-full ${hideTabs ? '' : 'max-w-4xl mx-auto'} bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-300`}>
      {/* Tab Headers */}
      {!hideTabs && (
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={() => { setActiveTab('buy'); setSubmitError(null); setTouched({}); }}
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
            onClick={() => { setActiveTab('sell'); setSubmitError(null); setTouched({}); }}
            className={`flex-1 py-4 text-center font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'sell'
                ? 'text-blue-600 border-blue-600 bg-blue-50/30'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <MapPin className="w-5 h-5" /> I Want to Sell
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4" noValidate>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {activeTab === 'buy' ? 'Submit your buying demand' : 'List your property for sale'}
        </h3>

        {/* Server/submit error */}
        {submitError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}

        {/* Name, Phone, Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>
              <User className="w-3.5 h-3.5" /> Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange} onBlur={() => handleBlur('name')}
              placeholder="e.g. Rajesh Patel" className={getInputCls('name')} maxLength={255}
            />
            {renderFieldError('name')}
          </div>

          <div className="space-y-1">
            <label className={labelCls}>
              <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={() => handleBlur('phone')}
              placeholder="e.g. 9876543210" className={getInputCls('phone')} maxLength={15} inputMode="numeric"
            />
            {renderFieldError('phone')}
          </div>

          <div className="space-y-1">
            <label className={labelCls}>
              <Mail className="w-3.5 h-3.5" /> Email
              <span className="text-slate-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
            </label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')}
              placeholder="e.g. rajesh@example.com" className={getInputCls('email')}
            />
            {renderFieldError('email')}
          </div>
        </div>

        {/* Property Type & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>
              <Home className="w-3.5 h-3.5" /> Property Type <span className="text-rose-500">*</span>
            </label>
            <select
              name="propertyType" value={formData.propertyType} onChange={handleChange} onBlur={() => handleBlur('propertyType')}
              className={getSelectCls('propertyType')}
            >
              <option value="" disabled className="text-slate-400">Select property type</option>
              {propertyTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
            </select>
            {renderFieldError('propertyType')}
          </div>

          <div className="space-y-1">
            <label className={labelCls}>
              <DollarSign className="w-3.5 h-3.5" /> {activeTab === 'buy' ? 'Budget' : 'Expected Price'} <span className="text-rose-500">*</span>
            </label>
            <select
              name="budgetOrPrice" value={formData.budgetOrPrice} onChange={handleChange} onBlur={() => handleBlur('budgetOrPrice')}
              className={getSelectCls('budgetOrPrice')}
            >
              <option value="" disabled className="text-slate-400">Select range</option>
              {budgetRanges.map(opt => <option key={opt.value} value={opt.value}>{opt.display_name}</option>)}
            </select>
            {renderFieldError('budgetOrPrice')}
          </div>
        </div>

        {/* Location: State → City → Area */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Location</span>
            <span className="text-rose-500 text-xs">*</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            {/* State */}
            <div className="space-y-1">
              <label className={labelCls}><Globe className="w-3.5 h-3.5" /> State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={() => handleBlur('state')}
                className={getSelectCls('state')}
              >
                <option value="" disabled className="text-slate-400">Select state</option>
                {LOCATION_DATA.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {renderFieldError('state')}
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className={`${labelCls} ${!formData.state ? 'opacity-50' : ''}`}>
                <Building className="w-3.5 h-3.5" /> City
              </label>
              {formData.state ? (
                <>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={() => handleBlur('city')}
                    className={getSelectCls('city')}
                  >
                    <option value="" disabled className="text-slate-400">Select city</option>
                    {availableCities.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {renderFieldError('city')}
                </>
              ) : (
                <select disabled className={disabledSelectCls}>
                  <option>Select state first</option>
                </select>
              )}
            </div>

            {/* Preferred Area */}
            <div className="space-y-1">
              <label className={`${labelCls} ${!formData.city ? 'opacity-50' : ''}`}>
                <MapPin className="w-3.5 h-3.5" /> Preferred Area
              </label>
              {formData.city ? (
                <>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    onBlur={() => handleBlur('area')}
                    className={getSelectCls('area')}
                  >
                    <option value="" disabled className="text-slate-400">Select area</option>
                    {availableAreas.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                  {renderFieldError('area')}
                </>
              ) : (
                <select disabled className={disabledSelectCls}>
                  <option>Select city first</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className={labelCls}>
            <FileText className="w-3.5 h-3.5" /> Additional Details
            <span className="text-slate-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder={
              activeTab === 'buy'
                ? 'Specify preferences e.g. 3 BHK, east-facing, corner plot, vastu preferred...'
                : 'Describe the property e.g. age, floors, parking, furnishing, loan clear...'
            }
            rows={2}
            className={`w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-4 py-3 placeholder-slate-400 outline-none transition-all duration-200 resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-blue-600/20"
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
