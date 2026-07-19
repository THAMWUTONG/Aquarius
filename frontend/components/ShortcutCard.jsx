import React from 'react';

export default function ShortcutCard({ title, description }) {
  return (
    <button className="w-full text-left p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200 group transition-all duration-150 flex items-center justify-between gap-4">
      <div>
        <h4 className="font-semibold text-xs text-slate-800">{title}</h4>
        <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
      </div>
      <i className="fas fa-arrow-right text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all text-xs shrink-0"></i>
    </button>
  );
}