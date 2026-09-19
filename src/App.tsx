import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing/LandingPage.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { DashboardPage } from './pages/Dashboard/DashboardPage.tsx';
import { TransactionsPage } from './pages/Transactions/TransactionsPage.tsx';
import { AccountsPage } from './pages/Accounts/AccountsPage.tsx';
import { CategoriesPage } from './pages/Categories/CategoriesPage.tsx';
import { SettingsPage } from './pages/Settings/SettingsPage.tsx';
import { initializeAnalytics } from './services/analyticsService.ts';
import { ThemeBootstrap } from './components/ThemeBootstrap.tsx';
import { LanguageProvider } from './i18n/LanguageProvider.tsx';

export default function App() {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeBootstrap />
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Application Workspace Routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}
