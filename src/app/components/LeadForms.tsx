'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle2, ChevronRight, Loader2, User, Phone, Mail,
  Building, MapPin, DollarSign, FileText, Globe, Home, AlertCircle, Edit, Trash2,
  Bed, Bath, Compass, Key, Tag, Car, Expand, Armchair, Layers, Clock,
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

// Dynamic options are now fetched from DB

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
  const [userId, setUserId] = useState<string | null>(null);

  // Dynamic Location states
  const [dbStates, setDbStates] = useState<{ id: string; name: string }[]>([]);
  const [dbCities, setDbCities] = useState<{ id: string; name: string }[]>([]);
  const [dbAreas, setDbAreas] = useState<{ id: string; name: string }[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Seller My Listings state
  const [myListings, setMyListings] = useState<any[]>([]);
  const [editModeId, setEditModeId] = useState<string | null>(null);
  const [fetchingListings, setFetchingListings] = useState(false);

  // Form states (Location values hold state_id, city_id, area_id)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    propertyType: 'apartment',
    state: '',
    city: '',
    area: '',
    budgetOrPrice: '',
    customBudget: '',
    bedrooms: '3',
    bathrooms: '3',
    builtupArea: '',
    additionalSpaces: '',
    possessionStatus: 'ready_to_move',
    facing: '',
    parking: '',
    description: '',
    tags: '',
    furnishing: 'semi_furnished',
    balconies: '',
    propertyAge: '',
    notes: '',
    listingPurpose: activeTab === 'buy' ? 'buy' : 'sell',
  });

  // Keep listingPurpose in sync when switching between forms
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      listingPurpose: activeTab === 'buy' ? 'buy' : 'sell'
    }));
  }, [activeTab]);

  // Track which fields have been touched
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // 1. Fetch States on Mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
          // Auto-fill email and phone if they have it and it's not set
          const profileEmail = session.user.email || session.user.user_metadata?.email || '';
          const profilePhone = session.user.phone || session.user.user_metadata?.phone || '';
          const profileName = session.user.user_metadata?.full_name || '';

          setFormData(prev => ({ 
            ...prev, 
            email: prev.email || profileEmail,
            phone: prev.phone || profilePhone,
            name: prev.name || profileName
          }));
        }

        const { data, error } = await supabase
          .from('states')
          .select('id, name')
          .order('name', { ascending: true });
        if (error) throw error;
        setDbStates(data || []);
        
        // Auto-select Gujarat for Ahmedabad locking
        if (data && !editModeId) {
          const gujarat = data.find(s => s.name.toLowerCase() === 'gujarat');
          if (gujarat && !formData.state) {
            setFormData(prev => ({ ...prev, state: gujarat.id }));
          }
        }
      } catch (e) {
        console.error('Error loading states:', e);
      }
    };
    fetchStates();
  }, []);

  // 2. Fetch Cities when selected State changes
  useEffect(() => {
    if (!formData.state) {
      setDbCities([]);
      setDbAreas([]);
      return;
    }
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name')
          .eq('state_id', formData.state)
          .order('name', { ascending: true });
        if (error) throw error;
        setDbCities(data || []);
        
        // Auto-select Ahmedabad
        if (data && !editModeId) {
          const ahmedabad = data.find(c => c.name.toLowerCase() === 'ahmedabad');
          if (ahmedabad && !formData.city) {
            setFormData(prev => ({ ...prev, city: ahmedabad.id, area: '' }));
          } else if (!formData.city) {
            setFormData(prev => ({ ...prev, city: '', area: '' }));
          }
        } else if (!editModeId && !formData.city) {
          setFormData(prev => ({ ...prev, city: '', area: '' }));
        }
      } catch (e) {
        console.error('Error loading cities:', e);
      }
    };
    fetchCities();
  }, [formData.state]);

  // 3. Fetch Areas when selected City changes
  useEffect(() => {
    if (!formData.city) {
      setDbAreas([]);
      return;
    }
    const fetchAreas = async () => {
      try {
        const { data, error } = await supabase
          .from('areas')
          .select('id, name')
          .eq('city_id', formData.city)
          .order('name', { ascending: true });
        if (error) throw error;
        setDbAreas(data || []);
        if (!editModeId) {
          setFormData(prev => ({ ...prev, area: '' }));
        }
      } catch (e) {
        console.error('Error loading areas:', e);
      }
    };
    fetchAreas();
  }, [formData.city]);

  useEffect(() => {
    fetchMyListings();
  }, [activeTab]);

  const fetchMyListings = async () => {
    try {
      const storageKey = activeTab === 'buy' ? 'myBuyerListings' : 'mySellerListings';
      const tableName = activeTab === 'buy' ? 'buyers_demand' : 'sellers_inventory';

      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setMyListings([]);
        return;
      }
      const ids = JSON.parse(stored);
      if (!Array.isArray(ids) || ids.length === 0) {
        setMyListings([]);
        return;
      }
      
      setFetchingListings(true);
      const { data, error } = await supabase.from(tableName).select('*').in('id', ids).order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setMyListings(data);
      }
    } catch (e) {
      console.error('Error fetching my listings', e);
      setMyListings([]);
    } finally {
      setFetchingListings(false);
    }
  };

  const handleEditClick = async (item: any) => {
    setLoadingLocations(true);
    setEditModeId(item.id);

    try {
      // Find state ID by matching text name
      const matchedState = dbStates.find(s => s.name.toLowerCase() === item.state.toLowerCase());
      const stateId = matchedState ? matchedState.id : '';

      let cityId = '';
      let areaId = '';
      let loadedCities: any[] = [];
      let loadedAreas: any[] = [];

      if (stateId) {
        const { data: citiesData } = await supabase
          .from('cities')
          .select('id, name')
          .eq('state_id', stateId)
          .order('name');
        if (citiesData) {
          loadedCities = citiesData;
          const matchedCity = citiesData.find(c => c.name.toLowerCase() === item.city.toLowerCase());
          cityId = matchedCity ? matchedCity.id : '';
        }
      }

      if (cityId) {
        const { data: areasData } = await supabase
          .from('areas')
          .select('id, name')
          .eq('city_id', cityId)
          .order('name');
        if (areasData) {
          loadedAreas = areasData;
          // Extract first part of area e.g. "Bopal" from "Bopal, Ahmedabad, Gujarat"
          const cleanAreaName = item.area.split(',')[0].trim();
          const matchedArea = areasData.find(a => a.name.toLowerCase() === cleanAreaName.toLowerCase());
          areaId = matchedArea ? matchedArea.id : '';
        }
      }

      setDbCities(loadedCities);
      setDbAreas(loadedAreas);

      setFormData({
        name: item.name,
        phone: item.phone,
        email: item.email || '',
        propertyType: item.property_type,
        state: stateId,
        city: cityId,
        area: areaId,
        budgetOrPrice: item.price || item.budget,
        customBudget: '',
        bedrooms: item.bedrooms || '',
        bathrooms: item.bathrooms || '',
        builtupArea: item.builtup_area || '',
        additionalSpaces: item.additional_spaces || '',
        possessionStatus: item.possession_status || '',
        facing: item.facing || '',
        parking: item.parking || '',
        description: item.description || '',
        tags: item.tags || '',
        furnishing: item.furnishing || '',
        balconies: item.balconies || '',
        propertyAge: item.property_age || '',
        notes: item.notes || '',
        listingPurpose: item.listing_purpose || (activeTab === 'buy' ? 'buy' : 'sell'),
      });
      setTouched({});
      setSubmitError(null);
      setSuccess(false);
    } catch (e) {
      console.error('Error loading location keys for edit:', e);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    const isBuy = activeTab === 'buy';
    const typeLabel = isBuy ? 'requirement' : 'listing';
    if (!confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;

    try {
      const storageKey = isBuy ? 'myBuyerListings' : 'mySellerListings';
      const tableName = isBuy ? 'buyers_demand' : 'sellers_inventory';

      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const newStored = stored.filter((savedId: string) => savedId !== id);
      localStorage.setItem(storageKey, JSON.stringify(newStored));
      
      if (editModeId === id) {
        cancelEdit();
      }
      
      fetchMyListings();
    } catch (e) {
      console.error(`Error deleting ${typeLabel}`, e);
      alert(`Failed to delete the ${typeLabel}.`);
    }
  };

  const cancelEdit = () => {
    setEditModeId(null);
    setFormData({ name: '', phone: '', email: '', propertyType: '', state: '', city: '', area: '', budgetOrPrice: '', bedrooms: '', bathrooms: '', builtupArea: '', additionalSpaces: '', possessionStatus: '', facing: '', parking: '', description: '', tags: '', furnishing: '', balconies: '', propertyAge: '', notes: '', listingPurpose: activeTab === 'buy' ? 'buy' : 'sell' });
    setTouched({});
    setSubmitError(null);
  };

  // Computed inline errors — only show for touched fields
  const errors: Partial<Record<FieldKey, string>> = {};
  (Object.keys(validators) as FieldKey[]).forEach((key) => {
    const err = validators[key](formData[key as keyof typeof formData] || '');
    if (err) errors[key] = err;
  });

  // Supabase system_settings options
  const isRent = formData.listingPurpose === 'rent';
  const isCommercial = formData.propertyType === 'commercial_shop' || formData.propertyType === 'office_space' || formData.propertyType === 'warehouse';

  const propertyTypes = options.filter((o) => o.category === 'property_type');
  let budgetRanges = options.filter((o) => o.category === (isRent ? 'rent_range' : 'budget_range'));
  if (isRent && budgetRanges.length === 0) {
    budgetRanges = [
      { category: 'rent_range', value: 'Under 10k', display_name: 'Under ₹10k' },
      { category: 'rent_range', value: '10k - 20k', display_name: '₹10k - ₹20k' },
      { category: 'rent_range', value: '20k - 30k', display_name: '₹20k - ₹30k' },
      { category: 'rent_range', value: '30k - 50k', display_name: '₹30k - ₹50k' },
      { category: 'rent_range', value: '50k - 1L', display_name: '₹50k - ₹1L' },
      { category: 'rent_range', value: 'Above 1L', display_name: 'Above ₹1L' },
    ];
  }
  budgetRanges = [...budgetRanges, { category: isRent ? 'rent_range' : 'budget_range', value: 'custom', display_name: 'Custom' }];
  const bedroomOptions = options.filter((o) => o.category === 'bedrooms');
  const bathroomOptions = options.filter((o) => o.category === 'bathrooms');
  const facingOptions = options.filter((o) => o.category === 'facing');
  const possessionOptions = options.filter((o) => o.category === 'possession_status');
  const furnishingOptions = options.filter((o) => o.category === 'furnishing');
  const balconyOptions = options.filter((o) => o.category === 'balconies');
  const propertyAgeOptions = options.filter((o) => o.category === 'property_age');
  const parkingOptions = options.filter((o) => o.category === 'parking');
  const additionalSpacesOptions = options.filter((o) => o.category === 'additional_spaces');
  const tagOptions = options.filter((o) => o.category === 'tags');
  const areaSuggestionsOptions = options.filter((o) => o.category === 'area_suggestions');

  const touch = (field: FieldKey) => setTouched((prev) => ({ ...prev, [field]: true }));

  // ── Quick Select Handlers ──────────────────────────────────────────────────
  const toggleMultiSelect = (field: 'additionalSpaces' | 'tags', value: string) => {
    const current = formData[field];
    const array = current ? current.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (array.includes(value)) {
      setFormData(prev => ({ ...prev, [field]: array.filter(v => v !== value).join(', ') }));
    } else {
      setFormData(prev => ({ ...prev, [field]: [...array, value].join(', ') }));
    }
  };

  const selectSingle = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in validators) {
      touch(field as FieldKey);
    }
  };

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

    // Find state, city, area names for storage in string columns
    const selectedState = dbStates.find(s => s.id === formData.state)?.name || '';
    const selectedCity = dbCities.find(c => c.id === formData.city)?.name || '';
    const selectedArea = dbAreas.find(a => a.id === formData.area)?.name || '';
    const locationString = `${selectedArea}, ${selectedCity}, ${selectedState}`;

    try {
      if (activeTab === 'buy') {
        const { error: insertError } = await supabase.from('buyers_demand').insert({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          property_type: formData.propertyType,
          state: selectedState,
          city: selectedCity,
          area: locationString,
          budget: formData.budgetOrPrice === 'custom' ? formData.customBudget.trim() : formData.budgetOrPrice,
          bedrooms: formData.bedrooms || null,
          bathrooms: formData.bathrooms || null,
          builtup_area: formData.builtupArea.trim() || null,
          additional_spaces: formData.additionalSpaces.trim() || null,
          possession_status: formData.possessionStatus || null,
          facing: formData.facing || null,
          parking: formData.parking.trim() || null,
          description: formData.description.trim() || null,
          tags: formData.tags.trim() || null,
          furnishing: formData.furnishing || null,
          balconies: formData.balconies || null,
          property_age: formData.propertyAge || null,
          notes: formData.notes.trim() || null,
          status: 'new_lead',
          listing_purpose: formData.listingPurpose,
          user_id: userId,
        });
        if (insertError) throw insertError;
      } else {
        const payload = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          property_type: formData.propertyType,
          state: selectedState,
          city: selectedCity,
          area: locationString,
          price: formData.budgetOrPrice === 'custom' ? formData.customBudget.trim() : formData.budgetOrPrice,
          bedrooms: formData.bedrooms || null,
          bathrooms: formData.bathrooms || null,
          builtup_area: formData.builtupArea.trim() || null,
          additional_spaces: formData.additionalSpaces.trim() || null,
          possession_status: formData.possessionStatus || null,
          facing: formData.facing || null,
          parking: formData.parking.trim() || null,
          description: formData.description.trim() || null,
          tags: formData.tags.trim() || null,
          furnishing: formData.furnishing || null,
          balconies: formData.balconies || null,
          property_age: formData.propertyAge || null,
          notes: formData.notes.trim() || null,
          listing_purpose: formData.listingPurpose,
          user_id: userId,
        };

        if (editModeId) {
          const { error: updateError } = await supabase.from('sellers_inventory').update(payload).eq('id', editModeId);
          if (updateError) throw updateError;
          setEditModeId(null);
          fetchMyListings();
        } else {
          const { data, error: insertError } = await supabase.from('sellers_inventory').insert({
            ...payload,
            status: 'new_lead',
          }).select('id').single();
          if (insertError) throw insertError;
          if (data) {
            const stored = JSON.parse(localStorage.getItem('mySellerListings') || '[]');
            if (!stored.includes(data.id)) {
              stored.push(data.id);
              localStorage.setItem('mySellerListings', JSON.stringify(stored));
            }
            fetchMyListings();
          }
        }
      }

      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', propertyType: '', state: '', city: '', area: '', budgetOrPrice: '', customBudget: '', bedrooms: '', bathrooms: '', builtupArea: '', additionalSpaces: '', possessionStatus: '', facing: '', parking: '', description: '', tags: '', furnishing: '', balconies: '', propertyAge: '', notes: '', listingPurpose: activeTab === 'buy' ? 'buy' : 'sell' });
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
            <Building className="w-5 h-5" /> Buy / Rent
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
            <MapPin className="w-5 h-5" /> Sell / Rent Out
          </button>
        </div>
      )}

      {/* My Listings Section (Buyer & Seller) */}
      {myListings.length > 0 && (
        <div className="p-4 md:p-6 bg-slate-50/80 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-600" /> My {activeTab === 'sell' ? 'Listed Properties' : 'Submitted Requirements'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myListings.map((item) => (
              <div key={item.id} className={`bg-white border rounded-xl p-4 shadow-sm relative transition-all ${editModeId === item.id ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 text-sm capitalize">{item.property_type.replace(/_/g, ' ')}</h4>
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                    {(item.price || item.budget || '').replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5" /> {item.area.split(',')[0]}, {item.city}
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEditClick(item)} className="flex-1 py-1.5 text-xs font-bold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => handleDeleteClick(item.id)} className="flex-1 py-1.5 text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingLocations && (
        <div className="p-4 bg-blue-50 text-blue-700 flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading location metadata for edit mode...
        </div>
      )}

      <form onSubmit={handleSubmit} className={`p-4 md:p-6 space-y-4 ${editModeId ? 'bg-indigo-50/30' : ''}`} noValidate>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900">
            {activeTab === 'buy' 
              ? (formData.listingPurpose === 'rent' ? 'Submit Rental Requirement' : 'Submit Buying Requirement')
              : editModeId 
                ? 'Edit Property Listing' 
                : (formData.listingPurpose === 'rent' ? 'List your property for rent' : 'List your property for sale')}
          </h3>
          {editModeId && (
            <button type="button" onClick={cancelEdit} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
              Cancel Edit
            </button>
          )}
        </div>

        {/* Server/submit error */}
        {submitError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}

        {/* Purpose Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 mb-6 max-w-md mx-auto sm:mx-0">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, listingPurpose: activeTab === 'buy' ? 'buy' : 'sell' })}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all shadow-sm ${
              formData.listingPurpose === (activeTab === 'buy' ? 'buy' : 'sell')
                ? 'bg-white text-blue-700 ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 shadow-none'
            }`}
          >
            {activeTab === 'buy' ? 'I Want to Buy' : 'I Want to Sell'}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, listingPurpose: 'rent' })}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all shadow-sm ${
              formData.listingPurpose === 'rent'
                ? 'bg-white text-blue-700 ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 shadow-none'
            }`}
          >
            {activeTab === 'buy' ? 'I Want to Rent' : 'Rent Out'}
          </button>
        </div>

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
              placeholder="e.g. freshcareer4@gmail.com" className={getInputCls('email')}
            />
            {renderFieldError('email')}
          </div>
        </div>

        {/* Property Type & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelCls}>
              <Home className="w-3.5 h-3.5" /> Property Type <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectSingle('propertyType', opt.value)}
                  className={`flex-1 min-w-[120px] px-3 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${formData.propertyType === opt.value ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                >
                  {opt.display_name}
                </button>
              ))}
            </div>
            {renderFieldError('propertyType')}
          </div>

          <div className="space-y-2">
            <label className={labelCls}>
              <DollarSign className="w-3.5 h-3.5" /> 
              {isRent 
                ? (activeTab === 'buy' ? 'Rental Budget' : 'Expected Rent') 
                : (activeTab === 'buy' ? 'Budget' : 'Expected Price')} 
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {budgetRanges.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectSingle('budgetOrPrice', opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${formData.budgetOrPrice === opt.value ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                >
                  {opt.display_name}
                </button>
              ))}
            </div>
            {formData.budgetOrPrice === 'custom' && (
              <div className="mt-3 animate-in slide-in-from-top-1">
                <input
                  type="text"
                  placeholder={isRent ? "e.g. 15,000" : "e.g. 55 Lakhs"}
                  value={formData.customBudget}
                  onChange={(e) => setFormData(prev => ({ ...prev, customBudget: e.target.value }))}
                  className={getInputCls('customBudget')}
                  required
                />
              </div>
            )}
            {renderFieldError('budgetOrPrice')}
          </div>
        </div>

        {/* Location: State → City → Area */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Location (Ahmedabad, Gujarat)</span>
            <span className="text-rose-500 text-xs">*</span>
          </div>

          <div className="grid grid-cols-1 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            {/* State (Hidden for Ahmedabad lock) */}
            <div className="hidden">
              <label className={labelCls}><Globe className="w-3.5 h-3.5" /> State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={() => handleBlur('state')}
                className={getSelectCls('state')}
              >
                <option value="" disabled className="text-slate-400">Select state</option>
                {dbStates.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {renderFieldError('state')}
            </div>

            {/* City (Hidden for Ahmedabad lock) */}
            <div className="hidden">
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
                    {dbCities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
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
                    {dbAreas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
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

        {/* Advanced Property Details */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <button type="button" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-extrabold text-slate-800">Advanced Details (Optional)</span>
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">{isAdvancedOpen ? 'Hide ▲' : 'Expand ▼'}</span>
          </button>
          
          {isAdvancedOpen && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className={labelCls}><Bed className="w-3.5 h-3.5" /> {isCommercial ? 'Cabins / Rooms' : 'Bedrooms'}</label>
              <div className="flex flex-wrap gap-1.5">
                {bedroomOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => selectSingle('bedrooms', opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${formData.bedrooms === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {opt.display_name.replace(' Bedrooms', '').replace(' Bedroom', '').replace('5+ ', '5+')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Bath className="w-3.5 h-3.5" /> {isCommercial ? 'Washrooms' : 'Bathrooms'}</label>
              <div className="flex flex-wrap gap-1.5">
                {bathroomOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => selectSingle('bathrooms', opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${formData.bathrooms === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {opt.display_name.replace(' Bathrooms', '').replace(' Bathroom', '')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Expand className="w-3.5 h-3.5" /> Built-up Area</label>
              <input type="text" name="builtupArea" value={formData.builtupArea} onChange={handleChange} placeholder="e.g. 1500 Sq.Ft." className={getInputCls('builtupArea' as any)} />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {areaSuggestionsOptions.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFormData(p => ({...p, builtupArea: s.value}))}
                    className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${formData.builtupArea === s.value ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Compass className="w-3.5 h-3.5" /> Facing</label>
              <div className="flex flex-wrap gap-1.5">
                {facingOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => selectSingle('facing', opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${formData.facing === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {opt.display_name.replace(' Facing', '')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Key className="w-3.5 h-3.5" /> Possession</label>
              <div className="flex flex-wrap gap-1.5">
                {possessionOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => selectSingle('possessionStatus', opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${formData.possessionStatus === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {opt.display_name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Car className="w-3.5 h-3.5" /> Parking</label>
              <div className="flex flex-wrap gap-1.5">
                {parkingOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectSingle('parking', opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${formData.parking === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {opt.display_name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Armchair className="w-3.5 h-3.5" /> Furnishing</label>
              <div className="flex flex-wrap gap-1.5">
                {furnishingOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => selectSingle('furnishing', opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${formData.furnishing === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {opt.display_name.replace('-Furnished', '').replace(' Furnished', '')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Layers className="w-3.5 h-3.5" /> Balconies</label>
              <div className="flex flex-wrap gap-1.5">
                {balconyOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => selectSingle('balconies', opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${formData.balconies === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {opt.display_name.replace(' Balconies', '').replace(' Balcony', '')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}><Clock className="w-3.5 h-3.5" /> Property Age</label>
              <div className="flex flex-wrap gap-1.5">
                {propertyAgeOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => selectSingle('propertyAge', opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${formData.propertyAge === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {opt.display_name.replace(' Years Old', ' Yrs').replace('New Construction', 'New')}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className={labelCls}><Home className="w-3.5 h-3.5" /> Additional Spaces</label>
               <div className="flex flex-wrap gap-1.5 mb-1.5">
                {additionalSpacesOptions.map(opt => {
                  const isSel = (formData.additionalSpaces || '').split(',').map(s => s.trim()).includes(opt.value);
                  return (
                    <button key={opt.value} type="button" onClick={() => toggleMultiSelect('additionalSpaces', opt.value)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${isSel ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
                    >
                      {opt.display_name}
                    </button>
                  );
                })}
               </div>
               <input type="text" name="additionalSpaces" value={formData.additionalSpaces} onChange={handleChange} placeholder="Custom (comma separated)" className={getInputCls('additionalSpaces' as any) + ' mt-1'} />
             </div>
             <div className="space-y-1">
               <label className={labelCls}><Tag className="w-3.5 h-3.5" /> Highlight Tags</label>
               <div className="flex flex-wrap gap-1.5 mb-1.5">
                 {tagOptions.map(opt => {
                   const isSelected = formData.tags.includes(opt.value);
                   return (
                     <button
                       key={opt.value}
                       type="button"
                       onClick={() => toggleMultiSelect('tags', opt.value)}
                       className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
                     >
                       {isSelected && <CheckCircle2 className="w-3 h-3 inline-block mr-1" />}
                       {opt.display_name}
                     </button>
                   );
                 })}
               </div>
               <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Custom (comma separated)" className={getInputCls('tags' as any) + ' mt-1'} />
             </div>
          </div>
          
          <div className="space-y-1">
            <label className={labelCls}><FileText className="w-3.5 h-3.5" /> Public Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Write a detailed description of the property to show on the public listing..." className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-4 py-3 placeholder-slate-400 outline-none transition-all duration-200 resize-none" />
          </div>
          </div>
          )}
        </div>


        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-blue-600/20"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : activeTab === 'buy' ? (
            'Let\'s Find Your Dream Home Together'
          ) : (
            'Help Me Sell My Property Safely'
          )}
        </button>
      </form>
    </div>
  );
}
