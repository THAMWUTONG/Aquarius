import React, { useEffect, useState } from 'react';
import { getLecturerMaterials } from '../services/getLecturerMaterials.jsx';

/**
 * Optional multi-select of the study materials a student should revise before
 * the current one - Chapter 1 is a prerequisite of Chapter 2.
 *
 * The options are the lecturer's OWN materials, fetched here rather than passed
 * in so both the upload and the edit modal can drop the control in without each
 * maintaining its own copy of the list. `excludeId` keeps the material being
 * edited out of its own option list; the server rejects a self-reference too,
 * but offering it as a tickable box would be a trap.
 *
 * Selection is held by the parent as an array of ids, which is exactly what the
 * modals post as `prerequisite_ids`.
 */
function PrerequisitePicker({ selectedIds, onChange, excludeId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Guards against a state update after the modal has already closed.
    let active = true;

    async function loadMaterials() {
      try {
        const data = await getLecturerMaterials();
        if (!active) return;
        setMaterials(data.materials.filter((item) => item.id !== excludeId));
      } catch (err) {
        console.error('Error loading prerequisite options:', err);
        if (active) setError('Could not load your other materials.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMaterials();

    return () => {
      active = false;
    };
  }, [excludeId]);

  const toggleMaterial = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id]
    );
  };

  const groupedByCourse = Object.entries(
    materials.reduce((groups, material) => {
      (groups[material.course] ||= []).push(material);
      return groups;
    }, {})
  );

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        Prerequisites <span className="text-slate-300">(optional)</span>
      </label>
      <p className="text-[11px] text-slate-400 mb-2">
        Materials a student should revise first - e.g. tick "Chapter 1" while adding "Chapter 2".
      </p>

      <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
        {loading ? (
          <p className="p-3 text-xs text-slate-400">Loading your materials...</p>
        ) : error ? (
          <p className="p-3 text-xs text-rose-600">{error}</p>
        ) : groupedByCourse.length === 0 ? (
          <p className="p-3 text-xs text-slate-400">
            No other materials yet - nothing to set as a prerequisite.
          </p>
        ) : (
          groupedByCourse.map(([course, courseMaterials]) => (
            <div key={course} className="border-b border-slate-100 last:border-b-0">
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {course}
              </p>
              {courseMaterials.map((material) => (
                <label
                  key={material.id}
                  className="flex items-start gap-2.5 px-3 py-1.5 hover:bg-white transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(material.id)}
                    onChange={() => toggleMaterial(material.id)}
                    className="mt-0.5 accent-sky-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700 leading-snug">
                    {material.title}
                    <span className="block text-[10px] font-normal text-slate-400">
                      {material.topic}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ))
        )}
      </div>

      {selectedIds.length > 0 && (
        <p className="mt-1.5 text-[11px] text-slate-500">
          {selectedIds.length} prerequisite{selectedIds.length === 1 ? '' : 's'} selected
        </p>
      )}
    </div>
  );
}

export default PrerequisitePicker;
