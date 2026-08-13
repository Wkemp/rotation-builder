import { resolveCourt, zoneLabel } from '../lib/rotation';

const LAYOUT_ZONES = [4, 3, 2, 5, 6, 1]; // front row then back row, left to right

export default function CheatSheet({ teamName, slots, liberos, roster }) {
  const playerAt = (id) => roster[id] || { name: '—', number: '' };

  return (
    <div
      id="cheat-sheet"
      className="bg-white text-black p-6 rounded-lg print:p-0 print:rounded-none print:h-screen print:flex print:flex-col"
    >
      <div className="flex items-baseline justify-between mb-4 border-b-2 border-black pb-2 print:mb-3 print:pb-2 print:shrink-0">
        <h2 className="font-display text-2xl font-semibold print:text-3xl">
          {teamName || 'Rotation'} Cheat Sheet
        </h2>
        <span className="text-xs text-gray-500 print:text-sm">
          Verify against your league's official rules
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:grid-cols-3 print:grid-rows-2 print:flex-1 print:gap-3">
        {[1, 2, 3, 4, 5, 6].map((rotationNum) => {
          const court = resolveCourt(rotationNum, slots, liberos);
          return (
            <div
              key={rotationNum}
              className="border border-gray-300 rounded p-2 print:border-2 print:border-gray-400 print:rounded-md print:p-4 print:flex print:flex-col print:break-inside-avoid"
            >
              <div className="font-display font-semibold text-sm mb-1.5 flex items-center justify-between print:text-xl print:mb-3">
                <span>Rotation {rotationNum}</span>
                <span className="text-[10px] text-gray-500 print:text-sm">
                  Serving: {playerAt(court[1].playerId).number || '–'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] font-data print:gap-2 print:text-base print:flex-1">
                {LAYOUT_ZONES.map((zone) => {
                  const cell = court[zone];
                  const p = playerAt(cell.playerId);
                  return (
                    <div
                      key={zone}
                      className={`border rounded px-1 py-1 text-center print:py-3 print:rounded-lg ${
                        zone === 1
                          ? 'border-black font-semibold print:border-2'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="text-gray-400 print:text-xs">{zoneLabel(zone)}</div>
                      <div className="print:text-lg print:font-semibold">
                        {cell.isLibero ? 'L' : p.number || '–'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
