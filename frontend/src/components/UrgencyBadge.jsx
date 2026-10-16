import React from 'react';
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';

const UrgencyBadge = ({ urgency }) => {
  const norm = (urgency || 'Normal').toLowerCase();

  if (norm === 'critical') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blood-100 text-blood-700 border border-blood-300 animate-pulse-subtle">
        <AlertCircle className="w-3.5 h-3.5 text-blood-600" />
        Critical Urgent
      </span>
    );
  }

  if (norm === 'urgent') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Urgent
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      Normal
    </span>
  );
};

export default UrgencyBadge;
