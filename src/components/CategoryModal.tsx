import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tag, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CategoryModalProps {
  onClose: () => void;
  onSuccess?: (categoryName: string) => void;
}

export default function CategoryModal({ onClose, onSuccess }: CategoryModalProps) {
  const { addCategory, t } = useApp();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const newCat = await addCategory(name.trim());
      onSuccess?.(newCat.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card w-full max-w-md rounded-[2.5rem] border border-border shadow-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Tag size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-main tracking-tight">Create Category</h2>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mt-1">New Classification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-bg rounded-xl transition-colors text-text-muted hover:text-text-main"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
              Category Name
            </label>
            <input
              autoFocus
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg border border-border/60 rounded-xl px-4 py-3.5 text-sm font-bold text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:font-medium placeholder:text-text-muted/30"
              placeholder="e.g. Health, Travel, Subscriptions"
            />
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-500 text-[10px] font-bold mt-1 px-1"
              >
                <AlertCircle size={12} />
                {error}
              </motion.div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-bg border border-border/60 text-text-main rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-border/20 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={16} />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
