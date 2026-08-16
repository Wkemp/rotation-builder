import { useState } from 'react';
import { Plus, X, Users } from 'lucide-react';
import { makePlayerId } from '../lib/id';
import { zoneLabel } from '../lib/rotation';
import EntitySwitcher from './EntitySwitcher';
import DataTransfer from './DataTransfer';

const POSITIONS = ['OH', 'MB', 'OPP', 'S', 'L', 'DS'];
const POSITION_NAMES = {
  OH: 'Outside Hitter',
  MB: 'Middle Blocker',
  OPP: 'Opposite / Right-side Hitter',
  S: 'Setter',
  L: 'Libero',
  DS: 'Defensive Specialist',
};

export default function RosterPanel({
  roster,
  setRoster,
  slots,
  setSlots,
  liberos,
  setLiberos,
  rotationSets,
  activeRotationSetId,
  onSwitchRotationSet,
  onCreateRotationSet,
  onDuplicateRotationSet,
  onRenameRotationSet,
  onDeleteRotationSet,
  onExportTeam,
  onExportBackup,
  onImportFile,
}) {
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newPosition, setNewPosition] = useState('');

  const players = Object.values(roster).sort((a, b) => (a.number || 0) - (b.number || 0));
  const liberoIds = new Set(liberos.map((l) => l.playerId));

  function addPlayer() {
    if (!newName.trim()) return;
    const id = makePlayerId();
    setRoster({
      ...roster,
      [id]: { id, name: newName.trim(), number: newNumber.trim(), position: newPosition },
    });
    setNewName('');
    setNewNumber('');
    setNewPosition('');
  }

  function removePlayer(id) {
    const next = { ...roster };
    delete next[id];
    setRoster(next);
    setSlots(slots.map((s) => (s === id ? null : s)));
    setLiberos(liberos.filter((l) => l.playerId !== id));
  }

  function updatePosition(id, position) {
    setRoster({ ...roster, [id]: { ...roster[id], position } });
  }

  function assignZone(zone, playerId) {
    const next = [...slots];
    next[zone - 1] = playerId || null;
    setSlots(next);
  }

  function toggleLibero(playerId) {
    if (liberoIds.has(playerId)) {
      setLiberos(liberos.filter((l) => l.playerId !== playerId));
    } else if (liberos.length < 2) {
      setLiberos([...liberos, { playerId, forPlayerId: null, canServe: false }]);
    }
  }

  function updateLibero(playerId, patch) {
    setLiberos(liberos.map((l) => (l.playerId === playerId ? { ...l, ...patch } : l)));
  }

  function playerOptionLabel(p) {
    return `#${p.number || '–'} ${p.name}${p.position ? ` · ${p.position}` : ''}`;
  }

  // A player already assigned to another zone shouldn't be selectable here too —
  // nobody can be in two places on the court at once. The current row's own
  // selection is always kept available so it doesn't vanish from its own dropdown.
  function lineupOptionsForZone(zone) {
    const myIndex = zone - 1;
    const currentValue = slots[myIndex];
    const usedElsewhere = new Set(slots.filter((id, idx) => idx !== myIndex && id));
    return players.filter(
      (p) => !liberoIds.has(p.id) && (p.id === currentValue || !usedElsewhere.has(p.id))
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-sm tracking-wide text-chalk-dim uppercase mb-2 flex items-center gap-1.5">
          <Users size={14} /> Roster
        </h3>
        <div className="flex gap-2 mb-2">
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
        <ul className="space-y-1.5 max-h-[36rem] overflow-y-auto pr-1">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 bg-ink-raised rounded px-2 py-2 text-sm"
            >
              <span className="font-data text-gold w-6 text-center flex-shrink-0">
                {p.number || '–'}
              </span>
              <span className="flex-1 min-w-0 truncate">{p.name}</span>
              <select
                value={p.position || ''}
                onChange={(e) => updatePosition(p.id, e.target.value)}
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
              <label className="flex items-center gap-1.5 text-[11px] text-chalk-dim flex-shrink-0 p-2 -m-2">
                <input
                  type="checkbox"
                  checked={liberoIds.has(p.id)}
                  onChange={() => toggleLibero(p.id)}
                  disabled={!liberoIds.has(p.id) && liberos.length >= 2}
                  className="w-5 h-5"
                />
                Active L
              </label>
              <button
                onClick={() => removePlayer(p.id)}
                className="text-chalk-dim hover:text-serve transition-colors flex-shrink-0 p-2 -m-2"
                aria-label={`Remove ${p.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
          {players.length === 0 && (
            <li className="text-xs text-chalk-dim italic py-2">Add players to build your lineup.</li>
          )}
        </ul>
      </div>

      <div className="bg-ink-raised/60 border border-ink-line rounded-lg px-2.5 py-2">
        <EntitySwitcher
          items={rotationSets}
          activeId={activeRotationSetId}
          onSwitch={onSwitchRotationSet}
          onCreate={onCreateRotationSet}
          onDuplicate={onDuplicateRotationSet}
          onRename={onRenameRotationSet}
          onDelete={onDeleteRotationSet}
          label="Lineup"
        />
      </div>

      <div>
        <h3 className="font-display text-sm tracking-wide text-chalk-dim uppercase mb-2">
          Starting Lineup — Rotation 1
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((zone) => {
            const playerId = slots[zone - 1];
            return (
              <div key={zone} className="flex items-center gap-2 text-xs">
                <span className="font-data text-chalk-dim w-14 flex-shrink-0">{zoneLabel(zone)}</span>
                <select
                  value={playerId || ''}
                  onChange={(e) => assignZone(zone, e.target.value)}
                  className="flex-1 min-w-0 bg-ink-raised border border-ink-line rounded px-1.5 py-2 text-base text-chalk truncate"
                >
                  <option value="">—</option>
                  {lineupOptionsForZone(zone).map((p) => (
                    <option key={p.id} value={p.id}>
                      {playerOptionLabel(p)}
                    </option>
                  ))}
                </select>
                {liberos.map((l, idx) => {
                  const isActive = l.forPlayerId === playerId;
                  const takenByOther =
                    !isActive &&
                    liberos.some((other) => other.playerId !== l.playerId && other.forPlayerId === playerId);
                  return (
                    <button
                      key={l.playerId}
                      onClick={() => updateLibero(l.playerId, { forPlayerId: isActive ? null : playerId })}
                      disabled={!playerId || takenByOther}
                      title={`${roster[l.playerId]?.name || 'Libero'} subs in/out for whoever's here`}
                      className={`flex-shrink-0 w-9 h-9 rounded-full text-xs font-display font-semibold border transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                        isActive
                          ? 'bg-court-line text-chalk border-court-line'
                          : 'bg-ink text-chalk-dim border-ink-line hover:border-court-line/50 hover:text-chalk'
                      }`}
                    >
                      {liberos.length > 1 ? `L${idx + 1}` : 'L'}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-chalk-dim mt-1.5">
          This is where each player stands the instant Rotation 1 begins. Zone 1 (RB) serves
          first — the same order then carries through every later rotation.
          {liberos.length > 0 && ' Tap L to set who a libero subs in/out for.'}
        </p>
      </div>

      {liberos.length > 0 && (
        <div>
          <h3 className="font-display text-sm tracking-wide text-chalk-dim uppercase mb-2">
            Libero Setup
          </h3>
          <div className="space-y-2">
            {liberos.map((l) => (
              <div key={l.playerId} className="bg-ink-raised rounded px-2.5 py-2 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-chalk flex-wrap">
                  <span className="font-medium">{roster[l.playerId]?.name}</span>
                  <span className="text-chalk-dim">
                    {l.forPlayerId
                      ? `subs in/out for ${roster[l.forPlayerId]?.name || '—'}`
                      : 'not assigned yet — tap L above'}
                  </span>
                </div>
                <label className="flex items-center gap-2 p-2 -m-2">
                  <input
                    type="checkbox"
                    checked={l.canServe}
                    onChange={(e) => updateLibero(l.playerId, { canServe: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-chalk-dim">Allowed to serve (check your league's rule)</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTransfer
        onExportTeam={onExportTeam}
        onExportBackup={onExportBackup}
        onImportFile={onImportFile}
      />
    </div>
  );
}
