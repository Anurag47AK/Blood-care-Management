import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import ConfirmModal from '../components/ConfirmModal';
import {
  GitPullRequest,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  AlertCircle,
  Phone,
  Users,
  XCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Matched donors modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const fetchMyRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/requests/my');
      setRequests(res.data.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blood requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleOpenMatches = async (reqItem) => {
    setSelectedRequest(reqItem);
    setModalOpen(true);
    setMatchesLoading(true);
    setMatchedDonors([]);
    try {
      const res = await api.get(`/requests/${reqItem._id}`);
      setMatchedDonors(res.data.matchedDonors || []);
    } catch (err) {
      console.error('Failed to load candidate matches', err);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleCancelPrompt = (reqItem) => {
    setRequestToCancel(reqItem);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!requestToCancel) return;
    setCancelSubmitting(true);
    try {
      await api.patch(`/requests/${requestToCancel._id}/cancel`);
      setCancelModalOpen(false);
      setRequestToCancel(null);
      await fetchMyRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blood-600 text-xs font-bold uppercase tracking-wider mb-1">
            <GitPullRequest className="w-4 h-4" />
            <span>Blood Requisition Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            My Blood Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track status, algorithmic ABO/Rh matched donors, and hospital allocations in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMyRequests}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Requests"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/request-blood"
            className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-md shadow-blood-600/25 transition-all hover:scale-105 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Blood Request</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search patient, hospital, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['all', 'pending', 'approved', 'fulfilled', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-2/3"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/90 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blood-50 text-blood-600 flex items-center justify-center mx-auto">
            <GitPullRequest className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              No Blood Requests Found
            </h3>
            <p className="text-xs text-slate-500">
              {searchTerm || statusFilter !== 'all'
                ? 'No requests match your selected filters. Try clearing your search.'
                : 'You have not submitted any blood requests yet.'}
            </p>
          </div>
          <Link
            to="/request-blood"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blood-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Request</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((reqItem) => (
            <div
              key={reqItem._id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row with badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-blood-50 text-blood-700 font-black text-sm flex items-center justify-center border border-blood-200">
                      {reqItem.bloodGroup}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {reqItem.patientName}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {reqItem.unitsRequired} {reqItem.unitsRequired === 1 ? 'Unit' : 'Units'} Required
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={reqItem.status} />
                    <UrgencyBadge urgency={reqItem.urgency} />
                  </div>
                </div>

                {/* Info List */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">
                      <strong>Hospital:</strong> {reqItem.hospitalName} ({reqItem.city})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      <strong>Doctor/Contact:</strong> {reqItem.contactPhone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      <strong>Required By:</strong>{' '}
                      {new Date(reqItem.requiredDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Additional Note */}
                {reqItem.reason && (
                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-xl border border-slate-100 line-clamp-2">
                    "{reqItem.reason}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenMatches(reqItem)}
                  className="px-3.5 py-2 bg-blood-50 hover:bg-blood-100 text-blood-700 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Compatible Donors</span>
                </button>

                {reqItem.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleCancelPrompt(reqItem)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Cancel Request"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matched Donors Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blood-600 uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Smart ABO/Rh Compatible Donors</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Matches for {selectedRequest?.patientName} ({selectedRequest?.bloodGroup})
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {matchesLoading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-blood-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500">
                    Evaluating physiological compatibility and donor proximities...
                  </p>
                </div>
              ) : matchedDonors.length === 0 ? (
                <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">
                    No Direct Voluntary Donors Available
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Currently no voluntary donors with compatible RBC profiles are available in your immediate vicinity. Our administrators monitor hospital blood bank stock to fulfill your request from inventory.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Found <strong>{matchedDonors.length}</strong> compatible donors sorted by compatibility score and location:
                  </p>
                  {matchedDonors.map((match) => (
                    <div
                      key={match.donorId}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {match.name}
                          </span>
                          <span className="px-2 py-0.5 bg-blood-100 text-blood-700 font-extrabold text-xs rounded-md">
                            {match.bloodGroup}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Score: {match.score}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Location: <strong>{match.city}</strong> {match.state ? `, ${match.state}` : ''}
                        </p>
                        {match.matchReasons && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {match.matchReasons.map((r, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {match.phone ? (
                          <a
                            href={`tel:${match.phone}`}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Call {match.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Contact Masked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Blood Request"
        message={`Are you certain you want to cancel the blood request for ${requestToCancel?.patientName} (${requestToCancel?.unitsRequired} units of ${requestToCancel?.bloodGroup})? This cannot be undone.`}
        confirmText="Yes, Cancel Request"
        cancelText="Keep Request"
        isDanger={true}
        isLoading={cancelSubmitting}
      />
    </div>
  );
};

export default MyRequestsPage;
