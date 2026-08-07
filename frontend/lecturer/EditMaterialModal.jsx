import React, { useState, useEffect } from 'react';
import { FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { getLecturerTopics, updateMaterial } from '../services/lecturerContentService.jsx';
import PrerequisitePicker from '../components/PrerequisitePicker.jsx';

/**
 * Edits a material's title, description, topic and prerequisites.
 *
 * The attached file is not replaceable here - swapping the file under an
 * existing row would silently change what students already downloaded. To
 * change the file, upload a new material and delete the old one.
 */
function EditMaterialModal({ material, onClose, onMaterialUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState('');
  const [prerequisiteIds, setPrerequisiteIds] = useState([]);

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!material) return;

    setTitle(material.title ?? '');
    setDescription(material.description ?? '');
    // The table row already carries the current prerequisites as {id, title},
    // so the picker can be pre-ticked without a second round trip.
    setPrerequisiteIds((material.prerequisites ?? []).map((item) => item.id));
    setError('');

    async function loadTopics() {
      try {
        const data = await getLecturerTopics();
        setTopics(data.topics);

        const current = data.topics.find((t) => t.topic === material.topic);
        setTopicId(String(current?.id ?? data.topics[0]?.id ?? ''));
      } catch (err) {
        console.error('Error loading topics:', err);
        setError('Could not load your topics. Please refresh and try again.');
      }
    }

    loadTopics();
  }, [material]);

  if (!material) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await updateMaterial(material.id, {
        title,
        description,
        topic_id: parseInt(topicId, 10),
        // Always sent, including as '[]': omitting the field tells the server
        // to leave the existing prerequisites alone, which would make it
        // impossible to clear the last one.
        prerequisite_ids: JSON.stringify(prerequisiteIds),
      });

      if (onMaterialUpdated) onMaterialUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating material:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">

        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Edit Material Details</h3>
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
              Material Title
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
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all resize-none"
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

          <PrerequisitePicker
            key={material.id}
            selectedIds={prerequisiteIds}
            onChange={setPrerequisiteIds}
            excludeId={material.id}
          />

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

export default EditMaterialModal;
