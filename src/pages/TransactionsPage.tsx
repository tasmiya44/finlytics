import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Filters from '../components/Filters';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import { Plus, Search, Filter as FilterIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TransactionsPage() {
  const { filteredExpenses, fetchExpenses, deleteExpense, addExpense, updateExpense, loading, categories } = useApp();
  const [searchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  useEffect(() => {
    if (editingExpense) setIsFormOpen(true);
  }, [editingExpense]);

  const handleFilter = (filters: any) => {
    fetchExpenses(filters);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-text-main dark:text-white tracking-tight">Transactions</h1>
          <p className="text-sm sm:text-base text-text-muted font-medium">Manage and track your detailed spending history.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-black py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="bg-card p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-polish">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FilterIcon size={18} />
          </div>
          <h3 className="text-base font-black text-text-main dark:text-white tracking-tight">Advanced Filters</h3>
        </div>
        
        <Filters 
          onFilter={handleFilter} 
          categories={categories.map(c => c.name)} 
          initialCategory={initialCategory}
          initialNlQuery={initialSearch}
        />
      </div>

      <div className="bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-polish overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-black text-text-main dark:text-white tracking-tight">Search Results</h3>
            <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
              {filteredExpenses.length} Records
            </span>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Quick search description..." 
              onChange={(e) => handleFilter({ nlQuery: e.target.value })}
              className="w-full bg-bg dark:bg-slate-900 border border-border rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="p-2 sm:p-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-text-muted gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="font-bold text-sm tracking-widest uppercase opacity-60">Synchronizing Data...</p>
            </div>
          ) : filteredExpenses.length > 0 ? (
            <ExpenseList 
              expenses={filteredExpenses} 
              onDelete={deleteExpense} 
              onEdit={setEditingExpense}
            />
          ) : (
            <div className="py-20 text-center text-text-muted italic">No transactions match your criteria.</div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsFormOpen(false);
                setEditingExpense(null);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md max-h-[92vh] overflow-y-auto"
            >
              <ExpenseForm 
                onAddExpense={(data) => {
                  addExpense(data);
                  setIsFormOpen(false);
                }}
                onUpdateExpense={(id, data) => {
                  updateExpense(id, data);
                  setIsFormOpen(false);
                  setEditingExpense(null);
                }}
                editingExpense={editingExpense}
                onCancelEdit={() => {
                  setIsFormOpen(false);
                  setEditingExpense(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
