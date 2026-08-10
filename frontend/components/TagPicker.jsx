import { useEffect, useState } from 'react';
import { getLecturerTags } from '../services/lecturerContentService.jsx';

/**
 * Optional multi-select of the study tags to put on a material - the short
 * labels ("Python", "Beginner") students filter and scan by.
 *
 * The options are the lecturer's OWN tags, fetched here rather than passed in so
 * the upload and the edit modal can both drop the control in without either
 * maintaining its own copy of the list. Creating a tag is deliberately NOT part
 * of this control: tags live in Manage Study Tags, so the same label is reused
 * rather than retyped into a near-duplicate on every upload.
 *
 * `refreshKey` re-fetches when the parent knows the tag list changed (a tag was
 * created or renamed while a modal was open).
 *
 * Selection is held by the parent as an array of ids, which is what the modals
 * post as `tag_ids`.
 */
function TagPicker({ selectedIds, onChange, refreshKey = 0 }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        if (active) setError('Could not load your study tags.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTags();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const toggleTag = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        Study Tags <span className="text-slate-300">(optional)</span>
      </label>
      <p className="text-[11px] text-slate-400 mb-2">
        Labels students browse by - e.g. "Python" or "Beginner". Add or rename them
        under Manage Study Tags.
      </p>

      <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50 p-2">
        {loading ? (
          <p className="p-1 text-xs text-slate-400">Loading your study tags...</p>
        ) : error ? (
          <p className="p-1 text-xs text-rose-600">{error}</p>
        ) : tags.length === 0 ? (
          <p className="p-1 text-xs text-slate-400">
            No study tags yet - create one under Manage Study Tags.
          </p>
        ) : (
          // Chips rather than the prerequisites' checkbox rows: a tag is one
          // short word, so a wrapped row fits far more of them on screen.
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const isSelected = selectedIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <p className="mt-1.5 text-[11px] text-slate-500">
          {selectedIds.length} study tag{selectedIds.length === 1 ? '' : 's'} selected
        </p>
      )}
    </div>
  );
}

export default TagPicker;
