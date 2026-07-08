import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Summary from '../components/Summary';
import SmartInsights from '../components/SmartInsights';
import BudgetOverview from '../components/BudgetOverview';
import BudgetSettings from '../components/BudgetSettings';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import { TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    user, expenses, filteredExpenses, budgets, loading, formatAmount,
    updateBudget, deleteBudget, addExpense, updateExpense, deleteExpense,
    language, t
  } = useApp();
  const [isBudgetSettingsOpen, setIsBudgetSettingsOpen] = useState(false);
  const [showAllThisMonth, setShowAllThisMonth] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  if (!user) return null;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const isDemoWorkspace = user.email === 'demo@finlytics.app';

  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthExpenses = getCurrentMonthExpenses();
  const recentExpenses = showAllThisMonth ? currentMonthExpenses : currentMonthExpenses.slice(0, 5);

  const currentMonthTotal = currentMonthExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  const lastMonthDate = new Date(currentYear, currentMonth - 1);
  const lastMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  });

  const lastMonthTotal = lastMonthExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  const totalBudget = budgets.reduce(
    (sum, b) => sum + Number(b.amount || 0),
    0
  );

  const savingsProgress =
    totalBudget > 0
      ? Math.max(0, Math.min(100, ((totalBudget - currentMonthTotal) / totalBudget) * 100))
      : 0;
  let insightMessage = "Add transactions to track your savings progress.";
  if (currentMonthExpenses.length > 0) {
    if (lastMonthExpenses.length > 0) {
      const diff = lastMonthTotal - currentMonthTotal;
      if (diff > 0) {
        const percent = Math.round((diff / lastMonthTotal) * 100);
        insightMessage = `You've saved ${percent}% more than last month. Keep going to reach your year-end goal!`;
      } else {
        const percent = Math.round((Math.abs(diff) / lastMonthTotal) * 100);
        insightMessage = `Your spending is up by ${percent}% compared to last month. Watch your budget!`;
      }
    } else {
      insightMessage = "Starting strong! Track your daily spending to visualize your savings trend.";
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-text-main dark:text-white tracking-tight">{greeting} 👋</h1>
          <p className="text-sm sm:text-base text-text-muted font-medium break-words">
            {isDemoWorkspace ? 'Explore Mode · Demo Workspace' : `Welcome to Finlytics, ${user.name}.`} {t('dashboard.overview')}
          </p>
        </div>
        <Link
          to="/transactions"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-black py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          {t('dashboard.new_transaction')}
        </Link>
      </div>

      <Summary expenses={expenses} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <SmartInsights userId={user.id} expensesCount={expenses.length} />

          <div className="bg-card p-4 sm:p-8 rounded-[1.75rem] sm:rounded-[2rem] border border-border shadow-polish relative overflow-hidden group/recent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full group-hover/recent:scale-110 transition-transform blur-2xl" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-text-main dark:text-white flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm">
                    <TrendingUp size={22} />
                  </div>
                  <span className="truncate">{t('dashboard.recent_activity')}</span>
                </h3>
                <div className="w-fit px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-80">This Month</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <ExpenseList
                expenses={currentMonthExpenses}
                showAll={showAllThisMonth}
                hidePagination={true}
                onDelete={deleteExpense}
                onEdit={(exp) => {
                  setEditingExpense(exp);
                  setIsExpenseFormOpen(true);
                }}
              />

              {currentMonthExpenses.length > 5 && (
                <div className="flex justify-center pt-4 border-t border-border/40">
                  <button
                    onClick={() => setShowAllThisMonth(!showAllThisMonth)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    {showAllThisMonth ? 'View Fewer Logs' : `View All This Month (${currentMonthExpenses.length})`}
                    <ArrowRight size={14} className={`transition-transform ${showAllThisMonth ? '-rotate-90' : 'rotate-90'}`} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-8">
            <BudgetOverview
              expenses={expenses}
              budgets={budgets}
              onOpenSettings={() => setIsBudgetSettingsOpen(true)}
            />

            <div className="bg-gradient-to-br from-primary to-primary-light p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-black">{t('dashboard.savings_goal')}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{t('dashboard.personal_target')}</p>
                  </div>
                  <TrendingUp size={24} className="text-white/20" />
                </div>
                <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed italic">"{insightMessage}"</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('dashboard.progress')}</span>
                    <span className="text-sm font-black">{Math.round(savingsProgress)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${savingsProgress}%` }}
                      className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    />
                  </div>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">
                  {totalBudget > currentMonthTotal
                    ? `${t('dashboard.remaining')}: ${formatAmount(totalBudget - currentMonthTotal)} to target`
                    : currentMonthExpenses.length === 0
                      ? 'Set your monthly budget to track progress'
                      : 'Budget exceeded for this month'}
                </p>
              </div>
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform blur-2xl pointer-events-none" />
            </div>
          </div>

          {/* New Monthly Tip Section to fill the empty space */}
          <div className="bg-card p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-polish group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all shadow-sm">
                <TrendingUp size={18} />
              </div>
              <h4 className="text-xs font-black text-text-main dark:text-white uppercase tracking-widest">{t('dashboard.financial_strategy')}</h4>
            </div>
            <p className="text-xs text-text-muted italic leading-relaxed opacity-80 border-l-2 border-primary/20 pl-4">
              "Did you know? Setting aside just 20% of your income consistently can build a strong emergency fund within 6 months. Review your Shopping category to find potential savings."
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isBudgetSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
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
              className="relative w-full max-w-md max-h-[92vh] overflow-y-auto"
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

        {isExpenseFormOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsExpenseFormOpen(false);
                setEditingExpense(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[92vh] bg-card rounded-[2rem] sm:rounded-[2.5rem] overflow-y-auto shadow-2xl"
            >
              <ExpenseForm
                onAddExpense={(data) => {
                  addExpense(data);
                  setIsExpenseFormOpen(false);
                }}
                onUpdateExpense={(id, data) => {
                  updateExpense(id, data);
                  setIsExpenseFormOpen(false);
                  setEditingExpense(null);
                }}
                editingExpense={editingExpense}
                onCancelEdit={() => {
                  setIsExpenseFormOpen(false);
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
