import React from 'react';

/**
 * Renders a quizzes.regulation_status / study_materials.regulation_status value.
 *
 * Quizzes allow 'flagged' and materials do not, so every value from both enums
 * is covered here rather than in each table. An unrecognised value still
 * renders - in slate, and with the raw text - because silently showing nothing
 * would hide a status the lecturer needs to act on.
 */
const STATUS_STYLES = {
  approved: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  pending: 'text-amber-600 bg-amber-50 border-amber-100',
  rejected: 'text-rose-600 bg-rose-50 border-rose-100',
  flagged: 'text-orange-600 bg-orange-50 border-orange-100',
};

function StatusBadge({ status }) {
  if (!status) {
    return <span className="text-slate-300 font-medium">—</span>;
  }

  const key = String(status).toLowerCase();
  const style = STATUS_STYLES[key] || 'text-slate-500 bg-slate-100/80 border-slate-200/60';

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${style}`}
    >
      {key}
    </span>
  );
}

export default StatusBadge;
