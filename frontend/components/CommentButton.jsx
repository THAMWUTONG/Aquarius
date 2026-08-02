import React from 'react';
import { FaRegComment } from 'react-icons/fa';

function CommentButton({ comments = 0, onClick }) {
  const hasComments = comments > 0;

  return (
    <button
      onClick={onClick}
      title={hasComments ? `${comments} Comment(s)` : 'No comments'}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
        hasComments
          ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
          : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
      }`}
    >
      <FaRegComment className="text-xs" />
      {hasComments && <span>{comments}</span>}
    </button>
  );
}

export default CommentButton;