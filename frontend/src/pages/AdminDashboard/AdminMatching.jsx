import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Sparkles,
  Search,
  Droplet,
  MapPin,
  Phone,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const AdminMatching = ({ initialRequest = null }) => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(initialRequest?._id || '');
  const [manualMode, setManualMode] = useState(false);

  const [criteria, setCriteria] = useState({
    bloodGroup: initialRequest?.bloodGroup || 'O+',
    city: initialRequest?.city || '',
    urgency: initialRequest?.urgency || 'Urgent'
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Load active requests for quick select
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await api.get('/admin/requests?status=Pending');
        if (res.data.success) {
          setActiveRequests(res.data.requests);
        }
      } catch (e) {
        console.error('Failed to load pending requests:', e);
      }
    };
    fetchActive();
  }, []);

  // When initialRequest changes
  useEffect(() => {
    if (initialRequest) {
      setSelectedRequestId(initialRequest._id);
      setManualMode(false);
      handleMatchByRequestId(initialRequest._id);
    }
  }, [initialRequest]);

  const handleMatchByRequestId = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/matching/request/${id}`);
      if (res.data.success) {
        setResults(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute matching engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/matching/find', criteria);
      if (res.data.success) {
        setResults(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute matching engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blood-100 flex items-center justify-center text-blood-600">
            <Sparkles className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Smart ABO/Rh Donor Matching Tool
            </h2>
            <p className="text-xs text-slate-500">
              Run clinical red blood cell compatibility matrix and proximity ranking on any request.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setManualMode(false)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              !manualMode
                ? 'bg-blood-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Match by Active Blood Request
          </button>
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              manualMode
                ? 'bg-blood-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Match by Custom Parameters
          </button>
        </div>

        {/* Input Forms */}
        {!manualMode ? (
          <div className="pt-2 flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Pending Hospital Blood Request:
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
              >
                <option value="">-- Choose a Request --</option>
                {activeRequests.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.requestId} — {r.patientName} ({r.bloodGroup}, {r.unitsRequired} units, {r.hospitalName}, {r.city})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={!selectedRequestId || loading}
              onClick={() => handleMatchByRequestId(selectedRequestId)}
              className="px-6 h-11 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-blood-400" />
              <span>{loading ? 'Matching...' : 'Run Smart Match'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualMatch} className="pt-2 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient Blood Group *
              </label>
              <select
                value={criteria.bloodGroup}
                onChange={(e) => setCriteria({ ...criteria, bloodGroup: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target City / District
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={criteria.city}
                onChange={(e) => setCriteria({ ...criteria, city: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency Level
              </label>
              <select
                value={criteria.urgency}
                onChange={(e) => setCriteria({ ...criteria, urgency: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blood-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Analyzing...' : 'Rank Candidates'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="space-y-6">
          {/* Compatibility Breakdown Header */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blood-400">
                  Target Patient Blood Group
                </span>
                <h3 className="text-2xl font-black">{results.recipientBloodGroup}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">
                  Total Compatible Donors Found
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {results.totalMatches}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Clinically Compatible Donor Types:</span>
              {results.compatibleGroups?.map((bg) => (
                <span
                  key={bg}
                  className="px-2 py-0.5 bg-blood-600/30 border border-blood-500/40 text-blood-300 font-bold rounded"
                >
                  {bg}
                </span>
              ))}
            </div>
          </div>

          {/* Candidates Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.donors?.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {item.donor?.user?.name || item.donor?.name || 'Anonymous Donor'}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.donor?.city || item.donor?.user?.city}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-sm rounded-xl block">
                      {item.score}% Match
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 block">
                      {item.donor?.bloodGroup}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  {item.matchReasons?.map((r, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Phone:{' '}
                    <strong className="text-slate-900">
                      {item.donor?.user?.phone || 'On File'}
                    </strong>
                  </span>
                  {item.donor?.user?.phone && (
                    <a
                      href={`tel:${item.donor?.user?.phone}`}
                      className="px-3 py-1.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Donor
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legal / Medical Disclaimer */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {results.medicalDisclaimer ||
                'Clinical Smart Match is advisory based on RBC compatibility and profile data. Physical screening, hemoglobin concentration test, and laboratory cross-matching are mandatory prior to transfusion.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMatching;
