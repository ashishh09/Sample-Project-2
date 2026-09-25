import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStatus } from '../types';
import {
  Plus,
  Search,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronRight,
  Receipt,
  X,
  PlusCircle,
  MinusCircle,
  Trash2,
  ChefHat,
  Filter,
} from 'lucide-react';

interface OrdersPageProps {
  setCurrentTab: (tab: string) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  preselectedTableId?: string;
  setPreselectedTableId: (id: string | undefined) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  setCurrentTab,
  isCreateModalOpen,
  setIsCreateModalOpen,
  preselectedTableId,
  setPreselectedTableId,
}) => {
  const {
    orders,
    tables,
    menuItems,
    createOrder,
    updateOrderStatus,
    settings,
    currentUser,
    generateBill,
  } = useRestaurant();

  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // View order detail modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // New Order Creation Form State
  const [selectedTableId, setSelectedTableId] = useState<string>(() => {
    return preselectedTableId || (tables.length > 0 ? tables[0].id : '');
  });
  const [cart, setCart] = useState<{ [menuId: string]: { quantity: number; notes?: string } }>({});
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('ALL');
  const [orderNotes, setOrderNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Update selectedTableId if preselectedTableId changes
  React.useEffect(() => {
    if (preselectedTableId) {
      setSelectedTableId(preselectedTableId);
    }
  }, [preselectedTableId]);

  // Cart operations
  const addToCart = (menuId: string) => {
    setCart((prev) => {
      const existing = prev[menuId];
      if (existing) {
        return {
          ...prev,
          [menuId]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return {
        ...prev,
        [menuId]: { quantity: 1 },
      };
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart((prev) => {
      const existing = prev[menuId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[menuId];
        return next;
      }
      return {
        ...prev,
        [menuId]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  };

  const deleteFromCart = (menuId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[menuId];
      return next;
    });
  };

  const updateCartNotes = (menuId: string, notes: string) => {
    setCart((prev) => {
      if (!prev[menuId]) return prev;
      return {
        ...prev,
        [menuId]: { ...prev[menuId], notes },
      };
    });
  };

  // Cart Subtotal calculation
  const cartEntries = Object.entries(cart);
  const cartSubtotal = cartEntries.reduce((total, [menuId, data]) => {
    const item = menuItems.find((m) => m.id === menuId);
    return total + (item ? item.price * data.quantity : 0);
  }, 0);

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedTableId) {
      setFormError('Please select a dining table');
      return;
    }

    if (cartEntries.length === 0) {
      setFormError('Please select at least one dish for the order');
      return;
    }

    const itemsPayload = cartEntries.map(([menuId, data]) => ({
      menuId,
      quantity: data.quantity,
      notes: data.notes,
    }));

    const res = createOrder(selectedTableId, itemsPayload, orderNotes);
    if (!res.success) {
      setFormError(res.message || 'Failed to place order');
      return;
    }

    // Reset and close
    setCart({});
    setOrderNotes('');
    setIsCreateModalOpen(false);
    setPreselectedTableId(undefined);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

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

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Table, Dish..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600 overflow-x-auto">
            {(['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-all shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => {
              setCart({});
              setOrderNotes('');
              setFormError('');
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Server / Waiter</th>
                <th className="py-3 px-4">Items Breakdown</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const date = new Date(ord.created_at);
                  const timeFormatted = date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{ord.table_number}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{ord.waiter_name}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="truncate text-slate-700" title={ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}>
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {ord.items.reduce((s, i) => s + i.quantity, 0)} total items
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {settings.currency_symbol}
                        {ord.subtotal}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {timeFormatted}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(ord.status === 'PENDING' || ord.status === 'PREPARING') && (
                            <button
                              onClick={() => setCurrentTab('kitchen')}
                              className="px-2 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-[11px] font-semibold flex items-center gap-1"
                              title="Go to Kitchen"
                            >
                              <ChefHat className="w-3 h-3" />
                              <span>Kitchen</span>
                            </button>
                          )}

                          {ord.status === 'READY' && (
                            <button
                              onClick={() => {
                                generateBill(ord.id);
                                setCurrentTab('billing');
                              }}
                              className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-semibold flex items-center gap-1"
                              title="Generate Bill"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Bill</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORDER MODAL (POS Ordering System) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <span>Create Customer Order (Point of Sale)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecting a table will automatically mark it OCCUPIED and queue items in the kitchen
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-4 sm:mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {formError}
              </div>
            )}

            {/* Modal Content: Split Screen (Menu Picker on Left, Order Cart on Right) */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left Column: Table Select & Menu Catalog (7 Cols) */}
              <div className="lg:col-span-7 p-4 sm:p-5 space-y-4">
                {/* 1. Table Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    1. Select Table *
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-800"
                  >
                    <option value="" disabled>
                      -- Choose Dining Table --
                    </option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.table_number} ({t.capacity} Seats) — [{t.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Menu Item Search & Filter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Add Dishes to Order
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Click dish to add to order ticket
                    </span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      placeholder="Search dish name..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    {/* Category tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                      {['ALL', 'Starters', 'Main Course', 'Pizza', 'Burger', 'Beverages', 'Desserts'].map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setMenuCategoryFilter(cat)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold shrink-0 cursor-pointer ${
                              menuCategoryFilter === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu items list */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {menuItems
                    .filter((m) => {
                      const matchCat =
                        menuCategoryFilter === 'ALL' || m.category === menuCategoryFilter;
                      const matchName = m.name.toLowerCase().includes(menuSearch.toLowerCase());
                      return matchCat && matchName;
                    })
                    .map((item) => {
                      const inCartQty = cart[item.id]?.quantity || 0;
                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                            inCartQty > 0
                              ? 'border-blue-300 bg-blue-50/40'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              <span className="font-semibold text-xs text-slate-900 truncate">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {settings.currency_symbol}
                              {item.price} • {item.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {inCartQty > 0 ? (
                              <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg p-0.5 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1 text-slate-600 hover:text-rose-600 rounded"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-xs px-1 text-blue-700">
                                  {inCartQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addToCart(item.id)}
                                  className="p-1 text-slate-600 hover:text-blue-600 rounded"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(item.id)}
                                disabled={!item.available}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                  item.available
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {item.available ? '+ Add' : 'Sold Out'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: Order Summary & Cart Ticket (5 Cols) */}
              <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-slate-50/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Order Ticket Summary
                    </span>
                    <span className="text-xs text-blue-600 font-semibold">
                      {cartEntries.length} items
                    </span>
                  </div>

                  {/* Selected items list */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {cartEntries.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-400">
                        <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No items added to ticket yet. Click "+ Add" on the left menu.
                      </div>
                    ) : (
                      cartEntries.map(([menuId, data]) => {
                        const item = menuItems.find((m) => m.id === menuId);
                        if (!item) return null;
                        const lineTotal = item.price * data.quantity;

                        return (
                          <div
                            key={menuId}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-900">{item.name}</span>
                              <span className="font-mono font-bold text-slate-800">
                                {settings.currency_symbol}
                                {lineTotal}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(menuId)}
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  <MinusCircle className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-bold text-slate-800">{data.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => addToCart(menuId)}
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[10px] text-slate-400">
                                  @ {settings.currency_symbol}
                                  {item.price}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => deleteFromCart(menuId)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Chef kitchen instructions input */}
                            <input
                              type="text"
                              value={data.notes || ''}
                              onChange={(e) => updateCartNotes(menuId, e.target.value)}
                              placeholder="Cooking note (e.g. less spicy)..."
                              className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Special order note */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      General Order Note
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. VIP guest, serve drinks first..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Subtotal & Submit Buttons */}
                <div className="pt-4 border-t border-slate-200 space-y-3 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-600">Subtotal</span>
                    <span className="font-mono font-extrabold text-base text-slate-900">
                      {settings.currency_symbol}
                      {cartSubtotal}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    * GST ({settings.gst_rate}%) will be computed at the time of final billing.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateOrderSubmit}
                      disabled={cartEntries.length === 0}
                      className="flex-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Send to Kitchen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>{viewingOrder.order_number}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge(
                      viewingOrder.status
                    )}`}
                  >
                    {viewingOrder.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingOrder.table_number} • Server: {viewingOrder.waiter_name}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items table */}
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {viewingOrder.items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100"
                >
                  <div>
                    <span className="font-semibold text-slate-800">
                      {i.quantity}x {i.name}
                    </span>
                    {i.notes && (
                      <p className="text-[10px] text-slate-500 italic">"{i.notes}"</p>
                    )}
                  </div>
                  <span className="font-mono font-medium text-slate-900">
                    {settings.currency_symbol}
                    {i.price * i.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 mb-4">
              <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono">
                  {settings.currency_symbol}
                  {viewingOrder.subtotal}
                </span>
              </div>
              {viewingOrder.notes && (
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="font-semibold">Note:</span> {viewingOrder.notes}
                </p>
              )}
            </div>

            {/* Quick status transition dropdown in view modal */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600">Update Status:</span>
                <select
                  value={viewingOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(viewingOrder.id, e.target.value as OrderStatus);
                    setViewingOrder({
                      ...viewingOrder,
                      status: e.target.value as OrderStatus,
                    });
                  }}
                  className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-800 cursor-pointer"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setViewingOrder(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
