import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import CreateQuizModal from '../components/CreateQuiz.jsx'; // 1. Import Modal
import EditQuizButton from '../components/EditQuizButton.jsx';
import EditQuizModal from './EditQuizModal.jsx';
import QuizFeedbackModal from './QuizFeedbackModal.jsx';
import { FaPlus, FaRegComment, FaTrashAlt, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { getLecturerQuizzes } from '../services/getLecturerQuizzes.jsx';
import { deleteQuiz } from '../services/lecturerContentService.jsx';

const initialQuizzes = [
  {
    id: 1,
    title: 'Variables Quiz',
    course: 'Introduction to Programming',
    topic: 'Variables & Data Types',
    questions: 5,
    comments: 1,
  },
  {
    id: 2,
    title: 'Control Flow Quiz',
    course: 'Introduction to Programming',
    topic: 'If-else, loops, and logical operators',
    questions: 5,
    comments: 1,
  },
  {
    id: 3,
    title: 'SQL Fundamentals Quiz',
    course: 'Database Systems',
    topic: 'SQL Queries',
    questions: 10,
    comments: 0,
  },
  {
    id: 4,
    title: 'Sorting Algorithms Quiz',
    course: 'Data Structures & Algorithms',
    topic: 'Bubble, merge, quick sort',
    questions: 5,
    comments: 0,
  },
  {
    id: 5,
    title: 'Probability Basics Quiz',
    course: 'Statistics for Data Science',
    topic: 'Probability Distributions',
    questions: 8,
    comments: 0,
  },
];

function ManageQuizzes() {
  const location = useLocation();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [isFallback, setIsFallback] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 2. Modal Open State
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [feedbackQuiz, setFeedbackQuiz] = useState(null);
  const [actionError, setActionError] = useState('');

  // Fetch updated list from PHP backend
  const fetchQuizzes = async () => {
    try {
      const data = await getLecturerQuizzes();
      setQuizzes(data.quizzes);
      setIsFallback(false);
    } catch (error) {
      // Keep initialQuizzes on screen, but flag it as sample data.
      console.error('Error loading quizzes:', error);
      setIsFallback(true);
    }
  };

  // Load the lecturer's real quizzes as soon as the page opens.
  useEffect(() => {
    async function loadQuizzes() {
      await fetchQuizzes();
    }

    loadQuizzes();
  }, [user]);

  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsModalOpen(true);

      // Clear state so refresh does not reopen modal
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Action Handlers
  const handleCreateQuiz = () => {
    setIsModalOpen(true);
  };

  const handleQuizCreated = () => {
    fetchQuizzes();
  };

  // Handlers
  const handleCommentClick = (quiz) => {
    setFeedbackQuiz(quiz);
  };

  const handleEditClick = (quiz) => {
    setEditingQuiz(quiz);
  };

  // Deletion removes the quiz's questions, attempts and feedback along with it
  // (ON DELETE CASCADE), so it is worth confirming before calling the API.
  const handleDeleteClick = async (quiz) => {
    const confirmed = window.confirm(
      `Delete "${quiz.title}"? This also removes its questions and any student attempts. This cannot be undone.`
    );
    if (!confirmed) return;

    setActionError('');

    try {
      await deleteQuiz(quiz.id);
      // Refetch rather than filtering local state: the old code dropped the row
      // from the table even when nothing was deleted on the server, so the quiz
      // reappeared on the next page load.
      await fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setActionError(error.message);
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar displayedTitle="Manage Quizzes" userName={user?.name || 'Dr. Sarah Lim'} userRole={user?.role || 'lecturer'} />

        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header Bar */}
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Create New Quiz</span>
            </button>
          </div>

          {/* Sample-data warning: only visible when the API could not be reached */}
          {isFallback && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium">
              <FaExclamationTriangle className="text-base shrink-0" />
              <span>Showing built-in sample data - could not reach the server. These rows are not from the database.</span>
            </div>
          )}

          {/* Failed delete/update, shown instead of silently doing nothing */}
          {actionError && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              <FaExclamationCircle className="text-base shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

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
                          <td className="py-4 px-6 font-semibold text-slate-800">{quiz.title}</td>
                          <td className="py-4 px-6 text-slate-700 font-medium">{quiz.course}</td>
                          <td className="py-4 px-6 text-slate-500">{quiz.topic}</td>
                          <td className="py-4 px-6 text-center font-medium text-slate-700">{quiz.questions}</td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">

                              {/* Functional Feedback / Comment Button */}
                              <button
                                onClick={() => handleCommentClick(quiz)}
                                title={hasComments ? `${quiz.comments} Comment(s)` : 'View feedback'}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                                  hasComments
                                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                                }`}
                              >
                                <FaRegComment className="text-xs" />
                                {hasComments && <span>{quiz.comments}</span>}
                              </button>

                              {/* Edit Button */}
                              <EditQuizButton quiz={quiz} onClick={handleEditClick} />

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteClick(quiz)}
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

      {/* Modals */}
      <CreateQuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onQuizCreated={handleQuizCreated}
      />

      <EditQuizModal
        quiz={editingQuiz}
        onClose={() => setEditingQuiz(null)}
        onQuizUpdated={fetchQuizzes}
      />

      <QuizFeedbackModal
        quiz={feedbackQuiz}
        onClose={() => setFeedbackQuiz(null)}
      />
    </div>
  );
}

export default ManageQuizzes;
