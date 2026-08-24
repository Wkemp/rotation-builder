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
          className="flex-1 min-w-0 bg-ink-raised border border-gold rounded px-2 py-1.5"
        />
        <button onClick={commit} className="p-2 -m-2 text-gold" aria-label="Save name">
          <Check size={18} />
        </button>
        <button onClick={() => setEditing(false)} className="p-2 -m-2 text-chalk-dim" aria-label="Cancel rename">
          <X size={18} />
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
        className="flex-1 min-w-0 bg-ink-raised border border-ink-line rounded px-2 py-1.5 text-chalk truncate"
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
          className="p-2 -m-2 text-chalk-dim hover:text-chalk transition-colors flex items-center justify-center"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 bg-ink-raised border border-ink-line rounded-lg shadow-lg py-1 min-w-[10rem]">
              <button
                onClick={startRename}
                className="w-full flex items-center gap-2 px-3 py-3 text-sm text-chalk hover:bg-ink transition-colors text-left"
              >
                <Pencil size={14} /> Rename
              </button>
              <button
                onClick={handleCreate}
                className="w-full flex items-center gap-2 px-3 py-3 text-sm text-chalk hover:bg-ink transition-colors text-left"
              >
                <Plus size={14} /> New {label.toLowerCase()}
              </button>
              {onDuplicate && (
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2 px-3 py-3 text-sm text-chalk hover:bg-ink transition-colors text-left"
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
        className="p-2 -m-2 text-chalk-dim hover:text-serve transition-colors flex-shrink-0 disabled:opacity-30 disabled:pointer-events-none"
        aria-label={`Delete ${label.toLowerCase()}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
