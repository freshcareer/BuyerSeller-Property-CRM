'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, ChevronRight, Loader2, User, Phone, Mail, Building, MapPin, DollarSign, FileText } from 'lucide-react';

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
    area: '',
    budgetOrPrice: '',
    notes: '',
  });

  // Filter options dynamically
  const propertyTypes = options.filter((o) => o.category === 'property_type');
  const cityAreas = options.filter((o) => o.category === 'city_area');
  const budgetRanges = options.filter((o) => o.category === 'budget_range');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name || !formData.phone || !formData.propertyType || !formData.area || !formData.budgetOrPrice) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'buy') {
        const { error: insertError } = await supabase.from('buyers_demand').insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          property_type: formData.propertyType,
          area: formData.area,
          budget: formData.budgetOrPrice,
          notes: formData.notes || null,
          status: 'new_lead', // default dynamic status value representation
        });

        if (insertError) throw insertError;
      } else {
        const { error: insertError } = await supabase.from('sellers_inventory').insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          property_type: formData.propertyType,
          area: formData.area,
          price: formData.budgetOrPrice,
          notes: formData.notes || null,
          status: 'new_lead',
        });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        propertyType: '',
        area: '',
        budgetOrPrice: '',
        notes: '',
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl max-w-xl mx-auto min-h-[400px] transition-all duration-500 animate-in fade-in zoom-in">
        <div className="p-4 bg-emerald-500/10 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Requirement Submitted!</h3>
        <p className="text-slate-300 mb-8 max-w-sm">
          Thank you. Our expert matching engines will process your details, and a representative will contact you shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2"
        >
          Submit Another Request <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-950/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-800/80 bg-slate-900/30">
        <button
          type="button"
          onClick={() => {
            setActiveTab('buy');
            setError(null);
          }}
          className={`flex-1 py-4 text-center font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'buy'
              ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-800/20'
          }`}
        >
          <Building className="w-5 h-5" /> I Want to Buy
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('sell');
            setError(null);
          }}
          className={`flex-1 py-4 text-center font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'sell'
              ? 'text-violet-400 border-violet-500 bg-violet-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-800/20'
          }`}
        >
          <MapPin className="w-5 h-5" /> I Want to Sell
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <h3 className="text-xl font-medium text-slate-200">
          {activeTab === 'buy' 
            ? 'Submit your buying demand' 
            : 'List your property for sale'}
        </h3>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 placeholder-slate-500 outline-none transition-all duration-300"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 555-0199"
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 placeholder-slate-500 outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@example.com"
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 placeholder-slate-500 outline-none transition-all duration-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Type Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Property Type <span className="text-rose-500">*</span>
            </label>
            <select
              name="propertyType"
              required
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 outline-none transition-all duration-300 appearance-none"
            >
              <option value="" disabled className="text-slate-500">Select type</option>
              {propertyTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Area Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Preferred Area <span className="text-rose-500">*</span>
            </label>
            <select
              name="area"
              required
              value={formData.area}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 outline-none transition-all duration-300 appearance-none"
            >
              <option value="" disabled className="text-slate-500">Select area</option>
              {cityAreas.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget or Price Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> {activeTab === 'buy' ? 'Budget Range' : 'Expected Price'} <span className="text-rose-500">*</span>
            </label>
            <select
              name="budgetOrPrice"
              required
              value={formData.budgetOrPrice}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 outline-none transition-all duration-300 appearance-none"
            >
              <option value="" disabled className="text-slate-500">Select range</option>
              {budgetRanges.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Additional Details
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder={activeTab === 'buy' 
              ? 'Specify any preferences e.g. 3 BHK, balcony facing, floor level...' 
              : 'Specify any characteristics e.g. age of building, parking spots, furnishing status...'}
            rows={3}
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 placeholder-slate-500 outline-none transition-all duration-300 resize-none"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
            activeTab === 'buy'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/20'
              : 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 hover:shadow-violet-500/20'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...
            </>
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
