'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Building2, 
  Phone, 
  MessageCircle, 
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface FollowUpTask {
  id: string;
  type: 'buyer' | 'seller';
  name: string;
  phone: string;
  property_type: string;
  area: string;
  follow_up_date: string;
  status: string;
}

const getFormatDate = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';
  
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const isPastDue = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
};

export default function OperationsCalendar() {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        setLoading(true);
        // Fetch Buyers with follow up date
        const { data: buyers, error: bErr } = await supabase
          .from('buyers_demand')
          .select('id, name, phone, property_type, area, follow_up_date, status')
          .not('follow_up_date', 'is', null);

        // Fetch Sellers with follow up date
        const { data: sellers, error: sErr } = await supabase
          .from('sellers_inventory')
          .select('id, name, phone, property_type, area, follow_up_date, status')
          .not('follow_up_date', 'is', null);

        if (bErr) throw bErr;
        if (sErr) throw sErr;

        const formattedBuyers = (buyers || []).map(b => ({ ...b, type: 'buyer' as const }));
        const formattedSellers = (sellers || []).map(s => ({ ...s, type: 'seller' as const }));

        const allTasks = [...formattedBuyers, ...formattedSellers].sort((a, b) => {
          return new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime();
        });

        setTasks(allTasks);
      } catch (err) {
        console.error('Error fetching follow up tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, []);

  // Group tasks by date
  const groupedTasks: Record<string, FollowUpTask[]> = {};
  tasks.forEach(task => {
    const dateStr = new Date(task.follow_up_date).toISOString().split('T')[0];
    if (!groupedTasks[dateStr]) groupedTasks[dateStr] = [];
    groupedTasks[dateStr].push(task);
  });


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-900 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5">
        <Clock className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading operations calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center gap-3 pb-1">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl text-white shadow-lg shadow-teal-500/30">
            <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          Operations Calendar
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 font-medium">
          Manage your scheduled follow-ups, calls, and site visits across all buyers and sellers.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5">
          <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-4 shadow-inner">
             <Calendar className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">No upcoming follow-ups</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">
            When you schedule a follow up date on a buyer or seller, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.keys(groupedTasks).map(dateStr => (
            <div key={dateStr} className="space-y-4 relative">
              <div className="sticky top-0 z-10 flex items-center gap-4 bg-slate-50 py-2">
                <h3 className={`text-lg font-extrabold ${isPastDue(dateStr) ? 'text-rose-600' : 'text-slate-900'}`}>
                  {getFormatDate(dateStr)}
                </h3>
                <div className={`h-px flex-1 ${isPastDue(dateStr) ? 'bg-rose-200' : 'bg-slate-200'}`}></div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPastDue(dateStr) ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>
                  {groupedTasks[dateStr].length} tasks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedTasks[dateStr].map(task => (
                  <div key={`${task.type}-${task.id}`} className={`bg-white/80 backdrop-blur-xl border rounded-3xl p-6 shadow-xl shadow-slate-900/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isPastDue(dateStr) ? 'border-rose-200/60' : 'border-slate-200/60 hover:border-emerald-300/60'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {task.type === 'buyer' ? (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              <Users className="w-3 h-3" /> Buyer
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              <Building2 className="w-3 h-3" /> Seller
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            {task.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">{task.name}</h4>
                      </div>
                      <a href={`tel:${task.phone}`} className="p-2 bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 hover:border-blue-200">
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                    
                    <div className="space-y-2 mb-4 text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" /> {task.area.replace(/_/g, ' ')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" /> {task.property_type.replace(/_/g, ' ')}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/${task.phone.replace(/\\D/g, '')}?text=Hello ${task.name}, I am following up regarding your property requirement.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg transition-colors border border-emerald-200"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                      <a
                        href={`/admin/${task.type}s`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-lg transition-colors border border-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
