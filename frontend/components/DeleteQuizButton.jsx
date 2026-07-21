import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';

function DeleteQuizButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Delete Quiz"
      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
    >
      <FaTrashAlt className="text-xs" />
    </button>
  );
}

export default DeleteQuizButton;