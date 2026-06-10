import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FiltersProps {
  onFilter: (filters: any) => void;
  categories: string[];
  initialNlQuery?: string;
  initialCategory?: string;
}

export default function Filters({ onFilter, categories, initialNlQuery = '', initialCategory = 'All' }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nlQuery, setNlQuery] = useState(initialNlQuery);
  const [filters, setFilters] = useState({
    category: initialCategory,
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (initialNlQuery !== undefined) setNlQuery(initialNlQuery);
  }, [initialNlQuery]);

  useEffect(() => {
    if (initialCategory !== undefined) setFilters(prev => ({ ...prev, category: initialCategory }));
  }, [initialCategory]);

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter({ ...filters, nlQuery });
    }, 400);

    return () => clearTimeout(timer);
  }, [nlQuery]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter({ ...newFilters, nlQuery });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNlQuery(e.target.value);
  };

  const resetFilters = (e: React.MouseEvent) => {
    e.preventDefault();
    const defaultFilters = {
      category: 'All',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    };
    setFilters(defaultFilters);
    setNlQuery('');
    onFilter({ ...defaultFilters, nlQuery: '' });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'All' && v !== '').length;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar Wrapper */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search size={18} className="text-text-muted group-hover:text-primary transition-colors duration-300" />
        </div>
        <input
          type="text"
          placeholder="Search transactions"
          value={nlQuery}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-12 sm:pr-40 py-4 bg-bg dark:bg-slate-900 border border-border/60 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all dark:text-white placeholder:text-text-muted/40 placeholder:italic"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
          {nlQuery && (
            <button 
              type="button"
              onClick={() => setNlQuery('')}
              className="p-1.5 hover:bg-card rounded-lg text-text-muted transition-colors active:scale-95"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${
              isExpanded || activeFiltersCount > 0 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-card border border-border text-text-muted hover:text-text-main hover:border-primary/40'
            }`}
          >
            <Filter size={14} />
            <span>{activeFiltersCount > 0 ? `Filters (${activeFiltersCount})` : 'Advanced'}</span>
            <ChevronDown size={14} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${
          isExpanded || activeFiltersCount > 0 
            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
            : 'bg-card border border-border text-text-muted hover:text-text-main hover:border-primary/40'
        }`}
      >
        <Filter size={14} />
        <span>{activeFiltersCount > 0 ? `Filters (${activeFiltersCount})` : 'Advanced Filters'}</span>
        <ChevronDown size={14} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card dark:bg-slate-800 border border-border dark:border-slate-700 p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] shadow-polish-strong">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-[0.1em] pl-1 flex items-center gap-2">
                    <Filter size={12} className="text-primary" /> Category
                  </label>
                  <div className="relative group">
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full bg-bg dark:bg-slate-900 border border-border dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium appearance-none dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:border-primary/50"
                    >
                      <option value="All">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-[0.1em] pl-1 flex items-center gap-2">
                    <DollarSign size={12} className="text-primary" /> Amount Range
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      className="w-full bg-bg dark:bg-slate-900 border border-border dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-primary/50"
                    />
                    <span className="hidden sm:inline text-text-muted font-bold">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      className="w-full bg-bg dark:bg-slate-900 border border-border dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-primary/50"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2 lg:col-span-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-[0.1em] pl-1 flex items-center gap-2">
                    <Calendar size={12} className="text-primary" /> Date Range
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full bg-bg dark:bg-slate-900 border border-border dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-primary/50"
                    />
                    <span className="hidden sm:inline text-text-muted font-bold">-</span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full bg-bg dark:bg-slate-900 border border-border dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Action */}
              <div className="mt-6 pt-5 border-t border-border dark:border-slate-700/50 flex justify-stretch sm:justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full sm:w-auto group text-[12px] font-bold text-[#F87171] hover:text-[#EF4444] transition-all flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-[#FEE2E2] dark:hover:bg-red-950/30"
                >
                  <X size={14} className="group-hover:rotate-90 transition-transform duration-300" /> 
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
