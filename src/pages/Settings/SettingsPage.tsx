import React, { useState, useRef, useEffect } from 'react';
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
  Eye,
  EyeOff,
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
import {
  getAnonymousInstallationId,
  isAnalyticsEnabled,
  setAnalyticsEnabled,
  getLocalAnalyticsLog,
} from '../../services/analyticsService.ts';
import type { BackupData } from '../../types.ts';

export function SettingsPage() {
  const { settings, updateCurrency, updateTheme } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analytics preferences
  const [analyticsActive, setAnalyticsActive] = useState(isAnalyticsEnabled());
  const [installId, setInstallId] = useState('');
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState(getLocalAnalyticsLog());

  // Import flow states
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Reset database state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const { id } = getAnonymousInstallationId();
    setInstallId(id);
    setAuditLogs(getLocalAnalyticsLog());
  }, []);

  const handleToggleAnalytics = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    setAnalyticsActive(enabled);
    setAuditLogs(getLocalAnalyticsLog());
  };

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
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Settings & Privacy</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure local preferences, data backup, restore, and privacy controls
        </p>
      </div>

      {/* 1. Privacy Notice (Mandated Section 24) */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-900">
          <Shield className="w-5 h-5 text-emerald-700" />
          <h2 className="text-sm font-bold">Privacy Notice & Architecture</h2>
        </div>
        <p className="text-xs text-emerald-800/90 leading-relaxed font-medium">
          Your financial data is stored locally on this device. Money Tracker does not require an
          account or cloud database. Anonymous usage metrics may be collected to understand overall
          app usage, but financial information is never sent to analytics.
        </p>
      </div>

      {/* 2. Preferences (Currency & Theme) */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
          Display & Regional Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Currency selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Primary Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => updateCurrency(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-400">
              Default is IDR (Indonesian Rupiah). Amounts are stored as clean integers without
              floating-point rounding errors.
            </p>
          </div>

          {/* Theme selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
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
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400">
              Calm, minimal visual interface optimized for daily personal tracking.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Data Portability: Backup, Restore & CSV Export */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
          Backup, Restore & Export
        </h2>

        {importSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Backup successfully validated and restored to your local database!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export JSON Backup */}
          <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Download className="w-4 h-4 text-neutral-700" />
                <span>Export Full Backup (JSON)</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Download all your accounts, categories, settings, and transactions into a standard
                JSON archive file.
              </p>
            </div>
            <button
              id="export-backup-btn"
              type="button"
              onClick={() => exportBackupJson()}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Transactions (CSV)</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Generate a spreadsheet-compatible CSV file directly in your browser. Never uploaded
                to any server.
              </p>
            </div>
            <button
              id="export-csv-btn"
              type="button"
              onClick={() => exportTransactionsCsv()}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download CSV File</span>
            </button>
          </div>
        </div>

        {/* Restore Backup Area */}
        <div className="p-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/30 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-neutral-700" />
                <span>Restore from JSON Backup</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Upload a valid Money Tracker JSON file. Structure, references, and amounts will be
                validated before restoring.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelected}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer"
            />
          </div>

          {/* Validation Results Display */}
          {validation && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-3 ${
                validation.isValid
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
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
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-200/40 text-[11px] font-medium">
                  <div>Accounts: {validation.stats.accountsCount}</div>
                  <div>Categories: {validation.stats.categoriesCount}</div>
                  <div>Transactions: {validation.stats.transactionsCount}</div>
                </div>
              )}

              {validation.errors.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-rose-700">Errors:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-800">
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-amber-700">Warnings:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                    {validation.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.isValid && (
                <div className="pt-2 flex items-center justify-between gap-4">
                  <p className="text-[11px] text-neutral-600">
                    Warning: Restoring will replace your current local database with the contents of
                    this backup.
                  </p>
                  <button
                    id="confirm-restore-btn"
                    type="button"
                    disabled={importing}
                    onClick={executeRestore}
                    className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    {importing ? 'Restoring...' : 'Confirm & Restore'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Anonymous Analytics & Transparency */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Anonymous Usage Telemetry</h2>
            <p className="text-xs text-neutral-500">
              Complete transparency into anonymous usage metrics
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={analyticsActive}
              onChange={(e) => handleToggleAnalytics(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
          </label>
        </div>

        <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
          <p>
            Money Tracker may collect anonymous usage statistics to understand overall feature
            adoption (e.g. how many times transactions are added or backups are made).
          </p>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5 font-mono text-[11px]">
            <div className="text-neutral-500 font-sans font-medium text-xs">
              Anonymous Installation Identifier:
            </div>
            <div className="text-neutral-900 select-all font-semibold break-all">
              {installId || 'anonymous-session'}
            </div>
            <p className="font-sans text-[10px] text-neutral-400 pt-1">
              This identifier is a random UUID generated in your browser. It identifies an
              installation, NOT a human, and changes if browser storage is cleared.
            </p>
          </div>

          {/* Verification Audit Log Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setAuditLogs(getLocalAnalyticsLog());
                setShowAuditLogs(!showAuditLogs);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 underline"
            >
              {showAuditLogs ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAuditLogs ? 'Hide Audit Log' : 'Inspect Dispatched Event Payloads (Verify Zero Financial Data)'}</span>
            </button>
          </div>

          {showAuditLogs && (
            <div className="mt-3 p-3 bg-neutral-900 text-neutral-100 rounded-xl text-[11px] font-mono max-h-48 overflow-y-auto space-y-2">
              <p className="text-neutral-400 font-sans text-xs">
                Recent anonymous events dispatched locally ({auditLogs.length}):
              </p>
              {auditLogs.length === 0 ? (
                <p className="text-neutral-500">No events logged yet in this session.</p>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={index} className="p-2 rounded bg-neutral-800/80 border border-neutral-700">
                    <span className="text-emerald-400 font-bold">{log.event_name}</span> at{' '}
                    <span className="text-neutral-400">{log.timestamp}</span>
                    <div className="text-[10px] text-neutral-400">
                      installation: {log.anonymous_installation_id.slice(0, 18)}... | version: {log.app_version}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Destructive Area: Reset Database */}
      <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-rose-950">Danger Zone: Reset Database</h2>
            <p className="text-xs text-rose-800/80 mt-0.5">
              Permanently wipe all transactions, custom accounts, and categories back to clean
              defaults.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 hover:text-white hover:bg-rose-600 bg-white border border-rose-300 rounded-xl transition-colors shadow-2xs"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Reset Local Database?</h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              This action cannot be undone unless you already downloaded a JSON backup. All recorded
              transactions will be permanently deleted and default accounts will start back at zero.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
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
