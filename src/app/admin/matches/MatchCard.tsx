'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building, Phone, Send, Calendar, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MatchProps {
  match: {
    buyer_id?: string;
    seller_id?: string;
    buyer_name: string;
    buyer_phone: string;
    seller_name: string;
    seller_phone: string;
    property_type: string;
    area: string;
  };
  formatType: (type: string) => string;
}

export default function MatchCard({ match, formatType }: MatchProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00');
  const [visitNotes, setVisitNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // WhatsApp message for buyer
  const waMessage = `Hello ${match.buyer_name},\n\nWe have found a perfect match for your requirement of a ${formatType(match.property_type)} in ${match.area.split(',')[0].trim()}.\n\nSeller Details:\nName: ${match.seller_name}\nPhone: ${match.seller_phone}\n\nWould you like to schedule a site visit? Please reply to confirm.\n\n- Property CRM Team`;
  const waUrl = `https://wa.me/${match.buyer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`;

  // Get tomorrow as minimum date for scheduling
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleSchedule = async () => {
    if (!visitDate) {
      setSaveError('Please select a date for the site visit.');
      return;
    }
    setSaving(true);
    setSaveError(null);

    try {
      const visitDateTime = new Date(`${visitDate}T${visitTime}:00`).toISOString();

      // Update buyer's follow_up_date if we have buyer_id
      if (match.buyer_id) {
        const { error } = await supabase
          .from('buyers_demand')
          .update({
            follow_up_date: visitDateTime,
            status: 'site_visit',
            notes: visitNotes ? `Site Visit Scheduled: ${visitNotes}` : 'Site Visit Scheduled via Smart Match'
          })
          .eq('id', match.buyer_id);
        if (error) throw error;
      }

      // Update seller's follow_up_date if we have seller_id
      if (match.seller_id) {
        const { error } = await supabase
          .from('sellers_inventory')
          .update({
            follow_up_date: visitDateTime,
            status: 'site_visit',
            notes: visitNotes ? `Site Visit Scheduled: ${visitNotes}` : 'Site Visit Scheduled via Smart Match'
          })
          .eq('id', match.seller_id);
        if (error) throw error;
      }

      setSaved(true);
      // Send WhatsApp confirmation after saving
      setTimeout(() => {
        setModalOpen(false);
        setSaved(false);
        setVisitDate('');
        setVisitTime('10:00');
        setVisitNotes('');
      }, 2000);
    } catch (err: unknown) {
      setSaveError((err as Error).message || 'Failed to schedule visit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col hover:shadow-2xl hover:border-slate-300 transition-all duration-300">

        {/* Header Strip */}
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            <span className="font-extrabold text-slate-800 tracking-tight">
              {formatType(match.property_type)}
            </span>
          </div>
          <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
            {match.area.split(',')[0]}
          </div>
        </div>

        {/* Content columns */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">

          {/* Buyer Side */}
          <div className="flex-1 p-6 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Buyer Demand</h3>
            </div>
            <p className="text-xl font-bold text-slate-900">{match.buyer_name}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> {match.buyer_phone}
            </p>
            <a
              href={`tel:${match.buyer_phone}`}
              className="inline-flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-bold hover:underline"
            >
              📞 Call Buyer
            </a>
          </div>

          {/* Seller Side */}
          <div className="flex-1 p-6 space-y-2 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm"></div>
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Seller Inventory</h3>
            </div>
            <p className="text-xl font-bold text-slate-900">{match.seller_name}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> {match.seller_phone}
            </p>
            <a
              href={`tel:${match.seller_phone}`}
              className="inline-flex items-center gap-1.5 mt-1 text-xs text-purple-600 font-bold hover:underline"
            >
              📞 Call Seller
            </a>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-white p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <Calendar className="w-4 h-4" /> Schedule Site Visit
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 text-sm"
          >
            <Send className="w-4 h-4" /> Send Match to Buyer
          </a>
        </div>
      </div>

      {/* ── Schedule Site Visit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-blue-50">
              <div>
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Schedule Site Visit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {match.buyer_name} (Buyer) ↔ {match.seller_name} (Seller)
                </p>
              </div>
              <button
                onClick={() => { setModalOpen(false); setSaveError(null); setSaved(false); }}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {saved ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                  <h4 className="text-xl font-bold text-slate-900 mb-1">Site Visit Scheduled!</h4>
                  <p className="text-slate-500 text-sm">
                    Visit saved for <strong>{new Date(`${visitDate}T${visitTime}`).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</strong>.
                    Check Operations Calendar for details.
                  </p>
                </div>
              ) : (
                <>
                  {saveError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {saveError}
                    </div>
                  )}

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Visit Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      min={getTomorrowDate()}
                      onChange={e => setVisitDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-xl px-4 py-3 outline-none transition-all"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Visit Time
                    </label>
                    <input
                      type="time"
                      value={visitTime}
                      onChange={e => setVisitTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-xl px-4 py-3 outline-none transition-all"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Visit Notes (Optional)
                    </label>
                    <textarea
                      value={visitNotes}
                      onChange={e => setVisitNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g. Meet at property gate, carry documents..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium rounded-xl px-4 py-3 outline-none transition-all resize-none text-sm"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                    📌 Saving will update both buyer & seller status to <strong>&quot;Site Visit Arranged&quot;</strong> and add to your Operations Calendar.
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!saved && (
              <div className="p-6 border-t border-slate-200 flex gap-3 bg-slate-50">
                <button
                  onClick={() => { setModalOpen(false); setSaveError(null); }}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={saving || !visitDate}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Confirm Visit'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
