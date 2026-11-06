import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const s = String(status).toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['ACTIVE', 'APPROVED', 'VERIFIED', 'COMPLETED', 'PASSED', 'READY_FOR_COLLECTION', 'WELL_STOCKED'].includes(s)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['PENDING', 'UNDER_REVIEW', 'SUBMITTED', 'IN_PROGRESS', 'UPCOMING', 'LOW_SUPPLY'].includes(s)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['REJECTED', 'BLOCKED', 'EXPIRED', 'DISCARDED', 'CRITICAL_SHORTAGE', 'EMERGENCY'].includes(s)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['BLOOD_ASSIGNED', 'CONFIRMED', 'AVAILABLE'].includes(s)) {
    styles = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (['CANCELLED', 'SUSPENDED'].includes(s)) {
    styles = 'bg-gray-100 text-gray-700 border-gray-300';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses} ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {s.replace(/_/g, ' ')}
    </span>
  );
}
