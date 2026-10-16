import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Droplet,
  Search,
  Heart,
  ShieldCheck,
  Clock,
  Users,
  Building2,
  AlertCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import UrgencyBadge from '../components/UrgencyBadge';
import CompatibilityMatrixModal from '../components/CompatibilityMatrixModal';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeDonors: 0,
    livesImpacted: 0,
    totalUnitsInStock: 0,
    activeRequests: 0
  });
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchGroup, setSearchGroup] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [matrixOpen, setMatrixOpen] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, urgentRes] = await Promise.all([
          api.get('/stats/public'),
          api.get('/requests/urgent')
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (urgentRes.data.success) {
          setUrgentRequests(urgentRes.data.requests);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchGroup) params.append('bloodGroup', searchGroup);
    if (searchCity) params.append('city', searchCity);
    navigate(`/find-donors?${params.toString()}`);
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-16 lg:space-y-24 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-blood-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-100/80 border border-blood-200 text-blood-700 text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blood-600 animate-spin" style={{ animationDuration: '6s' }} />
              Smart Blood Donation & Rapid Donor Matching System
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Every Drop Counts. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blood-600 via-blood-700 to-rose-700">
                Match Donors. Save Lives.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A clinical healthcare network connecting voluntary blood donors, patients, and blood banks with automated ABO/Rh red blood cell compatibility matching and live inventory tracking.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/find-donors"
                className="px-6 py-3.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-lg shadow-blood-600/30 transition-all hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
              >
                <Search className="w-4 h-4" />
                Find Donors
              </Link>
              <Link
                to="/register?role=donor"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 shadow-sm transition-all hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
              >
                <Heart className="w-4 h-4 text-blood-600 fill-current" />
                Donate Blood
              </Link>
              <Link
                to="/request-blood"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
              >
                <AlertCircle className="w-4 h-4 text-blood-400" />
                Request Blood
              </Link>
            </div>
          </div>

          {/* Quick Search Widget */}
          <div className="mt-12 max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/80">
            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Blood Group Required
                </label>
                <select
                  value={searchGroup}
                  onChange={(e) => setSearchGroup(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none font-semibold text-slate-800"
                >
                  <option value="">All Blood Groups (Any)</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  City / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Pune, Delhi..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none text-slate-800"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full h-11 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blood-600/20 flex items-center justify-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4" />
                  Search Donors
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Live Database Statistics (Calculated from Real DB Records) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blood-100 flex items-center justify-center text-blood-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {loading ? '...' : stats.totalDonors}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Registered Donors ({stats.activeDonors} Active)
              </p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {loading ? '...' : `${stats.totalUnitsInStock} Units`}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Blood Units in Bank Stock
              </p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {loading ? '...' : stats.livesImpacted}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Lives Impacted / Transfusions
              </p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {loading ? '...' : stats.activeRequests}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Active Hospital Requests
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Urgent Blood Requests Section */}
      {urgentRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-rose-50 via-white to-blood-50 p-6 sm:p-8 rounded-3xl border border-blood-200/70 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blood-600 animate-ping"></span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Urgent Emergency Blood Demands
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Critical medical procedures currently awaiting compatible donor assistance
                  </p>
                </div>
              </div>
              <Link
                to="/find-donors"
                className="text-xs sm:text-sm font-bold text-blood-700 hover:text-blood-800 flex items-center gap-1 group"
              >
                <span>View All Donors</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {urgentRequests.map((req) => (
                <div
                  key={req._id || req.requestId}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-3 py-1 bg-blood-100 text-blood-800 font-extrabold text-sm rounded-lg">
                      {req.bloodGroup}
                    </span>
                    <UrgencyBadge urgency={req.urgency} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{req.patientName}</h3>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.hospitalName}, {req.city}</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Need: <strong>{req.unitsRequired} Unit(s)</strong>
                    </span>
                    <Link
                      to={`/request-blood`}
                      className="px-3 py-1.5 bg-blood-50 hover:bg-blood-100 text-blood-700 font-bold rounded-lg transition-colors"
                    >
                      Respond &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Blood Compatibility Guide & Smart Matching Explainer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-blood-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              ABO & Rh Red Blood Cell Rules
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Clinically Verified Smart Donor Matching Engine
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Our intelligent matching algorithm evaluates RBC ABO/Rh compatibility, geographic proximity, 90-day donation interval eligibility, and urgency weighting to score and rank ideal voluntary donors.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMatrixOpen(true)}
                className="px-5 py-3 bg-blood-600 hover:bg-blood-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blood-600/30 flex items-center gap-2"
              >
                <span>Open Interactive Compatibility Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (Steps for Donors & Requesters) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-900">How Blood Care Works</h2>
          <p className="text-sm text-slate-600 mt-2">
            Seamless end-to-end workflow designed for rapid response during medical emergencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blood-50 border border-blood-200 text-blood-600 flex items-center justify-center font-black text-xl mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Register & Screen</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donors register their blood group, city, and weight. Eligibility checks ensure safety for both donor and recipient.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blood-50 border border-blood-200 text-blood-600 flex items-center justify-center font-black text-xl mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Smart Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a blood request is submitted, our system identifies available and compatible donors ranked by proximity and medical match score.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blood-50 border border-blood-200 text-blood-600 flex items-center justify-center font-black text-xl mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Verified Fulfillment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Blood bank administrators verify donations, update bank inventory with atomic safety, and record full audit trails.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Blood Donation Awareness & Eligibility Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blood-600 uppercase tracking-wider">
                Clinical Guidelines
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Are You Eligible to Donate Blood?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Voluntary whole blood donation is safe, simple, and saves up to three lives per unit. Check standard criteria before scheduling an appointment.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Age between 18 and 65 years old</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Minimum body weight of 45 kg (100 lbs)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>At least 90 days interval since last whole blood donation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hemoglobin concentration &ge; 12.5 g/dL verified on-site</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/donate-info"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blood-600 hover:text-blood-700"
                >
                  <span>Read Full Medical Eligibility & FAQ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-blood-50 p-6 sm:p-8 rounded-2xl border border-blood-100 space-y-4 text-center sm:text-left">
              <h3 className="text-xl font-bold text-blood-900">Ready to make a difference?</h3>
              <p className="text-xs text-blood-700 leading-relaxed">
                Register as a voluntary donor today. When someone in your city needs your compatible blood type, our system helps them reach you safely.
              </p>
              <Link
                to="/register?role=donor"
                className="inline-block px-5 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blood-600/30 transition-all hover:scale-105"
              >
                Register as a Donor Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CompatibilityMatrixModal isOpen={matrixOpen} onClose={() => setMatrixOpen(false)} />
    </div>
  );
};

export default HomePage;
