import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { t } = useApp();

  const MENU_ITEMS = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: Receipt, label: t('nav.transactions'), path: '/transactions' },
    { icon: BarChart3, label: t('nav.analytics'), path: '/analytics' },
    { icon: FileText, label: t('nav.reports'), path: '/reports' },
    { icon: PieChart, label: t('nav.categories'), path: '/categories' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
  ];
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-card border-r border-border flex flex-col transition-all sticky top-0"
    >
      <div className="p-6 flex items-center justify-between overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp size={18} className="text-white" />
              </div>
              <span className="font-black text-lg tracking-tight text-text-main dark:text-white">Finlytics</span>
            </motion.div>
          )}
          {isCollapsed && (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp size={18} className="text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-3 py-3 rounded-xl transition-all group
              ${isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-text-muted hover:bg-bg dark:hover:bg-slate-800 hover:text-text-main'
              }
            `}
          >
            <item.icon size={22} className={`${!isCollapsed ? 'shrink-0' : 'mx-auto'} transition-colors`} />
            {!isCollapsed && (
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-6 px-3 py-1 bg-text-main text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 border-t border-border flex items-center justify-center text-text-muted hover:text-primary transition-colors mb-2"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 font-bold text-xs"><ChevronLeft size={18} /> {t('nav.collapse')}</div>}
      </button>
    </motion.aside>
  );
}
