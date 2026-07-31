import React from 'react';

export default function StatCard({ label, value, iconClass, color, bgColor }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 flex items-center gap-4 shadow-sm shadow-slate-100/40">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor} ${color}`}>
        <i className={`${iconClass} text-lg`}></i>
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}