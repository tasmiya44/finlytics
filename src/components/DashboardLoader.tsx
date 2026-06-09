import React, { useEffect, useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardLoaderProps {
  name: string;
}

export default function DashboardLoader({ name }: DashboardLoaderProps) {
  // Rotate randomly between those 8 messages
  const [msg] = useState(() => {
    const messages = [
      `Hey ${name}, loading your financial profile...`,
      `Welcome back, ${name}! Preparing your dashboard...`,
      `Fetching your latest transactions...`,
      `Analyzing your spending patterns...`,
      `Gathering your financial insights...`,
      `Just a moment, ${name}. Your finances are on the way.`,
      `Loading your transaction history and reports...`,
      `Preparing your personalized Finlytics experience...`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  });

  const [showWakingUpMsg, setShowWakingUpMsg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWakingUpMsg(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg p-10 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/80 shadow-2xl flex flex-col items-center text-center space-y-8"
        id="finlytics-dashboard-loader-card"
      >
        {/* Brand visual badge */}
        <div className="relative">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 relative z-10"
            id="loader-brand-icon"
          >
            <TrendingUp size={30} className="text-white" />
          </motion.div>
          {/* Decorative rotating ambient borders for visual weight */}
          <div className="absolute -inset-2 rounded-[22px] border-2 border-dashed border-primary/20 dark:border-primary/30 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute -inset-4 rounded-[26px] border border-primary/10 dark:border-primary/15 animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }} />
        </div>

        {/* Brand Label block */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Finlytics</h2>
          <p className="text-[10px] font-black text-primary dark:text-primary-light uppercase tracking-[0.2em]">Smart Wealth Platform</p>
        </div>

        {/* Custom Loading Messages Box */}
        <div className="w-full bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-border/50 dark:border-slate-800/50 flex flex-col items-center space-y-3">
          <Loader2 size={24} className="text-primary dark:text-primary-light animate-spin" />
          <p className="text-sm font-semibold text-text-main dark:text-slate-300 leading-relaxed px-2">
            {msg}
          </p>
        </div>

        {/* Persistent loading bar animation */}
        <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
          />
        </div>

        {/* Server spin up message (after 5 seconds) */}
        <AnimatePresence>
          {showWakingUpMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="pt-2 text-center"
              id="loader-database-waking-msg"
            >
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Still working... Your database is waking up.
              </p>
              <span className="text-[11px] text-text-muted dark:text-slate-400 mt-1 block max-w-xs mx-auto leading-normal">
                Connecting to cloud servers. This happens when the server cold-starts after periods of inactivity.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
