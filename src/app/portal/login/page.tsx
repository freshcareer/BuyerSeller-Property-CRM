/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserCircle, Lock, Loader2, ArrowLeft, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

import { Suspense } from 'react';

function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/portal/buyer';
  
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push(redirectPath);
    };
    checkSession();
  }, [router, redirectPath]);

  const handleMobileAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const mobileStr = identifier.replace(/\D/g, '');
    if (mobileStr.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    const authEmail = `${mobileStr}@crm.com`;
    const authPassword = `Prop@${mobileStr}`; // Deterministic fixed password

    try {
      // 1. Attempt login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (!signInError) {
        // Success
        router.push(redirectPath);
        return;
      }

      // 2. If login fails, attempt silent signup
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { phone: mobileStr }
          }
        });
        
        if (signUpError) throw signUpError;
        // Signup success, now sign in
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (secondSignInError) throw secondSignInError;
        router.push(redirectPath);
      } else {
        throw signInError;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const authEmail = identifier.trim();

    try {
      if (isForgotPassword) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(authEmail);
        if (resetError) throw resetError;
        setSuccessMsg('If your email is registered, you will receive a password reset link shortly.');
      } else if (isSignUp) {
        const { error: authError } = await supabase.auth.signUp({
          email: authEmail,
          password,
        });
        if (authError) throw authError;
        setSuccessMsg('Registration successful! You can now log in.');
        setIsSignUp(false);
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });
        if (authError) throw authError;
        router.push(redirectPath);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errMsg = err.message || 'Authentication failed.';
      if (errMsg === 'Invalid login credentials') {
        errMsg = 'Invalid credentials. If you are a new user, please click "Sign up" below to create an account first.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>

          <div className="p-3 bg-blue-600 rounded-2xl shadow-md shadow-blue-600/20 mb-4">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="text-slate-500 mt-2 text-sm max-w-xs">
            Sign in to access your buyer or seller dashboard.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('mobile');
                setIdentifier('');
                setPassword('');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-4 text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                loginMethod === 'mobile' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <Phone className="w-4 h-4" /> Mobile Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setIdentifier('');
                setPassword('');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-4 text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                loginMethod === 'email' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <Mail className="w-4 h-4" /> Email Login
            </button>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
                {successMsg}
              </div>
            )}

            {loginMethod === 'mobile' ? (
              <form onSubmit={handleMobileAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> 10-Digit Mobile Number
                  </label>
                  <div className="flex bg-white border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all hover:border-slate-400">
                    <div className="bg-slate-50 px-4 py-3 border-r border-slate-200 text-slate-500 font-bold text-sm flex items-center">
                      +91
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 outline-none text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    <strong className="font-bold">Fast Login:</strong> Just enter your number. If you are new, we will instantly create an account for you. No passwords to remember!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || identifier.length < 10}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-blue-600/20 mt-2"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Continue with Mobile'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-4 py-3 outline-none transition-all"
                  />
                </div>

                {!isForgotPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Password
                      </label>
                      {!isSignUp && (
                        <button 
                          type="button" 
                          onClick={() => { setIsForgotPassword(true); setError(null); setSuccessMsg(null); }}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-4 py-3 outline-none transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-blue-600/20 mt-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</>
                  ) : isForgotPassword ? (
                    'Send Reset Link'
                  ) : isSignUp ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="text-center pt-2 border-t border-slate-100">
                  {isForgotPassword ? (
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMsg(null); }}
                      className="text-sm text-slate-500 font-semibold hover:text-slate-800 mt-2"
                    >
                      Back to Sign In
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMsg(null); }}
                      className="text-sm text-blue-600 font-semibold hover:underline mt-2"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                  )}
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <PortalLoginForm />
    </Suspense>
  );
}
