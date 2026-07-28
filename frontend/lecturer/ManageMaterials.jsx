import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import { FaPlus, FaLink, FaEdit, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import UploadMaterialModal from './UploadMaterials.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getLecturerMaterials } from '../services/getLecturerMaterials.jsx';

const initialMaterials = [
  {
    id: 1,
    title: 'Getting Started with Semantic HTML5',
    course: 'CS101',
    topic: 'HTML Basics',
    type: 'PDF',
    prerequisites: null,
  },
  {
    id: 2,
    title: 'Mastering Flexbox and Grid Layouts',
    course: 'CS101',
    topic: 'CSS Layouts',
    type: 'SLIDES',
    prerequisites: '1 topics',
  },
  {
    id: 3,
    title: 'ES6+ JavaScript Fundamentals',
    course: 'CS101',
    topic: 'JS Fundamentals',
    type: 'PDF',
    prerequisites: '1 topics',
  },
  {
    id: 4,
    title: 'Dynamic UI Development via DOM API',
    course: 'CS101',
    topic: 'DOM Manipulation',
    type: 'PDF',
    prerequisites: '1 topics',
  },
  {
    id: 5,
    title: 'Relational Algebra & Schema Design',
    course: 'CS202',
    topic: 'Relational Model',
    type: 'PDF',
    prerequisites: null,
  },
  {
    id: 6,
    title: 'Basic SQL SELECT Statements & Filtering',
    course: 'CS202',
    topic: 'SQL Basics',
    type: 'SLIDES',
    prerequisites: '1 topics',
  },
  {
    id: 7,
    title: 'Deep Dive: INNER, LEFT, RIGHT, and FULL Joins',
    course: 'CS202',
    topic: 'SQL Joins & Aggregations',
    type: 'PDF',
    prerequisites: '1 topics',
  },
  {
    id: 8,
    title: 'Database Normalization (1NF, 2NF, 3NF, BCNF)',
    course: 'CS202',
    topic: 'Database Normalization',
    type: 'PDF',
    prerequisites: '1 topics',
  },
  {
    id: 9,
    title: 'Understanding Limits and Continuous Functions',
    course: 'MA101',
    topic: 'Limits & Continuity',
    type: 'PDF',
    prerequisites: null,
  },
  {
    id: 10,
    title: 'The Power Rule, Product Rule, and Quotient Rule',
    course: 'MA101',
    topic: 'Derivatives Basics',
    type: 'SLIDES',
    prerequisites: '1 topics',
  },
  {
    id: 11,
    title: 'Chain Rule & Solving Optimization Problems',
    course: 'MA101',
    topic: 'Chain Rule & Optimization',
    type: 'PDF',
    prerequisites: '1 topics',
  },
  {
    id: 12,
    title: 'Definite and Indefinite Integrals',
    course: 'MA101',
    topic: 'Integrals Introduction',
    type: 'PDF',
    prerequisites: '1 topics',
  },
  {
    id: 13,
    title: 'Arrays vs Singly/Doubly Linked Lists',
    course: 'CS204',
    topic: 'Arrays & Linked Lists',
    type: 'PDF',
    prerequisites: null,
  },
];

function ManageMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState(initialMaterials);
  const [isFallback, setIsFallback] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 2. Modal open/close state

  // Fetch the lecturer's real materials from the PHP backend.
  // The API field names are mapped onto the shape this table already expects,
  // so none of the JSX below has to change:
  //   fileType (lowercase)  -> type       (the badge CSS uppercases it)
  //   prerequisites (number) -> '2 topics' | null
  const fetchMaterials = async () => {
    try {
      const data = await getLecturerMaterials();
      setMaterials(
        data.materials.map((item) => ({
          id: item.id,
          title: item.title,
          course: item.course,
          topic: item.topic,
          type: item.fileType,
          prerequisites: item.prerequisites > 0 ? `${item.prerequisites} topics` : null,
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
    setIsModalOpen(true); // 3. Triggers modal open
  };

  const handleMaterialUploaded = () => {
    // Refresh the table so a newly uploaded material appears immediately.
    fetchMaterials();
  };

  const handleEditClick = (material) => {
    console.log('Edit Material:', material);
  };

  const handleDeleteClick = (materialId) => {
    console.log('Delete Material ID:', materialId);
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Locked Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar displayedTitle="Manage Materials" userName={user?.name || 'Dr. Sarah Lim'} userRole={user?.role || 'lecturer'} />

        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Manage Classroom Materials
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Upload lecture slides, edit text contents, and define module dependency chains.
              </p>
            </div>

            <button
              onClick={handleUploadNew}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Upload New Material</span>
            </button>
          </div>

          {/* Sample-data warning: only visible when the API could not be reached */}
          {isFallback && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium">
              <FaExclamationTriangle className="text-base shrink-0" />
              <span>Showing built-in sample data - could not reach the server. These rows are not from the database.</span>
            </div>
          )}

          {/* Materials Table Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            {materials.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No materials available. Click "Upload New Material" to add content.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      <th className="py-4 px-6">Material Title</th>
                      <th className="py-4 px-6">Course</th>
                      <th className="py-4 px-6">Topic</th>
                      <th className="py-4 px-6 text-center">Type</th>
                      <th className="py-4 px-6 text-center">Prerequisites</th>
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
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {item.course}
                        </td>

                        {/* Topic */}
                        <td className="py-4 px-6 text-slate-500">
                          {item.topic}
                        </td>

                        {/* Type Badge (PDF / SLIDES) */}
                        <td className="py-4 px-6 text-center">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider rounded text-slate-500 bg-slate-100/80 border border-slate-200/60 uppercase">
                            {item.type}
                          </span>
                        </td>

                        {/* Prerequisites Badge */}
                        <td className="py-4 px-6 text-center">
                          {item.prerequisites ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100">
                              <FaLink className="text-[10px]" />
                              {item.prerequisites}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">—</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditClick(item)}
                              title="Edit Material"
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                            >
                              <FaEdit className="text-xs" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(item.id)}
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

      {/* 4. Integrated Pop-up Modal */}
      <UploadMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMaterialUploaded={handleMaterialUploaded}
      />
    </div>
  );
}

export default ManageMaterials;