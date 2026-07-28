import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrashAlt, FaCommentDots } from 'react-icons/fa';

// Mock feedback mapped per quiz id
const initialFeedbackData = {
  1: [
    {
      id: 101,
      studentName: 'Alex Tan',
      studentAvatar: 'AT',
      comment: 'Question 3 had a slight typo in the Python syntax example.',
      createdAt: '2026-03-24 14:32',
    },
  ],
  2: [
    {
      id: 102,
      studentName: 'Siti Nurhaliza',
      studentAvatar: 'SN',
      comment: 'Could we get more practice questions on nested loops?',
      createdAt: '2026-03-25 09:15',
    },
  ],
};

function QuizFeedbackModal({ isOpen, onClose, quiz, onCommentCountChange }) {
  const [feedbackList, setFeedbackList] = useState([]);

  // Load feedback for the specific quiz when opened
  useEffect(() => {
    if (quiz) {
      const items = initialFeedbackData[quiz.id] || [];
      setFeedbackList(items);
    }
  }, [quiz]);

  if (!isOpen || !quiz) return null;

  const handleDeleteComment = (commentId) => {
    const updatedList = feedbackList.filter((item) => item.id !== commentId);
    setFeedbackList(updatedList);
    
    // Update local dictionary
    initialFeedbackData[quiz.id] = updatedList;

    // Notify parent to update comment count in table badge
    if (onCommentCountChange) {
      onCommentCountChange(quiz.id, updatedList.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Student Feedback & Comments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {quiz.title} • <span className="font-medium text-slate-600">{quiz.course}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Comment List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {feedbackList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
              <FaCommentDots className="text-3xl text-slate-300" />
              <p className="text-sm font-medium">No feedback submitted for this quiz yet.</p>
            </div>
          ) : (
            feedbackList.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {item.studentAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {item.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.comment}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteComment(item.id)}
                  title="Delete comment"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0 cursor-pointer"
                >
                  <FaTrashAlt className="text-xs" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizFeedbackModal;