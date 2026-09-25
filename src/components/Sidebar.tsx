import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Grid,
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  Receipt,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { currentUser, logout, switchRole, settings } = useRestaurant();

  if (!currentUser) return null;

  // Role-based navigation permission matrix
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'waiter', 'cashier', 'kitchen', 'manager'] as UserRole[],
    },
    {
      id: 'tables',
      label: 'Tables',
      icon: Grid,
      roles: ['admin', 'waiter'] as UserRole[],
    },
    {
      id: 'menu',
      label: 'Food Menu',
      icon: UtensilsCrossed,
      roles: ['admin', 'waiter'] as UserRole[],
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      roles: ['admin', 'waiter', 'cashier', 'manager'] as UserRole[],
    },
    {
      id: 'kitchen',
      label: 'Kitchen (KDS)',
      icon: ChefHat,
      roles: ['admin', 'kitchen'] as UserRole[],
    },
    {
      id: 'billing',
      label: 'Billing & POS',
      icon: Receipt,
      roles: ['admin', 'cashier'] as UserRole[],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['admin', 'manager'] as UserRole[],
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      roles: ['admin'] as UserRole[],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['admin'] as UserRole[],
    },
    {
      id: 'about',
      label: 'About Project (SE)',
      icon: HelpCircle,
      roles: ['admin', 'waiter', 'cashier', 'kitchen', 'manager'] as UserRole[],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  const roleBadgeColors: Record<UserRole, string> = {
    admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    waiter: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    cashier: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    kitchen: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    manager: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  const allRoles: { role: UserRole; label: string }[] = [
    { role: 'admin', label: 'Admin' },
    { role: 'waiter', label: 'Waiter' },
    { role: 'cashier', label: 'Cashier' },
    { role: 'kitchen', label: 'Kitchen' },
    { role: 'manager', label: 'Manager' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-white truncate leading-tight tracking-tight">
              {settings.restaurant_name}
            </h1>
            <span className="text-[11px] font-medium text-blue-400 tracking-wider uppercase block">
              RMS • SE Assignment
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </button>
            );
          })}

          {/* Quick Role Switcher section for College Demo */}
          <div className="pt-5 mt-4 border-t border-slate-800/80">
            <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span>Demo Quick Switch</span>
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {allRoles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role)}
                  className={`text-xs py-1.5 px-2 rounded-md font-medium text-left border transition-all ${
                    currentUser.role === r.role
                      ? 'bg-blue-950/60 border-blue-500 text-blue-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {r.label}
                  {currentUser.role === r.role && <span className="ml-1 text-[10px]">●</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current User & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider mt-0.5 ${
                    roleBadgeColors[currentUser.role]
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
