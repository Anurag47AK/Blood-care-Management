import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Droplet,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const FindDonorsPage = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState(searchParams.get('bloodGroup') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [availability, setAvailability] = useState('true');
  const [smartCompatibility, setSmartCompatibility] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchDonors = async () => {
    setLoading(true);
    try {
      if (smartCompatibility && bloodGroup) {
        // Use smart matching API endpoint
        const response = await api.post('/matching/find', {
          bloodGroup,
          city,
          urgency: 'Normal'
        });
        if (response.data.success) {
          // Transform scored matches into donor cards
          const formatted = response.data.donors.map((item) => ({
            id: item.donor._id,
            name: item.donor.user?.name || 'Anonymous Donor',
            bloodGroup: item.donor.bloodGroup,
            city: item.donor.city || item.donor.user?.city,
            state: item.donor.user?.state,
            gender: item.donor.gender,
            age: item.donor.age,
            isAvailable: item.donor.isAvailable,
            lastDonationDate: item.donor.lastDonationDate,
            phone: item.donor.user?.phone,
            eligibilityMessage: item.eligibility?.message,
            isEligible: item.eligibility?.isEligible,
            score: item.score,
            matchReasons: item.matchReasons
          }));
          setDonors(formatted);
        }
      } else {
        // Standard filtered query
        const params = new URLSearchParams();
        if (bloodGroup) params.append('bloodGroup', bloodGroup);
        if (city) params.append('city', city);
        if (availability) params.append('availability', availability);

        const response = await api.get(`/donors/search?${params.toString()}`);
        if (response.data.success) {
          setDonors(response.data.donors);
        }
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [smartCompatibility]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-50 text-blood-700 text-xs font-bold uppercase tracking-wide mb-2">
          <Droplet className="w-3.5 h-3.5 fill-current" />
          Verified Donor Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Compatible Blood Donors
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Search registered voluntary blood donors by blood group and city. Activate Smart Compatibility to match both exact and RBC-compatible alternative groups.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none font-semibold text-slate-800"
              >
                <option value="">Any Blood Group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                City / Location
              </label>
              <input
                type="text"
                placeholder="Search city (e.g. Mumbai, Pune)..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none text-slate-800"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none text-slate-800"
              >
                <option value="true">Available Donors Only</option>
                <option value="">All Donors</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full h-11 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blood-600/20 flex items-center justify-center gap-2 text-sm"
              >
                <Search className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Smart Compatibility Toggle */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={smartCompatibility}
                onChange={(e) => setSmartCompatibility(e.target.checked)}
                className="w-4 h-4 text-blood-600 rounded border-slate-300 focus:ring-blood-500"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blood-600" />
                <span>Smart Compatibility Mode (Search for recipient: <strong>{bloodGroup || 'Select Blood Group'}</strong>)</span>
              </span>
            </label>

            <span className="text-slate-500">
              Found <strong>{donors.length}</strong> matching candidates
            </span>
          </div>
        </form>
      </div>

      {/* Donor Results Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-semibold text-slate-500">Searching donor records...</p>
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Donors Found Matching Your Criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try broadening your search by clearing the city filter or selecting "All Blood Groups", or submit a direct hospital blood request.
          </p>
          <div className="pt-2">
            <Link
              to="/request-blood"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Submit Blood Request Instead
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor) => (
            <div
              key={donor.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow space-y-4 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{donor.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{donor.city}{donor.state ? `, ${donor.state}` : ''}</span>
                    </p>
                  </div>
                  <span className="w-12 h-12 rounded-xl bg-blood-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blood-600/30">
                    {donor.bloodGroup}
                  </span>
                </div>

                {/* Score badge if smart compatibility is on */}
                {donor.score !== undefined && (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>Clinical Match Score</span>
                    <span className="font-bold text-emerald-700">{donor.score}% Compatible</span>
                  </div>
                )}

                {/* Status Badges */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold ${
                      donor.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {donor.isAvailable ? (
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-slate-500" />
                    )}
                    {donor.isAvailable ? 'Available to Donate' : 'Unavailable'}
                  </span>

                  {donor.isEligible !== undefined && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        donor.isEligible
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {donor.isEligible ? '90-Day Interval Met' : 'Donated Recently'}
                    </span>
                  )}
                </div>

                {donor.eligibilityMessage && (
                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    {donor.eligibilityMessage}
                  </p>
                )}
              </div>

              {/* Contact Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                    Contact Phone
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {donor.phone || 'Protected'}
                  </span>
                </div>

                {isAuthenticated ? (
                  <a
                    href={`tel:${donor.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blood-50 hover:bg-blood-100 text-blood-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Donor
                  </a>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Log In to Call
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Notice */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Notice:</strong> Donor contact information is provided solely for legitimate voluntary medical donation coordination. Any unauthorized solicitations, commercial trade of human blood, or harassment is strictly prohibited by law.
        </p>
      </div>
    </div>
  );
};

export default FindDonorsPage;
