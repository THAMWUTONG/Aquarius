import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import { FaPlus, FaRegComment, FaEdit, FaTrashAlt } from 'react-icons/fa';

// Sample initial state - easy to replace with backend data later
const initialQuizzes = [
  {
    id: 1,
    title: 'HTML5 Semantic Elements Quiz',
    course: 'CS101',
    topic: 'HTML Basics',
    questions: 3,
    comments: 1,
  },
  {
    id: 2,
    title: 'Flexbox & CSS Grid Mastery',
    course: 'CS101',
    topic: 'CSS Layouts',
    questions: 2,
    comments: 1,
  },
  {
    id: 3,
    title: 'Introductory SQL Querying',
    course: 'CS202',
    topic: 'SQL Basics',
    questions: 2,
    comments: 0,
  },
  {
    id: 4,
    title: 'Advanced Join Operations & Aggregations',
    course: 'CS202',
    topic: 'SQL Joins & Aggregations',
    questions: 3,
    comments: 1,
  },
  {
    id: 5,
    title: 'Relational Normalization Forms',
    course: 'CS202',
    topic: 'Database Normalization',
    questions: 2,
    comments: 0,
  },
  {
    id: 6,
    title: 'Limits & Continuity Quiz',
    course: 'MA101',
    topic: 'Limits & Continuity',
    questions: 2,
    comments: 1,
  },
  {
    id: 7,
    title: 'Differentiation Rules Practice',
    course: 'MA101',
    topic: 'Derivatives Basics',
    questions: 2,
    comments: 0,
  },
];

function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState(initialQuizzes);

  // Action Handlers
  const handleCreateQuiz = () => {
    console.log('Open Create Quiz Modal/Page');
  };

  const handleCommentClick = (quiz) => {
    console.log('View comments for quiz:', quiz);
  };

  const handleEditClick = (quiz) => {
    console.log('Edit quiz:', quiz);
  };

  const handleDeleteClick = (quizId) => {
    console.log('Delete quiz with ID:', quizId);
    // setQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Locked Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar userName="Dr. Sarah Lim" userRole="lecturer" />

        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header & Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Manage Classroom Quizzes
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add, update, or remove knowledge tests and check student feedback.
              </p>
            </div>

            <button 
              onClick={handleCreateQuiz}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Create New Quiz</span>
            </button>
          </div>

          {/* Quizzes Table */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            {quizzes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No quizzes available. Click "Create New Quiz" to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      <th className="py-4 px-6">Quiz Title</th>
                      <th className="py-4 px-6">Course</th>
                      <th className="py-4 px-6">Topic</th>
                      <th className="py-4 px-6 text-center">Questions</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {quizzes.map((quiz) => {
                      const hasComments = quiz.comments > 0;
                      return (
                        <tr key={quiz.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Title */}
                          <td className="py-4 px-6 font-semibold text-slate-800">
                            {quiz.title}
                          </td>

                          {/* Course */}
                          <td className="py-4 px-6 text-slate-600 font-medium">
                            {quiz.course}
                          </td>

                          {/* Topic */}
                          <td className="py-4 px-6 text-slate-500">
                            {quiz.topic}
                          </td>

                          {/* Question Count */}
                          <td className="py-4 px-6 text-center font-medium text-slate-700">
                            {quiz.questions}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              {/* Comment Button */}
                              <button
                                onClick={() => handleCommentClick(quiz)}
                                title={hasComments ? `${quiz.comments} Comment(s)` : 'No comments'}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                                  hasComments
                                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <FaRegComment className="text-xs" />
                                {hasComments && <span>{quiz.comments}</span>}
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditClick(quiz)}
                                title="Edit Quiz"
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                              >
                                <FaEdit className="text-xs" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteClick(quiz.id)}
                                title="Delete Quiz"
                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
                              >
                                <FaTrashAlt className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ManageQuizzes;