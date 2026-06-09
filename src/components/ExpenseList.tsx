import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, MoreVertical, ChevronDown, ChevronUp, FileText, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, Expense } from '../context/AppContext';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: number) => void;
  onEdit: (expense: Expense) => void;
  showAll?: boolean;
  hidePagination?: boolean;
}

export default function ExpenseList({ expenses, onDelete, onEdit, showAll = false, hidePagination = false }: ExpenseListProps) {
  const { formatAmount } = useApp();
  const [visibleCount, setVisibleCount] = useState(showAll ? expenses.length : 10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [activeMobileId, setActiveMobileId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMobileId(null);
      }
    };

    if (activeMobileId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMobileId]);

  if (expenses.length === 0) {
    return (
      <div className="py-20 text-center text-text-muted italic flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-3xl bg-bg/20">
        <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
          <Receipt size={24} className="opacity-20" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No transactions recorded</p>
          <p className="text-[9px] font-bold opacity-30">Start by adding your first expense</p>
        </div>
      </div>
    );
  }

  const visibleExpenses = showAll || hidePagination ? (showAll ? expenses : expenses.slice(0, 5)) : expenses.slice(0, visibleCount);
  const hasMore = !showAll && !hidePagination && visibleCount < expenses.length;

  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete !== null) {
      onDelete(expenseToDelete);
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false} mode="popLayout">
        {visibleExpenses.map((expense, index) => (
          <motion.div
            layout
            key={expense.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: Math.min(index * 0.03, 0.2) }}
            onClick={() => setActiveMobileId(activeMobileId === expense.id ? null : expense.id)}
            className={`group/expense bg-card p-4 rounded-2xl border border-border/50 flex items-center justify-between gap-4 transition-all hover:shadow-sm hover:border-primary/20 relative cursor-pointer md:cursor-default`}
          >
            <div className={`flex items-center gap-4 flex-1 min-w-0 transition-all duration-300`}>
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-sm font-black"
                style={getCategoryStyles(expense.category)}
              >
                {expense.category.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-text-main dark:text-white truncate tracking-tight">{expense.description}</h4>
                  {expense.receiptUrl && (
                    <a 
                      href={expense.receiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                      title="View Receipt"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText size={10} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black text-text-muted dark:text-slate-400 uppercase tracking-widest italic">{expense.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 relative">
              <div className="text-right">
                <div className="text-sm font-black text-text-main dark:text-white tracking-tight">
                  -{formatAmount(expense.amount)}
                </div>
                <div className="text-[10px] font-bold text-text-muted dark:text-slate-500 italic opacity-60">
                  {new Date(expense.date).toLocaleDateString()}
                </div>
              </div>

              {/* Actions Overlay - Vertical kebab menu for professional clean look */}
              <div className="relative shrink-0 flex items-center" ref={activeMobileId === expense.id ? menuRef : null}>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveMobileId(activeMobileId === expense.id ? null : expense.id); 
                  }}
                  className={`p-1.5 rounded-lg transition-all ${
                    activeMobileId === expense.id 
                      ? 'bg-primary/10 text-primary opacity-100' 
                      : 'text-text-muted hover:bg-primary/5 hover:text-primary md:opacity-0 md:group-hover/expense:opacity-100'
                  }`}
                >
                  <MoreVertical size={16} strokeWidth={2.5} />
                </button>

                <AnimatePresence>
                  {activeMobileId === expense.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5, x: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5, x: 0 }}
                      className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-border shadow-xl rounded-xl py-1.5 z-50 min-w-[140px] overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(expense); setActiveMobileId(null); }}
                        className="w-full px-4 py-2 flex items-center gap-3 text-text-main dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-colors text-xs font-bold text-left"
                      >
                        <Edit2 size={14} className="opacity-70" />
                        Edit record
                      </button>
                      <div className="mx-2 my-1 border-t border-border/50" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(expense.id); setActiveMobileId(null); }}
                        className="w-full px-4 py-2 flex items-center gap-3 text-danger hover:bg-danger/5 transition-colors text-xs font-bold text-left"
                      >
                        <Trash2 size={14} className="opacity-70" />
                        Delete expense
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {!hidePagination && (
        <div className="flex flex-col gap-2 mt-2">
          {hasMore && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="w-full py-4 bg-card/40 border border-border border-dashed rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold text-text-muted hover:text-text-main hover:bg-card transition-all"
            >
              <ChevronDown size={16} />
              Show More Transactions ({expenses.length - visibleCount} remaining)
            </motion.button>
          )}

          {!showAll && visibleCount > 10 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVisibleCount(10)}
              className="w-full py-4 bg-card/20 border border-border/50 border-dashed rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold text-text-muted hover:text-[#EF4444] hover:bg-card transition-all"
            >
              <ChevronUp size={16} />
              Hide Transactions (Collapse list)
            </motion.button>
          )}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function getCategoryStyles(category: string) {
  switch (category) {
    case 'Rent': return { backgroundColor: '#FFEECC', color: '#FFB37E' };
    case 'Food': return { backgroundColor: '#FFF9E6', color: '#FFD151' };
    case 'Shopping': return { backgroundColor: '#FFE6E6', color: '#FF9B9B' };
    case 'Entertainment': return { backgroundColor: '#FFFBEB', color: '#FCD34D' };
    case 'Utilities': return { backgroundColor: '#F3E8FF', color: '#D5B9FF' };
    case 'Transport': return { backgroundColor: '#E0F2FE', color: '#6DA5FF' };
    case 'Bills': return { backgroundColor: '#FEF2F2', color: '#FFADAD' };
    case 'Education': return { backgroundColor: '#F5F3FF', color: '#CDB4DB' };
    default: return { backgroundColor: '#EDF2F7', color: '#BDCEDB' };
  }
}

