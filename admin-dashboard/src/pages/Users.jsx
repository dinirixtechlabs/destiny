import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Users as UsersIcon,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Copy,
  Check,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('PASSENGER');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for viewing user details
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const params = {};
      if (selectedRole && selectedRole !== 'ALL') {
        params.role = selectedRole;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.get('/admin/users/', { params });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user directory. Please ensure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRole, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Client-side filter by active status if needed
  const filteredUsers = users.filter((user) => {
    if (statusFilter === 'ACTIVE') return user.is_active;
    if (statusFilter === 'INACTIVE') return !user.is_active;
    return true;
  });

  const getRoleBadge = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case 'DRIVER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Driver
          </span>
        );
      case 'PASSENGER':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Passenger
          </span>
        );
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <UsersIcon className="w-7 h-7 mr-2.5 text-emerald-600" />
            User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of registered passengers, fleet drivers, and administrative staff accounts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            Showing <strong className="text-slate-900">{filteredUsers.length}</strong> accounts
          </span>
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Search and Filters Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone number..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Role:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              {['PASSENGER', 'DRIVER', 'ALL'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedRole === role
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role === 'ALL' ? 'All Roles' : role.charAt(0) + role.slice(1).toLowerCase() + 's'}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No users found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {searchTerm || selectedRole !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No users match your search criteria. Try modifying your filters.'
                  : 'No passenger accounts exist on the platform yet.'}
              </p>
              {(searchTerm || selectedRole !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('PASSENGER');
                    setStatusFilter('ALL');
                  }}
                  className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/75 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(user.full_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {user.full_name || 'Nameless User'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {user.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                          <span>{user.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/50">
                          <XCircle className="w-3 h-3 mr-1 text-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        {new Date(user.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                  {getInitials(selectedUser.full_name)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{selectedUser.full_name}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {getRoleBadge(selectedUser.role)}
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {selectedUser.is_active ? 'Active Account' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* User ID with copy button */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account ID</p>
                  <p className="text-xs font-mono font-medium text-slate-700 mt-0.5 break-all">
                    {selectedUser.id}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyId(selectedUser.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center shrink-0 ml-3 cursor-pointer"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 mr-1" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Detail Items Grid */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Email Address</p>
                  <p className="text-xs font-bold text-slate-800 mt-1 break-all">{selectedUser.email}</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Phone Number</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedUser.phone || 'Not provided'}</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Staff Status</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {selectedUser.is_staff ? 'Administrator Staff' : 'Standard User'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Registered Date</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
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

export default Users;
