import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';
import { PieChart as PieIcon, BarChart3, TrendingUp, TrendingDown, DollarSign, Activity, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

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

export default function Analytics({ expenses }: { expenses: any[] }) {
  const { formatAmount, t } = useApp();
  
  // 1. Overview Metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpentMonth = currentMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalTransactionsMonth = currentMonthExpenses.length;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const avgDailySpent = totalTransactionsMonth > 0 ? totalSpentMonth / daysInMonth : 0;

  // 2. Category Breakdown (Pie/Donut)
  const categoryTotals = currentMonthExpenses.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Number(value)
  })).sort((a: any, b: any) => b.value - a.value);

  // 3. Daily Spending (Bar - Last 7 Days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const barData = last7Days.map(date => {
    const dayTotal = expenses
      .filter(e => e.date === date)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return { name: dayName, amount: dayTotal };
  });

  // 4. Monthly Trend (Line - Last 6 Months)
  const monthlyTrendData = [...Array(6)].map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthTotal = expenses
      .filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === month && ed.getFullYear() === year;
      })
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    return {
      name: d.toLocaleDateString('en-US', { month: 'short' }),
      amount: monthTotal
    };
  });

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[12px] font-black">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const metrics = [
    { label: t('analytics.monthly_spending'), value: formatAmount(totalSpentMonth), icon: <DollarSign size={20} />, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('analytics.transactions'), value: totalTransactionsMonth, icon: <Activity size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: t('analytics.avg_daily'), value: formatAmount(avgDailySpent), icon: <Calendar size={20} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-[2rem] border border-border shadow-soft flex items-center gap-5"
          >
            <div className={`w-12 h-12 rounded-xl ${m.bg} ${m.color} flex items-center justify-center`}>
              {m.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-0.5">{m.label}</p>
              <p className="text-xl font-black text-text-main dark:text-white tracking-tight">{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card p-8 rounded-[2.5rem] border border-border shadow-polish flex flex-col h-[450px]"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <PieIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main dark:text-white tracking-tight uppercase">{t('analytics.spending_core')}</h3>
              <p className="text-[10px] font-bold text-text-muted italic uppercase tracking-widest opacity-60">{t('analytics.dist_percent')}</p>
            </div>
          </div>
          
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#CBD5E1'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatAmount(value), 'Amount']}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-6 border-t border-border/50">
            {pieData.slice(0, 4).map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#64748B' }} />
                    <span className="text-[11px] font-black text-text-muted truncate uppercase tracking-tight">{entry.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-text-main">{((entry.value / totalSpentMonth) * 100).toFixed(0)}%</span>
                </div>
            ))}
          </div>
        </motion.div>

        {/* Bar Chart: Daily Spending */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-8 rounded-[2.5rem] border border-border shadow-polish flex flex-col h-[450px]"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main dark:text-white uppercase tracking-tight tracking-widest">{t('analytics.daily_flux')}</h3>
              <p className="text-[10px] font-bold text-text-muted italic uppercase tracking-widest opacity-60">{t('analytics.day_outflow')}</p>
            </div>
          </div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }}
                  formatter={(value: number) => [formatAmount(value), 'Spent']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '10px' }}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Line Chart: Monthly Trend (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card p-10 rounded-[2.5rem] border border-border shadow-polish h-[450px]"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-text-main dark:text-white uppercase tracking-tight">{t('analytics.monthly_trajectory')}</h3>
                <p className="text-[10px] font-bold text-text-muted italic uppercase tracking-[0.2em] opacity-60">{t('analytics.velocity')}</p>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#64748B' }}
                  dy={10}
                />
                <Tooltip 
                  formatter={(value: number) => [formatAmount(value), 'Total']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 15px 45px rgba(0,0,0,0.1)', padding: '15px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '13px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366F1" 
                  strokeWidth={5} 
                  dot={{ r: 6, strokeWidth: 3, fill: 'white', stroke: '#6366F1' }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#6366F1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
