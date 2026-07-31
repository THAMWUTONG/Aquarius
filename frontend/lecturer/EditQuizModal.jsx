import React, { useState, useEffect } from 'react';
import { FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { getLecturerTopics, updateQuiz } from '../services/lecturerContentService.jsx';

/**
 * Edits a quiz's details. Questions are not edited here - reworking a quiz's
 * questions after students have already attempted it would invalidate their
 * recorded scores, so that needs its own deliberate flow.
 */
function EditQuizModal({ quiz, onClose, onQuizUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState('');
  const [durationMin, setDurationMin] = useState(15);
  const [isPublished, setIsPublished] = useState(true);

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refill the form whenever a different quiz is opened, otherwise the modal
  // would keep showing the previously edited quiz's values.
  useEffect(() => {
    if (!quiz) return;

    setTitle(quiz.title ?? '');
    setDescription(quiz.description ?? '');
    setDurationMin(quiz.durationMin ?? 15);
    setIsPublished(Boolean(quiz.isPublished));
    setError('');

    async function loadTopics() {
      try {
        const data = await getLecturerTopics();
        setTopics(data.topics);

        // Match the quiz's current topic by title, since the list endpoint
        // returns topic names rather than ids.
        const current = data.topics.find((t) => t.topic === quiz.topic);
        setTopicId(String(current?.id ?? data.topics[0]?.id ?? ''));
      } catch (err) {
        console.error('Error loading topics:', err);
        setError('Could not load your topics. Please refresh and try again.');
      }
    }

    loadTopics();
  }, [quiz]);

  if (!quiz) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await updateQuiz(quiz.id, {
        title,
        description,
        topic_id: parseInt(topicId, 10),
        duration_min: parseInt(durationMin, 10),
        is_published: isPublished ? 1 : 0,
      });

      if (onQuizUpdated) onQuizUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating quiz:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">

        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Edit Quiz Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              <FaExclamationCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Topic
              </label>
              <select
                required
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
              >
                {topics.length === 0 ? (
                  <option value="">No topics available</option>
                ) : (
                  Object.entries(
                    topics.reduce((groups, topic) => {
                      (groups[topic.course] ||= []).push(topic);
                      return groups;
                    }, {})
                  ).map(([course, courseTopics]) => (
                    <optgroup key={course} label={course}>
                      {courseTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.topic}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                required
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="editIsPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400 cursor-pointer"
            />
            <label htmlFor="editIsPublished" className="text-xs font-bold text-slate-600 cursor-pointer">
              Published
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditQuizModal;
