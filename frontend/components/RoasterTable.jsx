import React from 'react';

function RosterTable({ students = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm shadow-slate-100/40">
      {/* Table Header / Title */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
          Classroom Enrollment Roster
        </h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              <th className="pb-3 pr-4">Student Name</th>
              <th className="pb-3 px-4">Programme</th>
              <th className="pb-3 pl-4 text-right">Intake</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {students.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-6 text-center text-slate-400">
                  No enrolled students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.studentId || student.email} className="hover:bg-slate-50/50 transition-colors">
                  {/* Student Name & Email */}
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-slate-800">{student.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{student.email}</div>
                  </td>

                  {/* Programme - students.programme */}
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {student.programme || '—'}
                  </td>

                  {/* Intake - students.intake */}
                  <td className="py-3.5 pl-4 text-right font-medium text-slate-500">
                    {student.intake || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RosterTable;