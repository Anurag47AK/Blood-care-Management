import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Droplet,
  Plus,
  Building2,
  Calendar,
  AlertCircle,
  XCircle,
  Users,
  CheckCircle,
  Phone,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import ConfirmModal from '../components/ConfirmModal';

const RequesterDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Matched donors modal
  const [matchedDonorsModal, setMatchedDonorsModal] = useState({
    isOpen: false,
    requestId: '',
    patientName: '',
    bloodGroup: '',
    donors: []
  });
  const [loadingMatches, setLoadingMatches] = useState(false);

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/requests/my');
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (err) {
      console.error('Failed to load user blood requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleCancelClick = (id) => {
    setSelectedRequestId(id);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (reason) => {
    try {
      const response = await api.patch(`/requests/${selectedRequestId}/cancel`, {
        cancellationReason: reason || 'Cancelled by requester'
      });
      if (response.data.success) {
        setFeedbackMsg('Blood request cancelled successfully.');
        setCancelModalOpen(false);
        fetchMyRequests();
      }
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const handleViewMatchedDonors = async (reqItem) => {
    setLoadingMatches(true);
    setMatchedDonorsModal({
      isOpen: true,
      requestId: reqItem.requestId,
      patientName: reqItem.patientName,
      bloodGroup: reqItem.bloodGroup,
      donors: []
    });

    try {
      const response = await api.get(`/matching/request/${reqItem._id}`);
      if (response.data.success) {
        setMatchedDonorsModal((prev) => ({
          ...prev,
          donors: response.data.donors || []
        }));
      }
    } catch (err) {
      console.error('Failed to load matched donors for request:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Requester Blood Tracking Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              Hospital Attendant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track status of blood requests, monitor matched donors, and manage cancellations.
          </p>
        </div>

        <Link
          to="/request-blood"
          className="px-5 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blood-600/30 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Blood Request</span>
        </Link>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">My Submitted Blood Requests</h3>
          <span className="text-xs font-semibold text-slate-500">
            Total Requests: <strong>{requests.length}</strong>
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Blood Requests Submitted Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you or your hospital patient requires whole blood or packed red cells, click the button below to submit a verified request.
            </p>
            <div className="pt-2">
              <Link
                to="/request-blood"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blood-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Create First Blood Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Hospital & City</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Required Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-blood-600">
                      {r.requestId}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{r.patientName}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-blood-100 text-blood-800 font-black rounded-lg text-xs">
                        {r.bloodGroup}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold">{r.unitsRequired} Unit(s)</td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{r.hospitalName}</div>
                      <div className="text-[11px] text-slate-400">{r.city}</div>
                    </td>
                    <td className="py-4 px-4">
                      <UrgencyBadge urgency={r.urgency} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {new Date(r.requiredDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewMatchedDonors(r)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        title="View clinical ranked matching donors"
                      >
                        <Sparkles className="w-3 h-3 text-blood-400" />
                        <span>Matched Donors</span>
                      </button>

                      {['Pending', 'Approved'].includes(r.status) && (
                        <button
                          onClick={() => handleCancelClick(r._id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors"
                        >
                          Cancel
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

      {/* Matched Donors Modal */}
      {matchedDonorsModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-blood-600 tracking-wider">
                  Smart Donor Matching Engine
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Compatible Donors for {matchedDonorsModal.patientName} ({matchedDonorsModal.bloodGroup})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Request ID: <span className="font-mono">{matchedDonorsModal.requestId}</span>
                </p>
              </div>
              <button
                onClick={() =>
                  setMatchedDonorsModal({ ...matchedDonorsModal, isOpen: false })
                }
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {loadingMatches ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-3 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-xs text-slate-500 font-semibold">
                    Evaluating clinical compatibility and ranking donors...
                  </p>
                </div>
              ) : matchedDonorsModal.donors.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  No compatible donors currently registered or available for this blood group in this region.
                </div>
              ) : (
                matchedDonorsModal.donors.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {item.donor?.user?.name || 'Anonymous Donor'}
                          </span>
                          <span className="px-2 py-0.5 bg-blood-100 text-blood-800 font-black rounded text-xs">
                            {item.donor?.bloodGroup}
                          </span>
                          {item.isExactMatch ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Exact Blood Match
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              Compatible RBC Donor
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Location: {item.donor?.city || item.donor?.user?.city}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-lg">
                          {item.score}% Match
                        </span>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.matchReasons?.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                        >
                          ✓ {r}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Phone: <strong className="text-slate-800">{item.donor?.user?.phone || 'Protected'}</strong>
                      </span>
                      {item.donor?.user?.phone && (
                        <a
                          href={`tel:${item.donor?.user?.phone}`}
                          className="px-3 py-1 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Phone className="w-3 h-3" />
                          Call Donor
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() =>
                  setMatchedDonorsModal({ ...matchedDonorsModal, isOpen: false })
                }
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close Matches
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Blood Request"
        message="Are you sure you want to cancel this pending blood request? This will close the request and remove it from the active hospital queue."
        confirmText="Cancel Request"
        isDanger={true}
        requiresReason={true}
        reasonPlaceholder="Please state why this request is being cancelled (e.g. arranged elsewhere)..."
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelModalOpen(false)}
      />
    </div>
  );
};

export default RequesterDashboard;
