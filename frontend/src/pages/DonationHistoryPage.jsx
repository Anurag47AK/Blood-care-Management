import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Heart,
  Droplet,
  Award,
  Calendar,
  Building2,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Sparkles,
  Download
} from 'lucide-react';

const DonationHistoryPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Log donation modal state
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    donationDate: new Date().toISOString().split('T')[0],
    bloodBankOrHospital: '',
    units: 1,
    remarks: ''
  });

  const fetchMyDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/donors/donations/my');
      setDonations(res.data.donations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await api.post('/donors/donations', formData);
      setLogModalOpen(false);
      setFormData({
        donationDate: new Date().toISOString().split('T')[0],
        bloodBankOrHospital: '',
        units: 1,
        remarks: ''
      });
      await fetchMyDonations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record donation.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const verifiedDonations = donations.filter((d) => d.status === 'verified');
  const totalUnits = verifiedDonations.reduce((acc, curr) => acc + (curr.units || 1), 0);
  const livesImpacted = totalUnits * 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blood-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span>Donor Recognition Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            My Donation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your verified voluntary donations, medical center certifications, and community impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMyDonations}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setLogModalOpen(true)}
            className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-md shadow-blood-600/25 transition-all hover:scale-105 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log a Donation</span>
          </button>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Total Recorded</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{donations.length}</div>
          <p className="text-[11px] text-slate-500">Total donation visits logged</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Verified Units</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{totalUnits}</div>
          <p className="text-[11px] text-slate-500">Clinical certified whole blood units</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Lives Saved</span>
            <div className="w-8 h-8 rounded-lg bg-blood-100 text-blood-700 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-3xl font-black text-blood-600">{livesImpacted}</div>
          <p className="text-[11px] text-slate-500">Estimated patients helped (3 per unit)</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Donor Badge</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">
            {verifiedDonations.length >= 5
              ? 'Gold Champion 🥇'
              : verifiedDonations.length >= 3
              ? 'Silver Lifesaver 🥈'
              : verifiedDonations.length >= 1
              ? 'Bronze Hero 🥉'
              : 'Registered Pledger'}
          </div>
          <p className="text-[11px] text-slate-500">Community recognition tier</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Donations List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">Donation History Log</h2>
            <p className="text-xs text-slate-500">
              Each donation is confirmed by authorized blood bank laboratory staff.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No Donations Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If you recently donated at a hospital or blood drive, log your visit here for administrator verification and certification.
            </p>
            <button
              onClick={() => setLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blood-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Log Recent Donation</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Donation Date</th>
                  <th className="px-6 py-4">Blood Bank / Hospital</th>
                  <th className="px-6 py-4">Units</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Staff Remarks</th>
                  <th className="px-6 py-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((don) => (
                  <tr key={don._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {new Date(don.donationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">
                          {don.bloodBankOrHospital}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {don.units || 1} Unit ({((don.units || 1) * 450)} mL)
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={don.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 italic">
                      {don.medicalStaffNotes || don.remarks || 'Standard voluntary whole blood collection.'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {don.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Donor
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Awaiting Admin Check
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Donation Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Log Whole Blood Donation</h3>
                <p className="text-xs text-slate-500">Record a recent voluntary blood donation visit.</p>
              </div>
              <button
                onClick={() => setLogModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Donation Date *
                </label>
                <input
                  type="date"
                  name="donationDate"
                  required
                  value={formData.donationDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Blood Bank / Hospital Name *
                </label>
                <input
                  type="text"
                  name="bloodBankOrHospital"
                  required
                  value={formData.bloodBankOrHospital}
                  onChange={handleFormChange}
                  placeholder="e.g. AIIMS Central Blood Center, New Delhi"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Units Donated *
                </label>
                <input
                  type="number"
                  name="units"
                  min="1"
                  max="2"
                  required
                  value={formData.units}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Notes / Receipt Number
                </label>
                <textarea
                  name="remarks"
                  rows={2}
                  value={formData.remarks}
                  onChange={handleFormChange}
                  placeholder="Optional details or donation drive receipt number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blood-600/20 transition-all disabled:opacity-50"
                >
                  {formSubmitting ? 'Submitting...' : 'Record Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationHistoryPage;
