import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Route,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation,
  MapPin,
  Car,
  User,
  Eye,
  X,
  Copy,
  Check,
  AlertCircle,
  IndianRupee,
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';

const ACTIVE_STATUSES = ['SEARCHING_DRIVER', 'REQUESTED', 'ACCEPTED', 'DRIVER_ARRIVING', 'ARRIVED', 'IN_PROGRESS'];

export const Rides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  const [exactStatusFilter, setExactStatusFilter] = useState('ALL');

  // Modal State
  const [selectedRide, setSelectedRide] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const fetchRides = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const params = {};
      if (exactStatusFilter !== 'ALL') {
        params.status = exactStatusFilter;
      } else if (selectedStatusTab === 'COMPLETED') {
        params.status = 'COMPLETED';
      } else if (selectedStatusTab === 'CANCELLED') {
        params.status = 'CANCELLED';
      }

      const res = await api.get('/admin/rides/', { params });
      if (res.data.success) {
        setRides(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError('Failed to fetch rides data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatusTab, exactStatusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRides();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchRides]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Cancelled
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Navigation className="w-3.5 h-3.5 mr-1 animate-pulse" />
            In Progress
          </span>
        );
      case 'ACCEPTED':
      case 'DRIVER_ARRIVING':
      case 'ARRIVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Navigation className="w-3.5 h-3.5 mr-1 animate-spin" />
            {status.replace('_', ' ')}
          </span>
        );
      case 'SEARCHING_DRIVER':
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <Clock className="w-3.5 h-3.5 mr-1 animate-spin" />
            Searching
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  // Client-side filtering for active tab and search
  const filteredRides = rides.filter((ride) => {
    // 1. Tab filter for ACTIVE (multiple statuses)
    if (selectedStatusTab === 'ACTIVE' && exactStatusFilter === 'ALL') {
      if (!ACTIVE_STATUSES.includes(ride.status)) return false;
    }

    // 2. Search term filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchPassenger = ride.passenger_name?.toLowerCase().includes(q) || ride.passenger_email?.toLowerCase().includes(q);
      const matchDriver = ride.driver_name?.toLowerCase().includes(q);
      const matchPickup = ride.pickup_address?.toLowerCase().includes(q);
      const matchDest = ride.destination_address?.toLowerCase().includes(q);
      const matchId = ride.id?.toLowerCase().includes(q);

      if (!matchPassenger && !matchDriver && !matchPickup && !matchDest && !matchId) {
        return false;
      }
    }

    return true;
  });

  // Calculate live statistics
  const totalRidesCount = rides.length;
  const activeRidesCount = rides.filter((r) => ACTIVE_STATUSES.includes(r.status)).length;
  const completedRidesCount = rides.filter((r) => r.status === 'COMPLETED').length;
  const cancelledRidesCount = rides.filter((r) => r.status === 'CANCELLED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Route className="w-7 h-7 mr-2.5 text-emerald-600" />
            Ride Operations & Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time ride tracking, route audits, driver assignments, and trip fare settlements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
            {activeRidesCount} Active Trips Live
          </span>
          <button
            onClick={() => fetchRides(true)}
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

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Recorded</p>
          <p className="text-xl font-black text-slate-900 mt-1">{totalRidesCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Active Now</p>
          <p className="text-xl font-black text-amber-600 mt-1">{activeRidesCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{completedRidesCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Cancelled</p>
          <p className="text-xl font-black text-rose-600 mt-1">{cancelledRidesCount}</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search passenger, driver, route or ID..."
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
          {/* Status Tab buttons */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            {[
              { id: 'ALL', label: 'All Trips' },
              { id: 'ACTIVE', label: 'Live Active' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedStatusTab(tab.id);
                  setExactStatusFilter('ALL');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedStatusTab === tab.id && exactStatusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Exact Status Filter */}
          <div className="flex items-center space-x-1.5">
            <select
              value={exactStatusFilter}
              onChange={(e) => {
                setExactStatusFilter(e.target.value);
                if (e.target.value !== 'ALL') setSelectedStatusTab('CUSTOM');
              }}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="ALL">Specific Status...</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="SEARCHING_DRIVER">SEARCHING_DRIVER</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="DRIVER_ARRIVING">DRIVER_ARRIVING</option>
              <option value="ARRIVED">ARRIVED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium">Loading rides directory...</p>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="py-16 text-center">
              <Route className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No rides found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {searchTerm || selectedStatusTab !== 'ALL' || exactStatusFilter !== 'ALL'
                  ? 'No rides match your current search and filters.'
                  : 'No rides have been requested across the platform yet.'}
              </p>
              {(searchTerm || selectedStatusTab !== 'ALL' || exactStatusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatusTab('ALL');
                    setExactStatusFilter('ALL');
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
                  <th className="px-6 py-3.5">Trip & Passenger</th>
                  <th className="px-6 py-3.5">Driver</th>
                  <th className="px-6 py-3.5">Route</th>
                  <th className="px-6 py-3.5">Fare</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Requested At</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Passenger & ID */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">
                          {ride.passenger_name || 'Passenger'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{ride.passenger_email}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          ID: {ride.id.substring(0, 8)}...
                        </p>
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="px-6 py-4">
                      {ride.driver_name ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {ride.driver_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{ride.driver_name}</p>
                            <span className="text-[10px] text-slate-400">Assigned Driver</span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center text-xs text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Route */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-start space-x-2 text-xs text-slate-800">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                          <span className="truncate font-medium">{ride.pickup_address}</span>
                        </div>
                        <div className="flex items-start space-x-2 text-xs text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0"></span>
                          <span className="truncate">{ride.destination_address}</span>
                        </div>
                      </div>
                    </td>

                    {/* Fare */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">
                          ₹{ride.final_fare || ride.estimated_fare}
                        </p>
                        {ride.final_fare && ride.final_fare !== ride.estimated_fare && (
                          <span className="text-[10px] text-slate-400 line-through">
                            Est: ₹{ride.estimated_fare}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(ride.status)}
                    </td>

                    {/* Requested timestamp */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div>
                        <p className="font-medium text-slate-700">
                          {new Date(ride.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(ride.requested_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedRide(ride)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ride Inspector Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                  <Route className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Trip Details</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {getStatusBadge(selectedRide.status)}
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{selectedRide.final_fare || selectedRide.estimated_fare}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRide(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Ride ID with copy */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ride UUID</p>
                  <p className="text-xs font-mono font-medium text-slate-700 mt-0.5 break-all">
                    {selectedRide.id}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyId(selectedRide.id)}
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

              {/* Route Map Flow Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                  <Compass className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Trip Route Navigation
                </p>

                {/* Pickup */}
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Pickup Location</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedRide.pickup_address}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Coordinates: {parseFloat(selectedRide.pickup_latitude).toFixed(6)}, {parseFloat(selectedRide.pickup_longitude).toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                <div className="pl-3.5">
                  <div className="w-0.5 h-4 bg-slate-300"></div>
                </div>

                {/* Destination */}
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Destination Location</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedRide.destination_address}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Coordinates: {parseFloat(selectedRide.destination_latitude).toFixed(6)}, {parseFloat(selectedRide.destination_longitude).toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Passenger & Driver Cards */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" /> Passenger
                  </p>
                  <p className="text-xs font-extrabold text-slate-900 mt-1">
                    {selectedRide.passenger_name || 'Passenger'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{selectedRide.passenger_email}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">ID: {selectedRide.passenger_id?.substring(0, 8)}...</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center">
                    <Car className="w-3.5 h-3.5 mr-1 text-slate-400" /> Assigned Driver
                  </p>
                  <p className="text-xs font-extrabold text-slate-900 mt-1">
                    {selectedRide.driver_name || 'None Assigned'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedRide.driver_name ? 'Active Fleet Partner' : 'Looking for nearby driver'}
                  </p>
                  {selectedRide.driver_id && (
                    <p className="text-[10px] font-mono text-slate-400 mt-1">ID: {selectedRide.driver_id.substring(0, 8)}...</p>
                  )}
                </div>
              </div>

              {/* Trip Timings & Financials */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Estimated Fare</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">₹{selectedRide.estimated_fare}</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Final Charged Fare</p>
                  <p className="text-sm font-extrabold text-emerald-600 mt-1">
                    {selectedRide.final_fare ? `₹${selectedRide.final_fare}` : 'Pending Completion'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Requested Time</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {new Date(selectedRide.requested_at).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Completion Time</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {selectedRide.completed_at ? new Date(selectedRide.completed_at).toLocaleString() : 'In Progress / Uncompleted'}
                  </p>
                </div>
              </div>

              {/* Cancellation Reason if applicable */}
              {selectedRide.status === 'CANCELLED' && selectedRide.cancellation_reason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <p className="text-xs font-bold text-rose-800 uppercase">Reason for Cancellation:</p>
                  <p className="text-xs text-rose-700 mt-1">{selectedRide.cancellation_reason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedRide(null)}
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

export default Rides;
