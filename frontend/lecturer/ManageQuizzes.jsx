import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import CreateQuizModal from '../components/CreateQuiz.jsx';
import EditQuizModal from '../components/EditQuizModal.jsx';
import EditQuizButton from '../components/EditQuizButton.jsx';
import QuizFeedbackModal from '../components/QuizFeedbackModal.jsx';
import { FaPlus, FaRegComment, FaTrashAlt } from 'react-icons/fa';

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
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEditQuiz, setSelectedEditQuiz] = useState(null);

  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedFeedbackQuiz, setSelectedFeedbackQuiz] = useState(null);

  // Handlers
  const handleCommentClick = (quiz) => {
    setSelectedFeedbackQuiz(quiz);
    setIsFeedbackOpen(true);
  };

  const handleCommentCountChange = (quizId, newCount) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, comments: newCount } : q))
    );
  };

  const handleEditClick = (quiz) => {
    setSelectedEditQuiz(quiz);
    setIsEditOpen(true);
  };

  const handleSaveEditedQuiz = (updatedQuiz) => {
    setQuizzes((prev) =>
      prev.map((item) => (item.id === updatedQuiz.id ? updatedQuiz : item))
    );
  };

  const handleDeleteClick = (quizId) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar userName="Dr. Sarah Lim" userRole="lecturer" />

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
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Create New Quiz</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
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
                              onClick={() => handleDeleteClick(quiz.id)}
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
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateQuizModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditQuizModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        quiz={selectedEditQuiz}
        onSave={handleSaveEditedQuiz}
      />

      <QuizFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        quiz={selectedFeedbackQuiz}
        onCommentCountChange={handleCommentCountChange}
      />
    </div>
  );
}

export default ManageQuizzes;