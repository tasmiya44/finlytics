import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  FileSpreadsheet,
  Menu,
  Receipt,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import DemoLoadingScreen from '../components/DemoLoadingScreen';
import ProductPreview, { HeroDashboardPreview } from '../components/marketing/ProductPreview';
import { loginAsDemo } from '../lib/demoLogin';

const features = [
  { icon: WalletCards, title: 'Expense Tracking', copy: 'Manage income and expenses effortlessly.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Target, title: 'Budget Planning', copy: 'Create monthly budgets and monitor spending.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Bot, title: 'AI Financial Insights', copy: 'Receive intelligent recommendations based on your spending.', color: 'bg-violet-50 text-violet-600' },
  { icon: ScanLine, title: 'Receipt Scanner', copy: 'Upload receipts and extract transaction details.', color: 'bg-amber-50 text-amber-600' },
  { icon: BarChart3, title: 'Analytics Dashboard', copy: 'Visualize spending with interactive charts.', color: 'bg-sky-50 text-sky-600' },
  { icon: FileSpreadsheet, title: 'PDF & Excel Reports', copy: 'Export detailed financial reports.', color: 'bg-rose-50 text-rose-600' },
  { icon: ShieldCheck, title: 'Secure Authentication', copy: 'Safe and protected user accounts.', color: 'bg-slate-100 text-slate-700' },
  { icon: Sparkles, title: 'Responsive Design', copy: 'Optimized for desktop, tablet, and mobile.', color: 'bg-fuchsia-50 text-fuchsia-600' }
];

const highlights = [
  'AI-Powered Financial Insights',
  'Smart Expense Tracking',
  'Budget Planning',
  'Receipt Scanner',
  'Interactive Analytics',
  'PDF & Excel Export',
  'Secure Authentication',
  'Responsive Design'
];

const steps = [
  { number: '01', title: 'Add Transactions', copy: 'Record income and expenses in a focused, organized workspace.', icon: Receipt },
  { number: '02', title: 'AI Categorizes & Analyzes', copy: 'Automatically organize spending and generate meaningful insights.', icon: Bot },
  { number: '03', title: 'View Insights & Reports', copy: 'Monitor finances through analytics, budgets, and exportable reports.', icon: TrendingUp }
];

