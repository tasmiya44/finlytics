import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Analytics from '../components/Analytics';
import BudgetOverview from '../components/BudgetOverview';
import BudgetSettings from '../components/BudgetSettings';
import { Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AnalyticsPage() {
  const { expenses, budgets, updateBudget, deleteBudget, user, t } = useApp();
  const [isBudgetSettingsOpen, setIsBudgetSettingsOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">{t('analytics.title')}</h1>
          <p className="text-text-muted font-medium">{t('analytics.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsBudgetSettingsOpen(true)}
          className="flex items-center gap-2 bg-text-main dark:bg-white text-white dark:text-text-main font-black py-3 px-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
        >
          <Target size={18} />
          {t('analytics.adjust_budgets')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <Analytics expenses={expenses} />
        </div>
        
        <div className="lg:col-span-12">
          <BudgetOverview 
            expenses={expenses} 
            budgets={budgets} 
            onOpenSettings={() => setIsBudgetSettingsOpen(true)}
          />
        </div>
      </div>

      <AnimatePresence>
        {isBudgetSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md"
            >
              <BudgetSettings 
                currentBudgets={budgets}
                onSave={updateBudget}
                onDelete={deleteBudget}
                onClose={() => setIsBudgetSettingsOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
