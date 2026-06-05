'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search, User, Building, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    buyers: any[];
    sellers: any[];
  }>({ buyers: [], sellers: [] });
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (!open) return;
    if (!query) {
      setResults({ buyers: [], sellers: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const [{ data: buyers }, { data: sellers }] = await Promise.all([
          supabase
            .from('buyers_demand')
            .select('id, name, phone, area, property_type, budget')
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%,area.ilike.%${query}%`)
            .limit(5),
          supabase
            .from('sellers_inventory')
            .select('id, name, phone, area, property_type, price')
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%,area.ilike.%${query}%`)
            .limit(5)
        ]);

        setResults({
          buyers: buyers || [],
          sellers: sellers || []
        });
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors w-full sm:w-64"
      >
        <Search className="w-4 h-4 text-slate-400" />
        <span className="flex-1 text-left font-medium">Search CRM...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setOpen(false)}>
          <div 
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <Command
              shouldFilter={false} // We handle filtering via Supabase
              className="flex flex-col h-full max-h-[60vh]"
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-100">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search leads, names, phones, or areas..."
                  className="flex-1 px-3 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none text-base"
                  autoFocus
                />
                {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />}
                <kbd className="hidden sm:inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 ml-2 shrink-0">
                  ESC
                </kbd>
              </div>

              <Command.List className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {!loading && query && results.buyers.length === 0 && results.sellers.length === 0 && (
                  <Command.Empty className="py-12 text-center text-sm text-slate-500">
                    No results found for "{query}".
                  </Command.Empty>
                )}

                {!query && (
                  <div className="py-8 text-center text-sm text-slate-400 font-medium">
                    Start typing to search across all buyers and sellers...
                  </div>
                )}

                {results.buyers.length > 0 && (
                  <Command.Group heading="Buyers Demand" className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
                    {results.buyers.map((buyer) => (
                      <Command.Item
                        key={buyer.id}
                        onSelect={() => {
                          setOpen(false);
                          router.push('/admin/buyers');
                          // In a real app we might open the specific buyer drawer by context or URL hash
                        }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 mt-1 hover:bg-indigo-50 rounded-lg cursor-pointer aria-selected:bg-indigo-50 group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-aria-selected:bg-blue-600 group-aria-selected:text-white transition-colors">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm group-aria-selected:text-indigo-900">{buyer.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{buyer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs font-medium text-slate-600">
                           <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {buyer.area.split(',')[0]}</span>
                           <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100"><DollarSign className="w-3 h-3" /> {buyer.budget.replace(/_/g, ' ')}</span>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {results.sellers.length > 0 && (
                  <Command.Group heading="Sellers Inventory" className="text-xs font-bold text-slate-500 px-2 py-1 mt-4 uppercase tracking-wider">
                    {results.sellers.map((seller) => (
                      <Command.Item
                        key={seller.id}
                        onSelect={() => {
                          setOpen(false);
                          router.push('/admin/sellers');
                        }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 mt-1 hover:bg-indigo-50 rounded-lg cursor-pointer aria-selected:bg-indigo-50 group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg group-aria-selected:bg-amber-500 group-aria-selected:text-white transition-colors">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm group-aria-selected:text-indigo-900">{seller.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{seller.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs font-medium text-slate-600">
                           <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {seller.area.split(',')[0]}</span>
                           <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100"><DollarSign className="w-3 h-3" /> {seller.price.replace(/_/g, ' ')}</span>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
