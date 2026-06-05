'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { Zap, User, Building } from 'lucide-react';

export function RealtimeToasts() {
  useEffect(() => {
    // Listen to new Buyers Demand
    const buyersSubscription = supabase
      .channel('buyers-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'buyers_demand' },
        (payload) => {
          const newBuyer = payload.new;
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-extrabold text-slate-900">
                      New Buyer Lead Added!
                    </p>
                    <p className="mt-1 text-sm text-slate-500 font-medium">
                      {newBuyer.name} is looking for a {newBuyer.property_type.replace(/_/g, ' ')} in {newBuyer.area.split(',')[0]} under {newBuyer.budget.replace(/_/g, ' ')}.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-100">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-bold text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 5000 });
        }
      )
      .subscribe();

    // Listen to new Sellers Inventory
    const sellersSubscription = supabase
      .channel('sellers-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sellers_inventory' },
        (payload) => {
          const newSeller = payload.new;
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-extrabold text-slate-900">
                      New Property Listing!
                    </p>
                    <p className="mt-1 text-sm text-slate-500 font-medium">
                      {newSeller.name} just listed a {newSeller.property_type.replace(/_/g, ' ')} in {newSeller.area.split(',')[0]} for {newSeller.price.replace(/_/g, ' ')}.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-100">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-bold text-amber-600 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 5000 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(buyersSubscription);
      supabase.removeChannel(sellersSubscription);
    };
  }, []);

  return <Toaster position="top-right" />;
}
