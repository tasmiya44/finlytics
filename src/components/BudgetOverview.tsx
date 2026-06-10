import { motion } from 'motion/react';
import { AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BudgetOverview({
  expenses,
  budgets,
  onOpenSettings
}: {
  expenses: any[];
  budgets: any[];
  onOpenSettings: () => void;
}) {
  const { formatAmount, t } = useApp();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const categorySpending = monthlyExpenses.reduce((acc, curr) => {
    const amount = Number(curr.amount || 0);
    acc[curr.category] = (acc[curr.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const budgetStats = budgets
    .map(budget => {
      const spent = Number(categorySpending[budget.category] || 0);
      const budgetAmount = Number(budget.amount || 0);
      const percent = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      return {
        ...budget,
        amount: budgetAmount,
        spent,
        percent
      };
    })
    .filter(b => Number(b.amount || 0) > 0);

  if (budgetStats.length === 0) {
    return (
      <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-polish mb-8 text-center">
        <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="text-text-muted" size={24} />
        </div>
        <p className="text-text-muted font-bold text-sm mb-4">{t('common.no_data')} - No budgets set.</p>
        <button
          onClick={onOpenSettings}
          className="text-primary font-extrabold text-[13px] hover:underline hover:text-primary-hover transition-all"
        >
          + {t('analytics.adjust_budgets')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-polish mb-8">
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <h3 className="text-xl font-extrabold text-text-main dark:text-white uppercase tracking-tight">
            {t('analytics.budget_tracking')}
          </h3>
          <p className="text-[11px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-widest mt-0.5">
            {t('analytics.current_goals')}
          </p>
        </div>
        <button
          onClick={onOpenSettings}
          className="bg-bg dark:bg-slate-800 hover:bg-border dark:hover:bg-slate-700 text-text-main dark:text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all border border-border dark:border-slate-700"
        >
          {t('analytics.adjust_budgets')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-y-8">
        {budgetStats.map((stat, index) => {
          const isOver = stat.spent > stat.amount;
          const isWarning = stat.percent >= 80 && !isOver;
          const percentLeft = Math.max(0, 100 - stat.percent);

          return (
            <motion.div
              key={stat.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-3 group"
            >
              <div className="flex justify-between items-end px-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isOver
                        ? 'bg-danger/10 text-danger'
                        : isWarning
                          ? 'bg-warning/10 text-warning'
                          : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isOver && <AlertCircle size={14} />}
                    {isWarning && <TrendingUp size={14} />}
                    {!isOver && !isWarning && <CheckCircle2 size={14} />}
                  </div>
                  <span className="text-[14px] font-black text-text-main dark:text-white uppercase tracking-tight">
                    {stat.category}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[13px] font-black text-text-main dark:text-white leading-none mb-1">
                    {formatAmount(stat.spent)}
                  </span>
                  <span className="text-[9px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-widest opacity-60">
                    of {formatAmount(stat.amount)}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-border/30 dark:bg-slate-800 rounded-full overflow-hidden border border-border/50 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stat.percent, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-colors ${
                    isOver
                      ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      : isWarning
                        ? 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                  }`}
                />
              </div>

              <div className="flex justify-between items-center px-1">
                {isOver ? (
                  <span className="text-[9px] font-black text-danger uppercase tracking-widest">
                    Over by {formatAmount(stat.spent - stat.amount)}
                  </span>
                ) : isWarning ? (
                  <span className="text-[9px] font-black text-warning uppercase tracking-widest">
                    Caution: {stat.percent.toFixed(0)}% Used
                  </span>
                ) : (
                  <span className="text-[9px] font-black text-success uppercase tracking-widest">
                    Good ({percentLeft.toFixed(1)}% Left)
                  </span>
                )}

                <span className="text-[9px] font-black text-text-muted dark:text-slate-400 uppercase tracking-widest">
                  {stat.percent.toFixed(0)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}