import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  HardDrive,
  Lock,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Download,
  Layers,
  CheckCircle2,
  PieChart,
  Wallet,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.tsx';
import { PublicFooter } from '../../components/layout/PublicFooter.tsx';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-neutral-100 dark:border-neutral-800 bg-linear-to-b from-neutral-50/70 dark:from-neutral-900/50 to-white dark:to-neutral-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold tracking-wide mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>100% Local-First & Zero Cloud Financial Database</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight leading-[1.15] mb-6">
            Your money. Your device.{' '}
            <span className="text-emerald-700 dark:text-emerald-400">Your privacy.</span>
          </h1>

          {/* Supporting text */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10">
            Track your income, expenses, and accounts without creating an account or sending your
            financial data to the cloud. All records stay in your browser.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              id="hero-start-tracking-cta"
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <span>Start Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#privacy"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 rounded-xl transition-colors"
            >
              Learn More
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-14 pt-8 border-t border-neutral-200/60 dark:border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center justify-center gap-2">
              <HardDrive className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>Browser IndexedDB</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>No Login or Password</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Download className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>JSON Backup & Restore</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>Client-side CSV Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-16 sm:py-24 bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-4">
              Your financial data stays on your device.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">
              Most personal finance apps require you to upload bank details, passwords, and private
              transactions to their remote servers. Money Tracker is built entirely differently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Stored Locally in IndexedDB</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Transactions, accounts, and categories live in your browser's persistent IndexedDB
                storage. No remote database or backend server has access to your transactions.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">No Account or Sign-in Required</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                No email, no phone number, no passwords, and no oauth trackers. Just open the app
                and start tracking immediately without giving away personal identity.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-200 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Never Uploaded to Cloud</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Money Tracker does not have a database backend like Supabase, Firebase, or SQL.
                Even if our website goes offline, your records remain intact on your computer or
                phone.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Strict Analytics Separation</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Your balances, amounts, notes, and categories stay in the browser. Optional Umami
                pageviews (if configured by the host) never include financial data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-16 sm:py-24 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-3">
              Carefully crafted for everyday financial clarity
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
              Everything you need to understand where your money goes, without complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-center mb-4">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">Track Transactions</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Record income, expenses, and account transfers with instant integer arithmetic and
                precise currency formatting.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 flex items-center justify-center mb-4">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">Multiple Accounts</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Manage BNI, Jago, BCA, Cash, or custom accounts. Balances calculate accurately from
                initial balance, income, expense, and transfers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-center mb-4">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">Monthly Overview</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Answer "How is my money doing this month?" with monthly income, expenses, net cash
                flow, and category expense breakdowns.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center mb-4">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">Local-First Privacy</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Your financial data never leaves your browser sandbox. Works completely offline
                without network dependence.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 flex items-center justify-center mb-4">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">Backup & Restore</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Export your entire financial database to a clean JSON file with integrity
                validation before restoring.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">CSV Export</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Export all transactions directly to CSV for spreadsheets, taxes, or archiving
                without any cloud processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-neutral-50/40 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-3">
              How It Works
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
              No registration, no credit card, no waiting. Simple 3-step tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Open Money Tracker</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Simply click "Start Tracking". Default accounts (BNI, Jago, BCA, Cash) and
                categories are prepared in your browser immediately.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Record your transactions</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Add your daily income, expenses, and account transfers in seconds. Everything is saved
                into your browser's IndexedDB.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Understand your cash flow</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                View your monthly income, expenses, and net cash flow at a glance. Filter, search,
                and export your records anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Backup & Restore Deep Dive */}
      <section id="backup" className="py-16 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 dark:bg-neutral-800 text-white flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Download className="w-3.5 h-3.5" /> Total Data Portability
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Your data is always in your control.
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                Never worry about vendor lock-in. You can download a standard JSON backup of your
                entire financial database at any time, save it on a USB drive or cloud drive of your
                choice, and restore it on any browser with full integrity validation.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/app/settings"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-neutral-900 bg-white dark:bg-neutral-100 hover:bg-neutral-100 dark:hover:bg-white rounded-xl transition-all shadow-md"
              >
                <span>View Backup Tools</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-linear-to-b from-white dark:from-neutral-950 to-neutral-50 dark:to-neutral-900 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Ready to take control of your money?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-base">
            Start tracking today without accounts, passwords, or data collection.
          </p>
          <div>
            <Link
              id="final-start-tracking-cta"
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <span>Start Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
