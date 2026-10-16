import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, Phone, ShieldCheck, Mail, MapPin, Award, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      {/* Emergency Callout Banner */}
      <div className="bg-gradient-to-r from-blood-700 via-blood-600 to-rose-700 text-white py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-full animate-bounce">
              <Phone className="w-4 h-4 text-white" />
            </span>
            <span className="font-bold text-sm sm:text-base">
              Medical Emergency Blood Helpline:
            </span>
            <span className="font-mono bg-black/20 px-2.5 py-0.5 rounded text-sm font-semibold tracking-wider">
              1800-BLOOD-CARE (1800-256-632)
            </span>
          </div>
          <Link
            to="/request-blood"
            className="px-4 py-1.5 bg-white text-blood-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-transform hover:scale-105 shadow-sm"
          >
            Submit Urgent Request &rarr;
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-blood-600 flex items-center justify-center text-white shadow-md shadow-blood-600/30">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Blood<span className="text-blood-500">Care</span> Management
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Smart Blood Donation and Donor Matching System connecting registered donors, certified blood banks, and hospital patients in real time with ABO/Rh compatibility matching.
            </p>
            <div className="space-y-1 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blood-400 shrink-0" />
                <span>Plot 42, Central Blood Transfusion & Research Center, New Delhi</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blood-400 shrink-0" />
                <span>support@bloodcare.org</span>
              </div>
            </div>
          </div>

          {/* Public Pages */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore & Learn
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-blood-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blood-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-blood-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/find-donors" className="hover:text-blood-400 transition-colors">
                  Find Blood Donors
                </Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-blood-400 transition-colors">
                  Donation Awareness & FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blood-400 transition-colors">
                  Contact & Centers
                </Link>
              </li>
            </ul>
          </div>

          {/* User Portals & Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Portals & Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/request-blood" className="hover:text-blood-400 transition-colors">
                  Submit Blood Request
                </Link>
              </li>
              <li>
                <Link to="/register?role=donor" className="hover:text-blood-400 transition-colors">
                  Register as Voluntary Donor
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blood-400 transition-colors">
                  Sign In to Account
                </Link>
              </li>
              <li>
                <Link to="/donor/dashboard" className="hover:text-blood-400 transition-colors">
                  Donor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/requester/dashboard" className="hover:text-blood-400 transition-colors">
                  Requester Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-blood-400 transition-colors">
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* College Project Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              College Capstone Demo
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Designed as a final year college project in Full-Stack Web Development (MERN Stack).
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-white block">Examiner Demo Ready:</span>
              <p>JWT auth, atomic MongoDB transactions, ABO/Rh matching, and live calculated statistics.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Blood Care Management System. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with precision for healthcare impact</span>
            <Heart className="w-3.5 h-3.5 text-blood-500 fill-current ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
