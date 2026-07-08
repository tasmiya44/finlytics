import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, FileText, LayoutDashboard, Receipt, Target, TrendingUp } from 'lucide-react';
import Summary from '../Summary';
import ExpenseList from '../ExpenseList';
import Analytics from '../Analytics';
import BudgetOverview from '../BudgetOverview';

const dateFor = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const monthDate = (monthsAgo: number, day: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo, day);
  return date.toISOString().split('T')[0];
};

export const PREVIEW_EXPENSES = [
  { id: 1, userId: 0, description: 'Morning coffee', amount: 180, category: 'Food', date: dateFor(0) },
  { id: 2, userId: 0, description: 'Metro card recharge', amount: 500, category: 'Transport', date: dateFor(1) },
  { id: 3, userId: 0, description: 'Grocery market', amount: 1240, category: 'Food', date: dateFor(2) },
  { id: 4, userId: 0, description: 'Streaming subscription', amount: 649, category: 'Entertainment', date: dateFor(3) },
  { id: 5, userId: 0, description: 'Apartment rent', amount: 28000, category: 'Rent', date: monthDate(0, 1) },
  { id: 6, userId: 0, description: 'Electricity bill', amount: 1850, category: 'Utilities', date: monthDate(0, 5) },
  { id: 7, userId: 0, description: 'Work essentials', amount: 2300, category: 'Shopping', date: monthDate(0, 8) },
  { id: 8, userId: 0, description: 'Previous groceries', amount: 2100, category: 'Food', date: monthDate(1, 6) },
  { id: 9, userId: 0, description: 'Previous rent', amount: 28000, category: 'Rent', date: monthDate(1, 1) },
  { id: 10, userId: 0, description: 'Travel pass', amount: 1450, category: 'Transport', date: monthDate(2, 12) }
];

const PREVIEW_BUDGETS = [
  { id: 1, userId: 0, category: 'Food', amount: 4000 },
  { id: 2, userId: 0, category: 'Shopping', amount: 3500 },
  { id: 3, userId: 0, category: 'Entertainment', amount: 2500 },
  { id: 4, userId: 0, category: 'Transport', amount: 3000 }
];

function DashboardSurface({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bg-bg ${compact ? 'space-y-4 p-4' : 'space-y-6 p-5 sm:p-7'}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Overview</p>
          <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-black tracking-tight text-text-main`}>Financial Dashboard</h3>
        </div>
        <div className="rounded-xl bg-primary px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white">Demo workspace</div>
      </div>
      <Summary expenses={PREVIEW_EXPENSES} />
      {!compact && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="rounded-[1.75rem] border border-border bg-card p-5 lg:col-span-3">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><TrendingUp size={18} /></div>
              <h4 className="font-black text-text-main">Recent activity</h4>
            </div>
            <ExpenseList expenses={PREVIEW_EXPENSES.slice(0, 3)} onDelete={() => undefined} onEdit={() => undefined} hidePagination />
          </div>
          <div className="lg:col-span-2">
            <BudgetOverview expenses={PREVIEW_EXPENSES} budgets={PREVIEW_BUDGETS} onOpenSettings={() => undefined} />
          </div>
        </div>
      )}
    </div>
  );
}

export function HeroDashboardPreview() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotateY: -4, rotateX: 1 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformPerspective: 1400 }}
      className="mx-auto w-full max-w-[920px] rounded-[26px] border border-slate-200 bg-white shadow-[0_34px_90px_rgba(79,70,229,0.20)]"
    >
      <div className="flex h-11 items-center gap-2 rounded-t-[25px] border-b border-slate-200 bg-slate-50 px-4 sm:h-12">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="mx-auto rounded-lg border border-slate-200 bg-white px-5 py-1.5 text-[8px] font-bold text-slate-400 shadow-sm sm:px-14 sm:text-[9px]">finlytics.app/dashboard</div>
      </div>
      <img
        src="/dashboard-preview.webp"
        alt="Finlytics dashboard showing financial summaries, AI insights, budgets, category distribution, and spending analytics"
        width="1800"
        height="1260"
        className="block h-auto w-full rounded-b-[25px]"
        loading="eager"
        fetchPriority="high"
      />
    </motion.div>
  );
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'reports', label: 'Reports', icon: FileText }
] as const;

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('dashboard');
  const reportTotal = useMemo(() => PREVIEW_EXPENSES.reduce((sum, item) => sum + item.amount, 0), []);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 sm:justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black transition-colors sm:px-4 ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-h-[720px] overflow-hidden bg-bg">
        {activeTab === 'dashboard' && <DashboardSurface />}
        {activeTab === 'transactions' && (
          <div className="p-5 sm:p-8">
            <h3 className="mb-5 text-2xl font-black tracking-tight text-text-main">Transactions</h3>
            <ExpenseList expenses={PREVIEW_EXPENSES.slice(0, 6)} onDelete={() => undefined} onEdit={() => undefined} hidePagination />
          </div>
        )}
        {activeTab === 'analytics' && <div className="p-4 sm:p-7"><Analytics expenses={PREVIEW_EXPENSES} /></div>}
        {activeTab === 'budgets' && <div className="p-5 sm:p-8"><BudgetOverview expenses={PREVIEW_EXPENSES} budgets={PREVIEW_BUDGETS} onOpenSettings={() => undefined} /></div>}
        {activeTab === 'reports' && (
          <div className="p-5 sm:p-8">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-10">
              <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
                <div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Official statement</p><h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Monthly Ledger</h3></div>
                <div className="sm:text-right"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statement total</p><p className="mt-1 text-3xl font-black text-slate-950">₹{reportTotal.toLocaleString('en-IN')}</p></div>
              </div>
              <div className="grid grid-cols-1 gap-4 py-7 sm:grid-cols-3">
                {['Reconciled items', 'Budget status', 'Export formats'].map((label, index) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className="mt-2 font-black text-slate-900">{index === 0 ? PREVIEW_EXPENSES.length : index === 1 ? 'On track' : 'PDF & Excel'}</p></div>)}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
