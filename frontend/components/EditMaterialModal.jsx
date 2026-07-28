import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

// Course to Topics relational mapping matching your database schema
const courseTopicsMap = {
  'Introduction to Programming': [
    'Variables & Data Types',
    'If-else, loops, and logical operators',
    'Defining reusable functions',
  ],
  'Data Structures & Algorithms': [
    'Linear data structures',
    'Bubble, merge, quick sort',
  ],
  'Database Systems': [
    'ER Modelling',
    'SQL Queries',
  ],
  'Statistics for Data Science': [
    'Descriptive Statistics',
    'Probability Distributions',
  ],
};

const materialTypes = ['SLIDES', 'VIDEO', 'PDF', 'DOCUMENT', 'LINK'];

function EditMaterialModal({ isOpen, onClose, material, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    course: '',
    topic: '',
    type: 'SLIDES',
    prerequisites: '—',
  });

  // Load existing material details when modal opens
  useEffect(() => {
    if (material) {
      setFormData({
        id: material.id,
        title: material.title || '',
        course: material.course || '',
        topic: material.topic || '',
        type: material.type || 'SLIDES',
        prerequisites: material.prerequisites || '—',
      });
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const handleCourseChange = (e) => {
    const selectedCourse = e.target.value;
    const availableTopics = courseTopicsMap[selectedCourse] || [];

    setFormData((prev) => ({
      ...prev,
      course: selectedCourse,
      topic: availableTopics[0] || '', // Auto-select first available topic
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800">Edit Study Material</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Material Title
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
              >
                {materialTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Prerequisites
              </label>
              <input
                type="text"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                placeholder="e.g. 1 topics or —"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMaterialModal;