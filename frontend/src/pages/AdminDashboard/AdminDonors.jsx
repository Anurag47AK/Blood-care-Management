import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';

const AdminDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (bloodGroupFilter) params.append('bloodGroup', bloodGroupFilter);
      if (cityFilter) params.append('city', cityFilter);
      if (availabilityFilter) params.append('availability', availabilityFilter);

      const response = await api.get(`/admin/donors?${params.toString()}`);
      if (response.data.success) {
        setDonors(response.data.donors);
      }
    } catch (err) {
      console.error('Failed to load donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroupFilter, availabilityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">Manage Registered Blood Donors</h2>
            <p className="text-xs text-slate-500">
              Directory of voluntary donors with clinical eligibility and contact information.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
            {donors.length} Donors Registered
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Search by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-10 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs font-semibold text-slate-500">Loading donors...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">No donor records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Vitals (Age/Weight)</th>
                  <th className="py-3 px-4">Total Donations</th>
                  <th className="py-3 px-4">Last Donation Date</th>
                  <th className="py-3 px-4 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donors.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.user?.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-blood-100 text-blood-800 font-black rounded-lg">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{d.user?.phone}</div>
                      <div className="text-[11px] text-slate-400">{d.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {d.city || d.user?.city}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {d.age} yrs • {d.weight} kg
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {d.totalDonations || 0}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {d.lastDonationDate
                        ? new Date(d.lastDonationDate).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          d.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {d.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDonors;
