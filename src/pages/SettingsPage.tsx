import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  AlertTriangle,
  Building,
  Percent,
  IndianRupee,
  Phone,
  MapPin,
  CheckCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData, tables, menuItems, orders, bills, payments, users } =
    useRestaurant();

  const [restaurantName, setRestaurantName] = useState(settings.restaurant_name);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol);
  const [gstRate, setGstRate] = useState(settings.gst_rate.toString());
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(gstRate);
    updateSettings({
      restaurant_name: restaurantName.trim() || 'Spice & Savor Bistro',
      currency_symbol: currencySymbol.trim() || '₹',
      gst_rate: isNaN(rateNum) ? 5 : rateNum,
      tagline: tagline.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBackupExport = () => {
    const backupData = {
      exported_at: new Date().toISOString(),
      settings,
      tables,
      menuItems,
      orders,
      bills,
      payments,
      users,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rms_database_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              System Settings & Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Configure restaurant branding, currency units, GST rate, and database state
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>System configuration successfully updated!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          Restaurant Identity & Taxation
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              <span>Restaurant Name *</span>
            </label>
            <input
              type="text"
              required
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tagline / Slogan
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
              <span>Currency Symbol *</span>
            </label>
            <select
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="₹">₹ (Indian Rupee - INR)</option>
              <option value="$">$ (US Dollar - USD)</option>
              <option value="€">€ (Euro - EUR)</option>
              <option value="£">£ (British Pound - GBP)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-purple-500" />
              <span>GST Tax Rate (%) *</span>
            </label>
            <input
              type="number"
              min="0"
              max="28"
              step="0.5"
              required
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default standard restaurant GST is 5% (2.5% CGST + 2.5% SGST)
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Telephone</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Address on Printed Receipt</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>

      {/* Database Maintenance & Demo Control Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          Demo Database State & Backup
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Backup / Export */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-xs text-slate-900 block mb-1">
                Export Full Database (JSON)
              </span>
              <p className="text-xs text-slate-500">
                Download current tables, menu items, orders, and payments as a structured JSON file
                for project demonstration submission or verification.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackupExport}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-xs text-rose-900 block mb-1">
                Reset Demo Database
              </span>
              <p className="text-xs text-rose-700/80">
                Resets all tables, orders, bills, and menu back to the clean initial college
                demonstration dataset.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Initial Demo State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="font-bold text-base text-slate-900">Reset Demo Database?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to reset all tables, orders, and receipts back to default? Any
                orders created in this session will be replaced with clean sample data.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
