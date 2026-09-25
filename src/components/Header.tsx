import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  Menu as MenuIcon,
  ChefHat,
  PlusCircle,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewOrder: () => void;
  setIsMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewOrder,
  setIsMobileOpen,
}) => {
  const { currentUser, switchRole, orders, tables } = useRestaurant();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  // Title dictionary
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Operations Dashboard',
      subtitle: 'Real-time table occupancy, kitchen queue, and daily revenue statistics',
    },
    tables: {
      title: 'Table Management',
      subtitle: 'Monitor seating capacities, reserve, occupy, and reset dining tables',
    },
    menu: {
      title: 'Food Menu Management',
      subtitle: 'Manage food catalog, categories, pricing, and live inventory availability',
    },
    orders: {
      title: 'Order Management (POS)',
      subtitle: 'Create customer orders, modify quantities, and track fulfillment status',
    },
    kitchen: {
      title: 'Kitchen Display System (KDS)',
      subtitle: 'Live kitchen ticket queue for chef preparation and expediting',
    },
    billing: {
      title: 'Billing & Invoicing',
      subtitle: 'Calculate subtotal, 5% GST, collect Cash/UPI/Card and generate receipts',
    },
    reports: {
      title: 'Sales & Performance Reports',
      subtitle: 'Analyze revenue metrics, top-selling dishes, and payment breakdowns',
    },
    users: {
      title: 'User Management',
      subtitle: 'Manage staff credentials, role-based access control, and account status',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Configure restaurant profile, taxation parameters, and demo data',
    },
    about: {
      title: 'Software Engineering Project Specs',
      subtitle: 'SDLC Agile phases, architecture design, MySQL schema, and test suite',
    },
  };

  const currentInfo = titles[currentTab] || {
    title: 'Restaurant Management System',
    subtitle: 'College Software Engineering Project',
  };

  // Kitchen pending counter
  const pendingKitchenOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'PREPARING'
  ).length;

  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 self-end md:self-auto">
        {/* Clock & Date Badge */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-mono font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{dateStr}</span>
          <span className="text-slate-300">•</span>
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{time}</span>
        </div>

        {/* Live Kitchen badge indicator */}
        {(currentUser.role === 'admin' || currentUser.role === 'kitchen' || currentUser.role === 'manager') && (
          <button
            onClick={() => setCurrentTab('kitchen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              pendingKitchenOrders > 0
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 animate-pulse'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Open Kitchen Display System"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
              {pendingKitchenOrders}
            </span>
          </button>
        )}

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg p-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase px-1.5">
            Role:
          </span>
          <select
            value={currentUser.role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="text-xs font-semibold text-blue-700 bg-white border border-slate-200 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="waiter">Waiter</option>
            <option value="cashier">Cashier</option>
            <option value="kitchen">Kitchen</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        {/* Quick New Order Button */}
        {(currentUser.role === 'admin' || currentUser.role === 'waiter') && (
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Order</span>
          </button>
        )}
      </div>
    </header>
  );
};
