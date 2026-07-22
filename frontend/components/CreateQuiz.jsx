import React, {useState} from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';


function CreateQuiz({ isOpen, onClose, onQuizCreated }) {
  // Main Quiz Info State
  const [quizTitle, setQuizTitle] = useState('');
  const [courseTarget, setCourseTarget] = useState('Introduction to Web Development');
  const [topicTag, setTopicTag] = useState('');

  // Dynamic Assessment Questions State
  const [questions, setQuestions] = useState([
    {
      id: 1,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'Option A',
      explanation: '',
    },
  ]);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Add a new blank question block
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'Option A',
        explanation: '',
      },
    ]);
  };

  // Remove a question block
  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) {
      alert('A quiz must have at least one question!');
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Handle updates to specific question fields
  const handleQuestionChange = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  // Submit Handler to PHP Backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: quizTitle,
      course: courseTarget,
      topic: topicTag,
      questions: questions,
    };

    try {
      setLoading(true);
      
      // Update with your PHP backend URL later (e.g., http://localhost/api/create_quiz.php)
      const response = await fetch('http://localhost/api/create_quiz.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (onQuizCreated) onQuizCreated();
        onClose();
      } else {
        // Fallback demo behavior if backend endpoint is not created yet
        console.log('Quiz Created Data Payload:', payload);
        if (onQuizCreated) onQuizCreated();
        onClose();
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      // Demo fallback so UI responds even without PHP running
      if (onQuizCreated) onQuizCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fixed Modal Backdrop
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            Create New Assessment Quiz
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top Inputs: Quiz Title & Course Target */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                QUIZ TITLE
              </label>
              <input
                type="text"
                required
                placeholder="e.g., HTML5 Semantic Elements Quiz"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                COURSE TARGET
              </label>
              <select
                value={courseTarget}
                onChange={(e) => setCourseTarget(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Introduction to Web Development">Introduction to Web Development</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Calculus I">Calculus I</option>
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              </select>
            </div>
          </div>

          {/* Topic Tag Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              TOPIC TAG
            </label>
            <input
              type="text"
              required
              placeholder="e.g., HTML Basics"
              value={topicTag}
              onChange={(e) => setTopicTag(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>

          <hr className="border-slate-100 my-2" />

          {/* Assessment Questions Header */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ASSESSMENT QUESTIONS
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

          {/* Dynamic Question List */}
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

              {/* Question Text */}
              <input
                type="text"
                required
                placeholder="Write the question text..."
                value={q.questionText}
                onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-sky-500 transition-all"
              />

              {/* Multiple Choice Options (A, B, C, D Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-3">A</span>
                  <input
                    type="text"
                    required
                    placeholder="Option A"
                    value={q.optionA}
                    onChange={(e) => handleQuestionChange(q.id, 'optionA', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-3">B</span>
                  <input
                    type="text"
                    required
                    placeholder="Option B"
                    value={q.optionB}
                    onChange={(e) => handleQuestionChange(q.id, 'optionB', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-3">C</span>
                  <input
                    type="text"
                    required
                    placeholder="Option C"
                    value={q.optionC}
                    onChange={(e) => handleQuestionChange(q.id, 'optionC', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-3">D</span>
                  <input
                    type="text"
                    required
                    placeholder="Option D"
                    value={q.optionD}
                    onChange={(e) => handleQuestionChange(q.id, 'optionD', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Correct Option Dropdown & Answer Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    CORRECT OPTION
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

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    ANSWER EXPLANATION
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
              disabled={loading}
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