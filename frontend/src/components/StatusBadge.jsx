import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || 'Pending').toLowerCase();

  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
    eligible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ineligible: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const currentStyle = styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
