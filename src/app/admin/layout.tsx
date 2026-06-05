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
  Zap,
  KeyRound,
} from 'lucide-react';
import Link from 'next/link';
import { GlobalSearch } from '@/components/GlobalSearch';
import { RealtimeToasts } from '@/components/RealtimeToasts';

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
  const [adminRole, setAdminRole] = useState('admin');

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
          .select('is_super_admin, role, email')
          .eq('id', session.user.id)
          .single();

        if (error || !profile || (!profile.is_super_admin && profile.role !== 'admin' && profile.role !== 'super_admin')) {
          console.warn('Unauthorized admin access attempt:', session.user.email);
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }

        setAdminEmail(profile.email);
        setAdminRole(profile.role || (profile.is_super_admin ? 'super_admin' : 'admin'));
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
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Smart Matches', href: '/admin/matches', icon: Zap },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50 text-slate-900 flex">
      <RealtimeToasts />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 p-5 space-y-6 shadow-xl shadow-indigo-900/5 z-20">
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-200/50">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">PropConnect Admin</span>
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
              <span className="font-bold text-lg text-slate-900">PropConnect Admin</span>
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
        <header className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="md:hidden font-bold text-lg text-slate-900">PropConnect Admin</span>
          </div>

          <div className="flex-1 flex justify-center px-4 md:px-8">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Logged in as</p>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-sm ${
                  adminRole === 'super_admin' 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {adminRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
              <p className="text-sm text-slate-800 font-extrabold mt-0.5">{adminEmail}</p>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-sm transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
