import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet,
  Heart,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const DonateBloodInfoPage = () => {
  const eligibilityCriteria = [
    { label: 'Age Requirement', desc: 'Between 18 and 65 years old.' },
    { label: 'Body Weight', desc: 'Minimum 45 kg (100 lbs) for a standard 350-450 mL donation.' },
    { label: 'Donation Interval', desc: 'At least 90 days (3 months) since your last whole blood donation.' },
    { label: 'Hemoglobin Level', desc: 'Minimum 12.5 g/dL checked prior to donation.' },
    { label: 'Blood Pressure', desc: 'Systolic 100-140 mmHg, Diastolic 60-90 mmHg.' },
    { label: 'General Health', desc: 'Free of active colds, fever, flu, or recent surgical procedures.' }
  ];

  const deferrals = [
    'Recent tattoo or body piercing within the last 6 months',
    'Major surgery within the last 6 to 12 months',
    'Pregnancy or currently breastfeeding within the last 6 months',
    'History of viral hepatitis B/C, HIV, or cardiac disorders',
    'Antibiotic therapy completed within the last 7 days'
  ];

  const mythsAndFacts = [
    {
      myth: 'Donating blood makes you physically weak or sick.',
      fact: 'False. Your body replaces the donated plasma fluid within 24 to 48 hours, and red blood cells are fully replenished in 4 to 6 weeks.'
    },
    {
      myth: 'It takes a long time and is painful.',
      fact: 'False. The actual blood collection takes only 8 to 10 minutes. The slight needle pinch lasts less than a second.'
    },
    {
      myth: 'You can contract an infection or disease while donating blood.',
      fact: 'False. All needles, blood bags, and collection kits are 100% sterile, single-use, and disposed of immediately according to international biohazard protocols.'
    },
    {
      myth: 'Vegetarians cannot donate blood because their iron is too low.',
      fact: 'False. Many vegetarians have excellent iron levels from lentils, leafy greens, and legumes. Hemoglobin is checked on-site beforehand.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-50 text-blood-700 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-current" />
          Voluntary Blood Donation Guide
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Give the Gift of Life: Everything You Need to Know
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Every two seconds, someone needs blood for surgery, cancer therapy, or trauma recovery. A single blood donation can save up to three lives.
        </p>
      </div>

      {/* Donation Journey 4 Steps */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center">
          The 4-Step Donation Journey (Takes Just 30 Minutes!)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="w-8 h-8 rounded-full bg-blood-600 text-white font-black text-sm flex items-center justify-center mx-auto">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Quick Registration</h3>
            <p className="text-xs text-slate-600">
              Provide basic personal identification and complete a private confidential health questionnaire.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="w-8 h-8 rounded-full bg-blood-600 text-white font-black text-sm flex items-center justify-center mx-auto">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Mini Health Check</h3>
            <p className="text-xs text-slate-600">
              A trained nurse checks your pulse, blood pressure, temperature, and a tiny prick to verify hemoglobin.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="w-8 h-8 rounded-full bg-blood-600 text-white font-black text-sm flex items-center justify-center mx-auto">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Painless Donation</h3>
            <p className="text-xs text-slate-600">
              Relax in a comfortable reclining chair for 8 to 10 minutes while approximately 350 mL is collected.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="w-8 h-8 rounded-full bg-blood-600 text-white font-black text-sm flex items-center justify-center mx-auto">
              4
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Rest & Refreshments</h3>
            <p className="text-xs text-slate-600">
              Enjoy complimentary fruit juice and snacks for 10-15 minutes before heading back to your routine!
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-50/60 p-6 sm:p-8 rounded-3xl border border-emerald-200 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <h3 className="text-lg font-black">Who CAN Donate</h3>
          </div>
          <p className="text-xs text-emerald-700">
            If you meet these standard clinical prerequisites, you are eligible to register:
          </p>
          <ul className="space-y-3">
            {eligibilityCriteria.map((item) => (
              <li key={item.label} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-900 block">{item.label}</strong>
                  <span className="text-slate-600">{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-50/60 p-6 sm:p-8 rounded-3xl border border-rose-200 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-800">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <h3 className="text-lg font-black">Temporary or Permanent Deferrals</h3>
          </div>
          <p className="text-xs text-rose-700">
            You may need to wait before donating if any of the following apply:
          </p>
          <ul className="space-y-3">
            {deferrals.map((text, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0"></span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Myths vs Facts */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Busting Common Blood Donation Myths</h2>
          <p className="text-xs text-slate-600">
            Medical facts versus popular misconceptions about whole blood donation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mythsAndFacts.map((item, index) => (
            <div key={index} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Myth</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm">"{item.myth}"</p>
              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-emerald-700 font-bold text-xs uppercase tracking-wide block mb-0.5">
                  Medical Fact
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{item.fact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blood-700 to-rose-700 text-white p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl shadow-blood-700/20">
        <h2 className="text-2xl sm:text-3xl font-black">Become Someone's Hero Today</h2>
        <p className="text-xs sm:text-sm text-blood-100 max-w-xl mx-auto leading-relaxed">
          Sign up as a registered voluntary donor. It takes 2 minutes and can mean the difference between life and death for an emergency patient in your neighborhood.
        </p>
        <div className="pt-2">
          <Link
            to="/register?role=donor"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-blood-700 font-bold rounded-xl shadow-md hover:bg-blood-50 transition-all hover:scale-105 text-sm"
          >
            <span>Register as a Blood Donor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonateBloodInfoPage;
