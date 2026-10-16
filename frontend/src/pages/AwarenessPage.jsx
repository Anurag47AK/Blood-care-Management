import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Droplet,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Activity,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';

const AwarenessPage = () => {
  // Interactive Eligibility Checker state
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [daysSinceDonation, setDaysSinceDonation] = useState('');
  const [hasInfection, setHasInfection] = useState(false);
  const [recentSurgery, setRecentSurgery] = useState(false);
  const [recentTattoo, setRecentTattoo] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const checkEligibility = (e) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);
    const daysNum = daysSinceDonation ? parseInt(daysSinceDonation, 10) : 100;

    const reasons = [];

    if (isNaN(ageNum) || ageNum < 18) {
      reasons.push('Donors must be at least 18 years old.');
    } else if (ageNum > 65) {
      reasons.push('Donors over 65 require explicit physician authorization.');
    }

    if (isNaN(weightNum) || weightNum < 45) {
      reasons.push('Minimum body weight requirement is 45 kg (100 lbs).');
    }

    if (daysSinceDonation && daysNum < 90) {
      reasons.push(`A minimum of 90 days must elapse between whole blood donations (${90 - daysNum} days remaining).`);
    }

    if (hasInfection) {
      reasons.push('Must be free of acute active infections, cold, fever, or flu.');
    }
    if (recentSurgery) {
      reasons.push('Major surgery deferral period is typically 6 to 12 months.');
    }
    if (recentTattoo) {
      reasons.push('Body piercings or tattoos require a 6-month clinical deferral.');
    }
    if (isPregnant) {
      reasons.push('Pregnant or breastfeeding individuals are deferred for 6 months postpartum.');
    }

    if (reasons.length === 0) {
      setEligibilityResult({
        eligible: true,
        message: 'Congratulations! You meet all baseline medical criteria to donate blood today.'
      });
    } else {
      setEligibilityResult({
        eligible: false,
        reasons
      });
    }
  };

  const components = [
    {
      name: 'Red Blood Cells (RBC)',
      shelfLife: '42 Days',
      storage: '1°C to 6°C',
      usage: 'Trauma accidents, major surgery, chronic anemia, severe blood loss.',
      icon: Droplet,
      color: 'text-blood-600 bg-blood-50 border-blood-200'
    },
    {
      name: 'Platelets (Thrombocytes)',
      shelfLife: '5 Days',
      storage: '20°C to 24°C (Constant Agitation)',
      usage: 'Cancer therapy patients, leukemia, clotting disorders, organ transplants.',
      icon: Activity,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      name: 'Plasma (Liquid Fraction)',
      shelfLife: '1 Year (Frozen)',
      storage: '-18°C or colder',
      usage: 'Burn victims, shock, severe liver disease, immune deficiencies.',
      icon: ShieldCheck,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      name: 'Cryoprecipitate',
      shelfLife: '1 Year (Frozen)',
      storage: '-18°C or colder',
      usage: 'Hemophilia, von Willebrand disease, massive bleeding control.',
      icon: Heart,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-50 border border-blood-200 text-blood-700 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-current" />
          Public Health Education
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Blood Donation Awareness & Clinical Eligibility
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Learn how whole blood donations are processed into lifesaving components and check your personal eligibility in real time before visiting a blood donation drive.
        </p>
      </div>

      {/* Interactive Eligibility Checker */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blood-600 text-white flex items-center justify-center shadow-md shadow-blood-600/25">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Interactive Donor Eligibility Checker
            </h2>
            <p className="text-xs text-slate-500">
              Instant clinical self-assessment based on standard Transfusion Medicine protocols.
            </p>
          </div>
        </div>

        <form onSubmit={checkEligibility} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Age (Years) *
              </label>
              <input
                type="number"
                min="10"
                max="100"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 24"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Weight (in kg) *
              </label>
              <input
                type="number"
                min="30"
                max="250"
                step="0.5"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 68"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Days Since Last Donation
              </label>
              <input
                type="number"
                min="0"
                value={daysSinceDonation}
                onChange={(e) => setDaysSinceDonation(e.target.value)}
                placeholder="Leave blank if first time"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Health Conditions & Temporary Deferrals (Select all that apply):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasInfection}
                  onChange={(e) => setHasInfection(e.target.checked)}
                  className="rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Currently experiencing cold, flu, fever, or active infection</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recentSurgery}
                  onChange={(e) => setRecentSurgery(e.target.checked)}
                  className="rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Underwent major dental or surgical procedure in last 6 months</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recentTattoo}
                  onChange={(e) => setRecentTattoo(e.target.checked)}
                  className="rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Got a tattoo or body piercing within past 6 months</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Currently pregnant or delivered a child in past 6 months</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-md shadow-blood-600/25 transition-all text-xs sm:text-sm"
            >
              Evaluate My Eligibility
            </button>
            <span className="text-[11px] text-slate-500">
              * Note: A quick on-site fingerstick hemoglobin check is also performed at the blood center before collection.
            </span>
          </div>
        </form>

        {/* Assessment Result */}
        {eligibilityResult && (
          <div
            className={`p-6 rounded-2xl border transition-all ${
              eligibilityResult.eligible
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {eligibilityResult.eligible ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-2">
                <h3 className="font-bold text-base">
                  {eligibilityResult.eligible
                    ? 'Eligible to Donate Blood'
                    : 'Temporary Deferral Detected'}
                </h3>
                {eligibilityResult.eligible ? (
                  <p className="text-xs text-emerald-800">{eligibilityResult.message}</p>
                ) : (
                  <ul className="space-y-1 list-disc list-inside text-xs text-rose-800">
                    {eligibilityResult.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
                {eligibilityResult.eligible && (
                  <div className="pt-2">
                    <Link
                      to="/register?role=donor"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      <span>Register as a Donor Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Blood Components Breakdown */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            One Donation, Four Lifesaving Components
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Whole blood is centrifuged into individual components so each patient receives precisely what their medical condition requires.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {components.map((comp, idx) => {
            const Icon = comp.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${comp.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{comp.name}</h3>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p>
                      <strong>Shelf Life:</strong> {comp.shelfLife}
                    </p>
                    <p>
                      <strong>Storage:</strong> {comp.storage}
                    </p>
                    <p className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                      {comp.usage}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre & Post Donation Care Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Before You Donate (Preparation)
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Drink 500 mL of water or fruit juice 15-30 minutes prior to collection.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Eat an iron-rich meal (spinach, lentils, beans, whole grains); avoid fatty foods.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Get 7 to 8 hours of restorative sleep the night before.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Bring a valid government-issued photo ID (driving license, passport, voter ID).</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blood-500"></span>
            After You Donate (Recovery)
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
              <span>Rest in the recovery lounge for 10-15 minutes and enjoy light snacks.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
              <span>Keep the bandage on your arm clean and dry for at least 4 to 6 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
              <span>Avoid heavy lifting, gym workouts, or strenuous physical exertion for 24 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
              <span>Increase fluid intake over the next 48 hours to quickly replenish plasma volume.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AwarenessPage;
