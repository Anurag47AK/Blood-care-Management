import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Droplet,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    donationId: null,
    code: ''
  });

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/donations?${params.toString()}`);
      if (response.data.success) {
        setDonations(response.data.donations);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter]);

  const handleApprove = async (id, code, bloodGroup, units) => {
    try {
      const response = await api.patch(`/admin/donations/${id}/approve`);
      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: `Donation ${code} approved. ${units} unit(s) of ${bloodGroup} added to inventory and donor profile updated!`
        });
        fetchDonations();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to approve donation.'
      });
    }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      const response = await api.patch(`/admin/donations/${rejectModal.donationId}/reject`, {
        rejectionReason: reason
      });
      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: `Donation ${rejectModal.code} rejected with reason: "${reason}". 0 units added to stock.`
        });
        setRejectModal({ isOpen: false, donationId: null, code: '' });
        fetchDonations();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reject donation.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Manage Donor Blood Donations</h2>
          <p className="text-xs text-slate-500">
            Verify completed blood donations. Approving automatically updates bank stock and donor eligibility interval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
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

      {/* Donations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs font-semibold text-slate-500">Loading donation records...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">No donation records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Donation ID</th>
                  <th className="py-3 px-4">Donor Name & Contact</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Hospital / Camp</th>
                  <th className="py-3 px-4">Donation Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Health Vitals / Reason</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blood-600">
                      {d.donationId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{d.donor?.name}</div>
                      <div className="text-[11px] text-slate-400">{d.donor?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-blood-100 text-blood-800 font-black rounded-lg">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">{d.units} Unit</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {d.hospitalOrCamp}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(d.donationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {d.rejectionReason || d.diseaseOrHealthNotes}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {d.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              handleApprove(d._id, d.donationId, d.bloodGroup, d.units)
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setRejectModal({
                                isOpen: true,
                                donationId: d._id,
                                code: d.donationId
                              })
                            }
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Donation Modal */}
      <ConfirmModal
        isOpen={rejectModal.isOpen}
        title={`Reject Donation ${rejectModal.code}`}
        message="Please provide a medical or screening justification for rejecting this blood donation (0 units will be added to stock)."
        confirmText="Confirm Rejection"
        isDanger={true}
        requiresReason={true}
        reasonPlaceholder="e.g. Hemoglobin below 12.5 g/dL, elevated blood pressure, recent fever reported..."
        onConfirm={handleRejectConfirm}
        onClose={() => setRejectModal({ isOpen: false, donationId: null, code: '' })}
      />
    </div>
  );
};

export default AdminDonations;
