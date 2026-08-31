import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, Plus, Trash2, Copy, Check, X } from 'lucide-react';

export default function EntitySwitcher({
  items, // object keyed by id: { id, name, ...}
  activeId,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
  onDuplicate, // optional
  label,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);

  const list = Object.values(items);
  const active = items[activeId];

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startRename() {
    setDraft(active?.name || '');
    setEditing(true);
    setMenuOpen(false);
  }

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onRename(activeId, trimmed);
    setEditing(false);
  }

  function handleCreate() {
    onCreate();
    setMenuOpen(false);
  }

  function handleDuplicate() {
    onDuplicate(activeId);
    setMenuOpen(false);
  }

  function handleDelete() {
    if (list.length <= 1) return;
    if (window.confirm(`Delete "${active?.name}"? This can't be undone.`)) {
      onDelete(activeId);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-chalk-dim flex-shrink-0 w-14">{label}</span>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="flex-1 min-w-0 h-11 bg-ink-raised border border-gold rounded px-2"
        />
        <button
          onClick={commit}
          className="flex items-center justify-center w-11 h-11 -m-1.5 rounded-full text-gold hover:bg-ink-raised transition-colors flex-shrink-0"
          aria-label="Save name"
        >
          <Check size={20} />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex items-center justify-center w-11 h-11 -m-1.5 rounded-full text-chalk-dim hover:bg-ink-raised transition-colors flex-shrink-0"
          aria-label="Cancel rename"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-chalk-dim flex-shrink-0 w-14">{label}</span>
      <select
        value={activeId}
        onChange={(e) => onSwitch(e.target.value)}
        className="flex-1 min-w-0 h-11 bg-ink-raised border border-ink-line rounded px-2 text-chalk truncate"
      >
        {list.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={`${label} options`}
          aria-expanded={menuOpen}
          className="flex items-center justify-center w-11 h-11 -m-1.5 rounded-full text-chalk-dim hover:text-chalk hover:bg-ink-raised transition-colors"
        >
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 bg-ink-raised border border-ink-line rounded-lg shadow-lg py-1 min-w-[10rem]">
              <button
                onClick={startRename}
                className="w-full flex items-center gap-2 px-3 h-11 text-sm text-chalk hover:bg-ink transition-colors text-left"
              >
                <Pencil size={14} /> Rename
              </button>
              <button
                onClick={handleCreate}
                className="w-full flex items-center gap-2 px-3 h-11 text-sm text-chalk hover:bg-ink transition-colors text-left"
              >
                <Plus size={14} /> New {label.toLowerCase()}
              </button>
              {onDuplicate && (
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2 px-3 h-11 text-sm text-chalk hover:bg-ink transition-colors text-left"
                >
                  <Copy size={14} /> Duplicate
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleDelete}
        disabled={list.length <= 1}
        className="flex items-center justify-center w-11 h-11 -m-1.5 rounded-full text-chalk-dim hover:text-serve hover:bg-ink-raised transition-colors flex-shrink-0 disabled:opacity-30 disabled:pointer-events-none"
        aria-label={`Delete ${label.toLowerCase()}`}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
