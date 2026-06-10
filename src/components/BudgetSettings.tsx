import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, IndianRupee, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Budget {
  category: string;
  amount: number | string;
}

interface BudgetSettingsProps {
  currentBudgets: Budget[];
  onSave: (category: string, amount: number) => void;
  onDelete: (category: string) => void;
  onClose: () => void;
}

export default function BudgetSettings({
  currentBudgets,
  onSave,
  onDelete,
  onClose
}: BudgetSettingsProps) {
  const { categories } = useApp();
  const [editingCategory, setEditingCategory] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !editingCategory) {
      setEditingCategory(categories[0].name);
    }
  }, [categories, editingCategory]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = Number(amount);

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return;
    }

    onSave(editingCategory, parsedAmount);
    setAmount('');
  };

  const handleEdit = (budget: Budget) => {
    setEditingCategory(budget.category);
    setAmount(String(Number(budget.amount || 0)));
  };

  return (
    <div className="bg-card p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-start gap-4 mb-6 sm:mb-8 px-1">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-text-main dark:text-white">Budgeting</h2>
          <p className="text-[10px] sm:text-[11px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-widest mt-0.5">
            Control your spending
          </p>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-bg rounded-xl transition-colors">
          <X size={20} className="text-text-muted" />
        </button>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-[0.15em] px-1">
            Current Allocations
          </h3>

          <div className="max-h-[180px] sm:max-h-[200px] overflow-y-auto space-y-2 pr-1 sm:pr-2 custom-scrollbar">
            {currentBudgets.length === 0 ? (
              <div className="py-8 text-center bg-bg dark:bg-slate-900 rounded-2xl border border-dashed border-border dark:border-slate-700">
                <p className="text-xs text-text-muted dark:text-slate-400 font-bold italic">
                  No financial limits set yet.
                </p>
              </div>
            ) : (
              currentBudgets.map(b => {
                const budgetAmount = Number(b.amount || 0);

                return (
                  <motion.div
                    layout
                    key={b.category}
                    className="flex justify-between items-center gap-3 bg-bg dark:bg-slate-900 px-4 sm:px-5 py-4 rounded-2xl border border-border dark:border-slate-700 group hover:border-primary/30 transition-all shadow-sm"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] font-bold text-text-main dark:text-white truncate">
                        {b.category}
                      </span>
                      <span className="text-[12px] font-extrabold text-primary dark:text-cyan-400">
                        ₹{budgetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:scale-90 sm:group-hover:scale-100 shrink-0">
                      <button
                        onClick={() => handleEdit(b)}
                        className="p-2 hover:bg-card dark:hover:bg-slate-800 rounded-xl text-text-muted dark:text-slate-400 hover:text-primary transition-all shadow-sm bg-bg dark:bg-slate-900 border border-border dark:border-slate-700"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => onDelete(b.category)}
                        className="p-2 hover:bg-card dark:hover:bg-slate-800 rounded-xl text-text-muted dark:text-slate-400 hover:text-[#EF4444] transition-all shadow-sm bg-bg dark:bg-slate-900 border border-border dark:border-slate-700"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 sm:space-y-6 pt-6 border-t border-border dark:border-slate-700">
          <h3 className="text-[10px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-[0.15em] px-1">
            {currentBudgets.find(b => b.category === editingCategory)
              ? 'Maintain Limit'
              : 'Add Allocation'}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-widest px-1">
                Category
              </label>

              <select
                value={editingCategory}
                onChange={e => setEditingCategory(e.target.value)}
                className="w-full bg-bg dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl px-4 py-3.5 font-bold text-text-main dark:text-white outline-none focus-visible:border-primary transition-all cursor-pointer appearance-none text-sm"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name} className="bg-bg dark:bg-slate-900">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-widest px-1">
                Monthly Limit
              </label>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-slate-400">
                  <IndianRupee size={16} />
                </div>

                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-bg dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl pl-10 pr-4 py-3.5 font-bold text-text-main dark:text-white outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-4.5 rounded-2xl font-extrabold text-[15px] shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all hover:bg-primary-hover active:scale-95 cursor-pointer mt-2"
          >
            <Save size={18} />
            Commit Changes
          </button>
        </form>
      </div>
    </div>
  );
}
