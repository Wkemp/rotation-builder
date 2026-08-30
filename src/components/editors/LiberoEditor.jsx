import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function LiberoEditor({ players, slots, liberos, onUpdateLiberos }) {
  const [newLiberoId, setNewLiberoId] = useState('');

  const starterIds = slots.filter(Boolean);
  const liberoPlayerIds = new Set(liberos.map((l) => l.playerId));
  const availableForLibero = Object.values(players).filter(
    (p) => !starterIds.includes(p.id) && !liberoPlayerIds.has(p.id)
  );

  function addLibero() {
    if (!newLiberoId || liberos.length >= 2) return;
    onUpdateLiberos([...liberos, { playerId: newLiberoId, forPlayerIds: [], servesForPlayerId: null }]);
    setNewLiberoId('');
  }

  function removeLibero(playerId) {
    onUpdateLiberos(liberos.filter((l) => l.playerId !== playerId));
  }

  function toggleTarget(libero, targetId) {
    const covered = new Set(libero.forPlayerIds);
    if (covered.has(targetId)) covered.delete(targetId);
    else covered.add(targetId);
    const nextForPlayerIds = [...covered];
    const nextServesFor = nextForPlayerIds.includes(libero.servesForPlayerId)
      ? libero.servesForPlayerId
      : null;
    onUpdateLiberos(
      liberos.map((l) =>
        l.playerId === libero.playerId
          ? { ...l, forPlayerIds: nextForPlayerIds, servesForPlayerId: nextServesFor }
          : l
      )
    );
  }

  function setServesFor(libero, targetId) {
    onUpdateLiberos(
      liberos.map((l) => (l.playerId === libero.playerId ? { ...l, servesForPlayerId: targetId || null } : l))
    );
  }

  // A starter already covered by a DIFFERENT libero can't also be covered by
  // this one - two liberos can't be covering the same slot, since only one
  // libero is ever on the court at a time.
  function targetOptionsFor(currentLiberoId) {
    const coveredByOthers = new Set();
    for (const l of liberos) {
      if (l.playerId === currentLiberoId) continue;
      for (const t of l.forPlayerIds) coveredByOthers.add(t);
    }
    return starterIds.filter((id) => !coveredByOthers.has(id)).map((id) => players[id]).filter(Boolean);
  }

  return (
    <div>
      <p className="text-xs text-chalk-dim mb-3">
        A libero can cover more than one starter — they'll automatically swap in whenever
        whichever one they cover rotates to the back row. Up to two liberos are supported (only
        one is ever shown on court at a time, per current rules).
      </p>

      {liberos.length === 0 && (
        <p className="text-xs text-chalk-dim italic mb-3">No libero configured yet.</p>
      )}

      <div className="space-y-3 mb-4">
        {liberos.map((libero) => {
          const liberoPlayer = players[libero.playerId];
          const targets = targetOptionsFor(libero.playerId);
          const covered = libero.forPlayerIds || [];
          return (
            <div key={libero.playerId} className="bg-ink-raised rounded-lg px-3 py-2.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-chalk">{liberoPlayer?.name || '—'}</span>
                <button
                  onClick={() => removeLibero(libero.playerId)}
                  className="text-chalk-dim hover:text-serve transition-colors p-2 -m-2"
                  aria-label={`Remove libero ${liberoPlayer?.name || ''}`}
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <div className="text-[11px] text-chalk-dim mb-1.5">Covers</div>
                <div className="flex flex-wrap gap-1.5">
                  {targets.map((p) => {
                    const active = covered.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleTarget(libero, p.id)}
                        className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-court-line text-chalk border-court-line'
                            : 'bg-ink text-chalk-dim border-ink-line hover:border-court-line/50'
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {covered.length > 0 && (
                <label className="flex items-center gap-2 text-xs pt-1 border-t border-ink-line/50">
                  <span className="text-chalk-dim flex-shrink-0">Serves in place of</span>
                  <select
                    value={libero.servesForPlayerId || ''}
                    onChange={(e) => setServesFor(libero, e.target.value)}
                    className="flex-1 min-w-0 bg-ink border border-ink-line rounded px-1.5 py-1.5 text-chalk truncate"
                  >
                    <option value="">Never (can't serve)</option>
                    {covered.map((id) => (
                      <option key={id} value={id}>
                        {players[id]?.name || '—'}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {liberos.length < 2 && availableForLibero.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={newLiberoId}
            onChange={(e) => setNewLiberoId(e.target.value)}
            className="flex-1 min-w-0 bg-ink-raised border border-ink-line rounded px-2 py-2 text-chalk truncate"
          >
            <option value="">Add a libero…</option>
            {availableForLibero.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={addLibero}
            disabled={!newLiberoId}
            className="bg-gold text-ink rounded h-11 w-11 flex items-center justify-center hover:bg-gold-dim transition-colors flex-shrink-0 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Add libero"
          >
            <Plus size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