export default function LandingPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDemo = async () => {
    setDemoLoading(true);
    setDemoError(null);

    try {
      const [user] = await Promise.all([
        loginAsDemo(),
        new Promise(resolve => setTimeout(resolve, 1400))
      ]);
      login(user);
      navigate('/dashboard');
    } catch (error) {
      setDemoLoading(false);
      setDemoError(error instanceof Error ? error.message : 'Could not prepare demo workspace');
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="marketing-shell min-h-screen bg-white text-slate-950">
      <AnimatePresence>{demoLoading && <DemoLoadingScreen />}</AnimatePresence>

      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl' : 'bg-white/70 backdrop-blur-md'}`}>
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"><TrendingUp size={21} /></span>
            <span className="text-lg font-black tracking-tight">Finlytics</span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {[
              ['Features', '#features'],
              ['How It Works', '#how-it-works'],
              ['AI Insights', '#why-finlytics'],
              ['About', '#about']
            ].map(([label, href]) => <a key={href} href={href} className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-950">{label}</a>)}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/auth" className="px-4 py-2.5 text-sm font-black text-slate-600 transition-colors hover:text-primary">Login</Link>
            <Link to="/auth" className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">Get Started <ArrowRight size={16} /></Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 lg:hidden" aria-label="Toggle navigation">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-slate-200 bg-white lg:hidden">
              <div className="space-y-1 px-5 py-5">
                {[
                  ['Features', '#features'],
                  ['How It Works', '#how-it-works'],
                  ['AI Insights', '#why-finlytics'],
                  ['About', '#about']
                ].map(([label, href]) => <a key={href} href={href} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-50">{label}</a>)}
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <Link to="/auth" onClick={closeMenu} className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-black">Login</Link>
                  <Link to="/auth" onClick={closeMenu} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-black text-white">Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="relative border-b border-indigo-100 bg-indigo-50/55 pb-20 pt-32 sm:pb-24 sm:pt-36 lg:pb-28">
          <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 sm:px-8 xl:grid-cols-[minmax(420px,0.8fr)_minmax(700px,1.2fr)] xl:px-10">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary shadow-sm">
                <Sparkles size={14} /> Your financial command center
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">Take Control of Your Finances with AI</h1>
              <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">Track expenses, manage budgets, scan receipts, generate reports, and receive AI-powered financial insights, all in one modern workspace.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/auth" className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black text-white shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 hover:bg-indigo-600">Get Started Free <ArrowRight size={18} /></Link>
                <button onClick={handleDemo} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-black text-slate-800 shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:text-primary"><TrendingUp size={18} /> Explore Demo</button>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500"><Check size={15} className="text-emerald-500" /> No credit card required</div>
              {demoError && <p className="mt-4 text-sm font-bold text-rose-600">{demoError}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.15 }} className="relative w-full xl:justify-self-end">
              <HeroDashboardPreview />
            </motion.div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Everything in one workspace</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Built for clarity, not complexity.</h2>
              <p className="mt-4 text-base font-medium leading-7 text-slate-500">From daily transactions to month-end reporting, every tool works together.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.article key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}><feature.icon size={21} /></div>
                  <h3 className="mt-5 text-base font-black">{feature.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{feature.copy}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-finlytics" className="scroll-mt-24 px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-300">Why Finlytics</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">A calmer way to understand your money.</h2>
                <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-300 sm:text-base">Powerful tools are useful only when they stay understandable. Finlytics keeps the detail while making every decision easier to see.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {highlights.map(item => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300"><Check size={15} /></span><span className="text-sm font-bold text-slate-100">{item}</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Simple by design</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">From transaction to insight in three steps.</h2></div>
            <div className="relative mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {steps.map((step, index) => (
                <motion.article key={step.number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }} className="relative rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex items-center justify-between"><span className="text-xs font-black tracking-[0.2em] text-primary">STEP {step.number}</span><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-primary"><step.icon size={21} /></div></div>
                  <h3 className="mt-8 text-xl font-black tracking-tight">{step.title}</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-500">{step.copy}</p>
                  {index < 2 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden rounded-full bg-white p-1 text-primary shadow-md lg:block" size={30} />}
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mb-10 max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Actual product experience</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">See the workspace before you sign in.</h2><p className="mt-4 text-base font-medium leading-7 text-slate-500">These previews use Finlytics' real interface components, charts, transaction rows, and budget tools.</p></div>
            <ProductPreview />
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20"><TrendingUp size={26} /></div>
            <h2 className="mt-7 text-3xl font-black tracking-tight sm:text-5xl">Ready to make your finances clearer?</h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-slate-500">Start with your own workspace or explore a fully prepared demo in seconds.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/auth" className="rounded-2xl bg-primary px-7 py-4 text-sm font-black text-white shadow-xl shadow-primary/20">Get Started Free</Link><button onClick={handleDemo} className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-sm font-black text-slate-800">Explore Demo</button></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
          <div className="sm:col-span-2 lg:col-span-1"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"><TrendingUp size={19} /></span><span className="font-black">Finlytics</span></div><p className="mt-4 max-w-xs text-sm font-medium leading-6 text-slate-500">Modern financial management with practical AI insights.</p></div>
          <div><h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Quick Links</h3><div className="mt-4 space-y-3 text-sm font-semibold text-slate-500"><a href="#features" className="block hover:text-primary">Features</a><a href="#how-it-works" className="block hover:text-primary">How It Works</a><Link to="/auth" className="block hover:text-primary">Login</Link></div></div>
          <div><h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Product</h3><div className="mt-4 space-y-3 text-sm font-semibold text-slate-500"><a href="#why-finlytics" className="block hover:text-primary">AI Insights</a><button onClick={handleDemo} className="block hover:text-primary">Explore Demo</button><a href="#about" className="block hover:text-primary">Product Preview</a></div></div>
          <div><h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Connect</h3><div className="mt-4 space-y-3 text-sm font-semibold text-slate-500"><a href="https://github.com/tasmiya44/finlytics" target="_blank" rel="noreferrer" className="block hover:text-primary">GitHub</a><a href="mailto:hello@finlytics.app" className="block hover:text-primary">Contact</a><span className="block">Privacy</span></div></div>
        </div>
        <div className="border-t border-slate-200 px-5 py-5 text-center text-xs font-semibold text-slate-400">© {new Date().getFullYear()} Finlytics. All rights reserved.</div>
      </footer>
    </div>
  );
}
