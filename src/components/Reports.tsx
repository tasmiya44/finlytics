import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getApiUrl } from '../lib/api';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

interface ReportData {
  totalSpent: number | string | null;
  transactionCount: number;
  categoryBreakdown: Record<string, number | string | null>;
  categoryCounts: Record<string, number>;
  highestCategory: { name: string; amount: number | string | null } | null;
  lowestCategory: { name: string; amount: number | string | null } | null;
  budgetStatus: Array<{
    category: string;
    limit: number | string | null;
    spent: number | string | null;
    percentage: number | string | null;
  }>;
}

interface ReportsProps {
  userId: number;
  expenses: Array<{
    id: number;
    amount: number;
    category: string;
    date: string;
    description: string;
  }>;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Reports({ userId }: ReportsProps) {
  const { formatAmount } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const fetchReportData = async () => {
    setLoading(true);
    setExportError(null);

    try {
      const response = await fetch(
        getApiUrl(`/api/reports/monthly?month=${selectedMonth}&year=${selectedYear}`),
        {
          headers: { 'x-user-id': userId.toString() }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    setExportError(null);

    try {
      const response = await fetch(
        getApiUrl(`/api/reports/export/${format}?month=${selectedMonth}&year=${selectedYear}`),
        {
          headers: { 'x-user-id': userId.toString() }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `Expense_Report_${selectedMonth + 1}_${selectedYear}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      } else {
        const text = await response.text();
        throw new Error(text || `Failed to generate ${format.toUpperCase()} report`);
      }
    } catch (error: any) {
      console.error(`Error exporting ${format}:`, error);
      setExportError(error.message || `Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(null);
    }
  };

  const getSummaryNote = () => {
    if (!reportData) return '';

    const overBudget = reportData.budgetStatus.filter(
      b => Number(b.percentage || 0) >= 100
    );

    const totalSpent = Number(reportData.totalSpent || 0);
    const savingsNote =
      totalSpent < 5000
        ? 'Excellent expense control this period.'
        : 'Spending aligned with historical averages.';

    if (overBudget.length > 0) {
      const first = overBudget[0];
      const spent = Number(first.spent || 0);
      const limit = Number(first.limit || 0);

      return `${first.category} exceeded budget by ${formatAmount(
        Math.max(0, spent - limit)
      )} this month. ${savingsNote}`;
    }

    return `Your spending is healthy! You've stayed within all tracked budget limits for ${MONTHS[selectedMonth]}. ${savingsNote}`;
  };

  return (
    <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8 pb-12 min-w-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-5 sm:p-8 bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-soft">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Calendar size={24} className="text-primary" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-text-main dark:text-white tracking-tight">
              Financial Reports
            </h2>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] opacity-60">
              Audit and Export Center
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3 sm:gap-4 bg-bg dark:bg-slate-900/50 p-2 rounded-2xl border border-border/50">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1 min-w-[140px] bg-card px-4 sm:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-main dark:text-white border border-border/50 focus:outline-none cursor-pointer hover:bg-bg transition-colors"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="flex-1 min-w-[100px] bg-card px-4 sm:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-main dark:text-white border border-border/50 focus:outline-none cursor-pointer hover:bg-bg transition-colors"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <div className="hidden sm:block h-8 w-px bg-border mx-2" />

          <div className="flex items-center gap-2 px-2 sm:px-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              Live Audit
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          {loading ? (
            <div className="h-[320px] sm:h-[400px] flex items-center justify-center bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-dashed border-border">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : reportData && reportData.transactionCount > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-8">
              <div className="bg-card p-5 sm:p-8 xl:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-polish relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 -mr-40 -mt-40 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 mb-10 sm:mb-16">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-px bg-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                        Official Statement
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight mb-2">
                      Monthly Ledger
                    </h3>

                    <p className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">
                      {MONTHS[selectedMonth]} {selectedYear}
                    </p>
                  </div>

                  <div className="w-full md:w-auto text-left md:text-right p-5 sm:p-6 bg-bg dark:bg-slate-950/20 rounded-3xl border border-border/50">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-60">
                      Statement Total
                    </p>
                    <p className="text-2xl sm:text-4xl font-black text-text-main dark:text-white leading-tight tracking-tight break-words">
                      {formatAmount(Number(reportData.totalSpent || 0))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 relative z-10 mb-10 sm:mb-12">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none opacity-60">
                      Reconciled Items
                    </p>
                    <p className="text-2xl font-black text-text-main dark:text-white tracking-tight">
                      {reportData.transactionCount}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none opacity-60">
                      Peak Classification
                    </p>
                    <p className="text-base font-black text-text-main dark:text-white truncate tracking-tight">
                      {reportData.highestCategory?.name || 'N/A'}
                    </p>
                    <p className="text-[10px] font-bold text-primary italic uppercase tracking-widest">
                      {reportData.highestCategory
                        ? formatAmount(Number(reportData.highestCategory.amount || 0))
                        : '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none opacity-60">
                      Base Classification
                    </p>
                    <p className="text-base font-black text-text-main dark:text-white truncate tracking-tight">
                      {reportData.lowestCategory?.name || 'N/A'}
                    </p>
                    <p className="text-[10px] font-bold text-text-muted italic uppercase tracking-widest">
                      {reportData.lowestCategory
                        ? formatAmount(Number(reportData.lowestCategory.amount || 0))
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-10 sm:mt-12 pt-10 sm:pt-12 border-t border-border/50">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6">
                    Expenditure Audit Table
                  </h4>

                  <div className="space-y-4">
                    {Object.entries(reportData.categoryBreakdown || {}).map(([cat, amt]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between gap-4 py-3 border-b border-border/20 last:border-0 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                          <span className="text-[13px] font-bold text-text-main dark:text-gray-300">
                            {cat}
                          </span>
                        </div>
                        <span className="text-[13px] font-black text-text-main dark:text-white text-right shrink-0">
                          {formatAmount(Number(amt || 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 sm:mt-12 p-5 sm:p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="w-12 h-12 bg-primary rounded-2xl text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <FileText size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                      Executive Summary
                    </p>
                    <p className="text-sm font-bold text-text-main dark:text-white leading-relaxed italic opacity-80">
                      "{getSummaryNote()}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 sm:p-8 xl:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-polish">
                <div className="flex items-center justify-between mb-8 sm:mb-12 gap-4">
                  <div>
                    <h3 className="text-xl font-black text-text-main dark:text-white uppercase tracking-tight leading-none mb-1">
                      Budget Reconciliation
                    </h3>
                    <p className="text-xs font-bold text-text-muted italic opacity-60">
                      Status of projected allocation vs actual variance
                    </p>
                  </div>

                  <TrendingUp className="text-primary opacity-20" size={40} />
                </div>

                <div className="space-y-6">
                  {reportData.budgetStatus.length > 0 ? (
                    <div className="bg-bg dark:bg-slate-950/20 rounded-3xl border border-border/50 overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left">
                        <thead>
                          <tr className="bg-bg dark:bg-slate-900 border-b border-border/50">
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                              Category
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">
                              Status
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">
                              Variance
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-border/30">
                          {reportData.budgetStatus.map(budget => {
                            const percentage = Number(budget.percentage || 0);
                            const limit = Number(budget.limit || 0);
                            const spent = Number(budget.spent || 0);
                            const isOver = percentage >= 100;
                            const variance = Math.abs(limit - spent);

                            return (
                              <tr key={budget.category} className="group hover:bg-bg/50 transition-colors">
                                <td className="px-6 py-5">
                                  <p className="text-sm font-black text-text-main dark:text-white uppercase tracking-tight">
                                    {budget.category}
                                  </p>
                                  <p className="text-[10px] font-bold text-text-muted">
                                    Target: {formatAmount(limit)}
                                  </p>
                                </td>

                                <td className="px-6 py-5 text-center">
                                  <span
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                      isOver
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    }`}
                                  >
                                    {isOver ? 'Exceeded' : 'Within Limit'}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-right">
                                  <p className={`text-sm font-black ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {isOver ? '+' : '-'}
                                    {formatAmount(variance)}
                                  </p>
                                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                    {percentage.toFixed(0)}% Utilized
                                  </p>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 border-2 border-dashed border-border rounded-3xl text-center">
                      <p className="text-text-muted font-black text-[10px] uppercase tracking-widest opacity-40">
                        No active budget allocations for this audit period
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="min-h-[320px] sm:h-[400px] flex flex-col items-center justify-center text-center bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-dashed border-border gap-6 p-6">
              <div className="w-20 h-20 bg-bg dark:bg-slate-900 rounded-full flex items-center justify-center scale-110">
                <FileText size={40} className="text-text-muted opacity-20" />
              </div>

              <p className="text-text-muted font-bold sm:px-12 text-sm leading-relaxed max-w-sm uppercase tracking-widest">
                Official statement unavailable for{' '}
                <span className="text-primary">
                  {MONTHS[selectedMonth]} {selectedYear}
                </span>{' '}
                due to lack of recorded transactions.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-8 bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-soft flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Download size={32} />
            </div>

            <h3 className="text-base font-black text-text-main dark:text-white mb-2 uppercase tracking-tight">
              Export Statement
            </h3>

            <p className="text-xs font-bold text-text-muted italic opacity-60 mb-8 leading-relaxed">
              Generate official financial documents for your offline records.
            </p>

            <div className="w-full space-y-3">
              <button
                disabled={!reportData || reportData.transactionCount === 0 || exporting !== null}
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {exporting === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                Download PDF Report
              </button>

              <button
                disabled={!reportData || reportData.transactionCount === 0 || exporting !== null}
                onClick={() => handleExport('excel')}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {exporting === 'excel' ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                Export Data Sheets
              </button>

              {exportError && (
                <div className="w-full p-4 bg-[#7F1D1D] rounded-2xl border border-red-500/30 text-left relative overflow-hidden transition-all mt-4">
                  <div className="flex gap-3">
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />

                    <div className="flex-1">
                      <p className="text-xs font-black text-white uppercase tracking-wider mb-1">
                        Export Failed
                      </p>
                      <p className="text-[11px] font-bold text-[#E2E8F0] leading-relaxed">
                        {exportError}
                      </p>
                    </div>

                    <button
                      onClick={() => setExportError(null)}
                      className="text-[#E2E8F0] hover:text-white shrink-0 ml-auto cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-primary text-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-sm font-black uppercase tracking-widest mb-4">
                Pro Insight
              </h4>
              <p className="text-white/80 text-xs font-bold italic leading-relaxed">
                "Statements help you identify patterns that casual monthly tracking might overlook. Review your high-spend areas to optimize for next month."
              </p>
            </div>

            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
