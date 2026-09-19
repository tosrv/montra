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
  PieChart,
  Wallet,
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.tsx';
import { PublicFooter } from '../../components/layout/PublicFooter.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

export function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-neutral-100 dark:border-neutral-800 bg-linear-to-b from-neutral-50/70 dark:from-neutral-900/50 to-white dark:to-neutral-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold tracking-wide mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('landing.badge')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight leading-[1.15] mb-6">
            {t('landing.headlinePrefix')}{' '}
            <span className="text-emerald-700 dark:text-emerald-400">{t('landing.headlinePrivacy')}</span>
          </h1>

          {/* Supporting text */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10">
            {t('landing.heroBody')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              id="hero-start-tracking-cta"
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <span>{t('nav.startTracking')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#privacy"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 rounded-xl transition-colors"
            >
              {t('landing.learnMore')}
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-14 pt-8 border-t border-neutral-200/60 dark:border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center justify-center gap-2">
              <HardDrive className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>{t('landing.trustIndexedDb')}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>{t('landing.trustNoLogin')}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Download className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>{t('landing.trustBackup')}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>{t('landing.trustCsv')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-16 sm:py-24 bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-4">
              {t('landing.privacyTitle')}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">
              {t('landing.privacyIntro')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{t('landing.privacyCard1Title')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.privacyCard1Body')}
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{t('landing.privacyCard2Title')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.privacyCard2Body')}
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-200 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{t('landing.privacyCard3Title')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.privacyCard3Body')}
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{t('landing.privacyCard4Title')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.privacyCard4Body')}
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
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
              {t('landing.featuresIntro')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-center mb-4">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t('landing.feature1Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.feature1Body')}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 flex items-center justify-center mb-4">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t('landing.feature2Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.feature2Body')}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-center mb-4">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t('landing.feature3Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.feature3Body')}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center mb-4">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t('landing.feature4Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.feature4Body')}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 flex items-center justify-center mb-4">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t('landing.feature5Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.feature5Body')}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t('landing.feature6Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.feature6Body')}
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
              {t('landing.howTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{t('landing.howStep1Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.howStep1Body')}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{t('landing.howStep2Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.howStep2Body')}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{t('landing.howStep3Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('landing.howStep3Body')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Backup & Restore Deep Dive */}
      <section id="backup" className="py-16 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 dark:bg-neutral-800 text-white space-y-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>{t('landing.backupBadge')}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                {t('landing.backupTitle')}
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed">
                {t('landing.backupBody')}
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-neutral-300">
              <li className="flex items-start gap-2.5 rounded-xl bg-white/5 border border-white/10 p-3.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{t('landing.backupPoint1')}</span>
              </li>
              <li className="flex items-start gap-2.5 rounded-xl bg-white/5 border border-white/10 p-3.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{t('landing.backupPoint2')}</span>
              </li>
              <li className="flex items-start gap-2.5 rounded-xl bg-white/5 border border-white/10 p-3.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{t('landing.backupPoint3')}</span>
              </li>
            </ul>

            <div className="flex justify-center">
              <Link
                to="/app/settings"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 text-sm font-semibold text-neutral-900 bg-white dark:bg-neutral-100 hover:bg-neutral-100 dark:hover:bg-white rounded-xl transition-all shadow-md"
              >
                <span>{t('landing.backupCta')}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-linear-to-b from-white dark:from-neutral-950 to-neutral-50 dark:to-neutral-900 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-base">
            {t('landing.ctaBody')}
          </p>
          <div>
            <Link
              id="final-start-tracking-cta"
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <span>{t('nav.startTracking')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
