import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Droplet,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  GitPullRequest,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  AlertTriangle,
  FileCheck2,
  PhoneCall
} from 'lucide-react';

const HowItWorksPage = () => {
  const [activeTab, setActiveTab] = useState('donor');

  const donorSteps = [
    {
      step: '01',
      title: 'Quick Voluntary Registration',
      desc: 'Create an account in 60 seconds with your blood group, contact number, and city. Health eligibility questions confirm you meet standard clinical criteria.',
      icon: UserCheck
    },
    {
      step: '02',
      title: 'Smart Availability Control',
      desc: 'You maintain full control. Toggle your availability ON when ready to donate, or OFF when busy or within the 90-day cooldown period.',
      icon: Clock
    },
    {
      step: '03',
      title: 'Instant Emergency Alerts',
      desc: 'When a nearby patient requests your compatible blood group, you receive an automated notification with hospital details and urgency level.',
      icon: Droplet
    },
    {
      step: '04',
      title: 'Hospital Verification & Badging',
      desc: 'Complete the donation at the certified center. Blood bank staff verify the record in the system, awarding you verified donor badges and updating your history.',
      icon: FileCheck2
    }
  ];

  const requesterSteps = [
    {
      step: '01',
      title: 'Submit Emergency Blood Request',
      desc: 'Specify the required blood group, number of units, hospital name, city, urgency level (Normal, Urgent, Emergency), and doctor contact.',
      icon: GitPullRequest
    },
    {
      step: '02',
      title: 'Algorithmic ABO/Rh Matching',
      desc: 'Our clinical engine scans for compatible donors using medical red blood cell rules and computes proximity scores to rank the best candidates.',
      icon: Search
    },
    {
      step: '03',
      title: 'Direct Donor Reachability',
      desc: 'View ranked compatible donors with live availability badges and direct contact buttons to coordinate immediate donation.',
      icon: PhoneCall
    },
    {
      step: '04',
      title: 'Hospital Stock Allocation',
      desc: 'If sufficient units exist in the blood bank inventory, administrators approve and fulfill the request atomically, guaranteeing zero duplicate allocation.',
      icon: Building2
    }
  ];

  const adminSteps = [
    {
      step: '01',
      title: 'Real-Time Inventory Surveillance',
      desc: 'Monitor blood stock across all 8 ABO/Rh blood groups. Automatic threshold indicators trigger alerts when units drop below minimum safe reserves.',
      icon: AlertTriangle
    },
    {
      step: '02',
      title: 'Atomic Multi-Document Transactions',
      desc: 'When fulfilling blood requests, inventory is deducted with strict database guards ($gte condition), ensuring stock levels can never become negative.',
      icon: Shield
    },
    {
      step: '03',
      title: 'Clinical Donation Verification',
      desc: 'Verify voluntary donations submitted by donors or entered by transfusion nurses, ensuring only screened and tested units enter the blood inventory.',
      icon: CheckCircle2
    },
    {
      step: '04',
      title: 'Comprehensive Audit Ledger',
      desc: 'Every administrative addition, deduction, approval, or user status update is recorded in an immutable audit log with IP, timestamp, and metadata.',
      icon: FileCheck2
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-50 border border-blood-200 text-blood-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          Seamless Ecosystem
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          How the Blood Care System Works
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          From the moment a patient requires urgent blood to the verified donation at the transfusion center, every stage is powered by real-time intelligence and clinical safety.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('donor')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'donor'
                ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>For Donors</span>
          </button>
          <button
            onClick={() => setActiveTab('requester')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'requester'
                ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>For Requesters & Patients</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>For Blood Banks & Admins</span>
          </button>
        </div>
      </div>

      {/* Steps Content Grid */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(activeTab === 'donor'
            ? donorSteps
            : activeTab === 'requester'
            ? requesterSteps
            : adminSteps
          ).map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-blood-300 transition-all hover:shadow-md relative space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-blood-600/40 font-mono">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blood-50 text-blood-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Tab-Specific Action Footer */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              {activeTab === 'donor' && 'Ready to register as a lifesaving blood donor?'}
              {activeTab === 'requester' && 'Need blood immediately for surgery or emergency care?'}
              {activeTab === 'admin' && 'Authorized blood bank staff or college examiner?'}
            </h4>
            <p className="text-xs text-slate-500">
              {activeTab === 'donor' && 'Takes under 2 minutes. You can pause availability anytime.'}
              {activeTab === 'requester' && 'Direct matching with all compatible blood types in your city.'}
              {activeTab === 'admin' && 'Access real-time inventory controls and verified logs.'}
            </p>
          </div>
          <div>
            {activeTab === 'donor' && (
              <Link
                to="/register?role=donor"
                className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blood-600/20 inline-flex items-center gap-1.5"
              >
                <span>Register as Donor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {activeTab === 'requester' && (
              <Link
                to="/request-blood"
                className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blood-600/20 inline-flex items-center gap-1.5"
              >
                <span>Submit Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {activeTab === 'admin' && (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ABO/Rh Compatibility Engine Explanation */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blood-600">
            Scientific Foundation
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            The Algorithmic ABO/Rh Compatibility Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Red blood cell compatibility is determined by surface antigens A, B, and Rh factor (D). Receiving mismatched blood causes acute hemolytic transfusion reactions. Our system computes mathematically verified donor compatibility before notifying candidates:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-blood-700 uppercase">Universal RBC Donor</span>
            <div className="text-2xl font-black text-slate-900">O- (O Negative)</div>
            <p className="text-xs text-slate-600">Can donate red cells to ALL 8 blood groups.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-blood-700 uppercase">Universal RBC Recipient</span>
            <div className="text-2xl font-black text-slate-900">AB+ (AB Positive)</div>
            <p className="text-xs text-slate-600">Can safely receive red cells from ALL 8 blood groups.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-blood-700 uppercase">Multi-Criteria Scoring</span>
            <div className="text-2xl font-black text-slate-900">100 Pts Scale</div>
            <p className="text-xs text-slate-600">Ranks exact matches, city proximity, and days since last donation.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-blood-700 uppercase">Safety Deferral</span>
            <div className="text-2xl font-black text-slate-900">90-Day Rule</div>
            <p className="text-xs text-slate-600">Automatically excludes donors who donated within the last 3 months.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
