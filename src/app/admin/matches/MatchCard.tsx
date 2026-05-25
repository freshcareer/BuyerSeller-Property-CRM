'use client';

import { Building, Phone, Send, Calendar } from 'lucide-react';

interface MatchProps {
  match: any;
  formatType: (type: string) => string;
}

export default function MatchCard({ match, formatType }: MatchProps) {
  const message = `Hello ${match.buyer_name},\n\nWe have found a perfect match for your requirement of a ${formatType(match.property_type)} in ${match.area}.\n\nWhen would you like to schedule a site visit?`;
  const waUrl = `https://wa.me/${match.buyer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header Strip */}
      <div className="bg-blue-50/50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg uppercase tracking-wider">
            Matched Location
          </span>
          <span className="text-sm font-semibold text-slate-700">{match.area}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          <Building className="w-4 h-4 text-blue-500" />
          {formatType(match.property_type)}
        </div>
      </div>

      {/* Content columns */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Buyer Side */}
        <div className="flex-1 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Buyer Demand</h3>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{match.buyer_name}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
              <Phone className="w-3.5 h-3.5" /> {match.buyer_phone}
            </p>
          </div>
        </div>

        {/* Seller Side */}
        <div className="flex-1 p-6 space-y-4 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Seller Inventory</h3>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{match.seller_name}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
              <Phone className="w-3.5 h-3.5" /> {match.seller_phone}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button 
          onClick={() => alert("Calendar Modal Implementation Pending")} 
          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm text-sm"
        >
          <Calendar className="w-4 h-4" /> Schedule Site Visit
        </button>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md text-sm"
        >
          <Send className="w-4 h-4" /> Send Match to Buyer
        </a>
      </div>
    </div>
  );
}
