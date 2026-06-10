import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Transaction',
  message = 'Are you sure you want to delete this transaction? This action cannot be undone.',
  loading = false
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-card border border-border rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 -mr-16 -mt-16 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-sm border border-danger/20">
                <AlertCircle size={30} />
              </div>
              
              <h3 className="text-lg sm:text-xl font-black text-text-main dark:text-white tracking-tight mb-2">
                {title}
              </h3>
              
              <p className="text-sm text-text-muted font-medium italic leading-relaxed mb-6 sm:mb-8 sm:px-4">
                {message}
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="w-full py-4 bg-danger text-white font-black rounded-2xl shadow-lg shadow-danger/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-4 bg-card border border-border text-text-muted font-black rounded-2xl hover:bg-bg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
