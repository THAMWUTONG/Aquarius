import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../components/Sidebar.jsx'; // Using your updated global Sidebar
import HeaderBar from '../components/HeaderBar.jsx';
import StatCard from '../components/StatCard.jsx';
import RosterTable from '../components/RoasterTable.jsx';
import ShortcutCard from '../components/ShortcutCard.jsx';
import SidebarNavItems from '../components/SidebarNavItems.jsx';
import Profile from '../pages/Profile.jsx';


function ManageQuizzes() {
    return (
<div className="flex min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Renders your modified shared Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar />
        <SidebarNavItems displayedText="Dashboard" />
        <SidebarNavItems displayedText="Manage Quizzes" />
        <SidebarNavItems displayedText="Manage Materials" />
        <SidebarNavItems displayedText="Monitor Performance" />
        <SidebarNavItems displayedText="Profile & Settings" />

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

export default ManageQuizzes;