import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplet,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  HeartHandshake,
  GitPullRequest,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'requester' ? 'requester' : 'donor';
  const [role, setRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    state: '',
    // Donor fields
    bloodGroup: 'O+',
    age: 25,
    gender: 'Male',
    weight: 65,
    agreedToTerms: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.city) {
      setError('Please fill in all mandatory account fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'donor') {
      if (formData.age < 18 || formData.age > 65) {
        setError('Donors must be between 18 and 65 years old.');
        return;
      }
      if (formData.weight < 45) {
        setError('Minimum body weight to donate whole blood is 45 kg.');
        return;
      }
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      role
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      if (role === 'donor') navigate('/donor/dashboard');
      else navigate('/requester/dashboard');
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blood-700 to-blood-500 flex items-center justify-center text-white mx-auto shadow-md shadow-blood-500/30">
            <Droplet className="w-7 h-7 fill-current animate-pulse-subtle" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Your BloodCare Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join our verified network of donors, blood banks, and healthcare recipients
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-sm grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              role === 'donor'
                ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>I want to Donate Blood</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('requester')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              role === 'requester'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>I need Blood / Patient</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/60 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Account Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City / Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Donor-Specific Fields */}
            {role === 'donor' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <span className="text-xs font-bold text-blood-700 uppercase tracking-wider block">
                  Donor Health & Eligibility Details
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Blood Group *
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full h-10 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-blood-700 outline-none"
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
                      Age (18-65) *
                    </label>
                    <input
                      type="number"
                      name="age"
                      min="18"
                      max="65"
                      required
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full h-10 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full h-10 px-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      name="weight"
                      min="45"
                      required
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full h-10 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blood-50 rounded-xl text-[11px] text-blood-900 leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
                  <span>
                    By registering as a donor, you confirm that you meet the minimum weight (45 kg) and have no history of chronic transmissible blood infections.
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blood-600 hover:bg-blood-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blood-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blood-600 hover:text-blood-700">
              Sign In Instead &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
