import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Droplet,
  GitPullRequest,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';

const AdminOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/admin');
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-500">Calculating database metrics...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const stockChartData = stats?.stockChartData || [];
  const lowStockAlerts = stats?.lowStockAlerts || [];
  const recentRequests = stats?.recentRequests || [];

  const getBarColor = (units) => {
    if (units <= 2) return '#ef4444'; // critical red
    if (units <= 5) return '#f59e0b'; // low amber
    return '#dc2626'; // healthy blood crimson
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Warning Banner if any */}
      {lowStockAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Low Inventory Alert:</strong> The following blood groups are below safe reserve levels:{' '}
              {lowStockAlerts.map((i) => `${i.bloodGroup} (${i.unitsAvailable} units)`).join(', ')}.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl whitespace-nowrap shadow-sm"
          >
            Manage Blood Stock &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Donors
            </span>
            <span className="p-2 bg-blood-50 text-blood-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.totalDonors}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
            {metrics.activeDonors} marked as currently available
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Blood in Stock
            </span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Droplet className="w-4 h-4 fill-current" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.totalUnits} <span className="text-sm font-bold text-slate-500">Units</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
            Across all 8 ABO/Rh blood groups
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Requests
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.pendingRequests}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
            {metrics.approvedRequests} approved awaiting fulfillment
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fulfilled Transfusions
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.fulfilledRequests}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
            Successfully provided to hospitals
          </p>
        </div>
      </div>

      {/* Blood Inventory Levels Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Live Blood Bank Stock Inventory (Units by Blood Group)
            </h3>
            <p className="text-xs text-slate-500">
              Calculated real-time from database records. Red indicates critical threshold (&le; 2 units).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Critical (&le; 2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Low (&le; 5)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blood-600"></span>
              Sufficient
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="bloodGroup" tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
              <YAxis allowDecimals={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                formatter={(val) => [`${val} Units`, 'Available Stock']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="units" radius={[8, 8, 0, 0]}>
                {stockChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.units)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">Recent Blood Requests Queue</h3>
          <button
            onClick={() => setActiveTab('requests')}
            className="text-xs font-bold text-blood-600 hover:text-blood-700"
          >
            Manage All Requests &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Group</th>
                <th className="py-3 px-4">Hospital</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRequests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-mono font-bold text-blood-600">{req.requestId}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{req.patientName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-blood-100 text-blood-800 font-bold rounded">
                      {req.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{req.hospitalName}</td>
                  <td className="py-3.5 px-4">
                    <UrgencyBadge urgency={req.urgency} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
