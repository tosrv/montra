import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HardDrive, Lock } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-12 text-sm text-neutral-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                MT
              </div>
              <span className="font-bold text-neutral-900 text-base">Money Tracker</span>
            </div>
            <p className="text-neutral-500 text-xs max-w-sm leading-relaxed">
              A local-first personal finance tracker. Your financial records are saved directly in
              your browser's IndexedDB and never sent to any remote server or cloud database.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 pt-2">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-neutral-700" /> Stored locally
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-700" /> No account required
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" /> Zero cloud telemetry
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 text-xs uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/app" className="hover:text-neutral-900 transition-colors">
                  Open Application
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-neutral-900 transition-colors">
                  Product Features
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-neutral-900 transition-colors">
                  Privacy Architecture
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 text-xs uppercase tracking-wider">
              Legal & Privacy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-neutral-500">100% Client-Side</span>
              </li>
              <li>
                <span className="text-neutral-500">IndexedDB Storage</span>
              </li>
              <li>
                <span className="text-neutral-500">Zero Cloud Storage</span>
              </li>
              <li>
                <span className="text-neutral-500">JSON & CSV Portability</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} Money Tracker. Your money. Your device. Your privacy.</p>
          <p>Designed for personal ownership and offline productivity.</p>
        </div>
      </div>
    </footer>
  );
}
