import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../components/Sidebar.jsx'; // Using your updated global Sidebar
import HeaderBar from '../components/HeaderBar.jsx';
import StatCard from '../components/StatCard.jsx';
import RosterTable from '../components/RoasterTable.jsx';
import ShortcutCard from '../components/ShortcutCard.jsx';
import { getLecturerDashboardData } from '../services/getLecturerDashboardData.jsx';

// Presentation config only. The numbers come from the API; these describe how
// each stat is LABELLED and COLOURED, keyed by the field name in stats.
const statCardConfig = [
  { key: 'totalStudents', label: 'Enrolled Students', iconClass: 'fas fa-users', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { key: 'totalQuizzes', label: 'Total Quizzes', iconClass: 'fas fa-award', color: 'text-purple-500', bgColor: 'bg-purple-50' },
  { key: 'totalMaterials', label: 'Materials Uploaded', iconClass: 'fas fa-folder-plus', color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  { key: 'totalFeedback', label: 'Student Reviews', iconClass: 'fas fa-comment-alt', color: 'text-rose-500', bgColor: 'bg-rose-50' },
];

// Static navigation, not data - safe to keep in the component.
const shortcutsData = [
  { title: 'Quiz Builder', description: 'Build new multiple choice assessments', to: '/manage-quizzes' },
  { title: 'Upload Lectures', description: 'Manage slides, pdfs, and prerequisites', to: '/manage-materials' },
  { title: 'Classroom Analytics', description: 'Review test averages and completions', to: '/monitor-performance' },
];

function LecturerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'lecturer') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchLecturerDashboardData() {
      try {
        const data = await getLecturerDashboardData();
        setDashboardData(data);
      }
      catch (error) {
        alert(error.message);
      }
      finally {
        setLoading(false);
      }
    }

    fetchLecturerDashboardData();
  }, [user]);

  if (!user || user.role !== 'lecturer' || loading || !dashboardData) {
    return null;
  }

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Locked Left Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar displayedTitle="Lecturer Dashboard" userName={user.name} userRole={user.role} />

        <main className="flex-1 overflow-y-auto p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Lecturer Portal Dashboard</h2>
            <p className="text-xs text-slate-400 mt-1">Monitor classroom stats, update quizzes, and review feedback.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCardConfig.map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={dashboardData.stats[stat.key]}
                iconClass={stat.iconClass}
                color={stat.color}
                bgColor={stat.bgColor}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2">
              <RosterTable students={dashboardData.roster} />
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm shadow-slate-100/40 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-2">Instructor Shortcuts</h3>
              <div className="space-y-3">
                {shortcutsData.map((shortcut) => (
                  <ShortcutCard
                    key={shortcut.to}
                    title={shortcut.title}
                    description={shortcut.description}
                    onClick={() => navigate(shortcut.to)}
                  />
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
