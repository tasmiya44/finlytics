import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../translations';
import { getApiUrl } from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
  userId: number;
  receiptUrl?: string;
}

export interface Budget {
  id: number;
  userId: number;
  category: string;
  amount: number;
}

export interface Category {
  id: number;
  name: string;
  userId: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'info' | 'success';
}

export type Currency = 'INR' | 'USD' | 'EUR';
export type Language = 'en' | 'hi';

export interface AppSettings {
  twoFactor: boolean;
  emailNotifications: boolean;
  connectedApps: string[];
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€'
};

const CONVERSION_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011
};

interface AppContextType {
  user: User | null;
  expenses: Expense[];
  filteredExpenses: Expense[];
  budgets: Budget[];
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  currency: Currency;
  currencySymbol: string;
  language: Language;
  settings: AppSettings;
  notifications: Notification[];
  categories: Category[];
  login: (userData: User) => void;
  logout: () => void;
  setCurrency: (c: Currency) => void;
  setLanguage: (l: Language) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  fetchExpenses: (filters?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addExpense: (exp: Omit<Expense, 'id' | 'userId'>) => Promise<void>;
  updateExpense: (id: number, exp: Omit<Expense, 'id' | 'userId'>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  updateBudget: (category: string, amount: number) => Promise<void>;
  deleteBudget: (category: string) => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  formatAmount: (amount: number) => string;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('expense_tracker_user_v3');
    return saved ? JSON.parse(saved) : null;
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('app_currency') as Currency) || 'INR';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'en';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? JSON.parse(saved) : {
      twoFactor: false,
      emailNotifications: true,
      connectedApps: []
    };
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('app_currency', c);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem('app_language', l);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const login = useCallback((userData: User) => {
    setInitialLoading(true);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setExpenses([]);
    setFilteredExpenses([]);
    setBudgets([]);
    setInitialLoading(true);
  }, []);

  const t = useCallback((key: string) => {
    return translations[language][key] || key;
  }, [language]);

  const formatAmount = useCallback((amount: number) => {
    const converted = amount * CONVERSION_RATES[currency];
    return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
      style: 'currency',
      currency: currency === 'INR' ? 'INR' : currency === 'USD' ? 'USD' : 'EUR',
      minimumFractionDigits: 2
    }).format(converted);
  }, [currency, language]);

  const generateNotifications = useCallback(() => {
    const newNotifications: Notification[] = [];
    
    // Check budgets
    budgets.forEach(b => {
      const spent = expenses
        .filter(e => {
          const d = new Date(e.date);
          const now = new Date();
          return (e.category?.toLowerCase() === b.category?.toLowerCase()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      
      const percent = (spent / b.amount) * 100;
      if (percent >= 100) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          title: `${b.category} Budget Exceeded`,
          message: `Your spending in ${b.category} has exceeded the budget of ${formatAmount(b.amount)} by ${formatAmount(spent - b.amount)}.`,
          time: 'Just now',
          type: 'warning'
        });
      } else if (percent >= 80) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          title: `${b.category} Budget Warning`,
          message: `You've used ${percent.toFixed(0)}% of your ${b.category} budget.`,
          time: '1h ago',
          type: 'info'
        });
      }
    });

    if (newNotifications.length === 0) {
      newNotifications.push({
        id: 1,
        title: 'Monthly Report Ready',
        message: 'Your financial statement for the previous period is now available for review.',
        time: '2h ago',
        type: 'success'
      });
    }

    setNotifications(newNotifications);
  }, [expenses, budgets, formatAmount]);

  useEffect(() => {
    if (expenses.length > 0 && budgets.length > 0) {
      generateNotifications();
    }
  }, [expenses, budgets, generateNotifications]);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(getApiUrl('/api/categories'), { headers: { 'x-user-id': user.id.toString() } });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [user, logout]);

  const fetchExpenses = useCallback(async (filters: any = {}) => {
    if (!user) return;
    try {
      setLoading(true);
      
      const headers = { 'x-user-id': user.id.toString() };
      
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.nlQuery) params.append('nlQuery', filters.nlQuery);

      // Fetch all required dashboard datasets in parallel to bypass sequential latency
      const [budgetsRes, expRes, allExpRes, categoriesRes] = await Promise.all([
        fetch(getApiUrl('/api/budgets'), { headers }),
        fetch(getApiUrl(`/api/expenses/filter?${params.toString()}`), { headers }),
        fetch(getApiUrl('/api/expenses'), { headers }),
        fetch(getApiUrl('/api/categories'), { headers })
      ]);

      if (
        budgetsRes.status === 401 ||
        expRes.status === 401 ||
        allExpRes.status === 401 ||
        categoriesRes.status === 401
      ) {
        logout();
        return;
      }

      if (budgetsRes.ok) {
        setBudgets(await budgetsRes.json());
      }
      
      if (expRes.ok) {
        setFilteredExpenses(await expRes.json());
      }

      if (allExpRes.ok) {
        setExpenses(await allExpRes.json());
      }

      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json());
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching:', err);
      setError('Could not load data.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
      localStorage.setItem('expense_tracker_user_v3', JSON.stringify(user));
    } else {
      localStorage.removeItem('expense_tracker_user_v3');
    }
  }, [user, fetchExpenses]);

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'userId'>) => {
    if (!user) return;
    const response = await fetch(getApiUrl('/api/expenses'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id.toString() },
      body: JSON.stringify(newExpense),
    });
    if (response.status === 401) {
      logout();
      return;
    }
    if (response.ok) {
      fetchExpenses();
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Error occurred while saving your transaction.');
    }
  };

  const updateExpense = async (id: number, updatedExpense: Omit<Expense, 'id' | 'userId'>) => {
    if (!user) return;
    const response = await fetch(getApiUrl(`/api/expenses/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id.toString() },
      body: JSON.stringify(updatedExpense),
    });
    if (response.status === 401) {
      logout();
      return;
    }
    if (response.ok) {
      fetchExpenses();
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Error occurred while updating your transaction.');
    }
  };

  const deleteExpense = async (id: number) => {
    if (!user) return;
    const response = await fetch(getApiUrl(`/api/expenses/${id}`), {
      method: 'DELETE',
      headers: { 'x-user-id': user.id.toString() }
    });
    if (response.status === 401) {
      logout();
      return;
    }
    if (response.ok) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      setFilteredExpenses(prev => prev.filter(e => e.id !== id));
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Error occurred while deleting your transaction.');
    }
  };

  const updateBudget = async (category: string, amount: number) => {
    if (!user) return;
    const response = await fetch(getApiUrl('/api/budgets'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id.toString() },
      body: JSON.stringify({ category, amount }),
    });
    if (response.status === 401) {
      logout();
      return;
    }
    if (response.ok) {
      const budRes = await fetch(getApiUrl('/api/budgets'), { headers: { 'x-user-id': user.id.toString() } });
      if (budRes.status === 401) {
        logout();
        return;
      }
      setBudgets(await budRes.json());
    }
  };

  const deleteBudget = async (category: string) => {
    if (!user) return;
    const response = await fetch(getApiUrl(`/api/budgets/${category}`), {
      method: 'DELETE',
      headers: { 'x-user-id': user.id.toString() }
    });
    if (response.status === 401) {
      logout();
      return;
    }
    if (response.ok) setBudgets(prev => prev.filter(b => b.category !== category));
  };

  const addCategory = async (name: string): Promise<Category> => {
    if (!user) throw new Error('Not logged in');
    const response = await fetch(getApiUrl('/api/categories'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id.toString() },
      body: JSON.stringify({ name }),
    });
    if (response.status === 401) {
      logout();
      throw new Error('Session expired');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating category');
    }
    const newCat = await response.json();
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const deleteCategory = async (id: number) => {
    if (!user) return;
    const response = await fetch(getApiUrl(`/api/categories/${id}`), {
      method: 'DELETE',
      headers: { 'x-user-id': user.id.toString() }
    });
    if (response.status === 401) {
      logout();
      return;
    }
    if (response.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting category');
    }
  };

  return (
    <AppContext.Provider value={{
      user, expenses, filteredExpenses, budgets, loading, initialLoading, error, currency,
      currencySymbol: CURRENCY_SYMBOLS[currency],
      language, settings, notifications, categories,
      login, logout, setCurrency, setLanguage, updateSettings,
      fetchExpenses, fetchCategories, addExpense, updateExpense,
      deleteExpense, updateBudget, deleteBudget, addCategory, deleteCategory,
      formatAmount, t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
