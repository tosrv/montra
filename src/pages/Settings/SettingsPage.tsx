import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  ExternalLink,
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

export function SettingsPage() {
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
          errors: ['Failed to parse file: corrupt or invalid JSON structure.'],
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
      alert('Restore failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setImporting(false);
    }
  };

  const handleResetData = async () => {
    await resetDatabaseToDefaults();
    setShowResetConfirm(false);
    window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
    alert('Database successfully reset to clean default accounts with zero transactions.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Settings & Privacy</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Configure local preferences, data backup, restore, and privacy controls
        </p>
      </div>

      {/* 1. Privacy Notice (Mandated Section 24) */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-100">
          <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm font-bold">Privacy Notice & Architecture</h2>
        </div>
        <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 leading-relaxed font-medium">
          Your financial data is stored locally on this device. Money Tracker does not require an
          account or cloud database. Balances, transactions, and notes never leave your browser.
        </p>
      </div>

      {/* 2. Preferences (Currency & Theme) */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          Display & Regional Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Currency selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Primary Currency
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
              Default is IDR (Indonesian Rupiah). Amounts are stored as clean integers without
              floating-point rounding errors.
            </p>
          </div>

          {/* Theme selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Appearance Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['system', 'light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateTheme(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                    settings.theme === t
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Calm, minimal visual interface optimized for daily personal tracking.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Data Portability: Backup, Restore & CSV Export */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          Backup, Restore & Export
        </h2>

        {importSuccess && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Backup successfully validated and restored to your local database!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export JSON Backup */}
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-sm">
                <Download className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>Export Full Backup (JSON)</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Download all your accounts, categories, settings, and transactions into a standard
                JSON archive file.
              </p>
            </div>
            <button
              id="export-backup-btn"
              type="button"
              onClick={() => exportBackupJson()}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export Transactions (CSV)</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Generate a spreadsheet-compatible CSV file directly in your browser. Never uploaded
                to any server.
              </p>
            </div>
            <button
              id="export-csv-btn"
              type="button"
              onClick={() => exportTransactionsCsv()}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download CSV File</span>
            </button>
          </div>
        </div>

        {/* Restore Backup Area */}
        <div className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>Restore from JSON Backup</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Upload a valid Money Tracker JSON file. Structure, references, and amounts will be
                validated before restoring.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelected}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 dark:file:bg-neutral-100 file:text-white dark:file:text-neutral-900 hover:file:bg-neutral-800 dark:hover:file:bg-white cursor-pointer"
            />
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
                    <span>Backup Verified: Ready to Restore</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Invalid Backup File Detected</span>
                  </>
                )}
              </div>

              {validation.stats && (
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-200/40 dark:border-neutral-700/40 text-[11px] font-medium">
                  <div>Accounts: {validation.stats.accountsCount}</div>
                  <div>Categories: {validation.stats.categoriesCount}</div>
                  <div>Transactions: {validation.stats.transactionsCount}</div>
                </div>
              )}

              {validation.errors.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-rose-700 dark:text-rose-300">Errors:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-800 dark:text-rose-200">
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-amber-700 dark:text-amber-300">Warnings:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-200">
                    {validation.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.isValid && (
                <div className="pt-2 flex items-center justify-between gap-4">
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                    Warning: Restoring will replace your current local database with the contents of
                    this backup.
                  </p>
                  <button
                    id="confirm-restore-btn"
                    type="button"
                    disabled={importing}
                    onClick={executeRestore}
                    className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    {importing ? 'Restoring...' : 'Confirm & Restore'}
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
            <h2 className="text-base font-bold text-rose-950 dark:text-rose-100">Danger Zone: Reset Database</h2>
            <p className="text-xs text-rose-800/80 dark:text-rose-200/80 mt-0.5">
              Permanently wipe all transactions, custom accounts, and categories back to clean
              defaults.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-200 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-700 bg-white dark:bg-neutral-900 border border-rose-300 dark:border-rose-800 rounded-xl transition-colors shadow-2xs"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Reset Local Database?</h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              This action cannot be undone unless you already downloaded a JSON backup. All recorded
              transactions will be permanently deleted and default accounts will start back at zero.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
