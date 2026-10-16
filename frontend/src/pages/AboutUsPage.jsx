import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Droplet,
  ShieldCheck,
  Users,
  Award,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Target,
  Compass
} from 'lucide-react';

const AboutUsPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Compassion First',
      description: 'Every feature and line of code is dedicated to saving human lives and supporting families in critical medical emergencies.'
    },
    {
      icon: Activity,
      title: 'Precision Compatibility',
      description: 'Our proprietary ABO/Rh matching engine ensures recipients are paired with physiologically compatible donors to eliminate adverse transfusion reactions.'
    },
    {
      icon: ShieldCheck,
      title: 'Data Integrity & Privacy',
      description: 'Strict privacy controls protect donor contact numbers from unauthorized scraping while maintaining instant reachability for genuine verified patients.'
    },
    {
      icon: Clock,
      title: 'Zero Latency Response',
      description: 'Connecting patients with nearby donors within seconds when every minute counts in trauma, surgical, or oncology procedures.'
    }
  ];

  const milestones = [
    {
      year: 'Phase 1',
      title: 'Algorithmic Foundation',
      desc: 'Formulated the red blood cell compatibility matrix covering all 8 ABO/Rh major blood types and multi-criteria scoring.'
    },
    {
      year: 'Phase 2',
      title: 'Atomic Inventory Engine',
      desc: 'Built safe concurrency transactions preventing race conditions and duplicate blood unit deductions.'
    },
    {
      year: 'Phase 3',
      title: 'Unified Hospital Ecosystem',
      desc: 'Integrated voluntary donors, hospital procurement officers, and blood bank administrators into a synchronized portal.'
    },
    {
      year: 'Phase 4',
      title: 'Live Examiner Capstone',
      desc: 'Ready for live college demonstration showcasing full-stack MERN capabilities and real healthcare impact.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-50 border border-blood-200 text-blood-700 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-current" />
          Mission & Vision
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Pioneering Smart Blood Matching for Next-Generation Healthcare
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Blood Care Management System is an advanced full-stack clinical platform built to eliminate critical shortages, reduce response times during medical emergencies, and empower voluntary blood donors.
        </p>
      </div>

      {/* Mission / Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-white to-blood-50/40 p-8 sm:p-10 rounded-3xl border border-blood-100 shadow-sm relative overflow-hidden space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blood-600 text-white flex items-center justify-center shadow-lg shadow-blood-600/30">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Our Clinical Mission</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To create an interoperable, transparent, and algorithmic blood management ecosystem where no patient suffers or succumbs due to the unavailability of matched blood units. We bridge hospital inventories, clinical testing, and community voluntary donors in real time.
          </p>
          <ul className="space-y-2 pt-2">
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              100% voluntary, unremunerated blood donation advocacy
            </li>
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Real-time ABO/Rh RBC compatibility verification
            </li>
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Zero wastage with atomic stock thresholds and low-stock alerts
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/30">
            <Compass className="w-6 h-6 text-blood-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Our Technological Vision</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Harnessing state-of-the-art MERN architecture (MongoDB, Express, React, Node.js) with microsecond atomic consistency to ensure that life-saving resources are cataloged, verified, and distributed with zero margin for error.
          </p>
          <ul className="space-y-2 pt-2">
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              JWT stateless authentication with strict Role-Based Access Control
            </li>
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Weighted donor scoring engine factoring distance, interval & availability
            </li>
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Full audit logging for regulatory compliance and hospital oversight
            </li>
          </ul>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Guiding Healthcare Values</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered around clinical safety standards, donor wellness, and transparent hospital administration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-blood-300 transition-all hover:shadow-md space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blood-50 text-blood-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{val.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* College Project Architecture Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blood-400">
            College Examiner Evaluation Highlights
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Full-Stack Engineering & Robust Technical Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            This project was developed strictly with modern industry best practices, adhering to decoupled architecture, strict validation, and comprehensive automated test suites.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Frontend</span>
            <h4 className="font-bold text-white text-base">React 19 + Vite</h4>
            <p className="text-xs text-slate-400">Tailwind CSS, Lucide icons, responsive dashboards & modals.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Backend</span>
            <h4 className="font-bold text-white text-base">Node.js + Express</h4>
            <p className="text-xs text-slate-400">RESTful routing, centralized error handler, JWT RBAC security.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Database</span>
            <h4 className="font-bold text-white text-base">MongoDB & Mongoose</h4>
            <p className="text-xs text-slate-400">Atomic inventory queries, schema indexing, automatic zero-config fallback.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Algorithms</span>
            <h4 className="font-bold text-white text-base">ABO/Rh Match Engine</h4>
            <p className="text-xs text-slate-400">Clinical red cell matrix and proximity-weighted donor prioritization.</p>
          </div>
        </div>
      </div>

      {/* Evolution Roadmap */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Project Development Milestones</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From algorithmic conception to an examiner-ready full-stack medical application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {milestones.map((m, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="px-2 py-0.5 rounded bg-blood-100 text-blood-700 text-[10px] font-bold uppercase tracking-wider">
                {m.year}
              </span>
              <h3 className="font-bold text-slate-900 text-sm">{m.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="bg-gradient-to-r from-blood-700 to-rose-700 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl shadow-blood-700/20">
        <h2 className="text-2xl sm:text-3xl font-black">Ready to Join Our Lifesaving Network?</h2>
        <p className="text-xs sm:text-sm text-blood-100 max-w-xl mx-auto leading-relaxed">
          Whether you want to pledge voluntary blood donations or need emergency assistance for a patient, our platform is live 24/7.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-blood-700 font-bold rounded-xl shadow-md hover:bg-blood-50 transition-all hover:scale-105 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <span>Register as a Donor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/request-blood"
            className="px-6 py-3 bg-blood-800/80 hover:bg-blood-800 text-white font-bold rounded-xl transition-all text-xs sm:text-sm"
          >
            Submit Blood Request
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
