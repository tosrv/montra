import React from 'react';
import { AlertTriangle, type LucideIcon } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: LucideIcon;
}

/** Destructive-action confirmation modal shared across pages. */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  icon: Icon = AlertTriangle,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4"
      >
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
        </div>

        {children}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
