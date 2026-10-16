import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Shield,
  HeartHandshake,
  GitPullRequest,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await api.get(`/admin/users?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: `User status successfully updated to ${newStatus}.`
        });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update user status.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">User Account Management</h2>
            <p className="text-xs text-slate-500">
              Manage permissions, roles, and account access across administrators, donors, and hospital requesters.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
            {users.length} Registered Accounts
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <input
              type="text"
              placeholder="Search user by name, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="donor">Donor</option>
              <option value="requester">Requester</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-10 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </form>
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs font-semibold text-slate-500">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-slate-900 text-white'
                            : u.role === 'donor'
                              ? 'bg-blood-100 text-blood-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role === 'admin' && <Shield className="w-3 h-3 text-blood-400" />}
                        {u.role === 'donor' && <HeartHandshake className="w-3 h-3 text-rose-500" />}
                        {u.role === 'requester' && <GitPullRequest className="w-3 h-3 text-blue-500" />}
                        <span className="uppercase">{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.phone}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{u.city}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {currentUser?._id === u._id ? (
                        <span className="text-[11px] text-slate-400 italic">Current User</span>
                      ) : (
                        <button
                          onClick={() => handleStatusToggle(u._id, u.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
