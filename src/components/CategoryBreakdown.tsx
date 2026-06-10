import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  PieChart as PieIcon, 
  ChevronRight, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Table as TableIcon,
  X,
  FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryBreakdownProps {
  expenses: any[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Rent': '#6366F1',
  'Food': '#22C55E',
  'Shopping': '#F59E0B',
  'Entertainment': '#EF4444',
  'Utilities': '#A855F7',
  'Transport': '#3B82F6',
  'Healthcare': '#10B981',
  'Bills': '#EC4899',
  'Education': '#8B5CF6',
  'Other': '#64748B'
};

export default function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const { formatAmount, t, language } = useApp();
  const [timeFilter, setTimeFilter] = useState('thisMonth');

  const TIME_FILTERS = [
    { id: 'thisMonth', label: t('categories.this_month') },
    { id: 'lastMonth', label: t('categories.last_month') },
    { id: 'allTime', label: t('categories.all_time') }
  ];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter(exp => {
      const d = new Date(exp.date);
      if (timeFilter === 'thisMonth') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (timeFilter === 'lastMonth') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lastMonth && d.getFullYear() === year;
      }
      return true; // All Time
    });
  }, [expenses, timeFilter]);

  const categoryData = useMemo(() => {
    const totals: Record<string, { amount: number; count: number }> = {};
    let totalSpent = 0;

    filteredData.forEach(exp => {
      if (!totals[exp.category]) {
        totals[exp.category] = { amount: 0, count: 0 };
      }
      totals[exp.category].amount += exp.amount;
      totals[exp.category].count += 1;
      totalSpent += exp.amount;
    });

    return Object.entries(totals).map(([name, data]) => ({
      name,
      value: data.amount,
      count: data.count,
      percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const totalSpent = useMemo(() => categoryData.reduce((acc, curr) => acc + curr.value, 0), [categoryData]);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border border-border/50">
          <p className="text-sm font-black text-text-main dark:text-white mb-1 uppercase tracking-tight">{data.name}</p>
          <p className="text-xs font-bold text-primary">{formatAmount(data.value)}</p>
          <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">{data.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 min-w-0">
      {/* Analytics Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <PieIcon size={24} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-text-main dark:text-white tracking-tight">{t('categories.dist_title')}</h2>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60">{t('categories.dist_subtitle')}</p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2 bg-bg dark:bg-slate-900/50 p-1.5 rounded-2xl border border-border/50">
          {TIME_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`flex-1 md:flex-none px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                timeFilter === f.id 
                  ? 'bg-card text-primary shadow-sm border border-border/50' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start">
        {/* Categories Analysis List */}
        <div className="bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-soft p-5 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h3 className="text-xl font-black text-text-main dark:text-white uppercase tracking-tight">{t('categories.intel_title')}</h3>
              <p className="text-xs font-bold text-text-muted italic opacity-60">{t('categories.intel_subtitle')}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-tight">{t('categories.total_observed')}</p>
              <p className="text-2xl font-black text-primary">{formatAmount(totalSpent)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {categoryData.length > 0 ? (
              categoryData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedCategory(item.name)}
                  className="group cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-bg dark:bg-slate-900/40 rounded-[1.75rem] sm:rounded-[2rem] border border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 gap-5">
                    <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#64748B' }}
                      >
                        {item.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h4 className="text-base font-black text-text-main dark:text-white tracking-tight truncate">{item.name}</h4>
                          <span className="text-[11px] font-black text-primary uppercase tracking-widest">{item.percentage.toFixed(1)}%</span>
                        </div>
                        
                        {/* Comparison Progress Bar */}
                        <div className="h-2.5 bg-border dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#64748B' }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.count} {t('categories.items')}</span>
                          <span className="w-1 h-1 bg-border rounded-full" />
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('categories.avg')} {formatAmount(item.value / item.count).split('.')[0]}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto sm:text-right sm:pl-6 sm:border-l border-border/50 sm:ml-6 sm:min-w-[130px]">
                      <p className="text-xl font-black text-text-main dark:text-white leading-none mb-1">{formatAmount(item.value)}</p>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50">{t('categories.aggregate')}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="md:col-span-2 py-16 sm:py-24 text-center border-2 border-dashed border-border rounded-[2rem] sm:rounded-[2.5rem]">
                <div className="w-20 h-20 bg-bg dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PieIcon className="text-text-muted opacity-20" size={32} />
                </div>
                <p className="text-text-muted font-black tracking-tight uppercase text-xs opacity-60">Zero recorded entries for this period Selection</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal (Matches the Look of Reports but focused on analysis) */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCategory(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="p-5 sm:p-8 border-b border-border/50 flex justify-between items-center gap-4 bg-card sticky top-0 z-10">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20"
                    style={{ backgroundColor: CATEGORY_COLORS[selectedCategory] || '#64748B' }}
                  >
                    <TableIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-text-main dark:text-white tracking-tight truncate">{selectedCategory} Breakdown</h3>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60">
                      {filteredData.filter(e => e.category === selectedCategory).length} transactions recorded
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-xl bg-bg dark:bg-slate-800 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 transition-all font-black text-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 thin-scrollbar">
                {filteredData
                  .filter(e => e.category === selectedCategory)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((exp) => (
                    <div key={exp.id} className="p-4 sm:p-5 bg-bg dark:bg-slate-950/20 rounded-2xl border border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-text-muted group-hover:bg-primary/5 group-hover:text-primary transition-all shadow-sm">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-text-main dark:text-white leading-tight mb-1 truncate">{exp.description}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tight">
                              {new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(exp.date))}
                            </p>
                            <span className="w-1 h-1 bg-border rounded-full" />
                            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-tight">
                              {exp.category}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-base font-black text-text-main dark:text-white sm:text-right">{formatAmount(exp.amount)}</p>
                    </div>
                  ))}
              </div>

              <div className="p-4 sm:p-6 border-t border-border/50 bg-bg/30 text-center uppercase tracking-[0.2em]">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="w-full sm:w-auto px-8 py-4 bg-text-main dark:bg-white text-bg dark:text-text-main text-[10px] font-black rounded-xl hover:opacity-90 transition-all"
                >
                  {t('categories.close_analysis')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
