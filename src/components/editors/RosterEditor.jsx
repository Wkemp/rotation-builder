import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const POSITIONS = ['OH', 'MB', 'OPP', 'RH', 'S', 'L', 'DS'];
const POSITION_NAMES = {
  OH: 'Outside Hitter',
  MB: 'Middle Blocker',
  OPP: 'Opposite',
  RH: 'Right-side Hitter',
  S: 'Setter',
  L: 'Libero',
  DS: 'Defensive Specialist',
};

export default function RosterEditor({ players, onAddPlayer, onUpdatePlayer, onRemovePlayer }) {
  const [newNumber, setNewNumber] = useState('');
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');

  const list = Object.values(players).sort((a, b) => (a.number || '').localeCompare(b.number || '', undefined, { numeric: true }));

  function addPlayer() {
    if (!newName.trim()) return;
    onAddPlayer({ number: newNumber.trim(), name: newName.trim(), position: newPosition });
    setNewNumber('');
    setNewName('');
    setNewPosition('');
  }

  return (
    <div>
      <p className="text-xs text-chalk-dim mb-3">
        Add, rename, or remove players. The position tag is just a label — it doesn't affect
        anything on the court.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          placeholder="#"
          className="w-14 bg-ink-raised border border-ink-line rounded px-2 py-2 font-data text-center"
        />
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          placeholder="Player name"
          className="flex-1 min-w-0 bg-ink-raised border border-ink-line rounded px-2 py-2"
        />
        <select
          value={newPosition}
          onChange={(e) => setNewPosition(e.target.value)}
          className="w-24 bg-ink-raised border border-ink-line rounded px-1 py-2 text-chalk-dim"
          title="Position"
        >
          <option value="">Pos</option>
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos} title={POSITION_NAMES[pos]}>
              {pos}
            </option>
          ))}
        </select>
        <button
          onClick={addPlayer}
          className="bg-gold text-ink rounded h-11 w-11 flex items-center justify-center hover:bg-gold-dim transition-colors flex-shrink-0"
          aria-label="Add player"
        >
          <Plus size={18} />
        </button>
      </div>

      <ul className="space-y-1.5 max-h-[28rem] overflow-y-auto pr-1">
        {list.map((p) => (
          <li key={p.id} className="flex items-center gap-2 bg-ink-raised rounded px-2 py-2 text-sm">
            <input
              value={p.number || ''}
              onChange={(e) => onUpdatePlayer(p.id, { number: e.target.value })}
              className="w-10 flex-shrink-0 bg-ink border border-ink-line rounded px-1 py-1.5 font-data text-gold text-center"
            />
            <input
              value={p.name}
              onChange={(e) => onUpdatePlayer(p.id, { name: e.target.value })}
              className="flex-1 min-w-0 bg-ink border border-ink-line rounded px-1.5 py-1.5 truncate"
            />
            <select
              value={p.position || ''}
              onChange={(e) => onUpdatePlayer(p.id, { position: e.target.value })}
              className="w-20 flex-shrink-0 bg-ink border border-ink-line rounded px-1 py-1.5 text-chalk-dim"
              title="Position"
            >
              <option value="">—</option>
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            <button
              onClick={() => onRemovePlayer(p.id)}
              className="text-chalk-dim hover:text-serve transition-colors flex-shrink-0 p-2 -m-2"
              aria-label={`Remove ${p.name}`}
            >
              <X size={16} />
            </button>
          </li>
        ))}
        {list.length === 0 && (
          <li className="text-xs text-chalk-dim italic py-2">Add players to build your roster.</li>
        )}
      </ul>
    </div>
  );
}
