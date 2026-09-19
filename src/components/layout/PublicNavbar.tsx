import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-neutral-800 dark:group-hover:bg-white transition-colors">
            <span className="tracking-tighter">MT</span>
          </div>
          <div>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-lg tracking-tight">Money Tracker</span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
              Local-First
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <a href="#features" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Features
          </a>
          <a href="#privacy" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Privacy
          </a>
          <a href="#how-it-works" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            How It Works
          </a>
          <a href="#backup" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Backup & Restore
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            id="navbar-start-tracking-cta"
            to="/app"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-xs transition-all"
          >
            <span>Start Tracking</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
