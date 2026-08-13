import { zoneForSlot, resolveCourt, zoneLabel, isFrontRow } from '../lib/rotation';

// Grid position (fraction of court width/height) for each zone's cell CENTER —
// used to place player pucks.
const ZONE_POS = {
  4: { x: 1 / 6, y: 1 / 4 }, 3: { x: 1 / 2, y: 1 / 4 }, 2: { x: 5 / 6, y: 1 / 4 },
  5: { x: 1 / 6, y: 3 / 4 }, 6: { x: 1 / 2, y: 3 / 4 }, 1: { x: 5 / 6, y: 3 / 4 },
};

// Column/row for each zone's cell — used to place zone labels in a corner,
// clear of the puck that sits in the center of the same cell.
const ZONE_CELL = {
  4: { col: 0, row: 0 }, 3: { col: 1, row: 0 }, 2: { col: 2, row: 0 },
  5: { col: 0, row: 1 }, 6: { col: 1, row: 1 }, 1: { col: 2, row: 1 },
};

export default function CourtDiagram({ rotationNum, slots, liberos, roster, showZoneLabels }) {
  const court = resolveCourt(rotationNum, slots, liberos);
  const playerAt = (id) => roster[id] || { name: '—', number: '' };

  return (
    <div className="relative w-full aspect-[3/2] select-none">
      {/* net */}
      <div className="absolute -top-2 left-0 right-0 h-2 bg-[repeating-linear-gradient(90deg,var(--color-chalk)_0,var(--color-chalk)_8px,transparent_8px,transparent_16px)] opacity-70 rounded-full" />

      {/* court outline + grid */}
      <div className="absolute inset-0 rounded-lg border-2 border-chalk/40 overflow-hidden bg-ink-raised z-0">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-chalk/20" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-chalk/20" />
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-chalk/10" />
        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-chalk/10" />

        {showZoneLabels &&
          Object.entries(ZONE_CELL).map(([zone, { col, row }]) => (
            <div
              key={`label-${zone}`}
              className="absolute font-data text-xs sm:text-sm font-medium tracking-wide text-chalk-dim/90 bg-ink-raised/90 px-1.5 py-0.5 rounded pointer-events-none"
              style={{
                left: `calc(${(col / 3) * 100}% + 6px)`,
                top: `calc(${(row / 2) * 100}% + 6px)`,
              }}
            >
              {zoneLabel(zone)}
            </div>
          ))}
      </div>

      {/* player pucks - keyed by slot so position transitions animate smoothly */}
      {[1, 2, 3, 4, 5, 6].map((slotNum) => {
        const zone = zoneForSlot(rotationNum, slotNum);
        const pos = ZONE_POS[zone];
        const cell = court[zone];
        const isServing = zone === 1;
        const player = playerAt(cell.playerId);

        return (
          <div
            key={`slot-${slotNum}`}
            className="absolute flex flex-col items-center transition-all duration-700 ease-out z-10"
            style={{
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`relative flex items-center justify-center rounded-full w-12 h-12 sm:w-14 sm:h-14 font-display font-semibold text-lg sm:text-xl shadow-lg transition-colors duration-500 ${
                cell.isLibero
                  ? 'bg-court-line text-chalk'
                  : isFrontRow(zone)
                    ? 'bg-gold text-ink'
                    : 'bg-ink text-chalk border-2 border-chalk-dim'
              }`}
            >
              {cell.isLibero ? 'L' : player.number || slotNum}
              {isServing && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-serve border-2 border-ink" />
              )}
            </div>
            <span className="mt-1 text-[11px] sm:text-xs font-medium text-chalk-dim max-w-[4.5rem] truncate text-center">
              {player.name || '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
