import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import UploadMaterialModal from './UploadMaterials.jsx';
import EditMaterialModal from '../components/EditMaterialModal.jsx';
import EditMaterialButton from '../components/EditMaterialButton.jsx';
import { FaPlus, FaLink, FaTrashAlt } from 'react-icons/fa';

// Initial dataset matching database relationships (Materials -> Topics -> Courses)
const initialMaterials = [
  {
    id: 1,
    title: 'Python Variables Slides',
    course: 'Introduction to Programming',
    topic: 'Variables & Data Types',
    type: 'SLIDES',
    prerequisites: '—',
  },
  {
    id: 2,
    title: 'Control Flow Video',
    course: 'Introduction to Programming',
    topic: 'If-else, loops, and logical operators',
    type: 'VIDEO',
    prerequisites: '1 topics',
  },
  {
    id: 3,
    title: 'Functions Cheat Sheet',
    course: 'Introduction to Programming',
    topic: 'Defining reusable functions',
    type: 'PDF',
    prerequisites: '1 topics',
  },
  {
    id: 4,
    title: 'Linked Lists Document',
    course: 'Data Structures & Algorithms',
    topic: 'Linear data structures',
    type: 'DOCUMENT',
    prerequisites: '—',
  },
  {
    id: 5,
    title: 'Sorting Algorithms Video',
    course: 'Data Structures & Algorithms',
    topic: 'Bubble, merge, quick sort',
    type: 'VIDEO',
    prerequisites: '1 topics',
  },
  {
    id: 6,
    title: 'ER Diagram Tutorial',
    course: 'Database Systems',
    topic: 'ER Modelling',
    type: 'PDF',
    prerequisites: '—',
  },
  {
    id: 7,
    title: 'SQL Query Practice Set',
    course: 'Database Systems',
    topic: 'SQL Queries',
    type: 'PDF',
    prerequisites: '1 topics',
  },
];

function ManageMaterials() {
  const [materials, setMaterials] = useState(initialMaterials);
  
  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Handlers
  const handleUploadNew = () => {
    setIsUploadOpen(true);
  };

  const handleEditClick = (material) => {
    setSelectedMaterial(material);
    setIsEditOpen(true);
  };

  const handleSaveMaterial = (updatedMaterial) => {
    setMaterials((prev) =>
      prev.map((item) => (item.id === updatedMaterial.id ? updatedMaterial : item))
    );
  };

  const handleDeleteClick = (materialId) => {
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar userName="Dr. Sarah Lim" userRole="lecturer" />

        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header Action Section */}
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
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {item.course}
                        </td>

                        {/* Topic */}
                        <td className="py-4 px-6 text-slate-500">
                          {item.topic}
                        </td>

                        {/* Type Badge */}
                        <td className="py-4 px-6 text-center">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider rounded text-slate-500 bg-slate-100/80 border border-slate-200/60 uppercase">
                            {item.type}
                          </span>
                        </td>

                        {/* Prerequisites Badge */}
                        <td className="py-4 px-6 text-center">
                          {item.prerequisites && item.prerequisites !== '—' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100">
                              <FaLink className="text-[10px]" />
                              {item.prerequisites}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">—</span>
                          )}
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

      {/* Integrated Upload Modal */}
      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Integrated Edit Modal */}
      <EditMaterialModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        material={selectedMaterial}
        onSave={handleSaveMaterial}
      />
    </div>
  );
}

export default ManageMaterials;