import React, { useState } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

const samplePrerequisites = [
  { id: 'cs101_html', code: '[CS101]', name: 'HTML Basics' },
  { id: 'cs101_css', code: '[CS101]', name: 'CSS Layouts' },
  { id: 'cs101_js', code: '[CS101]', name: 'JS Fundamentals' },
  { id: 'cs101_dom', code: '[CS101]', name: 'DOM Manipulation' },
  { id: 'cs202_relational', code: '[CS202]', name: 'Relational Model' },
  { id: 'cs202_sql', code: '[CS202]', name: 'SQL Basics' },
  { id: 'cs202_joins', code: '[CS202]', name: 'SQL Joins & Aggregations' },
  { id: 'cs202_norm', code: '[CS202]', name: 'Database Normalization' },
];

function UploadMaterialModal({ isOpen, onClose, onMaterialUploaded }) {
  const [formData, setFormData] = useState({
    title: '',
    courseTarget: 'CS101',
    topicName: '',
    materialType: 'PDF Document',
    file: null,
    coreContent: '',
    prerequisites: [],
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrereqChange = (id) => {
    setFormData((prev) => {
      const exists = prev.prerequisites.includes(id);
      return {
        ...prev,
        prerequisites: exists
          ? prev.prerequisites.filter((pId) => pId !== id)
          : [...prev.prerequisites, id],
      };
    });
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFormData((prev) => ({ ...prev, file: selectedFile }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send data to PHP backend
      const response = await fetch('http://localhost/api/upload_material.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        if (onMaterialUploaded) onMaterialUploaded();
        onClose();
      } else {
        console.error('Failed to upload material');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Upload New Course Study Material
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Row 1: Material Title & Course Target */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Material Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Understanding Normalization (1NF, 2NF, 3NF)"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Course Target
              </label>
              <select
                name="courseTarget"
                value={formData.courseTarget}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer"
              >
                <option value="CS101">Introduction to Web Development</option>
                <option value="CS202">Database Systems</option>
                <option value="MA101">Calculus I</option>
              </select>
            </div>
          </div>

          {/* Row 2: Topic Name, Material Type, File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Topic Name
              </label>
              <input
                type="text"
                name="topicName"
                value={formData.topicName}
                onChange={handleChange}
                placeholder="e.g., Database Normalization"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Material Type
              </label>
              <select
                name="materialType"
                value={formData.materialType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer"
              >
                <option value="PDF Document">PDF Document</option>
                <option value="Slide Deck">Slide Deck</option>
                <option value="Notes">Notes / Article</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                File Upload (Cosmetic)
              </label>
              <label className="flex items-center justify-between w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="truncate">
                  {formData.file ? formData.file.name : 'Pick file...'}
                </span>
                <FaPlus className="text-slate-400 text-xs shrink-0" />
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Row 3: Core Content Text */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Core Content Text (For AI Chatbot Grounding)
            </label>
            <textarea
              name="coreContent"
              value={formData.coreContent}
              onChange={handleChange}
              rows={4}
              placeholder="Paste the core text explanations of the lecture notes or document here..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-y"
            ></textarea>
          </div>

          {/* Row 4: Define Prerequisites */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Define Prerequisites (Other Course Modules)
            </label>
            <div className="p-4 border border-slate-200 rounded-xl bg-white max-h-48 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {samplePrerequisites.map((prereq) => (
                  <label
                    key={prereq.id}
                    className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={formData.prerequisites.includes(prereq.id)}
                      onChange={() => handlePrereqChange(prereq.id)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <span>
                      <strong className="text-sky-600 font-bold mr-1">
                        {prereq.code}
                      </strong>
                      {prereq.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadMaterialModal;