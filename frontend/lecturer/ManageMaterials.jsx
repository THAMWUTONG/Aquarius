import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import { FaPlus, FaTrashAlt, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import EditMaterialButton from '../components/EditMaterialButton.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import UploadMaterialModal from './UploadMaterials.jsx';
import EditMaterialModal from './EditMaterialModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getLecturerMaterials } from '../services/getLecturerMaterials.jsx';
import { deleteMaterial } from '../services/lecturerContentService.jsx';

// Initial dataset matching database relationships (Materials -> Topics -> Courses)
//
// prerequisites lists OTHER study materials that should be studied first, the
// same {id, title} shape the API returns - so 'Control Flow Video' expects the
// student to have gone through 'Python Variables Slides' already. A material
// may have several, or none at all.
const initialMaterials = [
  {
    id: 1,
    title: 'Python Variables Slides',
    course: 'Introduction to Programming',
    topic: 'Variables & Data Types',
    prerequisites: [],
    regulationStatus: 'approved',
  },
  {
    id: 2,
    title: 'Control Flow Video',
    course: 'Introduction to Programming',
    topic: 'If-else, loops, and logical operators',
    prerequisites: [{ id: 1, title: 'Python Variables Slides' }],
    regulationStatus: 'approved',
  },
  {
    id: 3,
    title: 'Functions Cheat Sheet',
    course: 'Introduction to Programming',
    topic: 'Defining reusable functions',
    prerequisites: [
      { id: 1, title: 'Python Variables Slides' },
      { id: 2, title: 'Control Flow Video' },
    ],
    regulationStatus: 'approved',
  },
  {
    id: 4,
    title: 'Linked Lists Document',
    course: 'Data Structures & Algorithms',
    topic: 'Linear data structures',
    prerequisites: [{ id: 1, title: 'Python Variables Slides' }],
    regulationStatus: 'approved',
  },
  {
    id: 5,
    title: 'Sorting Algorithms Video',
    course: 'Data Structures & Algorithms',
    topic: 'Bubble, merge, quick sort',
    prerequisites: [{ id: 4, title: 'Linked Lists Document' }],
    regulationStatus: 'pending',
  },
  {
    id: 6,
    title: 'ER Diagram Tutorial',
    course: 'Database Systems',
    topic: 'ER Modelling',
    prerequisites: [],
    regulationStatus: 'approved',
  },
  {
    id: 7,
    title: 'SQL Query Practice Set',
    course: 'Database Systems',
    topic: 'SQL Queries',
    prerequisites: [{ id: 6, title: 'ER Diagram Tutorial' }],
    regulationStatus: 'approved',
  },
];

function ManageMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState(initialMaterials);
  const [isFallback, setIsFallback] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [actionError, setActionError] = useState('');

  // Fetch the lecturer's real materials from the PHP backend, mapping the API
  // field names onto the shape this table expects. regulationStatus is passed
  // straight through - StatusBadge does the styling.
  const fetchMaterials = async () => {
    try {
      const data = await getLecturerMaterials();
      setMaterials(
        data.materials.map((item) => ({
          id: item.id,
          title: item.title,
          // Carried through so the edit modal can prefill it, even though the
          // table itself does not show a description column.
          description: item.description,
          course: item.course,
          topic: item.topic,
          // Other study materials to be covered first, as [{id, title}].
          // Defaulted to [] so the table and the picker never have to guard
          // against undefined when the prerequisite lookup came back empty.
          prerequisites: item.prerequisites ?? [],
          regulationStatus: item.regulationStatus,
        }))
      );
      setIsFallback(false);
    } catch (error) {
      // Keep initialMaterials on screen, but flag it as sample data.
      console.error('Error loading materials:', error);
      setIsFallback(true);
    }
  };

  useEffect(() => {
    async function loadMaterials() {
      await fetchMaterials();
    }

    loadMaterials();
  }, [user]);

  // Handlers
  const handleUploadNew = () => {
    setIsModalOpen(true);
  };

  const handleMaterialUploaded = () => {
    // Refresh the table so a newly uploaded material appears immediately.
    fetchMaterials();
  };

  const handleEditClick = (material) => {
    setEditingMaterial(material);
  };

  const handleDeleteClick = async (material) => {
    const confirmed = window.confirm(
      `Delete "${material.title}"? It is also removed from any other material that lists it as a prerequisite. This cannot be undone.`
    );
    if (!confirmed) return;

    setActionError('');

    try {
      await deleteMaterial(material.id);
      // Refetch instead of filtering local state, so the table always reflects
      // what the database actually holds.
      await fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      setActionError(error.message);
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar displayedTitle="Manage Materials" userName={user?.name || 'Dr. Sarah Lim'} userRole={user?.role || 'lecturer'} />

        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header Action Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Manage Classroom Materials
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add lecture materials, edit text contents, and define module dependency chains.
              </p>
            </div>

            <button
              onClick={handleUploadNew}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Add New Material</span>
            </button>
          </div>

          {/* Sample-data warning: only visible when the API could not be reached */}
          {isFallback && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium">
              <FaExclamationTriangle className="text-base shrink-0" />
              <span>Showing built-in sample data - could not reach the server. These rows are not from the database.</span>
            </div>
          )}

          {/* Failed delete/update, shown instead of silently doing nothing */}
          {actionError && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              <FaExclamationCircle className="text-base shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Materials Table Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            {materials.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No materials available. Click "Add New Material" to add content.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      <th className="py-4 px-6">Material Title</th>
                      <th className="py-4 px-6">Course</th>
                      <th className="py-4 px-6">Topic</th>
                      <th className="py-4 px-6">Prerequisites</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {materials.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Title */}
                        <td className="py-4 px-6 font-semibold text-slate-800">
                          {item.title}
                        </td>

                        {/* Course */}
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {item.course}
                        </td>

                        {/* Topic */}
                        <td className="py-4 px-6 text-slate-500">
                          {item.topic}
                        </td>

                        {/* Prerequisites: the study materials to cover first.
                            Rendered as one chip per material rather than a
                            count, so the lecturer can see the actual chain
                            without opening the edit modal. */}
                        <td className="py-4 px-6">
                          {item.prerequisites?.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[260px]">
                              {item.prerequisites.map((prerequisite) => (
                                <span
                                  key={prerequisite.id}
                                  title={prerequisite.title}
                                  className="inline-block max-w-[240px] truncate px-2 py-0.5 rounded-full text-[11px] font-medium text-violet-700 bg-violet-50 border border-violet-100"
                                >
                                  {prerequisite.title}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-medium">—</span>
                          )}
                        </td>

                        {/* Regulation Status */}
                        <td className="py-4 px-6 text-center">
                          <StatusBadge status={item.regulationStatus} />
                        </td>

                        {/* Actions Row */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Reusable Edit Material Button */}
                            <EditMaterialButton
                              material={item}
                              onClick={handleEditClick}
                            />

                            {/* Delete Material Button */}
                            <button
                              onClick={() => handleDeleteClick(item)}
                              title="Delete Material"
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
                            >
                              <FaTrashAlt className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Integrated Upload Modal.
          The already-fetched table rows double as the prerequisite options, so
          neither modal needs a second request. They are withheld while the
          fallback data is showing: those ids are invented, and offering them
          would only produce a rejected save. */}
      <UploadMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMaterialUploaded={handleMaterialUploaded}
        materials={isFallback ? [] : materials}
      />

      {/* Integrated Edit Modal */}
      <EditMaterialModal
        material={editingMaterial}
        onClose={() => setEditingMaterial(null)}
        onMaterialUpdated={fetchMaterials}
        materials={isFallback ? [] : materials}
      />
    </div>
  );
}

export default ManageMaterials;