import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplet,
  Mail,
  Lock,
  AlertCircle,
  Shield,
  HeartHandshake,
  GitPullRequest,
  ArrowRight
} from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if session expired from redirect query
  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Redirect to appropriate role dashboard
      const role = result.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'donor') navigate('/donor/dashboard');
      else if (role === 'requester') navigate('/requester/dashboard');
      else navigate('/');
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  // Helper for quick demonstration credentials
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blood-700 to-blood-500 flex items-center justify-center text-white mx-auto shadow-md shadow-blood-500/30">
            <Droplet className="w-7 h-7 fill-current animate-pulse-subtle" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to BloodCare
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to access your donation dashboard or manage blood requests
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pill Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            One-Click Demo Evaluator Credentials:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@bloodcare.org', 'Admin@123')}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-transform hover:scale-105 flex items-center justify-center gap-1 shadow-sm"
              title="Dr. Sunita Sharma (Admin)"
            >
              <Shield className="w-3 h-3 text-blood-400" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('rahul.donor@example.com', 'Donor@123')}
              className="py-1.5 px-2 bg-blood-600 hover:bg-blood-700 text-white rounded-lg text-xs font-bold transition-transform hover:scale-105 flex items-center justify-center gap-1 shadow-sm"
              title="Rahul Verma (Donor - O+)"
            >
              <HeartHandshake className="w-3 h-3 text-rose-200" />
              <span>Donor</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('vikram.requester@example.com', 'Patient@123')}
              className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-transform hover:scale-105 flex items-center justify-center gap-1 shadow-sm"
              title="Vikram Malhotra (Requester)"
            >
              <GitPullRequest className="w-3 h-3 text-blue-200" />
              <span>Patient</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/60 space-y-5">
          {isExpired && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blood-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blood-600 hover:bg-blood-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blood-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blood-600 hover:text-blood-700">
              Create an Account &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
