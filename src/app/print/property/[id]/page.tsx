'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Seller } from '@/app/admin/sellers/types';
import { 
  Building2, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  Compass, 
  CheckCircle2,
  Phone,
  Mail,
  CalendarDays
} from 'lucide-react';

export default function PropertyBrochurePrint() {
  const params = useParams();
  const id = params?.id as string;
  const [property, setProperty] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('sellers_inventory')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setProperty(data);
      } catch (err) {
        console.error('Failed to load property', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (property && !loading) {
      // Trigger print after rendering
      setTimeout(() => {
        window.print();
      }, 800);
    }
  }, [property, loading]);

  if (loading) {
    return <div className="p-10 text-center font-bold text-slate-500">Generating Document...</div>;
  }

  if (!property) {
    return <div className="p-10 text-center font-bold text-rose-500">Property not found.</div>;
  }

  const titleStr = `${property.property_type.replace(/_/g, ' ')}`;
  const areaName = property.area.split(',')[0].trim();
  const fullAddress = property.area.replace(/_/g, ' ');

  return (
    <div className="bg-white min-h-screen font-sans print:bg-white pb-20">
      
      {/* Non-Printable Header for Browser view */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden shadow-lg sticky top-0 z-50">
        <h2 className="font-extrabold flex items-center gap-2"><Building2 className="w-5 h-5" /> Brochure Preview</h2>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-bold text-sm shadow-md transition-all"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Brochure A4 Container */}
      <div className="max-w-[800px] mx-auto bg-white print:max-w-none print:shadow-none print:m-0 mt-8 shadow-2xl overflow-hidden border border-slate-100 relative print:border-none">
        
        {/* Top Header Section */}
        <div className="relative h-[250px] bg-slate-900 overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/80 z-10" />
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

          <div className="relative z-20 p-8 flex justify-between items-start">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span className="font-extrabold tracking-widest text-white uppercase text-sm">PropConnect Exclusive</span>
            </div>
          </div>

          <div className="relative z-20 p-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white capitalize drop-shadow-lg tracking-tight mb-2">
              {titleStr}
            </h1>
            <p className="text-blue-200 font-bold text-lg flex items-center gap-2 uppercase tracking-wide drop-shadow-md">
              <MapPin className="w-5 h-5" /> {areaName}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-10 space-y-10">
          
          {/* Price & Summary Ribbon */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider text-xs block mb-1">
                {property.listing_purpose === 'rent' ? 'Expected Rent' : 'Expected Price'}
              </span>
              <span className="text-3xl font-extrabold text-emerald-700 capitalize">
                {property.price.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-xs block mb-1">Location / Area</span>
              <span className="text-lg font-bold text-slate-800 capitalize truncate max-w-[200px]">
                {fullAddress}
              </span>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-6 uppercase tracking-widest flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" /> Property Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 mb-1"><Bed className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Bedrooms</span></div>
                <div className="font-extrabold text-lg text-slate-800">{property.bedrooms ? property.bedrooms.replace(/_/g, ' ') : 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 mb-1"><Bath className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Bathrooms</span></div>
                <div className="font-extrabold text-lg text-slate-800">{property.bathrooms ? property.bathrooms.replace(/_/g, ' ') : 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 mb-1"><Maximize className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Area</span></div>
                <div className="font-extrabold text-lg text-slate-800">{property.builtup_area || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 mb-1"><Car className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Parking</span></div>
                <div className="font-extrabold text-lg text-slate-800">{property.parking || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 mb-1"><Compass className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Facing</span></div>
                <div className="font-extrabold text-lg text-slate-800 capitalize">{property.facing ? property.facing.replace(/_/g, ' ') : 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 mb-1"><CheckCircle2 className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Furnished</span></div>
                <div className="font-extrabold text-lg text-slate-800 capitalize">{property.furnishing ? property.furnishing.replace(/_/g, ' ') : 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 mb-1"><CalendarDays className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Possession</span></div>
                <div className="font-extrabold text-lg text-slate-800 capitalize">{property.possession_status ? property.possession_status.replace(/_/g, ' ') : 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-4 uppercase tracking-widest">
                Description
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                {property.description}
              </p>
            </div>
          )}

          {/* Additional Features / Tags */}
          {(property.additional_spaces || property.tags) && (
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5 uppercase tracking-widest">
                Features & Highlights
              </h3>
              <div className="flex flex-wrap gap-3">
                {property.additional_spaces && property.additional_spaces.split(',').map((space, i) => (
                  <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg border border-blue-100">
                    {space.trim()}
                  </span>
                ))}
                {property.tags && property.tags.split(',').map((tag, i) => (
                  <span key={`tag-${i}`} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg border border-indigo-100">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Area */}
        <div className="bg-slate-900 text-white p-10 mt-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-1">PropConnect Realtors</h2>
              <p className="text-slate-400 text-sm font-medium">Ahmedabad's Premium Property Matchmakers</p>
            </div>
            <div className="flex flex-col gap-2 text-sm font-bold bg-white/10 px-6 py-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-blue-400" /> +91-9988776655</div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-blue-400" /> contact@propconnect.com</div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-500 font-medium">
            This document is auto-generated from PropConnect CRM. The information provided is deemed reliable but not guaranteed.
          </div>
        </div>

      </div>
      
      {/* Print Specific CSS to ensure background colors print properly */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { margin: 0; size: auto; }
        }
      `}} />
    </div>
  );
}
