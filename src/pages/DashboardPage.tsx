import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  Grid,
  CheckCircle2,
  Users2,
  ShoppingBag,
  ChefHat,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Clock,
  PlusCircle,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { OrderStatus } from '../types';

interface DashboardPageProps {
  setCurrentTab: (tab: string) => void;
  onOpenNewOrder: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setCurrentTab,
  onOpenNewOrder,
}) => {
  const { tables, orders, bills, payments, settings, currentUser } = useRestaurant();

  // Dynamic calculations from context
  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length;
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;
  const reservedTables = tables.filter((t) => t.status === 'RESERVED').length;

  const todayOrders = orders.length;
  const pendingKitchenOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'PREPARING'
  ).length;

  // Total sales calculated from completed payments
  const totalSales = payments.reduce((acc, p) => acc + p.amount, 0);

  // Status badge styling
  const statusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Recent 5 orders
  const recentOrders = [...orders].slice(0, 5);

  // Sales by Category calculation for visual chart
  const categorySales: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.status !== 'CANCELLED') {
      o.items.forEach((item) => {
        categorySales[item.name] = (categorySales[item.name] || 0) + item.price * item.quantity;
      });
    }
  });

  // Top 5 dishes
  const topDishes = Object.entries(categorySales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxDishSale = Math.max(...topDishes.map((d) => d[1]), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live RMS Production Simulator
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Restaurant operational pulse: {availableTables} tables ready for guests,{' '}
              {pendingKitchenOrders} orders cooking in kitchen, and {settings.currency_symbol}
              {totalSales.toLocaleString()} in realized revenue today.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {(currentUser?.role === 'admin' || currentUser?.role === 'waiter') && (
              <button
                onClick={onOpenNewOrder}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-500/30 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Order</span>
              </button>
            )}
            <button
              onClick={() => setCurrentTab('tables')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-all cursor-pointer"
            >
              <Grid className="w-4 h-4 text-blue-400" />
              <span>View Tables</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Tables */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Tables
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalTables}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-emerald-600">{availableTables} Available</span>
            <span>•</span>
            <span className="font-semibold text-amber-600">{occupiedTables} Occupied</span>
          </div>
        </div>

        {/* Card 2: Available Tables */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{availableTables}</p>
          <p className="text-xs text-slate-500 mt-1">Ready for seating</p>
        </div>

        {/* Card 3: Today's Orders */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{todayOrders}</p>
          <p className="text-xs text-slate-500 mt-1">
            {orders.filter((o) => o.status === 'COMPLETED').length} fulfilled
          </p>
        </div>

        {/* Card 4: Pending Kitchen Orders */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kitchen Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            {pendingKitchenOrders}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pending / Cooking</p>
        </div>

        {/* Card 5: Today's Sales */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {settings.currency_symbol}
            {totalSales.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{payments.length} paid invoices</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Tables Quick View + Top Dishes Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Availability Visual Grid */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Table Floor Map</h3>
              <p className="text-xs text-slate-500">Live seating visualizer</p>
            </div>
            <button
              onClick={() => setCurrentTab('tables')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {tables.map((table) => {
              let bg = 'bg-emerald-50 border-emerald-200 text-emerald-800';
              let dot = 'bg-emerald-500';
              if (table.status === 'OCCUPIED') {
                bg = 'bg-amber-50 border-amber-200 text-amber-800';
                dot = 'bg-amber-500';
              } else if (table.status === 'RESERVED') {
                bg = 'bg-blue-50 border-blue-200 text-blue-800';
                dot = 'bg-blue-500';
              }

              return (
                <div
                  key={table.id}
                  onClick={() => setCurrentTab('tables')}
                  className={`p-2.5 rounded-lg border flex flex-col justify-between cursor-pointer transition-all hover:scale-102 hover:shadow-xs ${bg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{table.table_number}</span>
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] opacity-80">
                    <span>{table.capacity} seats</span>
                    <span className="font-semibold text-[10px] uppercase">
                      {table.status.slice(0, 3)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Available ({availableTables})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Occupied ({occupiedTables})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Reserved ({reservedTables})
            </span>
          </div>
        </div>

        {/* Top Selling Items Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Top Ordered Food Items</h3>
                <p className="text-xs text-slate-500">Revenue contribution per dish</p>
              </div>
              <button
                onClick={() => setCurrentTab('reports')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Full Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {topDishes.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No sales recorded yet. Create and bill an order!
                </div>
              ) : (
                topDishes.map(([dishName, amount], idx) => {
                  const percent = Math.round((amount / maxDishSale) * 100);
                  return (
                    <div key={dishName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {dishName}
                        </span>
                        <span className="font-mono font-medium text-slate-700">
                          {settings.currency_symbol}
                          {amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Aggregated from live order line items</span>
            <span className="font-medium text-blue-600">Updated in real-time</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Dining Orders</h3>
            <p className="text-xs text-slate-500">Latest activity across tables and kitchen</p>
          </div>
          <button
            onClick={() => setCurrentTab('orders')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Orders ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No orders created yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => {
                  const itemsText = ord.items
                    .map((i) => `${i.quantity}x ${i.name}`)
                    .join(', ');

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ord.order_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{ord.table_number}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={itemsText}>
                        {itemsText}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {settings.currency_symbol}
                        {ord.subtotal}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (ord.status === 'PENDING' || ord.status === 'PREPARING') {
                              setCurrentTab('kitchen');
                            } else {
                              setCurrentTab('billing');
                            }
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {ord.status === 'PENDING' || ord.status === 'PREPARING'
                            ? 'Cook in Kitchen'
                            : 'View Invoice'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
