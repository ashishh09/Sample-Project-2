import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, MenuCategory } from '../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Tag,
  CircleDot,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const CATEGORIES: MenuCategory[] = [
  'Starters',
  'Main Course',
  'Pizza',
  'Burger',
  'Beverages',
  'Desserts',
];

export const MenuPage: React.FC = () => {
  const {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    settings,
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Main Course');
  const [price, setPrice] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [available, setAvailable] = useState(true);
  const [description, setDescription] = useState('');
  const [modalError, setModalError] = useState('');

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Starters');
    setPrice('');
    setIsVeg(true);
    setAvailable(true);
    setDescription('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setIsVeg(item.is_veg !== false);
    setAvailable(item.available);
    setDescription(item.description || '');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setModalError('Price must be greater than zero');
      return;
    }

    if (!name.trim()) {
      setModalError('Item name cannot be empty');
      return;
    }

    if (editingItem) {
      const res = updateMenuItem(editingItem.id, {
        name,
        category,
        price: priceNum,
        is_veg: isVeg,
        available,
        description: description || undefined,
      });
      if (!res.success) {
        setModalError(res.message || 'Failed to update item');
        return;
      }
    } else {
      const res = addMenuItem({
        name,
        category,
        price: priceNum,
        is_veg: isVeg,
        available,
        description: description || undefined,
      });
      if (!res.success) {
        setModalError(res.message || 'Failed to add item');
        return;
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name..."
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

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredItems.length} of {menuItems.length} items
            </span>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            All Dishes ({menuItems.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = menuItems.filter((i) => i.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
            <p className="text-sm">No menu items found for this selection.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border transition-all p-4 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                item.available ? 'border-slate-200' : 'border-slate-200 opacity-75 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Veg / Non-veg dot indicator */}
                    <div
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                        item.is_veg
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-rose-600 text-rose-600'
                      }`}
                      title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-8">
                  {item.description || 'Delicious freshly prepared recipe.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Price
                  </span>
                  <span className="font-mono font-extrabold text-base text-slate-900">
                    {settings.currency_symbol}
                    {item.price}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* In-Stock Availability Toggle */}
                  <button
                    onClick={() => toggleMenuItemAvailability(item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                      item.available
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                    title="Toggle in-stock status"
                  >
                    {item.available ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>In Stock</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-rose-600" />
                        <span>Sold Out</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Dish' : 'Add New Dish to Menu'}
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
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Butter Paneer, Crispy Veg Burger"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MenuCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Price ({settings.currency_symbol}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief culinary ingredients or taste notes..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Vegetarian (Green mark)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Currently In Stock</span>
                </label>
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
                  {editingItem ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
