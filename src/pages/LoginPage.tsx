import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  UtensilsCrossed,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  ChefHat,
  Receipt,
  UserCheck,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, settings } = useRestaurant();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts: {
    role: UserRole;
    user: string;
    pass: string;
    label: string;
    icon: any;
    color: string;
  }[] = [
    {
      role: 'admin',
      user: 'admin',
      pass: 'admin123',
      label: 'Admin (Full Control)',
      icon: Shield,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    },
    {
      role: 'waiter',
      user: 'waiter',
      pass: 'waiter123',
      label: 'Waiter (Tables & Orders)',
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    },
    {
      role: 'cashier',
      user: 'cashier',
      pass: 'cashier123',
      label: 'Cashier (Billing & POS)',
      icon: Receipt,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    },
    {
      role: 'kitchen',
      user: 'kitchen',
      pass: 'kitchen123',
      label: 'Kitchen (Chef KDS)',
      icon: ChefHat,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    },
    {
      role: 'manager',
      user: 'manager',
      pass: 'manager123',
      label: 'Manager (Reports & Ops)',
      icon: Briefcase,
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid username or password');
      }
      setLoading(false);
    }, 200);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
    login(u, p);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Restaurant Management System
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          College Software Engineering Assignment Project
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-950/80 border border-blue-700 text-blue-300">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>SDLC Model: Agile • Complete Functional Prototype</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white text-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, waiter, cashier..."
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to System'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Demo Login Credentials
              </span>
              <span className="text-[11px] text-blue-600 font-medium">Click to 1-Click Login</span>
            </div>

            <div className="space-y-1.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc.user, acc.pass)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${acc.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="font-semibold">{acc.label}</span>
                    </div>
                    <span className="font-mono text-[11px] opacity-80">
                      {acc.user} / {acc.pass}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Academic Note */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Developed as a college student software engineering project. Local simulated database
          persisted in browser storage.
        </p>
      </div>
    </div>
  );
};
