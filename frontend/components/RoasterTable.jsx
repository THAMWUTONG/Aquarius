import React from 'react';

function RosterTable({ students }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm shadow-slate-100/40">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
          Classroom Enrollment Roster
        </h3>
        <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 outline-none cursor-pointer">
          <option>All Enrolled Classes</option>
          <option>CS101</option>
          <option>CS202</option>
          <option>CS204</option>
          <option>MA101</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-bold">Student Name</th>
              <th className="pb-3 font-bold">Active Classes</th>
              <th className="pb-3 font-bold text-right">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {students.map((student, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 pr-4">
                  <div className="font-semibold text-slate-800">{student.name}</div>
                  <div className="text-[11px] text-slate-400">{student.email}</div>
                </td>
                <td className="py-3.5 pr-4 font-medium text-slate-600">
                  {student.classes}
                </td>
                <td className="py-3.5 text-right font-medium text-slate-400">
                  {student.lastActive}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RosterTable;