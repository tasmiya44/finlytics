import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Tag, Wallet, Calendar, FileText, Camera, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReceiptScanner from './ReceiptScanner';
import CategoryModal from './CategoryModal';
import { useApp } from '../context/AppContext';

interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
  userId: number;
  receiptUrl?: string;
}

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'userId'>) => void;
  onUpdateExpense: (id: number, expense: Omit<Expense, 'id' | 'userId'>) => void;
  editingExpense: Expense | null;
  onCancelEdit: () => void;
}

export default function ExpenseForm({ onAddExpense, onUpdateExpense, editingExpense, onCancelEdit }: ExpenseFormProps) {
  const { categories } = useApp();
  const [showScanner, setShowScanner] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receiptUrl: ''
  });

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, formData.category]);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        date: editingExpense.date,
        description: editingExpense.description,
        receiptUrl: editingExpense.receiptUrl || ''
      });
    }
  }, [editingExpense]);

  const handleScanComplete = (data: { amount: number; date: string; merchant: string; category: string }, url: string) => {
    setFormData({
      amount: data.amount.toString(),
      category: data.category,
      date: data.date,
      description: data.merchant,
      receiptUrl: url
    });
    setShowScanner(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      description: formData.description,
      receiptUrl: formData.receiptUrl || undefined
    };

    if (editingExpense) {
      onUpdateExpense(editingExpense.id, expenseData);
    } else {
      onAddExpense(expenseData);
    }
    
    // Clear form after adding
    if (!editingExpense) {
      setFormData({
        amount: '',
        category: categories[0]?.name || 'Food',
        date: new Date().toISOString().split('T')[0],
        description: '',
        receiptUrl: ''
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
            <ReceiptScanner 
              onScanComplete={handleScanComplete} 
              onClose={() => setShowScanner(false)} 
            />
          </div>
        )}
        {showCategoryModal && (
          <CategoryModal 
            onClose={() => setShowCategoryModal(false)}
            onSuccess={(name) => setFormData(prev => ({ ...prev, category: name }))}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-xl relative overflow-hidden max-w-full"
      >
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 ${editingExpense ? 'bg-primary/20' : 'bg-primary/10'} rounded-xl flex items-center justify-center`}>
              {editingExpense ? <Check size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-text-main dark:text-white tracking-tight">
                {editingExpense ? 'Edit Entry' : 'Manual Entry'}
              </h2>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mt-1">Transaction Details</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!editingExpense && (
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 bg-accent/10 border border-accent/20 text-accent rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-accent/20 active:scale-95"
              >
                <Camera size={14} />
                Smart Scan
              </button>
            )}
            {editingExpense && (
              <button onClick={onCancelEdit} className="p-2 hover:bg-bg rounded-xl transition-colors">
                <X size={20} className="text-text-muted" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {formData.receiptUrl && (
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-start sm:items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm border border-border/50">
                <img src={formData.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Document Attached</p>
                <p className="text-xs font-bold text-text-muted truncate">Receipt from transaction analysis</p>
              </div>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, receiptUrl: ''})}
                className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                title="Remove attachment"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted dark:text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <FileText size={12} className="text-primary" /> Label / Merchant
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-bg dark:bg-slate-900 border border-border/60 rounded-xl px-4 py-3.5 text-sm font-bold text-text-main dark:text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:font-medium placeholder:text-text-muted/30"
                placeholder="e.g. Acme Coffee Roasters"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted dark:text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Wallet size={12} className="text-primary" /> Amount
              </label>
              <div className="relative group">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-bg dark:bg-slate-900 border border-border/60 rounded-xl px-4 py-3.5 text-sm font-black text-text-main dark:text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted dark:text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Calendar size={12} className="text-primary" /> Date / Occurence
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-bg dark:bg-slate-900 border border-border/60 rounded-xl px-4 py-3.5 text-sm font-bold text-text-main dark:text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted dark:text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Tag size={12} className="text-primary" /> Category
              </label>
              <div className="relative group">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-bg dark:bg-slate-900 border border-border/60 rounded-xl px-4 py-3.5 text-sm font-bold text-text-main dark:text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="w-full group border border-dashed border-primary/40 rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 transition-all hover:bg-primary/5 hover:border-primary/60 active:scale-[0.99] text-primary/70 hover:text-primary bg-white/40 dark:bg-slate-900/40"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-[11px] font-black uppercase tracking-widest leading-none">Add Category</span>
            </button>

            {/* Tip Box */}
            <div className="bg-bg/50 dark:bg-slate-900/50 border border-border/40 p-4 rounded-xl flex items-start gap-3">
              <div className="text-text-main dark:text-white opacity-60 shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.1.7.7 1.3 1.5 1.5 2.4"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              </div>
              <p className="text-[11px] font-bold text-text-muted leading-relaxed">
                <span className="text-text-main dark:text-white">Tip:</span> You can create custom categories to organize your expenses better.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-[12px] sm:text-[13px] uppercase tracking-[0.16em] sm:tracking-[0.2em] shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] mt-2"
          >
            {editingExpense ? 'Finish Editing' : 'Add Recording'}
            <ChevronRight size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
