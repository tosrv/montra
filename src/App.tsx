import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { initializeAnalytics } from './services/analyticsService.ts';
import { ThemeBootstrap } from './components/ThemeBootstrap.tsx';
import { LanguageProvider } from './i18n/LanguageProvider.tsx';
import { PwaInstallProvider } from './components/pwa/PwaInstallProvider.tsx';
import { PWAInstallButton } from './components/pwa/PWAInstallButton.tsx';

// Route-level code splitting keeps the initial bundle small.
const LandingPage = lazy(() =>
  import('./pages/Landing/LandingPage.tsx').then((m) => ({ default: m.LandingPage }))
);
const DocsIndexPage = lazy(() =>
  import('./pages/Docs/DocsIndexPage.tsx').then((m) => ({ default: m.DocsIndexPage }))
);
const DocsArticlePage = lazy(() =>
  import('./pages/Docs/DocsArticlePage.tsx').then((m) => ({ default: m.DocsArticlePage }))
);
const DashboardPage = lazy(() =>
  import('./pages/Dashboard/DashboardPage.tsx').then((m) => ({ default: m.DashboardPage }))
);
const TransactionsPage = lazy(() =>
  import('./pages/Transactions/TransactionsPage.tsx').then((m) => ({ default: m.TransactionsPage }))
);
const AccountsPage = lazy(() =>
  import('./pages/Accounts/AccountsPage.tsx').then((m) => ({ default: m.AccountsPage }))
);
const CategoriesPage = lazy(() =>
  import('./pages/Categories/CategoriesPage.tsx').then((m) => ({ default: m.CategoriesPage }))
);
const BudgetPage = lazy(() =>
  import('./pages/Budget/BudgetPage.tsx').then((m) => ({ default: m.BudgetPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/Settings/SettingsPage.tsx').then((m) => ({ default: m.SettingsPage }))
);

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
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/docs" element={<DocsIndexPage />} />
              <Route path="/docs/:slug" element={<DocsArticlePage />} />

              <Route path="/app" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="budget" element={<BudgetPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <AppDesktopPwaInstall />
        </PwaInstallProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
