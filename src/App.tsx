import React, { useState, useEffect } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TablesPage } from './pages/TablesPage';
import { MenuPage } from './pages/MenuPage';
import { OrdersPage } from './pages/OrdersPage';
import { KitchenPage } from './pages/KitchenPage';
import { BillingPage } from './pages/BillingPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutProjectPage } from './pages/AboutProjectPage';
import { UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser } = useRestaurant();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // New Order modal state shared between components
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [preselectedTableId, setPreselectedTableId] = useState<string | undefined>(undefined);

  // Role permissions check
  useEffect(() => {
    if (!currentUser) return;

    const rolePermissions: Record<UserRole, string[]> = {
      admin: [
        'dashboard',
        'tables',
        'menu',
        'orders',
        'kitchen',
        'billing',
        'reports',
        'users',
        'settings',
        'about',
      ],
      waiter: ['dashboard', 'tables', 'menu', 'orders', 'about'],
      cashier: ['dashboard', 'billing', 'orders', 'about'],
      kitchen: ['kitchen', 'dashboard', 'about'],
      manager: ['dashboard', 'reports', 'orders', 'about'],
    };

    const allowed = rolePermissions[currentUser.role] || ['dashboard', 'about'];
    if (!allowed.includes(currentTab)) {
      setCurrentTab(allowed[0]);
    }
  }, [currentUser, currentTab]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const handleOpenOrderForTable = (tableId: string) => {
    setPreselectedTableId(tableId);
    setIsNewOrderModalOpen(true);
    setCurrentTab('orders');
  };

  const handleOpenNewOrder = () => {
    setPreselectedTableId(undefined);
    setIsNewOrderModalOpen(true);
    setCurrentTab('orders');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenNewOrder={handleOpenNewOrder}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              setCurrentTab={setCurrentTab}
              onOpenNewOrder={handleOpenNewOrder}
            />
          )}

          {currentTab === 'tables' && (
            <TablesPage onOpenOrderForTable={handleOpenOrderForTable} />
          )}

          {currentTab === 'menu' && <MenuPage />}

          {currentTab === 'orders' && (
            <OrdersPage
              setCurrentTab={setCurrentTab}
              isCreateModalOpen={isNewOrderModalOpen}
              setIsCreateModalOpen={setIsNewOrderModalOpen}
              preselectedTableId={preselectedTableId}
              setPreselectedTableId={setPreselectedTableId}
            />
          )}

          {currentTab === 'kitchen' && (
            <KitchenPage setCurrentTab={setCurrentTab} />
          )}

          {currentTab === 'billing' && (
            <BillingPage setCurrentTab={setCurrentTab} />
          )}

          {currentTab === 'reports' && <ReportsPage />}

          {currentTab === 'users' && <UsersPage />}

          {currentTab === 'settings' && <SettingsPage />}

          {currentTab === 'about' && <AboutProjectPage />}
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainAppContent />
    </RestaurantProvider>
  );
}
