import EntitySwitcher from '../EntitySwitcher';

export default function LineupEditor({
  rotationSets,
  activeRotationSetId,
  onSwitchRotationSet,
  onCreateRotationSet,
  onDuplicateRotationSet,
  onRenameRotationSet,
  onDeleteRotationSet,
  players,
  slots,
  liberos,
  onUpdateSlots,
}) {
  const liberoIds = new Set((liberos || []).map((l) => l.playerId));
  const playerList = Object.values(players);

  // A player already assigned to another zone shouldn't be selectable here too,
  // and a player configured as a libero doesn't independently occupy a numbered
  // starting slot - they only appear via the libero substitution mechanic.
  function lineupOptionsForZone(zone) {
    const myIndex = zone - 1;
    const currentValue = slots[myIndex];
    const usedElsewhere = new Set(slots.filter((id, idx) => idx !== myIndex && id));
    return playerList.filter(
      (p) => !liberoIds.has(p.id) && (p.id === currentValue || !usedElsewhere.has(p.id))
    );
  }

  function setZone(zone, playerId) {
    const next = [...slots];
    next[zone - 1] = playerId || null;
    onUpdateSlots(next);
  }

  return (
    <div>
      <div className="bg-ink-raised/60 border border-ink-line rounded-lg px-2.5 py-2 mb-4">
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

      <p className="text-xs text-chalk-dim mb-3">
        Assign your six starters to zones 1 through 6 — this is your serving order. Zone 1 always
        serves first.
      </p>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((zone) => (
          <div key={zone} className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gold text-ink font-display font-semibold flex-shrink-0">
              {zone}
            </span>
            <select
              value={slots[zone - 1] || ''}
              onChange={(e) => setZone(zone, e.target.value)}
              className="flex-1 min-w-0 h-11 bg-ink-raised border border-ink-line rounded px-2 text-chalk truncate"
            >
              <option value="">— empty —</option>
              {lineupOptionsForZone(zone).map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number || '–'} {p.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
