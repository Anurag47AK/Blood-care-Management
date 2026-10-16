import React, { useState } from 'react';
import { X, Check, Droplet, ShieldAlert, Info } from 'lucide-react';

const CompatibilityMatrixModal = ({ isOpen, onClose }) => {
  const [selectedGroup, setSelectedGroup] = useState('O-');

  if (!isOpen) return null;

  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const recipientCanReceiveFrom = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  };

  const donorCanGiveTo = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };

  const canReceive = recipientCanReceiveFrom[selectedGroup] || [];
  const canGive = donorCanGiveTo[selectedGroup] || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blood-100 flex items-center justify-center text-blood-600">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Red Blood Cell (RBC) Compatibility Guide
            </h2>
            <p className="text-xs text-slate-500">
              ABO & Rh D-Antigen Clinical Compatibility Standards
            </p>
          </div>
        </div>

        {/* Interactive Blood Selector */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Select a Blood Group to Test Compatibility:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {bloodGroups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedGroup(group)}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                  selectedGroup === group
                    ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30 scale-105'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-blood-300'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Patient / Recipient ({selectedGroup}):
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1">Can Receive RBC From:</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {canReceive.map((bg) => (
                  <span
                    key={bg}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    {bg}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Donor ({selectedGroup}):
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1">Can Safely Donate RBC To:</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {canGive.map((bg) => (
                  <span
                    key={bg}
                    className="px-2.5 py-1 bg-blood-50 text-blood-700 border border-blood-200 rounded-md text-xs font-bold flex items-center gap-1"
                  >
                    <Droplet className="w-3 h-3 text-blood-600 fill-current" />
                    {bg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Universal Donors & Recipients Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <span className="text-2xl">🩸</span>
            <div>
              <h4 className="text-sm font-bold text-rose-900">O Negative (O-) Universal Donor</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                O- red blood cells carry neither A, B, nor Rh antigens and can be given to patients of any blood type in emergencies.
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h4 className="text-sm font-bold text-blue-900">AB Positive (AB+) Universal Recipient</h4>
              <p className="text-xs text-blue-700 mt-0.5">
                AB+ patients have all A, B, and Rh antigens and can receive red blood cells of any compatible ABO/Rh group.
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Medical Disclaimer */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Official Medical Disclaimer:</strong> Blood matching on this platform is for screening and preliminary candidate discovery only. Final clinical eligibility, hemoglobin concentration, infectious disease screening (HIV, Hepatitis, Syphilis), and laboratory cross-matching are legally required and must be certified by certified blood bank personnel prior to transfusion.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityMatrixModal;
