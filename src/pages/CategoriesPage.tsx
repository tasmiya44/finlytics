import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CategoryBreakdown from '../components/CategoryBreakdown';
import CategoryModal from '../components/CategoryModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import { Plus, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CategoriesPage() {
  const { user, expenses, t } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">{t('categories.title')}</h1>
          <p className="text-text-muted font-medium">{t('categories.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowManageModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-accent/10 text-accent border border-accent/20 font-black py-3 px-6 rounded-2xl hover:bg-accent/20 transition-all active:scale-[0.98]"
          >
            <Settings2 size={18} />
            Manage
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white font-black py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            Create Category
          </button>
        </div>
      </div>

      <div className="w-full">
        <CategoryBreakdown expenses={expenses} />
      </div>

      <AnimatePresence>
        {showAddModal && (
          <CategoryModal onClose={() => setShowAddModal(false)} />
        )}
        {showManageModal && (
          <ManageCategoriesModal onClose={() => setShowManageModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
