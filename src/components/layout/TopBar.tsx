import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ThemeToggle from '../ThemeToggle';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  LayoutDashboard,
  Receipt,
  BarChart3,
  FileText,
  PieChart,
  Settings,
  Tag,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TopBar() {
  const { user, expenses, categories, logout, t, notifications } = useApp();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const pages = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard', type: 'page' },
    { icon: Receipt, label: t('nav.transactions'), path: '/transactions', type: 'page' },
    { icon: BarChart3, label: t('nav.analytics'), path: '/analytics', type: 'page' },
    { icon: FileText, label: t('nav.reports'), path: '/reports', type: 'page' },
    { icon: PieChart, label: t('nav.categories'), path: '/categories', type: 'page' },
    { icon: Settings, label: t('nav.settings'), path: '/settings', type: 'page' },
  ];

  const getFilteredSuggestions = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Pages
    pages.forEach(page => {
      if (page.label.toLowerCase().includes(query)) {
        results.push(page);
      }
    });

    // Categories
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(query)) {
        results.push({
          icon: Tag,
          label: cat.name,
          path: `/transactions?category=${encodeURIComponent(cat.name)}`,
          type: 'category'
        });
      }
    });

    // Transactions (unique descriptions)
    const seenDescriptions = new Set<string>();
    expenses.forEach(exp => {
      if (exp.description.toLowerCase().includes(query) && !seenDescriptions.has(exp.description.toLowerCase())) {
        results.push({
          icon: CreditCard,
          label: exp.description,
          path: `/transactions?search=${encodeURIComponent(exp.description)}`,
          type: 'transaction'
        });
        seenDescriptions.add(exp.description.toLowerCase());
      }
    });

    return results.slice(0, 8);
  };

  const suggestions = getFilteredSuggestions();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsProfileOpen(false);
    logout();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        navigate(suggestions[selectedIndex].path);
        setIsSearchFocused(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (path: string) => {
    navigate(path);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  return (
    <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full hidden sm:block" ref={searchRef}>
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-primary' : 'text-text-muted'}`} size={18} />
          <input 
            type="text" 
            placeholder={t('topbar.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-bg dark:bg-slate-900 border border-border rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-primary transition-all pr-12"
          />
          
          <AnimatePresence>
            {isSearchFocused && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-polish-strong overflow-hidden z-50 p-2"
              >
                {suggestions.length > 0 ? (
                  <div className="space-y-1">
                    {suggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item.path)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-bg'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={16} />
                          <div className="text-left">
                            <p className="text-sm font-bold">{item.label}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.type}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className={index === selectedIndex ? 'opacity-100' : 'opacity-0'} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest">No results for "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 transition-colors relative rounded-lg ${isNotificationsOpen ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-primary'}`}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-card" />
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-polish-strong overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border bg-bg/50">
                  <h3 className="text-xs font-black text-text-main dark:text-white uppercase tracking-widest">Notifications</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-border last:border-0 hover:bg-bg/50 transition-colors flex gap-3">
                        <div className={`mt-1 shrink-0 p-1.5 rounded-lg ${
                          n.type === 'warning' ? 'bg-danger/10 text-danger' : 
                          n.type === 'success' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                        }`}>
                          {n.type === 'warning' && <AlertTriangle size={14} />}
                          {n.type === 'success' && <CheckCircle2 size={14} />}
                          {n.type === 'info' && <Info size={14} />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-text-main dark:text-white mb-0.5">{n.title}</p>
                          <p className="text-[11px] font-bold text-text-muted leading-relaxed line-clamp-2">{n.message}</p>
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-2">{n.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Bell className="mx-auto text-text-muted opacity-20 mb-3" size={32} />
                      <p className="text-xs font-black text-text-muted uppercase tracking-widest">{t('common.no_data')}</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border bg-bg/30 text-center">
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Mark all as read</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-border mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-text-main dark:text-white leading-tight">{user?.name}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter italic">{t('topbar.pro_planner')}</p>
          </div>
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all overflow-hidden ${
                isProfileOpen ? 'bg-primary/20 text-primary border-primary/40' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              }`}
            >
              <UserIcon size={20} />
            </button>
            
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-xl shadow-polish-strong overflow-hidden z-50 pointer-events-auto"
                >
                  <div className="p-2">
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5 rounded-lg transition-colors font-bold text-left"
                    >
                      <LogOut size={16} />
                      {t('topbar.sign_out')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
