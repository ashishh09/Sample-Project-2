import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { User, UserRole } from '../types';
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  Receipt,
  ChefHat,
  Briefcase,
  Edit2,
  Trash2,
  Lock,
  X,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus, currentUser } =
    useRestaurant();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('waiter');
  const [modalError, setModalError] = useState('');

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('waiter');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password || '');
    setRole(user.role);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!name.trim() || !username.trim()) {
      setModalError('Name and Username are required');
      return;
    }

    if (!editingUser && !password.trim()) {
      setModalError('Password is required for new accounts');
      return;
    }

    if (editingUser) {
      const res = updateUser(editingUser.id, {
        name,
        username,
        role,
        password: password ? password : editingUser.password,
      });
      if (!res.success) {
        setModalError(res.message || 'Failed to update user');
        return;
      }
    } else {
      const res = addUser({
        name,
        username,
        password,
        role,
        status: 'active',
      });
      if (!res.success) {
        setModalError(res.message || 'Failed to create user');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const roleBadge = (roleName: UserRole) => {
    switch (roleName) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'waiter':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cashier':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'kitchen':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'manager':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Add User */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Staff & User Access Management (RBAC)
            </h3>
            <p className="text-xs text-slate-500">
              Manage credentials, permissions, and roles (Admin, Waiter, Cashier, Kitchen, Manager)
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-blue-600 font-semibold">
                              (Current Session)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {u.username}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${roleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        disabled={isCurrent}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        } ${isCurrent ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          disabled={isCurrent}
                          className={`p-1.5 rounded transition-colors ${
                            isCurrent
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                          title={isCurrent ? 'Cannot delete logged in user' : 'Delete User'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingUser ? 'Edit Staff Account' : 'Create New Staff Account'}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. chef_suresh"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password {editingUser ? '(Leave empty to keep unchanged)' : '*'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? '••••••••' : 'Enter password'}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  System Role (Access Scope) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="admin">Admin — Full Administrative Access</option>
                  <option value="waiter">Waiter — Tables, Menu & Order Taking</option>
                  <option value="cashier">Cashier — Billing, POS & Settlement</option>
                  <option value="kitchen">Kitchen — Chef Kitchen Display System (KDS)</option>
                  <option value="manager">Manager — Operational Reports & Orders</option>
                </select>
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
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
