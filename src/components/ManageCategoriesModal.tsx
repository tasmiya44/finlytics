import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tag, Trash2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ManageCategoriesModalProps {
  onClose: () => void;
}

export default function ManageCategoriesModal({ onClose }: ManageCategoriesModalProps) {
  const { expenses, categories, deleteCategory } = useApp();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteCategory(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setTimeout(() => setError(null), 3000);
    }
  };

  const isCategoryInUse = (categoryName: string) => {
    return expenses.some(e => e.category.toLowerCase() === categoryName.toLowerCase());
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card w-full max-w-lg rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-2xl p-5 sm:p-8 relative overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Tag size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-text-main tracking-tight">Manage Categories</h2>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-tight mt-1">Configure Classifications</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-bg rounded-xl transition-colors text-text-muted hover:text-text-main"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 sm:space-y-6 relative z-10 flex-1 overflow-y-auto pr-1 sm:pr-2 thin-scrollbar min-h-0">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {categories.map((cat) => {
              const inUse = isCategoryInUse(cat.name);
              const isDefault = cat.userId === 0;

              return (
                <div 
                  key={cat.id} 
                  className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-bg dark:bg-slate-900/50 rounded-2xl border border-border/40 group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black ${isDefault ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {cat.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-main truncate">{cat.name}</p>
                      {isDefault && (
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">System Default</p>
                      )}
                    </div>
                  </div>

                  {!isDefault && (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={inUse}
                      className={`p-2 rounded-xl transition-all ${
                        inUse 
                          ? 'text-text-muted opacity-20 cursor-not-allowed' 
                          : 'text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title={inUse ? 'Category in use' : 'Delete category'}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border/50 relative z-10">
          <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-2xl md:items-center">
            <Info size={16} className="text-primary shrink-0" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-relaxed">
              Default categories cannot be deleted. Custom categories can be removed if not used.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-5 sm:mt-6 py-4 bg-text-main text-white dark:bg-white dark:text-text-main rounded-2xl font-black text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Close Manager
          </button>
        </div>
      </motion.div>
    </div>
  );
}
