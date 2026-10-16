import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Droplet,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Shield,
  HeartHandshake,
  Activity,
  GitPullRequest,
  BookOpen,
  Bell,
  Heart,
  ChevronDown,
  Info,
  Phone
} from 'lucide-react';
import CompatibilityMatrixModal from './CompatibilityMatrixModal';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'requester') return '/requester/dashboard';
    return '/';
  };

  // Fetch unread notifications count if user is authenticated
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      api
        .get('/notifications?unreadOnly=true')
        .then((res) => {
          if (isMounted) {
            setUnreadCount(res.data.unreadCount || 0);
          }
        })
        .catch(() => {
          // ignore background fetch error
        });
    } else {
      setUnreadCount(0);
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blood-700 to-blood-500 flex items-center justify-center text-white shadow-md shadow-blood-500/20 group-hover:scale-105 transition-transform">
                <Droplet className="w-6 h-6 fill-current animate-pulse-subtle" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blood-700 transition-colors">
                    Blood<span className="text-blood-600">Care</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blood-100 text-blood-700 rounded-md uppercase tracking-wider">
                    Smart Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Smart Blood Donation & Matching System
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/')
                    ? 'text-blood-600 bg-blood-50'
                    : 'text-slate-600 hover:text-blood-600 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/about')
                    ? 'text-blood-600 bg-blood-50'
                    : 'text-slate-600 hover:text-blood-600 hover:bg-slate-50'
                }`}
              >
                About Us
              </Link>
              <Link
                to="/find-donors"
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/find-donors')
                    ? 'text-blood-600 bg-blood-50'
                    : 'text-slate-600 hover:text-blood-600 hover:bg-slate-50'
                }`}
              >
                Find Donors
              </Link>
              <Link
                to="/how-it-works"
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/how-it-works')
                    ? 'text-blood-600 bg-blood-50'
                    : 'text-slate-600 hover:text-blood-600 hover:bg-slate-50'
                }`}
              >
                How It Works
              </Link>
              <Link
                to="/awareness"
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/awareness') || isActive('/donate-info')
                    ? 'text-blood-600 bg-blood-50'
                    : 'text-slate-600 hover:text-blood-600 hover:bg-slate-50'
                }`}
              >
                Awareness
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/contact')
                    ? 'text-blood-600 bg-blood-50'
                    : 'text-slate-600 hover:text-blood-600 hover:bg-slate-50'
                }`}
              >
                Contact
              </Link>
              <button
                type="button"
                onClick={() => setMatrixOpen(true)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-blood-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-blood-500" />
                Compatibility
              </button>
            </nav>

            {/* Desktop Auth / User Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 relative">
                  {/* Notifications Icon Button */}
                  <Link
                    to="/notifications"
                    className="p-2 text-slate-600 hover:text-blood-600 hover:bg-slate-100 rounded-xl transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blood-600 ring-2 ring-white animate-pulse"></span>
                    )}
                  </Link>

                  {/* Primary Dashboard Link */}
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    {user.role === 'admin' && <Shield className="w-3.5 h-3.5 text-blood-400" />}
                    {user.role === 'donor' && <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />}
                    {user.role === 'requester' && <GitPullRequest className="w-3.5 h-3.5 text-blue-300" />}
                    <span>{user.role === 'admin' ? 'Admin Portal' : 'Dashboard'}</span>
                  </Link>

                  {/* User Profile Dropdown Button */}
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-1.5 p-1.5 pr-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-xs font-semibold"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blood-100 text-blood-700 font-black flex items-center justify-center text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {userDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-fade-in"
                        onMouseLeave={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 capitalize">{user.role} Account</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <span>My Profile & Settings</span>
                          </Link>

                          <Link
                            to="/my-requests"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <GitPullRequest className="w-4 h-4 text-slate-400" />
                            <span>My Blood Requests</span>
                          </Link>

                          {user.role === 'donor' && (
                            <Link
                              to="/donation-history"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                            >
                              <Heart className="w-4 h-4 text-slate-400" />
                              <span>Donation History</span>
                            </Link>
                          )}

                          <Link
                            to="/notifications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-slate-400" />
                              <span>Notifications</span>
                            </div>
                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-blood-100 text-blood-700 rounded-full font-bold text-[10px]">
                                {unreadCount}
                              </span>
                            )}
                          </Link>
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blood-600 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-xs font-bold bg-blood-600 hover:bg-blood-700 text-white rounded-xl shadow-md shadow-blood-600/25 transition-all hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex sm:hidden items-center gap-2">
              {isAuthenticated && (
                <Link
                  to="/notifications"
                  className="p-2 text-slate-600 hover:text-blood-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blood-600"></span>
                  )}
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              About Us
            </Link>
            <Link
              to="/find-donors"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Find Donors
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              How It Works
            </Link>
            <Link
              to="/awareness"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Awareness & Eligibility
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Contact
            </Link>
            <button
              onClick={() => {
                setMatrixOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-blood-600" />
              <span>Compatibility Guide</span>
            </button>

            <div className="pt-4 border-t border-slate-200">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-xs font-semibold text-slate-500">
                    Logged in: <strong className="text-slate-800">{user.name}</strong> ({user.role})
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/my-requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm"
                  >
                    My Blood Requests
                  </Link>
                  {user.role === 'donor' && (
                    <Link
                      to="/donation-history"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm"
                    >
                      Donation History
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-4 py-2 text-rose-600 bg-rose-50 rounded-xl font-semibold text-sm"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 border border-slate-300 rounded-xl font-bold text-sm text-slate-700"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 bg-blood-600 text-white rounded-xl font-bold text-sm shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <CompatibilityMatrixModal isOpen={matrixOpen} onClose={() => setMatrixOpen(false)} />
    </>
  );
};

export default Navbar;
