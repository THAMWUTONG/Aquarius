import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { getLecturerPerformanceData } from '../services/getLecturerPerformanceData.jsx';

// Sample gradebook shown until the first fetch resolves, and kept on screen
// (behind the warning banner) when the API cannot be reached.
const initialGradebook = [
  { id: 1, name: 'Alex Tan', email: 'alex.tan@aquarius.demo', attempts: 1, avgScore: '88%', quizScore: '100%' },
  { id: 2, name: 'Beatrice Ng', email: 'beatrice.ng@aquarius.demo', attempts: 0, avgScore: '72%', quizScore: '—' },
  { id: 3, name: 'Emily Tan', email: 'emily.tan@aquarius.demo', attempts: 0, avgScore: '65%', quizScore: '—' },
  { id: 4, name: 'Fiona Chan', email: 'fiona.chan@aquarius.demo', attempts: 0, avgScore: '80%', quizScore: '—' },
  { id: 5, name: 'Ian Teh', email: 'ian.teh@aquarius.demo', attempts: 0, avgScore: '—', quizScore: '—' },
];

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

function MonitorPerformance() {
  const { user } = useAuth();
  const [gradebook, setGradebook] = useState(initialGradebook);
  const [scoreAverages, setScoreAverages] = useState(scoreAveragesData);
  const [completionRates, setCompletionRates] = useState(completionRatesData);
  const [isFallback, setIsFallback] = useState(false);

  // Filter options come from the API; '' means "no filter" for both.
  const [filterOptions, setFilterOptions] = useState({ courses: [], quizzes: [] });
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');

  // Pull the three analytics datasets from one endpoint.
  // API values are mapped onto the shapes the charts and table already use,
  // so no JSX below needs to change. Scores stay a dash when a student has
  // never attempted a quiz - showing '0%' would wrongly imply they sat and failed.
  // Refetches whenever a filter changes: the gradebook is narrowed server-side
  // so the attempt counts and best scores stay correct for the selection,
  // which client-side filtering of already-aggregated rows could not do.
  useEffect(() => {
    async function fetchPerformanceData() {
      try {
        const data = await getLecturerPerformanceData({
          courseId: selectedCourse,
          quizId: selectedQuiz,
        });

        if (data.filters) {
          setFilterOptions(data.filters);
        }

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
            avgScore: student.avgScore === null ? '—' : `${student.avgScore}%`,
            quizScore: student.bestScore === null ? '—' : `${student.bestScore}%`,
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
  }, [user, selectedCourse, selectedQuiz]);

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] antialiased">
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
            {/* Table Header & Dropdown Filters */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Classroom Gradebook
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filter by course and quiz to view student attempts.
                </p>
              </div>

              {/* Cascading Dropdowns */}
              <div className="flex flex-wrap items-center gap-3">
                {/* First Dropdown: Course Selection */}
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    // The chosen quiz may belong to a different course, which
                    // would combine into a filter matching nothing. Clearing it
                    // keeps the two dropdowns consistent.
                    setSelectedQuiz('');
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  <option value="">All courses</option>
                  {filterOptions.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>

                {/* Second Dropdown: Quiz Title Selection */}
                <select
                  value={selectedQuiz}
                  onChange={(e) => setSelectedQuiz(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  <option value="">All quizzes</option>
                  {filterOptions.quizzes
                    .filter((quiz) => !selectedCourse || String(quiz.courseId) === String(selectedCourse))
                    .map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Student Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6 text-center">Attempts</th>
                    <th className="py-4 px-6 text-right">Average Score</th>
                    <th className="py-4 px-6 text-right">Quiz Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {gradebook.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">
                        No enrolled students match this selection.
                      </td>
                    </tr>
                  )}
                  {gradebook.map((student) => {
                    // A dash means the student never sat a quiz, so the score is
                    // greyed out rather than presented as a real result.
                    const hasAvg = student.avgScore !== '—';
                    const hasAttempted = student.quizScore !== '—';
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

                        {/* Attempts */}
                        <td className="py-4 px-6 text-center font-medium text-slate-700">
                          {student.attempts}
                        </td>

                        {/* Average Score */}
                        <td className={`py-4 px-6 text-right font-medium ${
                          hasAvg ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          {student.avgScore}
                        </td>

                        {/* Quiz Score */}
                        <td className={`py-4 px-6 text-right font-bold ${
                          hasAttempted ? 'text-emerald-600' : 'text-slate-300 font-normal'
                        }`}>
                          {student.quizScore}
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