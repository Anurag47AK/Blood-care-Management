import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Droplet,
  FileText,
  Phone,
  User,
  CheckCircle,
  MapPin,
  ArrowRight
} from 'lucide-react';

const RequestBloodPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsRequired: 1,
    hospitalName: '',
    hospitalAddress: '',
    city: user?.city || '',
    urgency: 'Normal',
    requiredDate: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    reason: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('You must be logged in to submit a formal blood request.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/requests', formData);
      if (response.data.success) {
        setSuccessResult(response.data.bloodRequest);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to submit blood request.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Tomorrow as minimum required date
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-50 text-blood-700 text-xs font-bold uppercase tracking-wide mb-2">
          <Droplet className="w-3.5 h-3.5 fill-current" />
          Clinical Request Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Submit Blood Request
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Submit verified emergency or planned blood unit requests. Our smart matching system immediately alerts compatible nearby voluntary donors and blood bank administrators.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Please log in or register to submit a blood request and track its status.</span>
          </div>
          <Link
            to="/login?redirect=/request-blood"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl whitespace-nowrap transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      )}

      {successResult ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Blood Request Submitted Successfully!
          </h2>
          <div className="p-4 bg-slate-50 rounded-2xl max-w-md mx-auto border border-slate-200 text-left space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Request Tracking ID:</span>
              <span className="font-mono font-bold text-blood-600 text-sm">
                {successResult.requestId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Patient Name:</span>
              <span className="font-bold text-slate-800">{successResult.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Required Blood Group:</span>
              <span className="font-black text-slate-900">{successResult.bloodGroup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Hospital / City:</span>
              <span className="font-bold text-slate-800">
                {successResult.hospitalName}, {successResult.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Current Status:</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                {successResult.status}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your request is now in queue. Blood bank staff will review availability and contact you shortly.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setSuccessResult(null);
                setFormData({
                  patientName: '',
                  bloodGroup: 'O+',
                  unitsRequired: 1,
                  hospitalName: '',
                  hospitalAddress: '',
                  city: user?.city || '',
                  urgency: 'Normal',
                  requiredDate: '',
                  contactName: user?.name || '',
                  contactPhone: user?.phone || '',
                  reason: ''
                });
              }}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors"
            >
              Submit Another Request
            </button>
            <Link
              to={user?.role === 'admin' ? '/admin' : '/requester/dashboard'}
              className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Track in My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6"
        >
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Patient & Medical Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blood-600" />
              1. Patient & Medical Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Blood Group Required *
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none font-bold text-slate-800"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Units Required (1 - 10) *
                </label>
                <input
                  type="number"
                  name="unitsRequired"
                  min="1"
                  max="10"
                  required
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Urgency Level *
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className={`w-full h-11 px-3 text-sm border rounded-xl focus:ring-2 focus:ring-blood-500 outline-none font-bold ${
                    formData.urgency === 'Critical'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : formData.urgency === 'Urgent'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Normal">Normal (Scheduled / 48+ hrs)</option>
                  <option value="Urgent">Urgent (Within 24 Hours)</option>
                  <option value="Critical">Critical (Immediate Emergency)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Medical Reason / Diagnosis / Surgery Type *
                </label>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="e.g. Open heart surgery, severe anemia, accidental trauma..."
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hospital & Location */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blood-600" />
              2. Hospital & Delivery Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hospital / Medical Center Name *
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  required
                  placeholder="e.g. Lilavati Hospital, Bandra"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hospital Ward / ICU / Room Address *
                </label>
                <input
                  type="text"
                  name="hospitalAddress"
                  required
                  placeholder="e.g. Ward 4B, 3rd Floor, Intensive Care Unit"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Required By Date *
                </label>
                <input
                  type="date"
                  name="requiredDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.requiredDate}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact Person Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blood-600" />
              3. Attendant / Contact Person
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  required
                  placeholder="Attendant or doctor name"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Mobile Phone *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className="px-8 py-3.5 bg-blood-600 hover:bg-blood-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blood-600/30 transition-all hover:scale-105 text-sm"
            >
              {loading ? 'Submitting Blood Request...' : 'Submit Verified Blood Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RequestBloodPage;
