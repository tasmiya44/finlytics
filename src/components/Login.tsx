import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

import ThemeToggle from './ThemeToggle';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleGoogleCredential = useCallback(async (response: google.accounts.id.CredentialResponse) => {
    if (!response.credential) {
      setError('Google login did not return a credential');
      return;
    }

    setGoogleLoading(true);
    setError(null);

    try {
      const authResponse = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      onLogin(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [onLogin]);

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!isLogin || !googleClientId || !googleButtonRef.current) {
      return;
    }

    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: Math.min(440, googleButtonRef.current.offsetWidth || 440)
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton, { once: true });
    } else {
      const script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      script.onerror = () => {
        if (!cancelled) {
          setError('Could not load Google login. Please try again.');
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [isLogin, handleGoogleCredential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl(isLogin ? '/api/auth/login' : '/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onLogin(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell relative flex min-h-screen items-center justify-center bg-bg px-4 py-24 text-text-main transition-colors duration-300 sm:px-6 sm:py-28">
      <Link
        to="/"
        className="absolute left-4 top-5 z-20 flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:left-8 sm:top-8"
      >
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-7">
        <ThemeToggle />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[520px]"
      >
        <header className="mb-6 text-center sm:mb-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.78 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 190, damping: 16, delay: 0.08 }}
            className="auth-logo-glow mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/25"
          >
            <TrendingUp size={27} strokeWidth={2.4} />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? 'signin-heading' : 'register-heading'} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-text-main sm:text-4xl">
                {isLogin ? 'Welcome Back 👋' : 'Create your account'}
              </h1>
              <p className="mx-auto mt-2 max-w-md px-3 text-sm font-medium leading-6 text-text-muted sm:text-base">
                {isLogin ? 'Sign in to continue managing your finances.' : 'Start managing your finances in one modern workspace.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </header>

        <section className="auth-card rounded-[28px] border border-border bg-card/90 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-9">
          <div className="relative mb-7 grid grid-cols-2 rounded-2xl border border-border bg-bg p-1.5" role="tablist" aria-label="Authentication mode">
            <motion.span
              className="absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl bg-primary shadow-lg shadow-primary/20"
              animate={{ left: isLogin ? 6 : '50%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 31 }}
            />
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              onClick={() => setIsLogin(true)}
              className={`relative z-10 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-colors sm:text-sm ${isLogin ? 'text-white' : 'text-text-muted hover:text-text-main'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => setIsLogin(false)}
              className={`relative z-10 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-colors sm:text-sm ${!isLogin ? 'text-white' : 'text-text-muted hover:text-text-main'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label htmlFor="auth-name" className="px-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Full Name
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary">
                      <UserIcon size={18} />
                    </div>
                    <input
                      id="auth-name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="auth-input w-full rounded-2xl border border-border bg-bg py-4 pl-12 pr-4 text-sm font-semibold text-text-main outline-none transition-all placeholder:text-text-muted/50 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label htmlFor="auth-email" className="px-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                Username or Email
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary">
                  <Mail size={18} />
                </div>
                <input
                  id="auth-email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="auth-input w-full rounded-2xl border border-border bg-bg py-4 pl-12 pr-4 text-sm font-semibold text-text-main outline-none transition-all placeholder:text-text-muted/50 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
                  placeholder="Name or name@example.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="auth-password" className="px-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                Password
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary">
                  <Lock size={18} />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="auth-input w-full rounded-2xl border border-border bg-bg py-4 pl-12 pr-4 text-sm font-semibold text-text-main outline-none transition-all placeholder:text-text-muted/50 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>
              <div className="mt-2 flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-border text-primary transition-all focus:ring-primary"
                />
                <label htmlFor="showPassword" className="cursor-pointer select-none text-[11px] font-bold uppercase tracking-wide text-text-muted">
                  Show Password
                </label>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 p-4 text-[11px] font-bold text-danger"
              >
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="auth-submit mt-3 flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-black text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 sm:text-[15px]"
            >
              {loading ? (
                <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/45 border-t-white" aria-hidden="true" /><span>Authenticating...</span></>
              ) : (
                <>
                  <span className="uppercase tracking-[0.16em] sm:tracking-widest">{isLogin ? 'Login' : 'Begin Journey'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <AnimatePresence initial={false}>
          {isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-5 space-y-4 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div className={`auth-google w-full overflow-hidden rounded-2xl border border-border bg-card py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${googleLoading ? 'pointer-events-none opacity-50' : ''}`}>
                  <div ref={googleButtonRef} className="flex min-h-[44px] w-full justify-center" />
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-bg text-text-muted py-4 rounded-2xl font-extrabold text-xs sm:text-sm border border-border flex items-center justify-center gap-3 opacity-60"
                >
                  <span className="uppercase tracking-[0.12em] sm:tracking-widest">Google Login Not Configured</span>
                </button>
              )}

            </motion.div>
          )}
          </AnimatePresence>
        </section>

        <div className="mt-7 text-center">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted/70">
            <ShieldCheck size={14} className="text-success" /> Secure • Private • Encrypted
          </p>
        </div>
      </motion.main>
    </div>
  );
}
