import React from 'react';

export default function RosterTable({ students }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm shadow-slate-100/40">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Classroom Enrollment Roster</h3>
        <div className="relative">
          <select className="appearance-none bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600 pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:border-slate-300 cursor-pointer">
            <option>All Enrolled Classes</option>
          </select>
          <i className="fas fa-chevron-down text-slate-400 text-[10px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase border-b border-slate-100 pb-3">
              <th className="pb-3 font-semibold">Student Name</th>
              <th className="pb-3 font-semibold">Active Classes</th>
              <th className="pb-3 font-semibold w-40">Avg Progress</th>
              <th className="pb-3 font-semibold text-right">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700">
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No students are enrolled in your courses yet.
                </td>
              </tr>
            )}
            {students.map((student, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 pr-4">
                  <p className="font-semibold text-slate-800">{student.name}</p>
                  <p className="text-[11px] text-slate-400 font-normal">{student.email}</p>
                </td>
                <td className="py-3.5 text-slate-500 font-medium pr-4">{student.classes}</td>
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-700 min-w-[28px] text-right">{student.progress}%</span>
                  </div>
                </td>
                <td className="py-3.5 text-right font-medium text-slate-400">{student.lastActive ?? 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}