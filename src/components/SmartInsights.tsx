import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Activity,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../lib/api';

interface SmartInsightsProps {
  userId: number;
  expensesCount: number;
}

export default function SmartInsights({ userId, expensesCount }: SmartInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);

        const response = await fetch(getApiUrl('/api/insights'), {
          headers: { 'x-user-id': userId.toString() }
        });

        if (response.ok) {
          const data = await response.json();
          setInsights(Array.isArray(data) ? data : []);
        } else {
          setInsights([]);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId, expensesCount]);

  const getInsightIcon = (text: string) => {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('critical') ||
      lowerText.includes('exceeded') ||
      lowerText.includes('over budget') ||
      lowerText.includes('warning')
    ) {
      return <AlertTriangle className="text-[#EF4444] dark:text-[#FF8080]" size={18} />;
    }

    if (
      lowerText.includes('higher') ||
      lowerText.includes('increased') ||
      lowerText.includes('more than') ||
      lowerText.includes('spending is up')
    ) {
      return <TrendingUp className="text-[#F59E0B] dark:text-[#FCD34D]" size={18} />;
    }

    if (
      lowerText.includes('save') ||
      lowerText.includes('saving') ||
      lowerText.includes('tip') ||
      lowerText.includes('recommend')
    ) {
      return <Lightbulb className="text-secondary dark:text-[#6EE7B7]" size={18} />;
    }

    if (
      lowerText.includes('highest') ||
      lowerText.includes('category') ||
      lowerText.includes('accounts for') ||
      lowerText.includes('financial summary')
    ) {
      return <Activity className="text-primary dark:text-[#7DD3FC]" size={18} />;
    }

    return <ChevronRight className="text-text-muted dark:text-[#CBD5E1]" size={18} />;
  };

  const getInsightColor = (text: string) => {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('critical') ||
      lowerText.includes('exceeded') ||
      lowerText.includes('over budget') ||
      lowerText.includes('warning')
    ) {
      return 'border-l-[#EF4444] bg-[var(--insight-red-bg)] text-[var(--insight-text)]';
    }

    if (
      lowerText.includes('higher') ||
      lowerText.includes('increased') ||
      lowerText.includes('more than') ||
      lowerText.includes('spending is up')
    ) {
      return 'border-l-[#F59E0B] bg-[var(--insight-amber-bg)] text-[var(--insight-text)]';
    }

    if (
      lowerText.includes('save') ||
      lowerText.includes('saving') ||
      lowerText.includes('tip') ||
      lowerText.includes('recommend')
    ) {
      return 'border-l-secondary bg-[var(--insight-green-bg)] text-[var(--insight-text)]';
    }

    return 'border-l-primary bg-[var(--insight-blue-bg)] text-[var(--insight-text)]';
  };

  if (loading) {
    return (
      <div className="bg-card p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-polish mb-6 sm:mb-8 h-[200px] flex items-center justify-center text-center">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="text-primary animate-pulse" size={32} />
          <p className="text-text-muted text-sm font-bold tracking-tight">
            Preparing your financial insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-5 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-polish mb-6 sm:mb-8 overflow-hidden relative group min-w-0">
      <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-[0.03] dark:opacity-[0.07] pointer-events-none group-hover:scale-110 transition-transform">
        <Sparkles className="w-24 h-24 sm:w-40 sm:h-40" />
      </div>

      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10 relative z-10 min-w-0">
        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
          <Sparkles size={22} />
        </div>

        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-black text-text-main dark:text-white tracking-tight leading-tight sm:leading-none mb-1">
            Financial Intelligence
          </h3>
          <p className="text-[10px] sm:text-[11px] font-black text-text-muted dark:text-slate-400 uppercase tracking-[0.16em] sm:tracking-[0.2em] mt-0.5">
            Automated Analysis
          </p>
        </div>
      </div>

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 relative z-10">
          <AnimatePresence mode="popLayout">
            {insights.slice(0, 6).map((insight, index) => (
              <motion.div
                key={`${insight}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className={`p-4 sm:p-5 rounded-2xl border-l-[4px] shadow-sm flex items-start gap-3 sm:gap-4 transition-all min-w-0 ${getInsightColor(insight)}`}
              >
                <div className="mt-0.5 shrink-0 opacity-80">
                  {getInsightIcon(insight)}
                </div>

                <p className="text-[12px] sm:text-[13px] font-bold leading-relaxed tracking-tight min-w-0">
                  {insight}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-10 sm:py-12 px-4 bg-bg dark:bg-slate-950/20 rounded-3xl border border-dashed border-border bg-bg/20">
          <div className="space-y-1">
            <p className="text-text-muted italic font-black uppercase text-[10px] tracking-widest opacity-60">
              No financial insights available yet
            </p>
            <p className="text-text-muted text-[9px] font-bold opacity-40">
              Add transactions and budgets to see personalized insights
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
