import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeftRight, Maximize2, Minimize2, Tag, RotateCcw } from 'lucide-react';
import {
  zoneForSlot,
  resolveCourt,
  zoneLabel,
  isFrontRow,
  gridToFraction,
  fractionToGrid,
  fractionToOutsideGrid,
  formationKey,
  GRID_COLS,
  GRID_ROWS,
  OUTSIDE_ROW,
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
  substitutionServers = {},
  roster,
  showZoneLabels,
  onToggleZoneLabels,
  serveState = 'base',
  showSwitch = false,
  formations = {},
  editingFormation = false,
  onToggleEditingFormation,
  onResetFormation,
  canReset = false,
  onPlacePlayer,
  isFullscreen = false,
  onToggleFullscreen,
  onPrevRotation,
  onNextRotation,
  note = '',
  onUpdateNote,
}) {
  const court = resolveCourt(rotationNum, slots, liberos, substitutions, substitutionServers);
  const playerAt = (id) => roster[id] || { name: '—', number: '' };
  const [pickedUpSlot, setPickedUpSlot] = useState(null);
  const [diagramTab, setDiagramTab] = useState('court'); // 'court' | 'notes'
  const courtRef = useRef(null);

  // On/off-court alerts: compares, per STARTER (not per zone, since a
  // starter's zone changes every rotation by design), whether they're
  // currently covered by a libero/sub versus last render. Tracking by the
  // starter's own id (not zone) is what makes this correct across a
  // rotation change rather than just noticing "zone 3 changed."
  const [alerts, setAlerts] = useState([]);
  const prevStatusRef = useRef(null);
  const statusByStarter = {};
  for (const zone of [1, 2, 3, 4, 5, 6]) {
    const cell = court[zone];
    if (!cell.originalPlayerId) continue;
    statusByStarter[cell.originalPlayerId] = cell.isLibero ? 'libero' : cell.isSub ? 'sub' : null;
  }
  const statusKey = JSON.stringify(statusByStarter);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = statusByStarter;
    if (!prevStatus) return; // first render - nothing to compare against yet

    const changes = [];
    for (const starterId of Object.keys(statusByStarter)) {
      const before = prevStatus[starterId];
      const after = statusByStarter[starterId];
      if (before === after) continue;
      const starterName = playerAt(starterId).name;
      if (after && !before) {
        changes.push({
          id: `${starterId}-in-${Date.now()}`,
          text: `${after === 'libero' ? 'Libero' : 'Sub'} in for ${starterName}`,
          tone: 'in',
        });
      } else if (!after && before) {
        changes.push({ id: `${starterId}-out-${Date.now()}`, text: `${starterName} back in`, tone: 'out' });
      } else {
        // switched directly from one type to the other (e.g. sub replaced by libero)
        changes.push({
          id: `${starterId}-swap-${Date.now()}`,
          text: `${after === 'libero' ? 'Libero' : 'Sub'} in for ${starterName}`,
          tone: 'in',
        });
      }
    }
    if (changes.length === 0) return;

    setAlerts((prev) => [...prev, ...changes]);
    const timers = changes.map((c) =>
      setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== c.id)), 4000)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey]);

  function dismissAlert(id) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const receiveFormation = formations[formationKey(rotationNum, 'receive')];
  // Switch ("playing position") data always exists independent of whether
  // it's currently being viewed, since the switch badge below needs to know
  // who switches regardless of which tab is active.
  const switchData = formations[formationKey(rotationNum, 'receive-switch')];
  const viewingSwitch = showSwitch && serveState === 'receive';
  const activeFormation = viewingSwitch
    ? switchData
    : serveState !== 'base'
      ? formations[formationKey(rotationNum, serveState)]
      : null;

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
  const navButtonSize = isFullscreen ? 'w-14 h-14' : 'w-11 h-11';
  const navIconSize = isFullscreen ? 24 : 18;
  // Margin reserved below the court box for the "outside the end line" strip
  // (a genuine extra row, 1/GRID_ROWS = 10% of court height) plus enough
  // slack for a puck's own radius to extend past it without being clipped
  // by an ancestor's overflow:hidden - computed for the real size range this
  // app runs at (iPad through full screen), not guessed.
  const courtBottomMargin = isFullscreen ? 'mb-40' : 'mb-20';

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

  function handleOutsideClick(e) {
    if (!editingFormation || pickedUpSlot === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const cell = fractionToOutsideGrid(x);
    onPlacePlayer?.(pickedUpSlot - 1, cell);
    setPickedUpSlot(null);
  }

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        {onUpdateNote ? (
          <div className="flex items-center gap-1 bg-ink-raised rounded-lg p-1 w-fit">
            <button
              onClick={() => setDiagramTab('court')}
              className={`h-11 px-3 rounded text-sm font-medium transition-colors ${
                diagramTab === 'court' ? 'bg-gold text-ink' : 'text-chalk-dim'
              }`}
            >
              Court
            </button>
            <button
              onClick={() => setDiagramTab('notes')}
              className={`h-11 px-3 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${
                diagramTab === 'notes' ? 'bg-gold text-ink' : 'text-chalk-dim'
              }`}
            >
              Notes
              {note && <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />}
            </button>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              className={`flex items-center justify-center w-11 h-11 rounded-full border transition-colors ${
                isFullscreen
                  ? 'bg-gold text-ink border-gold'
                  : 'bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
              }`}
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          )}
          {onToggleZoneLabels && (
            <button
              onClick={onToggleZoneLabels}
              aria-pressed={showZoneLabels}
              title="Zone labels"
              className={`flex items-center justify-center w-11 h-11 rounded-full border transition-colors ${
                showZoneLabels
                  ? 'bg-gold text-ink border-gold'
                  : 'bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
              }`}
            >
              <Tag size={17} />
            </button>
          )}
          {serveState !== 'base' && (
            <>
              {onResetFormation && (
                <button
                  onClick={onResetFormation}
                  disabled={!canReset}
                  title="Reset this formation to its default"
                  className="flex items-center gap-1.5 h-11 px-3 rounded-lg text-xs font-medium border border-ink-line bg-ink text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
              {onToggleEditingFormation && (
                <button
                  onClick={onToggleEditingFormation}
                  aria-pressed={editingFormation}
                  className={`h-11 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    editingFormation
                      ? 'bg-gold text-ink border-gold'
                      : 'bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
                  }`}
                >
                  {editingFormation ? 'Done' : 'Edit'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {(!onUpdateNote || diagramTab === 'court') && (
        <>
          <div className={`relative w-full aspect-[3/2] ${courtBottomMargin}`}>
            {/* on/off-court alerts: libero or sub coming in or out as rotations
                change, positioned over the court's own top-right corner, clear
                of the header controls above and not blocking taps on the court */}
            {alerts.length > 0 && (
              <div className="absolute top-2 right-2 z-30 flex flex-col items-end gap-1.5 pointer-events-none">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => dismissAlert(alert.id)}
                    className={`pointer-events-auto rounded-lg shadow-lg font-medium text-left transition-opacity ${
                      isFullscreen ? 'px-4 py-2.5 text-base' : 'px-3 py-2 text-sm'
                    } ${
                      alert.tone === 'in'
                        ? 'bg-court-line text-chalk'
                        : 'bg-ink-raised text-chalk border border-ink-line'
                    }`}
                  >
                    {alert.text}
                  </button>
                ))}
              </div>
            )}

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

            {/* outside the end line: a genuine extra row, the same height as
                any other row, for placing a player - most notably the server
                - truly off the court rather than just near its edge. Visually
                distinct (dashed edge, hatched fill, no solid border) so it
                reads as "out of bounds," not part of the court itself. */}
            <div
              onClick={handleOutsideClick}
              className={`absolute left-0 right-0 border-t border-dashed border-chalk/25 bg-[repeating-linear-gradient(135deg,var(--color-ink-line)_0,var(--color-ink-line)_1px,transparent_1px,transparent_6px)] z-0 ${
                editingFormation && pickedUpSlot !== null ? 'cursor-crosshair' : ''
              }`}
              style={{ top: '100%', height: `${(1 / GRID_ROWS) * 100}%` }}
            >
              {editingFormation && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: GRID_COLS - 1 }).map((_, i) => (
                    <div
                      key={`ogc-${i}`}
                      className="absolute top-0 bottom-0 w-px bg-gold/15"
                      style={{ left: `${((i + 1) / GRID_COLS) * 100}%` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* player pucks - keyed by slot so position transitions animate smoothly */}
            {[1, 2, 3, 4, 5, 6].map((slotNum) => {
              const zone = zoneForSlot(rotationNum, slotNum);
              const customCell = activeFormation?.[slotNum - 1];
              const hasSwitch = !!switchData?.[slotNum - 1];
              let pos;
              if (customCell) {
                pos = gridToFraction(customCell);
              } else if (viewingSwitch && receiveFormation?.[slotNum - 1]) {
                // No switch override for this player - they stay exactly
                // where they were for the receive formation, not Base.
                pos = gridToFraction(receiveFormation[slotNum - 1]);
              } else {
                pos = ZONE_POS[zone];
              }
              const isServing = zone === 1;
              // The server never actually stands inside zone 1 - they're
              // behind the end line until contact. Steps them back there,
              // snapped to the same outside-row grid cell a coach could tap
              // to, for Base and Serving views (not Receiving, where this
              // team isn't serving), unless the coach has explicitly placed
              // this slot via the formation editor, which always wins.
              if (isServing && !customCell && serveState !== 'receive') {
                pos = { x: ZONE_POS[1].x, y: (OUTSIDE_ROW + 0.5) / GRID_ROWS };
              }
              const cell = court[zone];
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
                    {serveState === 'receive' && hasSwitch && (
                      <span
                        title="Switches after contact"
                        className={`absolute flex items-center justify-center rounded-full bg-gold text-ink border-2 border-ink ${
                          isFullscreen ? '-bottom-2 -left-2 w-7 h-7' : '-bottom-1.5 -left-1.5 w-5 h-5'
                        }`}
                      >
                        <ArrowLeftRight size={isFullscreen ? 14 : 11} />
                      </span>
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

          {/* prev/next rotation - a dedicated row below the diagram, not overlaid
              on it, so it can't collide with zone labels or pucks no matter
              what's toggled on */}
          {(onPrevRotation || onNextRotation) && (
            <div className="flex items-center justify-center gap-3 mt-3">
              {onPrevRotation && (
                <button
                  onClick={onPrevRotation}
                  aria-label="Previous rotation"
                  className={`flex items-center justify-center rounded-full bg-ink-raised border border-ink-line text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors ${navButtonSize}`}
                >
                  <ChevronLeft size={navIconSize} />
                </button>
              )}
              <span className={`font-display font-semibold text-chalk-dim ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                Rotation {rotationNum}
              </span>
              {onNextRotation && (
                <button
                  onClick={onNextRotation}
                  aria-label="Next rotation"
                  className={`flex items-center justify-center rounded-full bg-ink-raised border border-ink-line text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors ${navButtonSize}`}
                >
                  <ChevronRight size={navIconSize} />
                </button>
              )}
            </div>
          )}

          {editingFormation && (
            <p className={`mt-2 text-gold text-center ${hintText}`}>
              {pickedUpSlot === null
                ? 'Tap a player, then tap where they should stand.'
                : 'Tap anywhere on the court (or the outside strip below it) to place them there.'}
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
        </>
      )}

      {onUpdateNote && diagramTab === 'notes' && (
        <textarea
          value={note}
          onChange={(e) => onUpdateNote(e.target.value)}
          placeholder="Notes for this rotation (optional) — specifics, coaching tips, anything worth remembering..."
          rows={10}
          className={`w-full bg-ink-raised border border-ink-line rounded-lg px-3 py-2 text-chalk placeholder:text-chalk-dim/50 resize-none ${
            isFullscreen ? 'text-lg' : 'text-base'
          }`}
        />
      )}
    </div>
  );
}
