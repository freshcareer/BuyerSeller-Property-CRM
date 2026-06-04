'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UserAccountButton() {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userMetaPhone = session.user.user_metadata?.phone;
          const email = session.user.email || '';
          
          if (userMetaPhone) {
            setPhone(userMetaPhone);
          } else if (email.startsWith('phone_')) {
            const extracted = email.split('@')[0].replace('phone_', '');
            setPhone(extracted);
          }
        }
      } catch (err) {
        console.error('Session check error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const userMetaPhone = session.user.user_metadata?.phone;
        const email = session.user.email || '';
        
        if (userMetaPhone) {
          setPhone(userMetaPhone);
        } else if (email.startsWith('phone_')) {
          const extracted = email.split('@')[0].replace('phone_', '');
          setPhone(extracted);
        }
      } else {
        setPhone(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-xl hidden sm:block" />
    );
  }

  if (phone) {
    const displayPhone = phone.length === 10 ? `+91 ${phone}` : phone;
    
    return (
      <Link
        href="/portal/buyer"
        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm"
        title="Go to Dashboard"
      >
        <User className="w-4 h-4" /> {displayPhone}
      </Link>
    );
  }

  return (
    <Link
      href="/portal/login"
      className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm"
    >
      <User className="w-4 h-4" /> My Account
    </Link>
  );
}
