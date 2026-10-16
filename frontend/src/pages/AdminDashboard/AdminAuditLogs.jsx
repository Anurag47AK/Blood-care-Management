import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldCheck, History, Search, AlertCircle, Clock } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs');
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      (log.userEmail || '').toLowerCase().includes(term) ||
      (log.targetEntity || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">System Audit Trail</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic-style audit records of logins, inventory updates, request approvals, and fulfillment.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search action or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs font-semibold text-slate-500">Loading audit records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            No audit records matching search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Target ID</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blood-700">{log.action}</td>
                    <td className="py-3 px-4 font-sans text-slate-800">
                      {log.performedBy?.name || log.userEmail || 'System'}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        {log.userRole || 'system'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 font-semibold">
                      {log.targetEntity}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.targetId || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3 px-4 text-right font-sans text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
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

export default AdminAuditLogs;
