import React from 'react';
import { useApp } from '../context/AppContext';
import Reports from '../components/Reports';

export default function ReportsPage() {
  const { user, expenses, t } = useApp();

  if (!user) return null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-black text-text-main dark:text-white tracking-tight">{t('reports.title')}</h1>
        <p className="text-sm sm:text-base text-text-muted font-medium">{t('reports.subtitle')}</p>
      </div>

      <div className="bg-transparent -mt-8">
        <Reports userId={user.id} expenses={expenses} />
      </div>
    </div>
  );
}
