import React, { useMemo, useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

/**
 * Picks the study materials a student should work through BEFORE this one.
 *
 * A prerequisite is another study material, not a topic - "Database Systems
 * requires Python Basics" - so the options here are the lecturer's own
 * materials. Any number can be chosen, including none.
 *
 * Selection is held by the parent as an array of material ids, because that is
 * exactly what the API stores; the titles are only ever for display.
 *
 * @param {object[]} materials    candidate materials, each {id, title, course}
 * @param {number[]} selectedIds  currently chosen material ids
 * @param {Function} onChange     receives the next array of ids
 * @param {number}   excludeId    the material being edited - a material cannot
 *                                be its own prerequisite, so it is not offered
 */
function PrerequisitePicker({ materials = [], selectedIds = [], onChange, excludeId = null }) {
  const [search, setSearch] = useState('');

  // The material being edited is filtered out here rather than relying on the
  // database CHECK constraint, so the option is never presentable in the first
  // place instead of failing on save.
  const candidates = useMemo(
    () => materials.filter((item) => item.id !== excludeId),
    [materials, excludeId]
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === '') return candidates;

    return candidates.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.course || '').toLowerCase().includes(query)
    );
  }, [candidates, search]);

  // Grouped by course so a long list stays navigable - the same shape the topic
  // dropdowns in these modals already use.
  const grouped = useMemo(
    () =>
      visible.reduce((groups, item) => {
        (groups[item.course || 'Other'] ||= []).push(item);
        return groups;
      }, {}),
    [visible]
  );

  // Read off `candidates`, not `visible`: a chip for an already-chosen material
  // must stay visible (and removable) even while a search hides its row.
  const selected = candidates.filter((item) => selectedIds.includes(item.id));

  const toggle = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="space-y-2">
      {candidates.length === 0 ? (
        <p className="text-xs text-slate-400 px-1 py-2">
          You have no other study materials yet, so there is nothing to require first.
        </p>
      ) : (
        <>
          {/* Chosen prerequisites, removable without scrolling the list */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100"
                >
                  <span className="truncate max-w-[180px]">{item.title}</span>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    title={`Remove ${item.title}`}
                    className="text-indigo-400 hover:text-indigo-700 transition-colors"
                  >
                    <FaTimes className="text-[9px]" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>

          <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
            {visible.length === 0 ? (
              <p className="text-xs text-slate-400 px-3 py-3">No materials match "{search}".</p>
            ) : (
              Object.entries(grouped).map(([course, courseMaterials]) => (
                <div key={course}>
                  <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                    {course}
                  </p>
                  {courseMaterials.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggle(item.id)}
                        className="mt-0.5 accent-sky-500 cursor-pointer"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-700 truncate">
                          {item.title}
                        </span>
                        {item.topic && (
                          <span className="block text-[10px] text-slate-400 truncate">
                            {item.topic}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PrerequisitePicker;
