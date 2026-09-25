import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStatus } from '../types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  Bell,
  Utensils,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';

interface KitchenPageProps {
  setCurrentTab: (tab: string) => void;
}

export const KitchenPage: React.FC<KitchenPageProps> = ({ setCurrentTab }) => {
  const { orders, updateOrderStatus, generateBill } = useRestaurant();
  const [filter, setFilter] = useState<'ACTIVE' | 'PENDING' | 'PREPARING' | 'READY'>('ACTIVE');

  // Kitchen shows orders that are PENDING, PREPARING, or READY
  const kitchenOrders = orders.filter((o) => {
    if (filter === 'ACTIVE') {
      return o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'READY';
    }
    return o.status === filter;
  });

  // Calculate elapsed minutes
  const getElapsedMinutes = (dateStr: string) => {
    const elapsedMs = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
  };

  const getStatusCardStyles = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          card: 'border-amber-300 bg-amber-50/30',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          header: 'bg-amber-100/70 text-amber-900',
        };
      case 'PREPARING':
        return {
          card: 'border-blue-300 bg-blue-50/30',
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          header: 'bg-blue-100/70 text-blue-900',
        };
      case 'READY':
        return {
          card: 'border-purple-300 bg-purple-50/30',
          badge: 'bg-purple-100 text-purple-800 border-purple-300',
          header: 'bg-purple-100/70 text-purple-900',
        };
      default:
        return {
          card: 'border-slate-200 bg-white',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          header: 'bg-slate-100 text-slate-900',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top KDS Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span>Kitchen Display System (KDS)</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-mono font-bold">
                {kitchenOrders.length} In Queue
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Kitchen order workflow: Pending ➔ Preparing ➔ Ready ➔ Completed
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
          {(
            [
              { id: 'ACTIVE', label: 'All Active' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'PREPARING', label: 'Preparing' },
              { id: 'READY', label: 'Ready' },
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filter === btn.id
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Kitchen Queue Clear!</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All customer dishes have been prepared and served. When a waiter creates an order, it
            will immediately appear on this display.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitchenOrders.map((order) => {
            const styles = getStatusCardStyles(order.status);
            const elapsed = getElapsedMinutes(order.created_at);

            return (
              <div
                key={order.id}
                className={`rounded-2xl border-2 shadow-sm transition-all flex flex-col justify-between overflow-hidden ${styles.card}`}
              >
                {/* Ticket Header */}
                <div
                  className={`p-4 border-b flex items-center justify-between font-medium ${styles.header}`}
                >
                  <div>
                    <span className="font-extrabold text-base font-mono block">
                      {order.order_number}
                    </span>
                    <span className="font-bold text-sm">{order.table_number}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border tracking-wider ${styles.badge}`}
                    >
                      {order.status}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono mt-1 opacity-80 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>{elapsed} min ago</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Items Body */}
                <div className="p-4 flex-1 space-y-2.5 bg-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Dishes To Cook ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
                  </div>

                  <div className="divide-y divide-slate-100 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="pt-1.5 pb-1 flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <span className="font-mono font-black text-sm text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {item.quantity}x
                          </span>
                          <div>
                            <span className="font-bold text-sm text-slate-900 leading-snug">
                              {item.name}
                            </span>
                            {item.notes && (
                              <p className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold mt-1">
                                🍳 Special Instruction: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                      <span className="font-bold">Order Note:</span> {order.notes}
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-slate-400">
                    Server: <span className="font-medium text-slate-600">{order.waiter_name}</span>
                  </div>
                </div>

                {/* Ticket Action Workflow Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-amber-300" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-purple-200" />
                      <span>Mark Ready (Call Waiter)</span>
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <div className="w-full flex items-center gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </button>

                      <button
                        onClick={() => {
                          generateBill(order.id);
                          setCurrentTab('billing');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                        title="Send to Cashier Billing"
                      >
                        <span>Bill ➔</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
