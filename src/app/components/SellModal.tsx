'use client';

import { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import LeadForms from '@/app/components/LeadForms';

interface SettingOption { category: string; value: string; display_name: string; }
interface Props { options: SettingOption[]; }

export default function SellModal({ options }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow shadow-blue-600/30"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Apni Property List Karo</span>
        <span className="sm:hidden">Sell</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900">Apni Property List Karo</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Only show the sell tab */}
            <div className="p-4">
              <LeadForms options={options} defaultTab="sell" hideTabs={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
