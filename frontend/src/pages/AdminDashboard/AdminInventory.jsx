import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Droplet,
  Plus,
  Minus,
  Edit3,
  AlertTriangle,
  History,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'add' | 'issue' | 'adjust'
  const [form, setForm] = useState({
    bloodGroup: 'A+',
    units: 1,
    newUnits: 0,
    reason: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchData = async () => {
    try {
      const [invRes, txnRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/transactions')
      ]);

      if (invRes.data.success) {
        setInventory(invRes.data.inventory);
      }
      if (txnRes.data.success) {
        setTransactions(txnRes.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (type, group = 'A+') => {
    setActiveModal(type);
    setForm({
      bloodGroup: group,
      units: 1,
      newUnits: 0,
      reason:
        type === 'add'
          ? 'Camp donation intake'
          : type === 'issue'
            ? 'Issued for clinical emergency'
            : '',
      notes: ''
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (activeModal === 'add') {
        const res = await api.post('/inventory/add', {
          bloodGroup: form.bloodGroup,
          units: Number(form.units),
          reason: form.reason || 'Manual addition',
          notes: form.notes
        });
        if (res.data.success) {
          setFeedback({ type: 'success', message: res.data.message });
          setActiveModal(null);
          fetchData();
        }
      } else if (activeModal === 'issue') {
        const res = await api.post('/inventory/issue', {
          bloodGroup: form.bloodGroup,
          units: Number(form.units),
          reason: form.reason || 'Manual stock issue',
          notes: form.notes
        });
        if (res.data.success) {
          setFeedback({ type: 'success', message: res.data.message });
          setActiveModal(null);
          fetchData();
        }
      } else if (activeModal === 'adjust') {
        const res = await api.patch('/inventory/adjust', {
          bloodGroup: form.bloodGroup,
          newUnits: Number(form.newUnits),
          reason: form.reason
        });
        if (res.data.success) {
          setFeedback({ type: 'success', message: res.data.message });
          setActiveModal(null);
          fetchData();
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Operation failed.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-xs font-semibold text-slate-500">Loading inventory records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Blood Bank Inventory Management</h2>
          <p className="text-xs text-slate-500">
            Atomic stock balance tracking across all 8 blood groups with concurrency safety.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openModal('add')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Units</span>
          </button>
          <button
            onClick={() => openModal('issue')}
            className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Issue Units</span>
          </button>
          <button
            onClick={() => openModal('adjust')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Adjust Units</span>
          </button>
        </div>
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

      {/* Stock Cards Grid (8 Blood Groups) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {inventory.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all ${
              item.status === 'Critical'
                ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                : item.status === 'Low Stock'
                  ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-900">{item.bloodGroup}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.status === 'Critical'
                    ? 'bg-rose-200 text-rose-800'
                    : item.status === 'Low Stock'
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{item.unitsAvailable}</span>
              <span className="text-xs text-slate-500 font-semibold ml-1">Units</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Threshold: {item.lowStockThreshold} units</span>
              <button
                onClick={() => openModal('adjust', item.bloodGroup)}
                className="text-blood-600 hover:text-blood-800 font-bold"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-base">
              Blood Stock Transaction Audit Trail
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {transactions.length} Total Logged Movements
          </span>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-10 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">TXN ID</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Stock Before &rarr; After</th>
                  <th className="py-3 px-4">Audit Reason</th>
                  <th className="py-3 px-4">Authorized By</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {t.transactionId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-blood-100 text-blood-800 font-bold rounded">
                        {t.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.type === 'ADDITION'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.type === 'DEDUCTION'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">{t.units}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {t.previousStock} &rarr; <span className="font-bold text-slate-900">{t.newStock}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{t.reason}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {t.performedBy?.name || 'Administrator'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unified Inventory Action Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 relative border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {activeModal === 'add' && 'Add Blood Units to Bank'}
              {activeModal === 'issue' && 'Issue Blood Units (Deduction)'}
              {activeModal === 'adjust' && 'Adjust Blood Inventory Balance'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All inventory modifications are atomic and recorded in the permanent audit trail.
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group *
                </label>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {activeModal === 'adjust' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Target Units Available *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.newUnits}
                    onChange={(e) => setForm({ ...form, newUnits: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Units Count *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.units}
                    onChange={(e) => setForm({ ...form, units: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Reason / Justification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Donation camp batch #102, hospital release..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {submitting ? 'Updating...' : 'Save & Record Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
