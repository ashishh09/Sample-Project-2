import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { RestaurantTable, TableStatus } from '../types';
import {
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit2,
  Trash2,
  ShoppingBag,
  Search,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';

interface TablesPageProps {
  onOpenOrderForTable: (tableId: string) => void;
}

export const TablesPage: React.FC<TablesPageProps> = ({ onOpenOrderForTable }) => {
  const { tables, orders, addTable, updateTable, deleteTable, setTableStatus, settings } =
    useRestaurant();

  const [statusFilter, setStatusFilter] = useState<'ALL' | TableStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState('');

  // Filtered tables
  const filteredTables = tables.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch = t.table_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openAddModal = () => {
    setEditingTable(null);
    setTableNumber(`Table ${tables.length + 1}`);
    setCapacity('4');
    setNotes('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (table: RestaurantTable) => {
    setEditingTable(table);
    setTableNumber(table.table_number);
    setCapacity(table.capacity.toString());
    setNotes(table.notes || '');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      setModalError('Capacity must be a positive integer');
      return;
    }

    if (editingTable) {
      const res = updateTable(editingTable.id, {
        table_number: tableNumber,
        capacity: capNum,
        notes: notes || undefined,
      });
      if (!res.success) {
        setModalError(res.message || 'Failed to update table');
        return;
      }
    } else {
      const res = addTable(tableNumber, capNum, notes);
      if (!res.success) {
        setModalError(res.message || 'Failed to add table');
        return;
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filter, Add Table */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table number..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status filter tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
            {(['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
            <p className="text-sm">No tables match your current filter.</p>
          </div>
        ) : (
          filteredTables.map((table) => {
            // Find active order if occupied
            const activeOrder = orders.find(
              (o) =>
                (o.id === table.current_order_id || o.table_id === table.id) &&
                (o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'READY')
            );

            let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            let dotColor = 'bg-emerald-500';
            if (table.status === 'OCCUPIED') {
              statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
              dotColor = 'bg-amber-500';
            } else if (table.status === 'RESERVED') {
              statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
              dotColor = 'bg-blue-500';
            }

            return (
              <div
                key={table.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 pb-3 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {table.table_number}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{table.capacity} Seater</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    {table.status}
                  </span>
                </div>

                {/* Body: Active Order or Status detail */}
                <div className="p-4 flex-1 flex flex-col justify-center">
                  {table.status === 'OCCUPIED' && activeOrder ? (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{activeOrder.order_number}</span>
                        <span className="font-mono text-amber-800">
                          {settings.currency_symbol}
                          {activeOrder.subtotal}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 truncate">
                        {activeOrder.items.length} items ({activeOrder.status})
                      </p>
                    </div>
                  ) : table.status === 'RESERVED' ? (
                    <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-2.5 text-xs text-blue-900">
                      <p className="font-semibold">Reserved Table</p>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        {table.notes || 'Guest reservation confirmed'}
                      </p>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-xs text-slate-400">
                      <p>Ready for guests</p>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Available</p>
                    </div>
                  )}

                  {table.notes && table.status !== 'RESERVED' && (
                    <p className="text-[11px] text-slate-500 italic mt-2">"{table.notes}"</p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {/* Status quick changer */}
                    <select
                      value={table.status}
                      onChange={(e) => setTableStatus(table.id, e.target.value as TableStatus)}
                      className="text-[11px] font-semibold bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-700 cursor-pointer focus:outline-none"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="RESERVED">Reserved</option>
                    </select>

                    <button
                      onClick={() => openEditModal(table)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors"
                      title="Edit Table"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title="Delete Table"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Create Order button */}
                  <button
                    onClick={() => onOpenOrderForTable(table.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Order</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingTable ? 'Edit Restaurant Table' : 'Add New Restaurant Table'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Table Number / Name *
                </label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. Table 1, T-12, Booth 4"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Seating Capacity (Guests) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 2, 4, 6"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Special Notes / Location (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Window side, AC section, Patio"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
