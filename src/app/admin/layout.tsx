'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  Loader2,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Query profile for admin status
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_super_admin, email')
          .eq('id', session.user.id)
          .single();

        if (error || !profile || !profile.is_super_admin) {
          console.warn('Unauthorized admin access attempt:', session.user.email);
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }

        setAdminEmail(profile.email);
        setAuthorized(true);
      } catch (err) {
        console.error('Auth verification error:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Buyers Demand', href: '/admin/buyers', icon: Users },
    { name: 'Sellers Inventory', href: '/admin/sellers', icon: Building2 },
    { name: 'Operations Calendar', href: '/admin/calendar', icon: CalendarDays },
    { name: 'Settings Manager', href: '/admin/settings', icon: SettingsIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Verifying secure admin session...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 p-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Access Denied</h2>
        <p className="text-slate-500 max-w-sm text-center mb-6">
          You are not authorized to view this page. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-5 space-y-6 shadow-sm z-10">
        <div className="flex items-center gap-2.5 px-2 py-3 border-b border-slate-100">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-600/20">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">CRM Control</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Mobile Sidebar / Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/50 backdrop-blur-sm">
          <div className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col space-y-6 animate-in slide-in-from-left duration-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-lg text-slate-900">CRM Control</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="md:hidden font-bold text-lg text-slate-900">CRM Control</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Logged in as</p>
              <p className="text-sm text-slate-700 font-bold">{adminEmail}</p>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-sm transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
