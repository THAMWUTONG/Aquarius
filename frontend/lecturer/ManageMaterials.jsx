import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import { FaPlus, FaLink, FaEdit, FaTrashAlt } from 'react-icons/fa';

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
  const [materials, setMaterials] = useState(initialMaterials);

  // Handlers for future backend logic
  const handleUploadNew = () => {
    console.log('Upload New Material Clicked');
  };

  const handleEditClick = (material) => {
    console.log('Edit Material:', material);
  };

  const handleDeleteClick = (materialId) => {
    console.log('Delete Material ID:', materialId);
    // setMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased">
      {/* Locked Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar userName="Dr. Sarah Lim" userRole="lecturer" />

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
    </div>
  );
}

export default ManageMaterials;