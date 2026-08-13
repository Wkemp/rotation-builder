import { useState, useRef, useEffect } from 'react';
import { Pencil, Plus, Trash2, Copy, Check, X } from 'lucide-react';

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
  const inputRef = useRef(null);

  const list = Object.values(items);
  const active = items[activeId];

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startRename() {
    setDraft(active?.name || '');
    setEditing(true);
  }

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onRename(activeId, trimmed);
    setEditing(false);
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
      <button
        onClick={startRename}
        className="p-2 -m-2 text-chalk-dim hover:text-chalk transition-colors flex-shrink-0"
        aria-label={`Rename ${label.toLowerCase()}`}
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={onCreate}
        className="p-2 -m-2 text-chalk-dim hover:text-chalk transition-colors flex-shrink-0"
        aria-label={`New ${label.toLowerCase()}`}
      >
        <Plus size={16} />
      </button>
      {onDuplicate && (
        <button
          onClick={() => onDuplicate(activeId)}
          className="p-2 -m-2 text-chalk-dim hover:text-chalk transition-colors flex-shrink-0"
          aria-label={`Duplicate ${label.toLowerCase()}`}
        >
          <Copy size={16} />
        </button>
      )}
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
