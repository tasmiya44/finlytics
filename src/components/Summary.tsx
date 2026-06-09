import { motion } from 'motion/react';
import { TrendingUp, CreditCard, Activity, CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Summary({ expenses }: { expenses: any[] }) {
  const { formatAmount, t } = useApp();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const monthlyTotal = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const highestCategory = Object.entries(
    monthlyExpenses.reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>)
  ).sort((a: any, b: any) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'None';
  
  const stats = [
    {
      label: t('summary.transactions'),
      value: monthlyExpenses.length.toString(),
      icon: <CreditCard className="text-primary" size={20} />,
      bgColor: 'bg-primary/10',
      textColor: 'text-text-main'
    },
    {
      label: t('summary.monthly_spend'),
      value: formatAmount(monthlyTotal),
      icon: <CalendarDays className="text-success" size={20} />,
      bgColor: 'bg-success/10',
      textColor: 'text-text-main'
    },
    {
      label: t('summary.top_category'),
      value: highestCategory,
      icon: <Activity className="text-warning" size={20} />,
      bgColor: 'bg-warning/10',
      textColor: 'text-text-main'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card p-8 rounded-[2.5rem] border border-border/60 shadow-polish flex items-center gap-6 transition-all hover:shadow-hover hover:border-primary/20 group"
        >
          <div className={`w-16 h-16 rounded-[1.5rem] ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {stat.icon}
          </div>
          <div>
            <h3 className="text-[11px] font-black text-text-muted dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5 opacity-60 leading-none">{stat.label}</h3>
            <div className={`text-2xl font-black ${stat.textColor} dark:text-white leading-none tracking-tight`}>
              {stat.value}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

