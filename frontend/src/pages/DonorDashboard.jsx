import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Droplet,
  Heart,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Phone,
  Activity
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [matchingRequests, setMatchingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  // New donation modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationForm, setDonationForm] = useState({
    hospitalOrCamp: 'Central Blood Bank & Donation Center',
    units: 1,
    diseaseOrHealthNotes: 'None reported. Normal vitals.'
  });
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [donationMsg, setDonationMsg] = useState('');

  const fetchDonorData = async () => {
    try {
      const [profileRes, donationsRes, matchesRes] = await Promise.all([
        api.get('/donors/profile/me'),
        api.get('/donors/donations/my'),
        api.get('/donors/matching-requests')
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.profile);
      }
      if (donationsRes.data.success) {
        setDonations(donationsRes.data.donations);
      }
      if (matchesRes.data.success) {
        setMatchingRequests(matchesRes.data.requests);
      }
    } catch (err) {
      console.error('Failed to load donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setTogglingAvailability(true);
    try {
      const newStatus = !profile.isAvailable;
      const res = await api.patch('/donors/availability', { isAvailable: newStatus });
      if (res.data.success) {
        setProfile({ ...profile, isAvailable: newStatus });
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setSubmittingDonation(true);
    setDonationMsg('');
    try {
      const res = await api.post('/donors/donations', donationForm);
      if (res.data.success) {
        setDonationMsg('Donation entry submitted! Blood bank staff will verify and add to inventory.');
        setShowDonationModal(false);
        fetchDonorData();
      }
    } catch (err) {
      setDonationMsg(err.response?.data?.message || 'Failed to submit donation.');
    } finally {
      setSubmittingDonation(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading donor profile...</p>
      </div>
    );
  }

  const eligibility = profile?.eligibilityCheck || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner & Profile Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blood-700 to-blood-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blood-600/30">
              {profile?.bloodGroup || 'O+'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blood-100 text-blood-700 uppercase">
                  Verified Donor
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {profile?.city || user?.city}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Availability Toggle */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center px-4">
              <span className="block text-xs font-bold text-slate-500 uppercase">
                Lifetime Donations
              </span>
              <span className="text-xl font-black text-slate-900">
                {profile?.totalDonations || 0}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center px-4">
              <span className="block text-xs font-bold text-slate-500 uppercase">
                Availability Status
              </span>
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={togglingAvailability}
                className={`mt-1 px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  profile?.isAvailable
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    profile?.isAvailable ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                  }`}
                ></span>
                <span>{profile?.isAvailable ? 'Ready to Donate' : 'Paused / Unavailable'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowDonationModal(true)}
              className="px-5 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blood-600/30 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Blood Donation</span>
            </button>
          </div>
        </div>
      </div>

      {donationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{donationMsg}</span>
        </div>
      )}

      {/* 2-Column Section: Interval Eligibility Status & Matched Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Clinical Eligibility Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Activity className="w-5 h-5 text-blood-600" />
            <h3>Medical Interval Eligibility</h3>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              eligibility.isEligible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm">
              {eligibility.isEligible ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              )}
              <span>{eligibility.isEligible ? 'Eligible for Donation' : 'In Waiting Interval'}</span>
            </div>
            <p className="text-xs mt-1.5 leading-relaxed font-medium">
              {eligibility.message}
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Last Recorded Donation:</span>
              <span className="font-bold text-slate-800">
                {profile?.lastDonationDate
                  ? new Date(profile.lastDonationDate).toLocaleDateString()
                  : 'None Recorded'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Days Since Donation:</span>
              <span className="font-bold text-slate-800">
                {eligibility.daysSinceLastDonation !== null
                  ? `${eligibility.daysSinceLastDonation} days`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Mandatory Interval:</span>
              <span className="font-bold text-slate-800">90 Days (Whole Blood)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="font-semibold text-slate-500">Weight on File:</span>
              <span className="font-bold text-slate-800">{profile?.weight} kg (Min. 45 kg)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Final medical clearance is verified on-site by qualified healthcare staff including blood pressure, pulse, and hemoglobin concentration.
            </span>
          </div>
        </div>

        {/* Right 2 Columns: Matching Blood Requests in Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Droplet className="w-5 h-5 text-blood-600 fill-current" />
              <h3>Matching Blood Requests For Your Type ({profile?.bloodGroup})</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-blood-50 text-blood-700 font-bold text-xs rounded-full">
              {matchingRequests.length} Open
            </span>
          </div>

          {matchingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No emergency requests currently pending for your blood group. Thank you for staying ready!
            </div>
          ) : (
            <div className="space-y-3">
              {matchingRequests.map((req) => (
                <div
                  key={req.id || req.requestId}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-blood-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {req.patientName}
                        </span>
                        <span className="px-2 py-0.5 bg-blood-100 text-blood-800 font-bold text-xs rounded">
                          {req.bloodGroup}
                        </span>
                        {req.isExactMatch && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Exact Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.hospitalName}, {req.city}</span>
                      </p>
                    </div>
                    <UrgencyBadge urgency={req.urgency} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Requires: <strong>{req.unitsRequired} Unit(s)</strong> by{' '}
                      {new Date(req.requiredDate).toLocaleDateString()}
                    </span>

                    <a
                      href={`tel:${req.contactPhone}`}
                      className="px-3 py-1.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Contact: {req.contactName}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donation History Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">My Donation History</h3>
        {donations.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No past donations recorded yet. Click "Record Blood Donation" above after completing a donation drive.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Donation ID</th>
                  <th className="py-3 px-4">Hospital / Blood Drive</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-blood-600">
                      {d.donationId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {d.hospitalOrCamp}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{d.units} Unit</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(d.donationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {d.rejectionReason || d.diseaseOrHealthNotes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 relative border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2">Record Blood Donation</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit details of your blood donation. An administrator will review and credit this to the official blood bank inventory.
            </p>

            <form onSubmit={handleDonationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Donation Center / Hospital / Drive *
                </label>
                <input
                  type="text"
                  required
                  value={donationForm.hospitalOrCamp}
                  onChange={(e) =>
                    setDonationForm({ ...donationForm, hospitalOrCamp: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Units Donated (Standard: 1 Unit) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="2"
                  required
                  value={donationForm.units}
                  onChange={(e) =>
                    setDonationForm({ ...donationForm, units: Number(e.target.value) })
                  }
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vitals & Health Remarks
                </label>
                <input
                  type="text"
                  value={donationForm.diseaseOrHealthNotes}
                  onChange={(e) =>
                    setDonationForm({
                      ...donationForm,
                      diseaseOrHealthNotes: e.target.value
                    })
                  }
                  placeholder="e.g. Hb 14.0 g/dL, BP 120/80"
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDonationModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDonation}
                  className="px-5 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {submittingDonation ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
