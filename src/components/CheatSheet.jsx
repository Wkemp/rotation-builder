import {
  resolveCourt,
  zoneForSlot,
  gridToFraction,
  formationKey,
  isFrontRow,
  ZONES,
  ZONE_POS,
  GRID_COLS,
  GRID_ROWS,
  OUTSIDE_ROW,
} from '../lib/rotation';

/** One small court diagram: net line, six positioned circles, and a caption
 * noting any libero/sub swaps active for this specific rotation. */
function MiniCourt({
  rotationNum,
  slots,
  liberos,
  substitutions,
  substitutionServers,
  roster,
  activeFormation,
  serveState,
  note,
}) {
  const court = resolveCourt(rotationNum, slots, liberos, substitutions, substitutionServers);
  const playerAt = (id) => roster[id] || { name: '—', number: '' };
  const servingPlayer = playerAt(court[1].playerId);

  const notes = [];
  for (const zone of ZONES) {
    const cell = court[zone];
    if (cell.isLibero) {
      notes.push(
        `L #${playerAt(cell.playerId).number || '?'} in for #${playerAt(cell.originalPlayerId).number || '?'}`
      );
    } else if (cell.isSub) {
      notes.push(
        `Sub #${playerAt(cell.playerId).number || '?'} in for #${playerAt(cell.originalPlayerId).number || '?'}`
      );
    }
  }

  return (
    <div className="border-2 border-gray-400 rounded-md p-2 print:p-3 flex flex-col print:break-inside-avoid">
      <div className="flex items-center justify-between mb-1.5 print:mb-2">
        <span className="font-display font-semibold text-sm print:text-lg">Rotation {rotationNum}</span>
        <span className="text-[10px] text-gray-500 print:text-sm">Serving #{servingPlayer.number || '–'}</span>
      </div>
      <div className="relative w-full aspect-[3/2] border border-black rounded mb-10">
        {/* net: a bold line is enough at this size */}
        <div className="absolute -top-1 left-0 right-0 h-[3px] bg-black rounded-full" />
        {/* thin zone guide lines */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300" />
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-200" />
        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-200" />

        {[1, 2, 3, 4, 5, 6].map((slotNum) => {
          const zone = zoneForSlot(rotationNum, slotNum);
          const customCell = activeFormation?.[slotNum - 1];
          const isServing = zone === 1;
          let pos = customCell ? gridToFraction(customCell) : ZONE_POS[zone];
          // Same "server steps behind the end line" treatment as the
          // interactive view, for Base/Serving pages (not Receiving).
          if (isServing && !customCell && serveState !== 'receive') {
            pos = { x: ZONE_POS[1].x, y: (OUTSIDE_ROW + 0.5) / GRID_ROWS };
          }
          const cell = court[zone];
          const player = playerAt(cell.playerId);
          // Libero and subs share one "not the normal starter" treatment
          // (dotted border) - the caption below spells out which is which,
          // rather than trying to encode two special states visually.
          const special = cell.isLibero || cell.isSub;
          const filled = !special && isFrontRow(zone);

          return (
            <div
              key={slotNum}
              className="absolute flex items-center justify-center rounded-full text-[10px] print:text-lg font-data font-bold"
              style={{
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
                // A puck fills exactly one cell of the 4x4 grid within its zone.
                // Since the court is 3:2 and the grid is 12x8 (same 3:2 ratio),
                // this works out to a true square regardless of the court's
                // actual rendered size on screen or in print.
                width: `${100 / GRID_COLS}%`,
                height: `${100 / GRID_ROWS}%`,
                transform: 'translate(-50%, -50%)',
                border: special ? '2px dotted black' : '1.5px solid black',
                background: filled ? '#000' : '#fff',
                color: filled ? '#fff' : '#000',
              }}
            >
              {player.number || '–'}
            </div>
          );
        })}
      </div>
      {notes.length > 0 && (
        <div className="text-[8px] print:text-[11px] text-gray-600 leading-tight">
          {notes.join(' · ')}
        </div>
      )}
      {note && (
        <div className="mt-1 pt-1 border-t border-gray-200 text-[8px] print:text-[11px] text-gray-700 italic leading-tight">
          {note}
        </div>
      )}
    </div>
  );
}

/** One printable page: header, a 3x2 grid of MiniCourts, optional footer content. */
function RotationPage({
  title,
  subtitle,
  isFirstPage,
  getFormation,
  slots,
  liberos,
  substitutions,
  substitutionServers,
  roster,
  serveState,
  rotationNotes,
  footer,
}) {
  return (
    <div
      className={`p-6 print:p-0 print:min-h-screen print:flex print:flex-col ${
        isFirstPage ? '' : 'mt-8 print:mt-0 print:break-before-page'
      }`}
    >
      <div className="flex items-baseline justify-between mb-4 border-b-2 border-black pb-2 print:mb-3 print:pb-2 print:shrink-0">
        <h2 className="font-display text-2xl font-semibold print:text-3xl">{title}</h2>
        <span className="text-xs text-gray-500 print:text-sm">{subtitle}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:grid-cols-3 print:grid-rows-2 print:flex-1 print:gap-3">
        {[1, 2, 3, 4, 5, 6].map((rotationNum) => (
          <MiniCourt
            key={rotationNum}
            rotationNum={rotationNum}
            slots={slots}
            liberos={liberos}
            substitutions={substitutions}
            substitutionServers={substitutionServers}
            roster={roster}
            activeFormation={getFormation ? getFormation(rotationNum) : null}
            serveState={serveState}
            note={rotationNotes?.[rotationNum]}
          />
        ))}
      </div>
      {footer}
    </div>
  );
}

export default function CheatSheet({
  teamName,
  slots,
  liberos,
  substitutions = [],
  substitutionServers = {},
  formations = {},
  rotationNotes = {},
  roster,
}) {
  const playerAt = (id) => roster[id] || { name: '—', number: '' };
  const hasServeFormations = Object.keys(formations).some((k) => k.endsWith('-serve'));
  const hasReceiveFormations = Object.keys(formations).some((k) => k.endsWith('-receive'));

  const substitutionsFooter = substitutions.length > 0 && (
    <div className="mt-4 pt-3 border-t border-gray-300 print:mt-3 print:pt-3 print:shrink-0">
      <h3 className="font-display font-semibold text-sm mb-1.5 print:text-lg print:mb-2">
        Planned Substitutions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 print:grid-cols-3 print:gap-3 text-[11px] print:text-sm">
        {substitutions.map((s) => (
          <div
            key={s.id}
            className="border border-gray-300 rounded px-2 py-1.5 print:border-2 print:border-gray-400 print:rounded-md print:px-3 print:py-2"
          >
            <div className="font-medium">
              {playerAt(s.subPlayerId).name || '—'}{' '}
              <span className="font-normal text-gray-500">in for</span>{' '}
              {playerAt(s.forPlayerId).name || '—'}
            </div>
            <div className="text-gray-500 print:text-gray-600">
              {s.rotations && s.rotations.length > 0
                ? `Rotation${s.rotations.length > 1 ? 's' : ''} ${s.rotations.join(', ')}`
                : 'Any rotation'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="printable bg-white text-black rounded-lg print:rounded-none">
      <RotationPage
        title={`${teamName || 'Rotation'} Cheat Sheet — Base`}
        subtitle="Verify against your league's official rules"
        isFirstPage
        getFormation={null}
        slots={slots}
        liberos={liberos}
        substitutions={substitutions}
        substitutionServers={substitutionServers}
        roster={roster}
        serveState="base"
        rotationNotes={rotationNotes}
        footer={substitutionsFooter}
      />

      {hasServeFormations && (
        <RotationPage
          title={`${teamName || 'Rotation'} — Serving`}
          subtitle="Custom rotations shown; others fall back to Base"
          getFormation={(r) => formations[formationKey(r, 'serve')]}
          slots={slots}
          liberos={liberos}
          substitutions={substitutions}
          substitutionServers={substitutionServers}
          roster={roster}
          serveState="serve"
          rotationNotes={rotationNotes}
        />
      )}

      {hasReceiveFormations && (
        <RotationPage
          title={`${teamName || 'Rotation'} — Receiving`}
          subtitle="Custom rotations shown; others fall back to Base"
          getFormation={(r) => formations[formationKey(r, 'receive')]}
          slots={slots}
          liberos={liberos}
          substitutions={substitutions}
          substitutionServers={substitutionServers}
          roster={roster}
          serveState="receive"
          rotationNotes={rotationNotes}
        />
      )}
    </div>
  );
}
