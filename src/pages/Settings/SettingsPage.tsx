import React, { useState, useRef } from 'react';
import {
  Shield,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.ts';
import { CURRENCY_OPTIONS } from '../../utils/currency.ts';
import {
  exportBackupJson,
  validateBackupData,
  restoreBackupData,
  exportTransactionsCsv,
  resetDatabaseToDefaults,
  type ValidationResult,
} from '../../services/backupService.ts';
import type { BackupData } from '../../types.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher.tsx';
import { APP_VERSION } from '../../version.ts';

export function SettingsPage() {
  const { t } = useLanguage();
  const { settings, updateCurrency, updateTheme } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import flow states
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Reset database state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const themeLabels = {
    system: t('settings.themeSystem'),
    light: t('settings.themeLight'),
    dark: t('settings.themeDark'),
  } as const;

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFile(file);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateBackupData(parsed);
        setValidation(result);
        if (result.isValid) {
          setParsedBackup(parsed);
        } else {
          setParsedBackup(null);
        }
      } catch (err) {
        setValidation({
          isValid: false,
          errors: [t('settings.parseFailed')],
          warnings: [],
        });
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const executeRestore = async () => {
    if (!parsedBackup) return;
    try {
      setImporting(true);
      await restoreBackupData(parsedBackup);
      setImportSuccess(true);
      setImportedFile(null);
      setValidation(null);
      setParsedBackup(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
    } catch (err: any) {
      alert(t('settings.restoreFailed', { message: err?.message || 'Unknown error' }));
    } finally {
      setImporting(false);
    }
  };

  const handleResetData = async () => {
    await resetDatabaseToDefaults();
    setShowResetConfirm(false);
    window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
    alert(t('settings.resetDone'));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{t('settings.title')}</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* 1. Privacy Notice (Mandated Section 24) */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-100">
          <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm font-bold">{t('settings.privacyTitle')}</h2>
        </div>
        <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 leading-relaxed font-medium">
          {t('settings.privacyBody')}
        </p>
      </div>

      {/* 2. Preferences (Currency, Theme & Language) */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          {t('settings.prefsTitle')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Currency selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('settings.currency')}
            </label>
            <select
              value={settings.currency}
              onChange={(e) => updateCurrency(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 px-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {t('settings.currencyHint')}
            </p>
          </div>

          {/* Theme selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('settings.theme')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['system', 'light', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => updateTheme(theme)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    settings.theme === theme
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {themeLabels[theme]}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {t('settings.themeHint')}
            </p>
          </div>

          {/* Language selection */}
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('settings.language')}
            </label>
            <LanguageSwitcher variant="full" />
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {t('settings.languageHint')}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Data Portability: Backup, Restore & CSV Export */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          {t('settings.backupTitle')}
        </h2>

        {importSuccess && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('settings.restoreSuccess')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export JSON Backup */}
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-sm">
                <Download className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>{t('settings.exportJson')}</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {t('settings.exportJsonHint')}
              </p>
            </div>
            <button
              id="export-backup-btn"
              type="button"
              onClick={() => exportBackupJson()}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('settings.exportJsonBtn')}</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('settings.exportCsv')}</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {t('settings.exportCsvHint')}
              </p>
            </div>
            <button
              id="export-csv-btn"
              type="button"
              onClick={() => exportTransactionsCsv()}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('settings.exportCsvBtn')}</span>
            </button>
          </div>
        </div>

        {/* Restore Backup Area */}
        <div className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>{t('settings.importTitle')}</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {t('settings.importHint')}
              </p>
            </div>

            <label className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 dark:file:bg-neutral-100 file:text-white dark:file:text-neutral-900 hover:file:bg-neutral-800 dark:hover:file:bg-white cursor-pointer">
              <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white">
                {t('settings.chooseFile')}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelected}
                className="hidden"
              />
            </label>
          </div>

          {/* Validation Results Display */}
          {validation && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-3 ${
                validation.isValid
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {validation.isValid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('settings.restoreSuccess')}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>{validation.errors[0] ?? t('settings.parseFailed')}</span>
                  </>
                )}
              </div>

              {validation.stats && (
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-200/40 dark:border-neutral-700/40 text-[11px] font-medium">
                  <div>{t('app.nav.accounts')}: {validation.stats.accountsCount}</div>
                  <div>{t('app.nav.categories')}: {validation.stats.categoriesCount}</div>
                  <div>{t('app.nav.transactions')}: {validation.stats.transactionsCount}</div>
                </div>
              )}

              {validation.errors.length > 0 && !validation.isValid && (
                <ul className="list-disc list-inside space-y-0.5 text-rose-800 dark:text-rose-200">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              {validation.warnings.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-200">
                  {validation.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              )}

              {validation.isValid && (
                <div className="pt-2 flex items-center justify-end">
                  <button
                    id="confirm-restore-btn"
                    type="button"
                    disabled={importing}
                    onClick={executeRestore}
                    className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    {importing ? t('settings.restoring') : t('settings.restoreBtn')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Destructive Area: Reset Database */}
      <div className="bg-rose-50/50 dark:bg-rose-950/40 p-6 rounded-2xl border border-rose-200/80 dark:border-rose-900 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-rose-950 dark:text-rose-100">{t('settings.dangerTitle')}</h2>
            <p className="text-xs text-rose-800/80 dark:text-rose-200/80 mt-0.5">
              {t('settings.dangerHint')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-200 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-700 bg-white dark:bg-neutral-900 border border-rose-300 dark:border-rose-800 rounded-xl transition-colors shadow-2xs"
          >
            {t('settings.resetBtn')}
          </button>
        </div>
      </div>

      {/* 5. About / version */}
      <div className="px-1 pt-2 pb-4 text-center sm:text-left">
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {t('settings.aboutVersion', { version: APP_VERSION })}
        </p>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{t('settings.resetConfirmTitle')}</h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {t('settings.resetConfirmBody')}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
              >
                {t('settings.resetCancel')}
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
              >
                {t('settings.resetConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
