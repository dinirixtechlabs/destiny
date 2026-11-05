import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Car,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Star,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ShieldCheck,
  ShieldAlert,
  X,
  Copy,
  Check,
  FileText,
  AlertCircle
} from 'lucide-react';

export const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [onlineFilter, setOnlineFilter] = useState('ALL');

  // Modal & Action states
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const fetchDrivers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const params = {};
      if (approvalFilter === 'APPROVED') params.is_approved = 'true';
      if (approvalFilter === 'PENDING') params.is_approved = 'false';

      if (onlineFilter === 'ONLINE') params.is_online = 'true';
      if (onlineFilter === 'OFFLINE') params.is_online = 'false';

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.get('/admin/drivers/', { params });
      if (res.data.success) {
        setDrivers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to fetch drivers directory. Please verify that the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [approvalFilter, onlineFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrivers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDrivers]);

  const handleApproveDriver = async (driverId, driverName) => {
    setActionLoadingId(driverId);
    setError(null);
    try {
      const res = await api.post(`/admin/drivers/${driverId}/approve/`);
      if (res.data.success) {
        setActionSuccess(`Driver ${driverName} has been approved successfully!`);
        setTimeout(() => setActionSuccess(null), 4000);
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, is_approved: true } : d))
        );
        if (selectedDriver?.id === driverId) {
          setSelectedDriver((prev) => ({ ...prev, is_approved: true }));
        }
      }
    } catch (err) {
      console.error('Error approving driver:', err);
      setError(`Failed to approve driver: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSuspendDriver = async (driverId, driverName) => {
    if (!window.confirm(`Are you sure you want to suspend driver "${driverName}"? They will not be able to accept rides.`)) {
      return;
    }

    setActionLoadingId(driverId);
    setError(null);
    try {
      const res = await api.post(`/admin/drivers/${driverId}/suspend/`);
      if (res.data.success) {
        setActionSuccess(`Driver ${driverName} has been suspended.`);
        setTimeout(() => setActionSuccess(null), 4000);
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, is_approved: false, is_online: false } : d))
        );
        if (selectedDriver?.id === driverId) {
          setSelectedDriver((prev) => ({ ...prev, is_approved: false, is_online: false }));
        }
      }
    } catch (err) {
      console.error('Error suspending driver:', err);
      setError(`Failed to suspend driver: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'D';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const totalCount = drivers.length;
  const approvedCount = drivers.filter((d) => d.is_approved).length;
  const pendingCount = drivers.filter((d) => !d.is_approved).length;
  const onlineCount = drivers.filter((d) => d.is_online).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
            <Car className="w-7 h-7 mr-2.5 text-[#38bdf8]" />
            Driver Fleet Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review driver applications, approve licenses, inspect vehicles, and monitor online status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            Total <strong className="text-white">{totalCount}</strong> Drivers
          </span>
          <button
            onClick={() => fetchDrivers(true)}
            disabled={refreshing}
            className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Action / Success Banner */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between text-emerald-300 animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-semibold">{actionSuccess}</p>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Quick Stats Grid in Dark Midnight Navy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b1a3d]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered</p>
          <p className="text-xl font-black text-white mt-1">{totalCount}</p>
        </div>
        <div className="bg-[#0b1a3d]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved Fleet</p>
          <p className="text-xl font-black text-emerald-400 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-[#0b1a3d]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending / Suspended</p>
          <p className="text-xl font-black text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-[#0b1a3d]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Online Now</p>
          <p className="text-xl font-black text-[#38bdf8] mt-1">{onlineCount}</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-[#0b1a3d]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search driver name, email, or license..."
            className="w-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 bg-[#071330] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0096f0] focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Approval Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <div className="inline-flex rounded-xl bg-[#071330] p-1 border border-white/10">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'PENDING', label: 'Pending / Suspended' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setApprovalFilter(item.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    approvalFilter === item.id
                      ? 'bg-[#0096f0] text-white shadow-md shadow-[#0096f0]/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Online Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Activity:</span>
            <select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value)}
              className="text-xs bg-[#071330] border border-white/10 text-white py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0096f0] font-medium cursor-pointer"
            >
              <option value="ALL">All Activity</option>
              <option value="ONLINE">Online Only</option>
              <option value="OFFLINE">Offline Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Data Table */}
      <div className="bg-[#0b1a3d]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-3 border-[#0096f0] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium">Loading driver fleet...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="py-16 text-center">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No drivers found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchTerm || approvalFilter !== 'ALL' || onlineFilter !== 'ALL'
                  ? 'No drivers match your current filter settings. Try clearing your filters.'
                  : 'No driver accounts registered on the platform yet.'}
              </p>
              {(searchTerm || approvalFilter !== 'ALL' || onlineFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setApprovalFilter('ALL');
                    setOnlineFilter('ALL');
                  }}
                  className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-[#38bdf8] bg-[#0096f0]/15 hover:bg-[#0096f0]/25 rounded-xl transition-colors cursor-pointer border border-[#0096f0]/30"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Driver</th>
                  <th className="px-6 py-3.5">License & Rating</th>
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Live Presence</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {drivers.map((driver) => {
                  const activeVehicle = driver.vehicles?.[0];
                  const isLoadingAction = actionLoadingId === driver.id;

                  return (
                    <tr key={driver.id} className="hover:bg-white/5 transition-colors">
                      {/* Driver Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitials(driver.user?.full_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">
                              {driver.user?.full_name || 'Driver'}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{driver.user?.email}</p>
                            <p className="text-[11px] text-slate-500">{driver.user?.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>

                      {/* License & Rating */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center text-xs font-mono font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                            <FileText className="w-3 h-3 mr-1 text-slate-400" />
                            {driver.license_number}
                          </div>
                          <div className="flex items-center text-xs font-bold text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                            <span>{parseFloat(driver.rating || 5.0).toFixed(2)}</span>
                            <span className="text-[10px] text-slate-500 font-normal ml-1">/ 5.0</span>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        {activeVehicle ? (
                          <div>
                            <p className="text-xs font-semibold text-white">
                              {activeVehicle.vehicle_model}
                            </p>
                            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-mono bg-white/5 px-1 rounded text-slate-300 border border-white/10">
                                {activeVehicle.vehicle_number}
                              </span>
                              <span>•</span>
                              <span>{activeVehicle.vehicle_type}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No vehicle attached</span>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="px-6 py-4">
                        {driver.is_approved ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
                            Pending / Suspended
                          </span>
                        )}
                      </td>

                      {/* Online Presence */}
                      <td className="px-6 py-4">
                        {driver.is_online ? (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-slate-500 mr-1.5"></span>
                            Offline
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!driver.is_approved ? (
                            <button
                              onClick={() => handleApproveDriver(driver.id, driver.user?.full_name)}
                              disabled={isLoadingAction}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-[#0096f0] hover:bg-[#0082d4] rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer shadow-[#0096f0]/25"
                              title="Approve driver account"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspendDriver(driver.id, driver.user?.full_name)}
                              disabled={isLoadingAction}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                              title="Suspend driver account"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                              Suspend
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedDriver(driver)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer border border-white/10"
                            title="View complete details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Driver Details Modal in Dark Luxury Theme */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b1a3d] rounded-3xl max-w-xl w-full shadow-2xl border border-white/10 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#071330]">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0096f0]/20 text-[#38bdf8] flex items-center justify-center font-bold text-base border border-[#0096f0]/30">
                  {getInitials(selectedDriver.user?.full_name)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {selectedDriver.user?.full_name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {selectedDriver.is_approved ? (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Partner
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-400 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Under Review
                      </span>
                    )}
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">
                      {selectedDriver.is_online ? 'Active on map' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Driver ID with copy */}
              <div className="bg-[#071330] p-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Driver ID</p>
                  <p className="text-xs font-mono font-medium text-slate-300 mt-0.5 break-all">
                    {selectedDriver.id}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyId(selectedDriver.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-300 bg-white/10 border border-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center shrink-0 ml-3 cursor-pointer"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3 h-3 text-[#38bdf8] mr-1" />
                      <span className="text-[#38bdf8]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Driver Credentials Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 rounded-xl border border-white/10 bg-[#071330]/60">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">License Number</p>
                  <p className="text-xs font-mono font-bold text-white mt-1">
                    {selectedDriver.license_number}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-[#071330]/60">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Driver Rating</p>
                  <div className="flex items-center text-xs font-bold text-amber-400 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span>{parseFloat(selectedDriver.rating || 5.0).toFixed(2)} / 5.0</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-[#071330]/60">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Email Address</p>
                  <p className="text-xs font-bold text-white mt-1 break-all">
                    {selectedDriver.user?.email}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-[#071330]/60">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Phone Number</p>
                  <p className="text-xs font-bold text-white mt-1">
                    {selectedDriver.user?.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Registered Vehicles Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center">
                  <Car className="w-4 h-4 mr-1.5 text-[#38bdf8]" />
                  Assigned Vehicles ({selectedDriver.vehicles?.length || 0})
                </h4>

                {(!selectedDriver.vehicles || selectedDriver.vehicles.length === 0) ? (
                  <p className="text-xs text-slate-400 italic bg-[#071330] p-4 rounded-xl border border-dashed border-white/10 text-center">
                    No vehicles registered for this driver yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDriver.vehicles.map((veh) => (
                      <div
                        key={veh.id}
                        className="p-3.5 rounded-xl border border-white/10 bg-[#071330] flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <p className="text-xs font-extrabold text-white">{veh.vehicle_model}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-slate-300 border border-white/10">
                              {veh.vehicle_number}
                            </span>
                            <span>•</span>
                            <span>{veh.vehicle_type}</span>
                            <span>•</span>
                            <span>Color: {veh.vehicle_color || 'Default'}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          veh.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}>
                          {veh.is_active ? 'Active Vehicle' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#071330] flex items-center justify-between">
              <div>
                {!selectedDriver.is_approved ? (
                  <button
                    onClick={() => handleApproveDriver(selectedDriver.id, selectedDriver.user?.full_name)}
                    disabled={actionLoadingId === selectedDriver.id}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-[#0096f0] hover:bg-[#0082d4] rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer shadow-[#0096f0]/25"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Approve Driver
                  </button>
                ) : (
                  <button
                    onClick={() => handleSuspendDriver(selectedDriver.id, selectedDriver.user?.full_name)}
                    disabled={actionLoadingId === selectedDriver.id}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 mr-1.5" />
                    Suspend Driver
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
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

export default Drivers;
