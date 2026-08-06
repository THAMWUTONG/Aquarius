import React, { useState, useEffect } from 'react';
import { FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { getLecturerTopics, uploadMaterial } from '../services/lecturerContentService.jsx';
import PrerequisitePicker from '../components/PrerequisitePicker.jsx';

/**
 * Creates a study material: title, description, topic, type and the materials
 * that should be studied first.
 *
 * Materials carry no file attachment - they are metadata plus their place in
 * the dependency chain.
 */
function UploadMaterialModal({ isOpen, onClose, onMaterialUploaded, materials = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [topicId, setTopicId] = useState('');
  const [prerequisiteIds, setPrerequisiteIds] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    async function loadTopics() {
      try {
        const data = await getLecturerTopics();
        setTopics(data.topics);

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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFileType('pdf');
    setPrerequisiteIds([]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!topicId) {
      setError('Please choose a topic for this material.');
      return;
    }

    // uploaded_by is NOT sent: the server takes it from the session, so the
    // browser cannot claim to be creating material on another lecturer's behalf.
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file_type', fileType);
    formData.append('topic_id', topicId);
    // Comma-joined because multipart/form-data has no array type. The server
    // splits it back out; an empty selection sends an empty string, which it
    // reads as "no prerequisites".
    formData.append('prerequisite_ids', prerequisiteIds.join(','));

    try {
      setLoading(true);
      await uploadMaterial(formData);

      resetForm();
      if (onMaterialUploaded) onMaterialUploaded();
      onClose();
    } catch (err) {
      console.error('Upload Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            Add New Course Study Material
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              <FaExclamationCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Material Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Material Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Python Variables Slides"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g., Lecture slides for variables and data types."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Topic & Material Type Selection */}
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
                Material Type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="slides">Slides</option>
                <option value="video">Video</option>
                <option value="pdf">PDF Document</option>
                <option value="document">Word Document</option>
              </select>
            </div>
          </div>

          {/* Prerequisites: other study materials to be covered first */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Prerequisites <span className="text-slate-300 normal-case font-medium">(optional)</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Study materials a student should complete before this one. Pick as many as you need, or leave empty.
            </p>
            <PrerequisitePicker
              materials={materials}
              selectedIds={prerequisiteIds}
              onChange={setPrerequisiteIds}
            />
          </div>

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
              {loading ? 'Saving...' : 'Save Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadMaterialModal;
