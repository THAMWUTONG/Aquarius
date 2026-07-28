import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { getLecturerPerformanceData } from '../services/getLecturerPerformanceData.jsx';

// Sample chart data - easy to connect to dynamic backend calculations later
const scoreAveragesData = [
  { course: 'CS101', average: 100 },
  { course: 'CS202', average: 50 },
  { course: 'MA101', average: 83 },
  { course: 'CS204', average: 0 },
];

const completionRatesData = [
  { topic: 'HTML Basics', rate: 14 },
  { topic: 'CSS Layouts', rate: 14 },
  { topic: 'SQL Basics', rate: 14 },
  { topic: 'Database Normalization', rate: 14 },
  { topic: 'Limits & Continuity', rate: 14 },
  { topic: 'Derivatives Basics', rate: 14 },
];

// Sample gradebook data
const initialGradebook = [
  {
    id: 1,
    name: 'Alex Tan',
    email: 'alex.tan@aquarius.demo',
    status: 'Passed',
    attempts: 1,
    bestScore: '100%',
  },
  {
    id: 2,
    name: 'Beatrice Ng',
    email: 'beatrice.ng@aquarius.demo',
    status: 'No Attempt',
    attempts: 0,
    bestScore: '—',
  },
  {
    id: 3,
    name: 'Emily Tan',
    email: 'emily.tan@aquarius.demo',
    status: 'No Attempt',
    attempts: 0,
    bestScore: '—',
  },
  {
    id: 4,
    name: 'Fiona Chan',
    email: 'fiona.chan@aquarius.demo',
    status: 'No Attempt',
    attempts: 0,
    bestScore: '—',
  },
  {
    id: 5,
    name: 'Ian Teh',
    email: 'ian.teh@aquarius.demo',
    status: 'No Attempt',
    attempts: 0,
    bestScore: '—',
  },
];

function MonitorPerformance() {
  const { user } = useAuth();
  const [gradebook, setGradebook] = useState(initialGradebook);
  const [scoreAverages, setScoreAverages] = useState(scoreAveragesData);
  const [completionRates, setCompletionRates] = useState(completionRatesData);
  const [isFallback, setIsFallback] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('Introduction to Web Development');
  const [selectedQuiz, setSelectedQuiz] = useState('HTML5 Semantic Elements Quiz');

  // Pull the three analytics datasets from one endpoint.
  // API values are mapped onto the shapes the charts and table already use,
  // so no JSX below needs to change. bestScore stays a dash when a student has
  // never attempted a quiz - showing '0%' would wrongly imply they sat and failed.
  useEffect(() => {
    async function fetchPerformanceData() {
      try {
        const data = await getLecturerPerformanceData();

        setScoreAverages(
          data.courseAverages.map((item) => ({
            course: item.course,
            average: item.average,
          }))
        );

        setCompletionRates(
          data.topicCompletion.map((item) => ({
            topic: item.topic,
            rate: item.rate,
          }))
        );

        setGradebook(
          data.gradebook.map((student) => ({
            id: student.studentId,
            name: student.name,
            email: student.email,
            status: student.status,
            attempts: student.attempts,
            bestScore: student.bestScore === null ? '—' : `${student.bestScore}%`,
          }))
        );

        setIsFallback(false);
      } catch (error) {
        // Keep the sample charts and gradebook on screen, but flag them.
        console.error('Error loading performance analytics:', error);
        setIsFallback(true);
      }
    }

    fetchPerformanceData();
  }, [user]);

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Locked Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar displayedTitle="Monitor Performance" userName={user?.name || 'Dr. Sarah Lim'} userRole={user?.role || 'lecturer'} />

        <main className="flex-1 overflow-y-auto p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Student Performance Analytics
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Monitor classroom score averages and quiz completion statistics.
            </p>
          </div>

          {/* Sample-data warning: only visible when the API could not be reached */}
          {isFallback && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium">
              <FaExclamationTriangle className="text-base shrink-0" />
              <span>Showing built-in sample data - could not reach the server. These figures are not from the database.</span>
            </div>
          )}

          {/* Top Analytics Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Class Score Averages per Course */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6">
                Class Score Averages per Course
              </h3>
              
              <div className="relative h-64 flex items-end justify-between px-4 pt-6 border-b border-l border-slate-200">
                {/* Y-Axis Guidelines */}
                <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 flex justify-start text-[10px] text-slate-400 pl-1">- 100</div>
                <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100 flex justify-start text-[10px] text-slate-400 pl-1">- 75</div>
                <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100 flex justify-start text-[10px] text-slate-400 pl-1">- 50</div>
                <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100 flex justify-start text-[10px] text-slate-400 pl-1">- 25</div>

                {/* Bars */}
                {scoreAverages.map((item) => (
                  <div key={item.course} className="flex flex-col items-center flex-1 z-10 h-full justify-end">
                    <div
                      style={{ height: `${item.average}%` }}
                      className="w-10 bg-sky-500 rounded-t transition-all duration-300"
                    ></div>
                    <span className="text-[11px] font-medium text-slate-500 mt-3">
                      {item.course}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Quiz Completion Rates (%) */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6">
                Quiz Completion Rates (%)
              </h3>

              <div className="relative h-64 flex items-end justify-between px-2 pt-6 border-b border-l border-slate-200">
                {/* Y-Axis Guidelines */}
                <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 flex justify-start text-[10px] text-slate-400 pl-1">- 100</div>
                <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100 flex justify-start text-[10px] text-slate-400 pl-1">- 75</div>
                <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100 flex justify-start text-[10px] text-slate-400 pl-1">- 50</div>
                <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100 flex justify-start text-[10px] text-slate-400 pl-1">- 25</div>

                {/* Bars */}
                {completionRates.map((item) => (
                  <div key={item.topic} className="flex flex-col items-center flex-1 z-10 h-full justify-end">
                    <div
                      style={{ height: `${item.rate}%` }}
                      className="w-6 bg-indigo-300/80 rounded-t transition-all duration-300"
                    ></div>
                    <span className="text-[10px] font-medium text-slate-500 mt-3 truncate max-w-[70px] text-center" title={item.topic}>
                      {item.topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Classroom Gradebook Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            {/* Table Filter Controls */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Classroom Gradebook
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filter by course and quiz to view student attempts.
                </p>
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  <option value="Introduction to Web Development">Introduction to Web Development</option>
                  <option value="Database Systems">Database Systems</option>
                  <option value="Calculus I">Calculus I</option>
                </select>

                <select
                  value={selectedQuiz}
                  onChange={(e) => setSelectedQuiz(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  <option value="HTML5 Semantic Elements Quiz">HTML5 Semantic Elements Quiz</option>
                  <option value="Flexbox & CSS Grid Mastery">Flexbox & CSS Grid Mastery</option>
                </select>
              </div>
            </div>

            {/* Student Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Attempts</th>
                    <th className="py-4 px-6 text-right">Best Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {gradebook.map((student) => {
                    const isPassed = student.status === 'Passed';
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Student Name & Email */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800">
                            {student.name}
                          </div>
                          <div className="text-xs text-slate-400 font-normal">
                            {student.email}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${
                              isPassed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>

                        {/* Attempts */}
                        <td className="py-4 px-6 text-center font-medium text-slate-700">
                          {student.attempts}
                        </td>

                        {/* Best Score */}
                        <td className={`py-4 px-6 text-right font-bold ${
                          isPassed ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          {student.bestScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MonitorPerformance;