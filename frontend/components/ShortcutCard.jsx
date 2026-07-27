import React from "react";

/**
 * Renders a clickable shortcut card for the lecturer dashboard using Font Awesome 5 icons.
 * @param {Object} props
 * @param {string} props.title - The headline title of the shortcut.
 * @param {string} [props.description] - Brief description of the shortcut action.
 * @param {Function} [props.onClick] - Click handler function.
 */
function ShortcutCard({ title, description, onClick }) {
  // Input validation
  if (!title || typeof title !== "string") {
    console.error("ShortcutCard: 'title' prop is required and must be a string.");
    return null;
  }

  /**
   * Safe click handler wrapper.
   * @param {React.MouseEvent<HTMLButtonElement>} e
   */
  const handleClick = (e) => {
    if (typeof onClick === "function") {
      onClick(e);
    } else {
      console.warn(`ShortcutCard: No valid onClick handler provided for '${title}'.`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-between w-full p-4 border rounded-lg cursor-pointer border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition group text-left"
    >
      <div>
        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition">
          {title}
        </h4>
        {description && typeof description === "string" && (
          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>
      <i className="fas fa-chevron-right shrink-0 text-xs text-slate-400 group-hover:text-teal-600 transition" />
    </button>
  );
}

export default ShortcutCard;