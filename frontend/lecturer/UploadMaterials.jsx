import React, { useState } from 'react';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';

function UploadMaterialModal({ isOpen, onClose, onMaterialUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [topicId, setTopicId] = useState('1');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    // Use FormData to send file binary along with database metadata
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file_type', fileType);
    formData.append('topic_id', topicId);
    formData.append('uploaded_by', 7); // Hardcoded ID or extract from auth state
    formData.append('file', file);

    try {
      setLoading(true);

      const response = await fetch('http://localhost/api/upload_material.php', {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed; browser automatically sets multipart/form-data
      });

      const data = await response.json();

      if (data.success) {
        if (onMaterialUploaded) onMaterialUploaded();
        onClose();
      } else {
        alert(data.message || 'Failed to upload study material');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Network error while uploading material.');
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
            Upload New Course Study Material
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

          {/* Topic & File Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Topic ID
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="1">Topic 1 - Variables</option>
                <option value="2">Topic 2 - Control Flow</option>
                <option value="3">Topic 3 - Functions</option>
                <option value="4">Topic 4 - Linked Lists</option>
                <option value="5">Topic 5 - Sorting Algorithms</option>
                <option value="6">Topic 6 - ER Diagrams</option>
                <option value="7">Topic 7 - SQL Querying</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                File Type
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

          {/* Real File Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              File Attachment
            </label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-colors text-center cursor-pointer">
              <input
                type="file"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <FaCloudUploadAlt className="text-2xl text-sky-500" />
                <span className="text-xs font-semibold text-slate-600">
                  {file ? file.name : 'Click or drag file to upload'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Supported: .pdf, .mp4, .docx, .pptx
                </span>
              </div>
            </div>
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
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Save Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadMaterialModal;