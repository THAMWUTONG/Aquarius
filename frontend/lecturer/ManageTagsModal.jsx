import { useState, useEffect } from 'react';
import {
  FaTimes,
  FaPlus,
  FaPen,
  FaTrashAlt,
  FaCheck,
  FaExclamationCircle,
} from 'react-icons/fa';
import {
  getLecturerTags,
  createTag,
  updateTag,
  deleteTag,
} from '../services/lecturerContentService.jsx';

/**
 * Create, rename and delete the lecturer's own study tags.
 *
 * Every row here belongs to the logged-in lecturer - the endpoint never returns
 * anyone else's tag, and refuses to write to one - so no ownership check is
 * needed in this file.
 *
 * `onTagsChanged` fires after every successful write so the materials table can
 * refetch: renaming or deleting a tag changes what its Study Tag column shows.
 *
 * Mounted only while open (the parent renders it conditionally) rather than
 * mounted-and-hidden, so every open starts from clean state without an effect
 * having to reset half a dozen fields.
 */
function ManageTagsModal({ onClose, onTagsChanged }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Which row is in rename mode, and the text being typed into it. Held here
  // rather than per row so only one rename can be open at a time.
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Bumped after every successful write to re-run the fetch below. The list is
  // always re-read from the server rather than patched in place, so a rename
  // that collided, or a delete someone else already made, cannot leave a stale
  // row on screen.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Guards against a state update after the modal has already closed.
    let active = true;

    async function loadTags() {
      try {
        const data = await getLecturerTags();
        if (!active) return;
        setTags(data.tags);
      } catch (err) {
        console.error('Error loading study tags:', err);
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTags();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  // Every write follows the same shape: clear the last error, call the API,
  // refresh the list, and tell the parent the tags moved.
  const runWrite = async (write) => {
    setError('');

    try {
      await write();
      setRefreshKey((key) => key + 1);
      if (onTagsChanged) onTagsChanged();
      return true;
    } catch (err) {
      console.error('Study tag write failed:', err);
      setError(err.message);
      return false;
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const name = newName.trim();
    if (!name) {
      setError('A tag name is required.');
      return;
    }

    setCreating(true);
    const ok = await runWrite(() => createTag(name));
    if (ok) setNewName('');
    setCreating(false);
  };

  const startRename = (tag) => {
    setError('');
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const handleRename = async (tag) => {
    const name = editingName.trim();

    // Nothing typed, or nothing changed - close the row instead of sending a
    // write the server would only reject or no-op.
    if (!name || name === tag.name) {
      setEditingId(null);
      return;
    }

    setSavingId(tag.id);
    const ok = await runWrite(() => updateTag(tag.id, name));
    if (ok) setEditingId(null);
    setSavingId(null);
  };

  const handleDelete = async (tag) => {
    // Deleting cascades onto study_material_tags, so say how many materials
    // lose the tag before it happens - it cannot be undone.
    const usage =
      tag.materialCount > 0
        ? ` It will be removed from ${tag.materialCount} material${tag.materialCount === 1 ? '' : 's'}.`
        : '';

    const confirmed = window.confirm(
      `Delete the study tag "${tag.name}"?${usage} This cannot be undone.`
    );
    if (!confirmed) return;

    await runWrite(() => deleteTag(tag.id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Manage Study Tags</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Your own tags - other lecturers cannot see or edit them.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              <FaExclamationCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Create */}
          <form onSubmit={handleCreate}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              New Study Tag
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={100}
                placeholder="e.g., Python"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FaPlus className="text-[10px]" />
                <span>{creating ? 'Adding...' : 'Add Tag'}</span>
              </button>
            </div>
          </form>

          {/* List */}
          <div>
            <p className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Your Study Tags
            </p>

            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {loading ? (
                <p className="p-4 text-xs text-slate-400">Loading your study tags...</p>
              ) : tags.length === 0 ? (
                <p className="p-4 text-xs text-slate-400">
                  No study tags yet. Add one above to start tagging your materials.
                </p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors"
                  >
                    {editingId === tag.id ? (
                      <input
                        type="text"
                        autoFocus
                        maxLength={100}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleRename(tag);
                          }
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-sky-500"
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <span className="inline-block max-w-full truncate px-2.5 py-0.5 rounded-full text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100">
                          {tag.name}
                        </span>
                        <span className="block mt-0.5 text-[10px] text-slate-400">
                          {tag.materialCount === 0
                            ? 'Not used yet'
                            : `Used on ${tag.materialCount} material${tag.materialCount === 1 ? '' : 's'}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      {editingId === tag.id ? (
                        <>
                          <button
                            onClick={() => handleRename(tag)}
                            disabled={savingId === tag.id}
                            title="Save Tag Name"
                            className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <FaCheck className="text-xs" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            title="Cancel"
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startRename(tag)}
                            title="Rename Tag"
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            <FaPen className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag)}
                            title="Delete Tag"
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageTagsModal;
