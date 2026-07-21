import React from 'react';
import { FaEdit } from 'react-icons/fa';

function EditQuizButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Edit Quiz"
      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
    >
      <FaEdit className="text-xs" />
    </button>
  );
}

export default EditQuizButton;