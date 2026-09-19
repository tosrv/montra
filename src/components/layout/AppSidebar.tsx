import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Settings,
  Plus,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

interface AppSidebarProps {
  onOpenAddTransaction: () => void;
}

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/transactions', label: 'Transactions', icon: Receipt },
  { to: '/app/accounts', label: 'Accounts', icon: Wallet },
  { to: '/app/categories', label: 'Categories', icon: Tags },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar({ onOpenAddTransaction }: AppSidebarProps) {
  return (
    <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div className="p-4 space-y-6">
        {/* Header Branding */}
        <div className="flex items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              MT
            </div>
            <div>
              <span className="font-bold text-neutral-900 text-base leading-tight block">
                Money Tracker
              </span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Local-first (IndexedDB)
              </span>
            </div>
          </Link>
        </div>

        {/* Primary CTA button */}
        <button
          id="sidebar-add-transaction-btn"
          type="button"
          onClick={onOpenAddTransaction}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-neutral-500" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom info link */}
      <div className="p-4 border-t border-neutral-100">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home Page</span>
        </Link>
      </div>
    </aside>
  );
}
