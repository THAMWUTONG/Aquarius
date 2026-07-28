import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaExclamationCircle } from 'react-icons/fa';
import { getLecturerTopics, createQuiz } from '../services/lecturerContentService.jsx';

const blankQuestion = () => ({
  id: crypto.randomUUID(),
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'Option A',
  score: 1,
  explanation: '',
});

function CreateQuiz({ isOpen, onClose, onQuizCreated }) {
  // Main Quiz Info State matching table columns
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState('');
  const [durationMin, setDurationMin] = useState(15);
  const [isPublished, setIsPublished] = useState(true);

  // Dynamic Assessment Questions State
  const [questions, setQuestions] = useState([blankQuestion()]);

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Topics are loaded when the modal opens rather than on mount: the component
  // stays rendered while closed, and refetching on open picks up any course
  // changes without a page reload.
  useEffect(() => {
    if (!isOpen) return;

    async function loadTopics() {
      try {
        const data = await getLecturerTopics();
        setTopics(data.topics);

        // Preselect so the dropdown never shows a blank row that submits as 0.
        if (data.topics.length > 0) {
          setTopicId((current) => current || String(data.topics[0].id));
        }
      } catch (err) {
        console.error('Error loading topics:', err);
        setError('Could not load your topics. Please refresh and try again.');
      }
    }

    loadTopics();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([...questions, blankQuestion()]);
  };

  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) {
      setError('A quiz must have at least one question.');
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDurationMin(15);
    setIsPublished(true);
    setQuestions([blankQuestion()]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!topicId) {
      setError('Please choose a topic for this quiz.');
      return;
    }

    // Data payload structured specifically to match DB columns
    const payload = {
      title,
      description,
      topic_id: parseInt(topicId, 10),
      duration_min: parseInt(durationMin, 10),
      is_published: isPublished ? 1 : 0,
      questions,
    };

    try {
      setLoading(true);
      await createQuiz(payload);

      resetForm();
      if (onQuizCreated) onQuizCreated();
      onClose();
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Create New Assessment Quiz</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Server-side validation and save errors */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              <FaExclamationCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quiz Title & Topic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Variables Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>

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
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              required
              rows={2}
              placeholder="Test your understanding of Python variables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>

          {/* Duration and Publication Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400 cursor-pointer"
              />
              <label htmlFor="isPublished" className="text-xs font-bold text-slate-600 cursor-pointer">
                Publish immediately
              </label>
            </div>
          </div>

          <hr className="border-slate-100 my-2" />

          {/* Assessment Questions Header */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assessment Questions
            </h4>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors"
            >
              <FaPlus className="text-[10px]" />
              <span>Add Question</span>
            </button>
          </div>

          {/* Questions List */}
          {questions.map((q, index) => (
            <div key={q.id} className="p-5 border border-slate-200/80 rounded-2xl bg-slate-50/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  Question #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="text-xs font-medium text-rose-400 hover:text-rose-600 transition-colors"
                >
                  Remove Question
                </button>
              </div>

              <input
                type="text"
                required
                placeholder="Write the question text..."
                value={q.questionText}
                onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-sky-500 transition-all"
              />

              {/* Options A, B, C, D. Only A and B are required - a question with
                  two choices is valid, and blank boxes are dropped on save. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-3">{opt}</span>
                    <input
                      type="text"
                      required={opt === 'A' || opt === 'B'}
                      placeholder={opt === 'A' || opt === 'B' ? `Option ${opt}` : `Option ${opt} (optional)`}
                      value={q[`option${opt}`]}
                      onChange={(e) => handleQuestionChange(q.id, `option${opt}`, e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Correct Option, Marks & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Correct Option
                  </label>
                  <select
                    value={q.correctOption}
                    onChange={(e) => handleQuestionChange(q.id, 'correctOption', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-400/80 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Option A">Option A</option>
                    <option value="Option B">Option B</option>
                    <option value="Option C">Option C</option>
                    <option value="Option D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Marks
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={q.score}
                    onChange={(e) => handleQuestionChange(q.id, 'score', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Answer Explanation
                  </label>
                  <input
                    type="text"
                    placeholder="Provide why the answer is correct..."
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-sky-500 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
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
              disabled={loading || topics.length === 0}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateQuiz;
