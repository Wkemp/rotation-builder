import { useState } from 'react';
import { X } from 'lucide-react';
import { makeId } from '../../lib/id';

export default function SubsEditor({
  players,
  slots,
  liberos,
  substitutions,
  substitutionServers,
  onUpdateSubstitutions,
  onUpdateSubstitutionServers,
}) {
  const [newSubPlayerId, setNewSubPlayerId] = useState('');
  const [newForPlayerId, setNewForPlayerId] = useState('');
  const [newSubRotations, setNewSubRotations] = useState([]);

  const starterIds = slots.filter(Boolean);
  const liberoIds = new Set((liberos || []).map((l) => l.playerId));
  const benchPlayers = Object.values(players).filter(
    (p) => !starterIds.includes(p.id) && !liberoIds.has(p.id)
  );

  function subPlayerOptionsFor(currentForPlayerId) {
    const lockedToOtherStarter = new Set(
      substitutions.filter((s) => s.forPlayerId !== currentForPlayerId).map((s) => s.subPlayerId)
    );
    return benchPlayers.filter((p) => !lockedToOtherStarter.has(p.id));
  }

  function toggleRotation(r) {
    setNewSubRotations((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r].sort()));
  }

  function addSubstitution() {
    if (!newSubPlayerId || !newForPlayerId) return;
    onUpdateSubstitutions([
      ...substitutions,
      { id: makeId('sub_'), subPlayerId: newSubPlayerId, forPlayerId: newForPlayerId, rotations: newSubRotations },
    ]);
    setNewSubPlayerId('');
    setNewForPlayerId('');
    setNewSubRotations([]);
  }

  function removeSubstitution(id) {
    const removed = substitutions.find((s) => s.id === id);
    onUpdateSubstitutions(substitutions.filter((s) => s.id !== id));
    if (removed && substitutionServers[removed.forPlayerId] === removed.subPlayerId) {
      const stillHasOtherEntry = substitutions.some(
        (s) => s.id !== id && s.forPlayerId === removed.forPlayerId && s.subPlayerId === removed.subPlayerId
      );
      if (!stillHasOtherEntry) {
        const next = { ...substitutionServers };
        delete next[removed.forPlayerId];
        onUpdateSubstitutionServers(next);
      }
    }
  }

  function updateSubstitutionServer(starterId, serverId) {
    if (serverId === starterId) {
      const next = { ...substitutionServers };
      delete next[starterId];
      onUpdateSubstitutionServers(next);
    } else {
      onUpdateSubstitutionServers({ ...substitutionServers, [starterId]: serverId });
    }
  }

  const substitutionsByStarter = {};
  for (const s of substitutions) {
    if (!substitutionsByStarter[s.forPlayerId]) substitutionsByStarter[s.forPlayerId] = [];
    substitutionsByStarter[s.forPlayerId].push(s);
  }

  return (
    <div>
      <p className="text-xs text-chalk-dim mb-3">
        Non-libero subs — for bench players you plan to bring in for a starter. Real substitution
        rule: everyone grouped under a starter is locked to that one slot for the set, and only
        one of them can ever serve for it - set that with "Serves" below.
      </p>

      <div className="bg-ink-raised rounded-lg px-2.5 py-2 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <select
            value={newSubPlayerId}
            onChange={(e) => setNewSubPlayerId(e.target.value)}
            className="flex-1 min-w-0 h-11 bg-ink border border-ink-line rounded px-1.5 text-base text-chalk truncate"
          >
            <option value="">Sub player…</option>
            {subPlayerOptionsFor(newForPlayerId).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="text-chalk-dim flex-shrink-0">for</span>
          <select
            value={newForPlayerId}
            onChange={(e) => setNewForPlayerId(e.target.value)}
            className="flex-1 min-w-0 h-11 bg-ink border border-ink-line rounded px-1.5 text-base text-chalk truncate"
          >
            <option value="">Starter…</option>
            {starterIds.map((id) => (
              <option key={id} value={id}>
                {players[id]?.name || '—'}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-chalk-dim flex-shrink-0">Rotations:</span>
          {[1, 2, 3, 4, 5, 6].map((r) => (
            <button
              key={r}
              onClick={() => toggleRotation(r)}
              className={`w-11 h-11 rounded text-xs font-medium transition-colors flex-shrink-0 ${
                newSubRotations.includes(r) ? 'bg-gold text-ink' : 'bg-ink text-chalk-dim border border-ink-line'
              }`}
            >
              {r}
            </button>
          ))}
          <span className="text-[10px] text-chalk-dim/70 ml-1">(none = any)</span>
        </div>
        <button
          onClick={addSubstitution}
          disabled={!newSubPlayerId || !newForPlayerId}
          className="w-full h-11 rounded-lg bg-gold text-ink text-sm font-medium hover:bg-gold-dim transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          Add Substitution
        </button>
      </div>

      {Object.keys(substitutionsByStarter).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(substitutionsByStarter).map(([starterId, entries]) => {
            const groupMembers = [starterId, ...entries.map((s) => s.subPlayerId)];
            const currentServer = substitutionServers[starterId] || starterId;
            return (
              <div key={starterId} className="bg-ink-raised rounded px-2.5 py-2 text-xs space-y-1.5">
                <div className="font-medium text-chalk">{players[starterId]?.name || '—'}</div>
                <ul className="space-y-1 pl-2 border-l-2 border-ink-line">
                  {entries.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-chalk">{players[s.subPlayerId]?.name || '—'}</span>
                        <span className="text-chalk-dim">
                          {' — '}
                          {s.rotations.length > 0
                            ? `Rotation${s.rotations.length > 1 ? 's' : ''} ${s.rotations.join(', ')}`
                            : 'Any rotation'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeSubstitution(s.id)}
                        className="flex items-center justify-center w-11 h-11 -m-1.5 flex-shrink-0 rounded-full text-chalk-dim hover:text-serve hover:bg-ink transition-colors"
                        aria-label="Remove substitution"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <label className="flex items-center gap-2 pt-1">
                  <span className="text-chalk-dim flex-shrink-0">Serves</span>
                  <select
                    value={currentServer}
                    onChange={(e) => updateSubstitutionServer(starterId, e.target.value)}
                    className="flex-1 min-w-0 h-11 bg-ink border border-ink-line rounded px-1.5 text-chalk truncate"
                  >
                    {groupMembers.map((id) => (
                      <option key={id} value={id}>
                        {players[id]?.name || '—'}
                        {id === starterId ? ' (starter)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-chalk-dim italic">No planned substitutions yet.</p>
      )}
    </div>
  );
}
