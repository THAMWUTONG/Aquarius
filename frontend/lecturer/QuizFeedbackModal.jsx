import React, { useState, useEffect } from 'react';
import { FaTimes, FaRegComment } from 'react-icons/fa';
import { getQuizFeedback } from '../services/lecturerContentService.jsx';

/**
 * Shows the student comments left on one quiz.
 *
 * The comment button on the quizzes table used to only console.log, so the
 * comment count was visible but the comments themselves were unreachable.
 */
function QuizFeedbackModal({ quiz, onClose }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quiz) return;

    let cancelled = false;

    async function loadFeedback() {
      setLoading(true);
      setError('');

      try {
        const data = await getQuizFeedback(quiz.id);
        // Guard against a late response from a previously opened quiz
        // overwriting the comments of the one now on screen.
        if (!cancelled) setFeedback(data.feedback);
      } catch (err) {
        console.error('Error loading quiz feedback:', err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [quiz]);

  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden my-8">

        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800 truncate">Student Comments</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{quiz.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading comments...</p>
          ) : error ? (
            <p className="text-xs text-rose-600 text-center py-6">{error}</p>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FaRegComment className="mx-auto text-2xl mb-2 opacity-40" />
              <p className="text-xs">No students have commented on this quiz yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {feedback.map((item) => (
                <li key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-xs font-bold text-slate-700">{item.studentName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.submittedAt}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizFeedbackModal;
