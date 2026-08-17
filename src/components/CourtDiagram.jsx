import { useState, useRef } from 'react';
import {
  zoneForSlot,
  resolveCourt,
  zoneLabel,
  isFrontRow,
  gridToFraction,
  fractionToGrid,
  formationKey,
  GRID_COLS,
  GRID_ROWS,
  ZONE_POS,
} from '../lib/rotation';

// Column/row for each zone's cell — used to place zone labels in a corner,
// clear of the puck that sits in the center of the same cell.
const ZONE_CELL = {
  4: { col: 0, row: 0 }, 3: { col: 1, row: 0 }, 2: { col: 2, row: 0 },
  5: { col: 0, row: 1 }, 6: { col: 1, row: 1 }, 1: { col: 2, row: 1 },
};

export default function CourtDiagram({
  rotationNum,
  slots,
  liberos,
  substitutions = [],
  roster,
  showZoneLabels,
  serveState = 'base',
  formations = {},
  editingFormation = false,
  onPlacePlayer,
  isFullscreen = false,
}) {
  const court = resolveCourt(rotationNum, slots, liberos, substitutions);
  const playerAt = (id) => roster[id] || { name: '—', number: '' };
  const [pickedUpSlot, setPickedUpSlot] = useState(null);
  const courtRef = useRef(null);

  const activeFormation =
    serveState !== 'base' ? formations[formationKey(rotationNum, serveState)] : null;

  // Position (left/top) is already percentage-based, so it scales with the
  // court box automatically. Size and text are normally fixed pixel values
  // though, so without this they'd stay small even as the court grows a lot
  // in full screen. These pick a bigger set of sizes for that case.
  const puckSize = isFullscreen
    ? 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl'
    : 'w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl';
  const servingDot = isFullscreen ? 'w-6 h-6 -top-2 -right-2' : 'w-4 h-4 -top-1.5 -right-1.5';
  const nameLabel = isFullscreen ? 'text-sm sm:text-base mt-1.5' : 'text-[11px] sm:text-xs mt-1';
  const nameLabelWidth = isFullscreen ? 'max-w-[7rem]' : 'max-w-[4.5rem]';
  const zoneLabelSize = isFullscreen
    ? 'text-base sm:text-lg px-2 py-1'
    : 'text-xs sm:text-sm px-1.5 py-0.5';
  const hintText = isFullscreen ? 'text-base' : 'text-[11px]';
  const benchChip = isFullscreen ? 'w-14 h-14 text-lg' : 'w-9 h-9 text-sm';
  const benchCaption = isFullscreen ? 'text-sm mt-1.5' : 'text-[10px] mt-1';
  const benchCaptionWidth = isFullscreen ? 'max-w-[7rem]' : 'max-w-[4.5rem]';
  const sectionLabel = isFullscreen ? 'text-sm' : 'text-[10px]';

  function handlePuckClick(slotNum) {
    if (!editingFormation) return;
    setPickedUpSlot((prev) => (prev === slotNum ? null : slotNum));
  }

  function handleCourtClick(e) {
    if (!editingFormation || pickedUpSlot === null || !courtRef.current) return;
    const rect = courtRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const cell = fractionToGrid(x, y);
    onPlacePlayer?.(pickedUpSlot - 1, cell);
    setPickedUpSlot(null);
  }

  return (
    <div className="w-full select-none">
      <div className="relative w-full aspect-[3/2]">
        {/* net: antennas at the sidelines, a solid top tape, and a mesh band
            hanging below it - reads as an actual net, not a dashed line */}
        <div className="absolute -top-4 left-0 right-0 h-4 pointer-events-none">
          <div className="absolute -left-0.5 top-0 w-1 h-5 bg-serve rounded-full shadow-sm" />
          <div className="absolute -right-0.5 top-0 w-1 h-5 bg-serve rounded-full shadow-sm" />
          <div className="absolute top-0.5 left-0 right-0 h-1.5 bg-chalk rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-2.5 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,var(--color-chalk-dim)_0,var(--color-chalk-dim)_1px,transparent_1px,transparent_5px)] opacity-40" />
        </div>

        {/* court outline + grid - also the tap target for placing a picked-up player */}
        <div
          ref={courtRef}
          onClick={handleCourtClick}
          className={`absolute inset-0 rounded-lg border-2 border-chalk/40 overflow-hidden bg-ink-raised z-0 ${
            editingFormation && pickedUpSlot !== null ? 'cursor-crosshair' : ''
          }`}
        >
          <div className="absolute left-0 right-0 top-1/2 h-px bg-chalk/20" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-chalk/20" />
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-chalk/10" />
          <div className="absolute top-0 bottom-0 left-2/3 w-px bg-chalk/10" />

          {editingFormation && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: GRID_COLS - 1 }).map((_, i) => (
                <div
                  key={`gc-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-gold/15"
                  style={{ left: `${((i + 1) / GRID_COLS) * 100}%` }}
                />
              ))}
              {Array.from({ length: GRID_ROWS - 1 }).map((_, i) => (
                <div
                  key={`gr-${i}`}
                  className="absolute left-0 right-0 h-px bg-gold/15"
                  style={{ top: `${((i + 1) / GRID_ROWS) * 100}%` }}
                />
              ))}
            </div>
          )}

          {showZoneLabels &&
            Object.entries(ZONE_CELL).map(([zone, { col, row }]) => (
              <div
                key={`label-${zone}`}
                className={`absolute font-data font-medium tracking-wide text-chalk-dim/90 bg-ink-raised/90 rounded pointer-events-none ${zoneLabelSize}`}
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
          const customCell = activeFormation?.[slotNum - 1];
          const pos = customCell ? gridToFraction(customCell) : ZONE_POS[zone];
          const cell = court[zone];
          const isServing = zone === 1;
          const player = playerAt(cell.playerId);
          const isPickedUp = pickedUpSlot === slotNum;

          return (
            <div
              key={`slot-${slotNum}`}
              onClick={() => handlePuckClick(slotNum)}
              className={`absolute flex flex-col items-center transition-all duration-700 ease-out z-10 ${
                editingFormation ? 'cursor-pointer' : ''
              }`}
              style={{
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`relative flex items-center justify-center rounded-full font-display font-semibold shadow-lg transition-colors duration-500 ${puckSize} ${
                  isPickedUp ? 'ring-4 ring-gold animate-pulse' : ''
                } ${
                  cell.isSub
                    ? 'bg-sub text-chalk'
                    : cell.isLibero
                      ? 'bg-court-line text-chalk'
                      : isFrontRow(zone)
                        ? 'bg-gold text-ink'
                        : 'bg-ink text-chalk border-2 border-chalk-dim'
                }`}
              >
                {cell.isLibero ? 'L' : player.number || slotNum}
                {isServing && (
                  <span
                    className={`absolute rounded-full bg-serve border-2 border-ink ${servingDot}`}
                  />
                )}
              </div>
              <span
                className={`font-medium text-chalk-dim truncate text-center ${nameLabel} ${nameLabelWidth}`}
              >
                {player.name || '—'}
              </span>
            </div>
          );
        })}
      </div>

      {editingFormation && (
        <p className={`mt-2 text-gold text-center ${hintText}`}>
          {pickedUpSlot === null
            ? 'Tap a player, then tap where they should stand.'
            : 'Tap anywhere on the court to place them there.'}
        </p>
      )}

      {/* Libero + Bench share one row: substitutions on the left, libero pinned
          to the right end - no reason for either to cost its own line. */}
      {(liberos.length > 0 || substitutions.length > 0) && (
        <div className="mt-4 pt-3 border-t border-ink-line flex items-start gap-4">
          {substitutions.length > 0 && (
            <div className="flex-1 min-w-0">
              <div
                className={`uppercase tracking-widest text-chalk-dim/70 font-display mb-2 ${sectionLabel}`}
              >
                Bench
              </div>
              <div className="flex flex-wrap gap-3">
                {substitutions.map((s) => {
                  const isActive =
                    !s.rotations || s.rotations.length === 0 || s.rotations.includes(rotationNum);
                  const subPlayer = playerAt(s.subPlayerId);
                  const forPlayer = playerAt(s.forPlayerId);
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col items-center transition-opacity duration-500"
                      style={{ opacity: isActive ? 1 : 0.4 }}
                    >
                      <div
                        className={`flex items-center justify-center rounded-full font-display font-semibold border-2 transition-colors duration-500 ${benchChip} ${
                          isActive
                            ? 'bg-sub text-chalk border-sub'
                            : 'bg-ink text-chalk-dim border-ink-line'
                        }`}
                      >
                        {subPlayer.number || '?'}
                      </div>
                      <span
                        className={`text-chalk-dim text-center truncate ${benchCaption} ${benchCaptionWidth}`}
                      >
                        {isActive ? 'in for' : 'for'} {forPlayer.name || '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {liberos.length > 0 && (
            <div className="flex-shrink-0 ml-auto">
              <div
                className={`uppercase tracking-widest text-chalk-dim/70 font-display mb-2 text-right ${sectionLabel}`}
              >
                Libero
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                {liberos.map((l) => {
                  const activeEntry = Object.values(court).find(
                    (c) => c.isLibero && c.playerId === l.playerId
                  );
                  const isActive = !!activeEntry;
                  const liberoPlayer = playerAt(l.playerId);
                  const coveringName = activeEntry ? playerAt(activeEntry.originalPlayerId).name : null;
                  return (
                    <div
                      key={l.playerId}
                      className="flex flex-col items-center transition-opacity duration-500"
                      style={{ opacity: isActive ? 1 : 0.4 }}
                    >
                      <div
                        className={`flex items-center justify-center rounded-full font-display font-semibold border-2 transition-colors duration-500 ${benchChip} ${
                          isActive
                            ? 'bg-court-line text-chalk border-court-line'
                            : 'bg-ink text-chalk-dim border-ink-line'
                        }`}
                      >
                        {liberoPlayer.number || 'L'}
                      </div>
                      <span
                        className={`text-chalk-dim text-center truncate ${benchCaption} ${benchCaptionWidth}`}
                      >
                        {isActive ? `for ${coveringName}` : 'on bench'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
