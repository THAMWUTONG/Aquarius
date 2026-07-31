import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

// Course to Topics relational mapping based on database schema
const courseTopicsMap = {
  'Introduction to Programming': ['Variables & Data Types', 'If-else, loops, and logical operators', 'Defining reusable functions'],
  'Data Structures & Algorithms': ['Linear data structures', 'Bubble, merge, quick sort'],
  'Database Systems': ['ER Modelling', 'SQL Queries'],
  'Statistics for Data Science': ['Descriptive Statistics', 'Probability Distributions'],
  'Web Application Development': ['HTML & CSS Fundamentals', 'JavaScript Basics'],
};

function EditQuizModal({ isOpen, onClose, quiz, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    topic: '',
    questions: 0,
  });

  // Pre-fill form state when quiz object changes
  useEffect(() => {
    if (quiz) {
      setFormData({
        id: quiz.id,
        title: quiz.title || '',
        course: quiz.course || '',
        topic: quiz.topic || '',
        questions: quiz.questions || 0,
        comments: quiz.comments || 0,
      });
    }
  }, [quiz]);

  if (!isOpen || !quiz) return null;

  const handleCourseChange = (e) => {
    const selectedCourse = e.target.value;
    const availableTopics = courseTopicsMap[selectedCourse] || [];
    
    setFormData((prev) => ({
      ...prev,
      course: selectedCourse,
      topic: availableTopics[0] || '', // Auto-select first topic of selected course
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const availableTopics = courseTopicsMap[formData.course] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Edit Quiz</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleCourseChange}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
            >
              {Object.keys(courseTopicsMap).map((courseName) => (
                <option key={courseName} value={courseName}>
                  {courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Topic
            </label>
            <select
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
            >
              {availableTopics.map((topicName) => (
                <option key={topicName} value={topicName}>
                  {topicName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Number of Questions
            </label>
            <input
              type="number"
              name="questions"
              min="1"
              value={formData.questions}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-lg shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditQuizModal;