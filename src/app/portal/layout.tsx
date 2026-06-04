'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, Home, Loader2, Heart, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // If it's the login page, don't enforce auth layout
    if (pathname === '/portal/login') {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/portal/login?redirect=${pathname}`);
      } else {
        setUserEmail(session.user.email || null);
        setLoading(false);
      }
    };
    
    checkSession();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (pathname === '/portal/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Portal Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 mr-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              PropConnect
            </Link>
            <nav className="hidden sm:flex items-center gap-2">
              <Link 
                href="/portal/buyer" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${pathname.includes('/buyer') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Heart className="w-4 h-4" /> My Watchlist & Demands
              </Link>
              <Link 
                href="/portal/seller" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${pathname.includes('/seller') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Building2 className="w-4 h-4" /> My Listed Properties
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 hidden md:block">
              {userEmail?.includes('@user.propconnect.com') 
                ? `+91 ${userEmail.split('@')[0].replace('phone_', '')}` 
                : userEmail}
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Mobile Navigation */}
        <div className="sm:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
          <Link 
            href="/portal/buyer" 
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${pathname.includes('/buyer') ? 'bg-blue-50 text-blue-700' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            <Heart className="w-4 h-4" /> Buyer Dashboard
          </Link>
          <Link 
            href="/portal/seller" 
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${pathname.includes('/seller') ? 'bg-blue-50 text-blue-700' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            <Building2 className="w-4 h-4" /> Seller Dashboard
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
}
