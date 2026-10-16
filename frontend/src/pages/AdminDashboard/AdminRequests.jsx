import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Building2,
  Phone,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';
import ConfirmModal from '../../components/ConfirmModal';

const AdminRequests = ({ onSelectMatchingRequest }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modals state
  const [rejectModal, setRejectModal] = useState({ isOpen: false, requestId: null, code: '' });
  const [fulfillModal, setFulfillModal] = useState({
    isOpen: false,
    requestId: null,
    code: '',
    bloodGroup: '',
    units: 0
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (bloodGroupFilter) params.append('bloodGroup', bloodGroupFilter);
      if (search) params.append('search', search);

      const response = await api.get(`/admin/requests?${params.toString()}`);
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, bloodGroupFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleApprove = async (id, code) => {
    try {
      const response = await api.patch(`/admin/requests/${id}/approve`);
      if (response.data.success) {
        setFeedback({ type: 'success', message: `Request ${code} approved successfully.` });
        fetchRequests();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to approve request.'
      });
    }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      const response = await api.patch(`/admin/requests/${rejectModal.requestId}/reject`, {
        rejectionReason: reason
      });
      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: `Request ${rejectModal.code} rejected with recorded justification.`
        });
        setRejectModal({ isOpen: false, requestId: null, code: '' });
        fetchRequests();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reject request.'
      });
    }
  };

  const handleFulfillConfirm = async () => {
    try {
      const response = await api.patch(`/admin/requests/${fulfillModal.requestId}/fulfill`);
      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: `Request ${fulfillModal.code} fulfilled. Units successfully deducted from bank inventory.`
        });
        setFulfillModal({ isOpen: false, requestId: null, code: '', bloodGroup: '', units: 0 });
        fetchRequests();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fulfill request. Check stock levels.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">Manage Blood Requests</h2>
            <p className="text-xs text-slate-500">
              Approve, reject, or fulfill hospital blood demands with automated stock deduction.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
            {requests.length} Records Found
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Search by Request ID, patient name, hospital, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 outline-none font-semibold text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 outline-none font-bold text-slate-700"
            >
              <option value="">All Groups</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-10 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
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
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs font-semibold text-slate-500">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">No requests found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Patient & Contact</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Hospital & Address</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Needed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blood-600">
                      {r.requestId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.patientName}</div>
                      <div className="text-[11px] text-slate-500">
                        Attendant: {r.contactName} ({r.contactPhone})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-blood-100 text-blood-800 font-black rounded-lg">
                        {r.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{r.unitsRequired}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{r.hospitalName}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.hospitalAddress}, {r.city}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <UrgencyBadge urgency={r.urgency} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(r.requiredDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                        {/* Smart Match shortcut */}
                        <button
                          onClick={() => onSelectMatchingRequest && onSelectMatchingRequest(r)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-sm"
                          title="Run Smart Matching Algorithm"
                        >
                          <Sparkles className="w-3 h-3 text-blood-400" />
                          <span>Match</span>
                        </button>

                        {/* Approve Button */}
                        {r.status === 'Pending' && (
                          <button
                            onClick={() => handleApprove(r._id, r.requestId)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px]"
                          >
                            Approve
                          </button>
                        )}

                        {/* Fulfill Button */}
                        {['Pending', 'Approved'].includes(r.status) && (
                          <button
                            onClick={() =>
                              setFulfillModal({
                                isOpen: true,
                                requestId: r._id,
                                code: r.requestId,
                                bloodGroup: r.bloodGroup,
                                units: r.unitsRequired
                              })
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-sm"
                          >
                            Fulfill
                          </button>
                        )}

                        {/* Reject Button */}
                        {['Pending', 'Approved'].includes(r.status) && (
                          <button
                            onClick={() =>
                              setRejectModal({
                                isOpen: true,
                                requestId: r._id,
                                code: r.requestId
                              })
                            }
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px]"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal with mandatory justification */}
      <ConfirmModal
        isOpen={rejectModal.isOpen}
        title={`Reject Blood Request ${rejectModal.code}`}
        message="Please provide a formal justification for rejecting this blood request. This reason will be permanently recorded in the audit trail."
        confirmText="Confirm Rejection"
        isDanger={true}
        requiresReason={true}
        reasonPlaceholder="e.g. Incomplete prescription, unreachable contact, unverified patient details..."
        onConfirm={handleRejectConfirm}
        onClose={() => setRejectModal({ isOpen: false, requestId: null, code: '' })}
      />

      {/* Fulfill Modal */}
      <ConfirmModal
        isOpen={fulfillModal.isOpen}
        title={`Fulfill Blood Request ${fulfillModal.code}`}
        message={`Are you sure you want to mark this request as fulfilled? This will atomically deduct ${fulfillModal.units} unit(s) of ${fulfillModal.bloodGroup} from the blood bank inventory.`}
        confirmText="Fulfill & Deduct Stock"
        isDanger={false}
        requiresReason={false}
        onConfirm={handleFulfillConfirm}
        onClose={() =>
          setFulfillModal({ isOpen: false, requestId: null, code: '', bloodGroup: '', units: 0 })
        }
      />
    </div>
  );
};

export default AdminRequests;
