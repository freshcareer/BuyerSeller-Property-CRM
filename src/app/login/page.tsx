/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in and redirect to admin dashboard
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Double check super admin status
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_super_admin')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_super_admin) {
          router.push('/admin/dashboard');
        }
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const SUPER_ADMINS = ['freshcareer4@gmail.com', 'rajeshrshiv@gmail.com', 'admin@propconnect.com'];
      
      let loginEmail = email;
      let loginPassword = password;
      
      // Magic bypass for all Super Admins to use a single master password
      if (SUPER_ADMINS.includes(email.toLowerCase()) && password === 'Admin@123') {
        loginEmail = 'admin@propconnect.com';
        loginPassword = 'Admin@123';
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) throw authError;

      const user = data.user;
      if (!user) throw new Error('No user returned from login.');

      // Verify if the user is a Super Admin
      const isHardcodedAdmin = user.email && SUPER_ADMINS.includes(user.email.toLowerCase());

      if (!isHardcodedAdmin) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_super_admin')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.is_super_admin) {
          await supabase.auth.signOut();
          throw new Error('Access Denied: You do not have Super Admin privileges.');
        }
      }

      // Login successful, redirect to dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials or access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 selection:bg-blue-500/30 relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>

          <div className="p-3 bg-blue-600 rounded-2xl shadow-md shadow-blue-600/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Admin Portal
          </h2>
          <p className="text-slate-500 mt-2 text-sm max-w-xs">
            Sign in to PropConnect with your Super Admin credentials.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-4 py-3 placeholder-slate-400 outline-none transition-all duration-300"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-4 py-3 placeholder-slate-400 outline-none transition-all duration-300"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-blue-600/20 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                'Secure Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
