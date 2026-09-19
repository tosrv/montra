import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { PwaInstallProvider } from './components/pwa/PwaInstallProvider.tsx';
import { PWAInstallButton } from './components/pwa/PWAInstallButton.tsx';

function AppDesktopPwaInstall() {
  const location = useLocation();
  if (!location.pathname.startsWith('/app')) return null;
  return <PWAInstallButton variant="floating" />;
}

export default function App() {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <LanguageProvider>
        <PwaInstallProvider>
          <ThemeBootstrap />
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AppDesktopPwaInstall />
        </PwaInstallProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
