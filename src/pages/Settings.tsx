import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Coins, 
  Moon, 
  Sun, 
  Globe, 
  ShieldCheck, 
  Bell, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { 
    user, currency, setCurrency, logout, 
    language, setLanguage, 
    settings, updateSettings, t 
  } = useApp();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full min-w-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-black text-text-main dark:text-white tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm sm:text-base text-text-muted font-medium">{t('settings.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <section className="bg-card p-5 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-polish relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -mr-32 -mt-32 rounded-full group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 min-w-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border-4 border-card shadow-lg ring-1 ring-border shrink-0">
              <UserIcon className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="flex-1 text-center md:text-left min-w-0">
              <h3 className="text-xl sm:text-2xl font-black text-text-main dark:text-white tracking-tight truncate">{user?.name}</h3>
              <p className="text-sm sm:text-base text-text-muted font-bold opacity-60 mb-4 break-all">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">{t('settings.active_account')}</span>
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{t('settings.pro_plan')}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full md:w-auto px-8 py-3 bg-danger/10 text-danger font-black rounded-2xl border border-danger/20 hover:bg-danger hover:text-white transition-all text-xs uppercase tracking-widest"
            >
              {t('settings.sign_out_securely')}
            </button>
          </div>
        </section>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-sm space-y-6 min-w-0"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <Coins size={20} />
              </div>
              <h3 className="text-base font-black text-text-main dark:text-white tracking-tight">{t('settings.regional')}</h3>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">{t('settings.currency')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['INR', 'USD', 'EUR'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`py-3 px-2 sm:px-4 rounded-xl font-black text-xs sm:text-sm border-2 transition-all ${
                        currency === curr 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border text-text-muted hover:border-primary/40'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">{t('settings.language')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'en' as const, label: 'English' },
                    { id: 'hi' as const, label: 'Hindi (हिंदी)' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id)}
                      className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                        language === lang.id 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border text-text-muted hover:border-primary/40'
                      }`}
                    >
                      <Globe size={14} className={language === lang.id ? 'text-primary' : 'text-text-muted'} />
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-sm space-y-6 min-w-0"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-black text-text-main dark:text-white tracking-tight">{t('settings.security')}</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { 
                  id: 'twoFactor',
                  icon: ShieldCheck, 
                  label: t('settings.two_factor'), 
                  isActive: settings.twoFactor,
                  toggle: () => updateSettings({ twoFactor: !settings.twoFactor })
                },
                { 
                  id: 'emailNotifications',
                  icon: Bell, 
                  label: t('settings.email_notifications'), 
                  isActive: settings.emailNotifications,
                  toggle: () => updateSettings({ emailNotifications: !settings.emailNotifications })
                },
              ].map((item) => (
                <div 
                  key={item.id} 
                  onClick={item.toggle}
                  className="flex items-start sm:items-center justify-between gap-3 p-4 bg-bg dark:bg-slate-900/50 rounded-2xl border border-border group cursor-pointer hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon size={18} className={`${item.isActive ? 'text-primary' : 'text-text-muted'} group-hover:scale-110 transition-all`} />
                    <span className="text-xs font-extrabold text-text-main dark:text-white min-w-0">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-tight ${item.isActive ? 'text-success' : 'text-text-muted opacity-60'}`}>
                      {item.isActive ? t('settings.enabled') : t('settings.disabled')}
                    </span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${item.isActive ? 'bg-primary' : 'bg-border'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${item.isActive ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-start sm:items-center justify-between gap-3 p-4 bg-bg dark:bg-slate-900/50 rounded-2xl border border-border group cursor-pointer hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <ExternalLink size={18} className="text-text-muted group-hover:text-primary transition-colors" />
                  <span className="text-xs font-extrabold text-text-main dark:text-white min-w-0">{t('settings.connected_apps')}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-tight opacity-60">
                    {settings.connectedApps.length} {t('settings.linked')}
                  </span>
                  <ChevronRight size={14} className="text-text-muted" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
