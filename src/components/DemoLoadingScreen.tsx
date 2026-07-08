import { motion } from 'motion/react';
import { LoaderCircle, TrendingUp } from 'lucide-react';

export default function DemoLoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="auth-shell fixed inset-0 z-[200] flex items-center justify-center bg-bg px-6 text-text-main"
    >
      <div className="relative z-10 w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: [0, -7, 0] }}
          transition={{ scale: { type: 'spring', stiffness: 180, damping: 18 }, opacity: { duration: 0.3 }, y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }}
          className="auth-logo-glow mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/25"
        >
          <TrendingUp size={30} />
        </motion.div>
        <h2 className="text-2xl font-black tracking-tight text-text-main sm:text-3xl">Preparing your Demo Workspace...</h2>
        <p className="mt-3 text-sm font-semibold text-text-muted">Loading sample financial data and AI insights...</p>
        <div className="mt-8 h-2 overflow-hidden rounded-full border border-border bg-card shadow-inner">
          <motion.div
            initial={{ width: '8%' }}
            animate={{ width: ['8%', '58%', '86%', '96%'] }}
            transition={{ duration: 1.5, times: [0, 0.45, 0.78, 1], ease: 'easeOut' }}
            className="auth-submit h-full rounded-full"
          />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-text-muted">
          <LoaderCircle size={15} className="animate-spin text-primary" />
          <span>Building your workspace</span>
          <span className="flex w-5 items-end gap-0.5" aria-hidden="true">
            {[0, 1, 2].map(index => <motion.span key={index} animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.16 }} className="h-1 w-1 rounded-full bg-primary" />)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
