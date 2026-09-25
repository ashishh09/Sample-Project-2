import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRestaurant();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
        let borderClass = 'border-blue-200 bg-white';
        let title = 'Information';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          borderClass = 'border-emerald-200 bg-white';
          title = 'Success';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderClass = 'border-rose-200 bg-white';
          title = 'Error';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          borderClass = 'border-amber-200 bg-white';
          title = 'Notice';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-lg border ${borderClass} transition-all duration-300 animate-slide-in`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                {title}
              </p>
              <p className="text-sm font-medium text-slate-800 break-words leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
