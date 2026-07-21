import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../components/Sidebar.jsx'; // Using your updated global Sidebar
import HeaderBar from '../components/HeaderBar.jsx';
import StatCard from '../components/StatCard.jsx';
import RosterTable from '../components/RoasterTable.jsx';
import ShortcutCard from '../components/ShortcutCard.jsx';
import SidebarNavItems from '../components/SidebarNavItems.jsx';

const statsData = [
  { id: 1, label: 'Enrolled Students', value: 15, iconClass: 'fas fa-users', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 2, label: 'Total Quizzes', value: 7, iconClass: 'fas fa-award', color: 'text-purple-500', bgColor: 'bg-purple-50' },
  { id: 3, label: 'Materials Uploaded', value: 16, iconClass: 'fas fa-folder-plus', color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  { id: 4, label: 'Student Reviews', value: 4, iconClass: 'fas fa-comment-alt', color: 'text-rose-500', bgColor: 'bg-rose-50' },
];

const studentsData = [
  { name: 'Alex Tan', email: 'alex.tan@aquarius.demo', classes: 'CS101, CS202, MA101', progress: 62, lastActive: '2026-07-18' },
  { name: 'Beatrice Ng', email: 'beatrice.ng@aquarius.demo', classes: 'CS101, CS204', progress: 83, lastActive: '2026-07-19' },
  { name: 'Charlie Koh', email: 'charlie.koh@aquarius.demo', classes: 'CS202, CS204', progress: 73, lastActive: '2026-07-17' },
  { name: 'David Lee', email: 'david.lee@aquarius.demo', classes: 'MA101, CS204', progress: 35, lastActive: '2026-07-14' },
  { name: 'Emily Tan', email: 'emily.tan@aquarius.demo', classes: 'CS101, CS202', progress: 75, lastActive: '2026-07-18' },
  { name: 'Fiona Chan', email: 'fiona.chan@aquarius.demo', classes: 'CS101, MA101', progress: 90, lastActive: '2026-07-16' },
  { name: 'George Wong', email: 'george.wong@aquarius.demo', classes: 'CS202, MA101', progress: 25, lastActive: '2026-07-12' },
  { name: 'Hannah Lim', email: 'hannah.lim@aquarius.demo', classes: 'CS204', progress: 90, lastActive: '2026-07-19' },
  { name: 'Ian Teh', email: 'ian.teh@aquarius.demo', classes: 'CS101, CS202, CS204', progress: 38, lastActive: '2026-07-15' },
];

const shortcutsData = [
  { title: 'Quiz Builder', description: 'Build new multiple choice assessments' },
  { title: 'Upload Lectures', description: 'Manage slides, pdfs, and prerequisites' },
  { title: 'Classroom Analytics', description: 'Review test averages and completions' },
];

function LecturerDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Locked Left Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar userName="Dr. Sarah Lim" userRole="lecturer" />

        <main className="flex-1 overflow-y-auto p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Lecturer Portal Dashboard</h2>
            <p className="text-xs text-slate-400 mt-1">Monitor classroom stats, update quizzes, and review feedback.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <StatCard key={stat.id} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2">
              <RosterTable students={studentsData} />
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm shadow-slate-100/40 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-2">Instructor Shortcuts</h3>
              <div className="space-y-3">
                {shortcutsData.map((shortcut, idx) => (
                  <ShortcutCard key={idx} {...shortcut} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LecturerDashboard;