import React, { useState } from 'react';
import { Wallet, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
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
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[440px] w-full relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block bg-primary p-4 rounded-[22px] shadow-lg shadow-primary/30 mb-6"
          >
            <Wallet className="text-white" size={36} />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
            {isLogin ? 'Welcome to Finlytics' : 'Create your Finlytics account'}
          </h1>
          <p className="text-text-muted font-medium mt-2">Manage your finances with clarity and precision</p>
        </div>

        <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
          <div className="flex bg-bg p-1.5 rounded-2xl mb-8 border border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${isLogin ? 'bg-card shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${!isLogin ? 'bg-card shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                      <UserIcon size={18} />
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-bg border border-border rounded-xl pl-12 pr-4 py-3.5 font-medium text-text-main outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all placeholder:text-text-muted/30 text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl pl-12 pr-4 py-3.5 font-medium text-text-main outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all placeholder:text-text-muted/30 text-sm"
                  placeholder="Tasmiya or name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">
                Password
              </label>
              <div className="relative group/pass">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl pl-12 pr-4 py-3.5 font-medium text-text-main outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all placeholder:text-text-muted/30 text-sm font-mono"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center gap-2 px-1 mt-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer transition-all"
                />
                <label htmlFor="showPassword" className="text-[11px] font-bold text-text-muted cursor-pointer select-none uppercase tracking-wide">
                  Show Password
                </label>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#FFF1F2] dark:bg-[#452723]/30 border border-[#FCA5A5] text-[#EF4444] text-[11px] font-bold p-4 rounded-xl flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-[#EF4444] rounded-full shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4.5 rounded-2xl font-extrabold text-[16px] shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="uppercase tracking-widest">{isLogin ? 'Login' : 'Begin Journey'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-text-muted font-bold text-[10px] uppercase tracking-[0.2em] opacity-40">
            Secure • Private • Encrypted
          </p>
        </div>
      </motion.div>
    </div>
  );
}

