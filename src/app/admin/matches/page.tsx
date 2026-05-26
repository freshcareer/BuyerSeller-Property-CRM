'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Zap, Loader2 } from 'lucide-react';
import MatchCard from './MatchCard';

interface Match {
  buyer_id: string;
  seller_id: string;
  buyer_name: string;
  buyer_phone: string;
  seller_name: string;
  seller_phone: string;
  property_type: string;
  area: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const { data: buyers, error: buyersError } = await supabase
          .from('buyers_demand')
          .select('id, name, phone, property_type, city, area, status');

        const { data: sellers, error: sellersError } = await supabase
          .from('sellers_inventory')
          .select('id, name, phone, property_type, city, area, status');

        if (buyersError) throw buyersError;
        if (sellersError) throw sellersError;

        // Helper: normalize strings for comparison (lowercase + trim)
        const norm = (s: string) => (s || '').toLowerCase().trim();

        // Extract just the area name (first part before comma)
        const getAreaSlug = (area: string) => norm(area).split(',')[0].trim().replace(/\s+/g, '_').replace(/-/g, '_');

        const activeBuyers = (buyers || []).filter(b => b.status !== 'closed_won' && b.status !== 'closed_lost');
        const activeSellers = (sellers || []).filter(s => s.status !== 'closed_won' && s.status !== 'closed_lost');

        const computedMatches: Match[] = [];
        activeBuyers.forEach(buyer => {
          activeSellers.forEach(seller => {
            const typeMatch = norm(buyer.property_type) === norm(seller.property_type);
            const cityMatch = norm(buyer.city) === norm(seller.city);
            const areaMatch = getAreaSlug(buyer.area) === getAreaSlug(seller.area);

            if (typeMatch && cityMatch && areaMatch) {
              computedMatches.push({
                buyer_id: buyer.id,
                seller_id: seller.id,
                buyer_name: buyer.name,
                buyer_phone: buyer.phone,
                property_type: buyer.property_type,
                area: buyer.area,
                seller_name: seller.name,
                seller_phone: seller.phone
              });
            }
          });
        });
        setMatches(computedMatches);
      } catch (err: unknown) {
        setError((err as Error).message || 'An error occurred while fetching matches');
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  // Format property type nicely (e.g. 'residential_plot' -> 'Residential Plot')
  const formatType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Smart Matches
          </h1>
          <p className="text-slate-500 mt-1">
            Automatically paired buyers and sellers based on location and property type.
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          <p className="font-bold">Error loading matches:</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Finding perfect matches...</p>
        </div>
      ) : !matches || matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <Zap className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No matches found</h3>
          <p className="text-slate-500 text-center max-w-sm">
            We couldn&apos;t find any exact matches between buyers and sellers in the same area for the same property type.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {matches.map((match, idx) => (
            <MatchCard key={idx} match={match} formatType={formatType} />
          ))}
        </div>
      )}
    </div>
  );
}
