export default function ServeOrderSheet({ teamName, slots, roster }) {
  const playerAt = (id) => roster[id] || { name: '—', number: '' };

  return (
    <div className="printable bg-white text-black rounded-lg print:rounded-none p-6 print:p-0 max-w-md mx-auto">
      <div className="mb-4 border-b-2 border-black pb-2">
        <h2 className="font-display text-2xl font-semibold">{teamName || 'Team'} — Serve Order</h2>
        <span className="text-xs text-gray-500">Zone 1 serves first</span>
      </div>
      <ol className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((zone) => {
          const player = playerAt(slots[zone - 1]);
          return (
            <li
              key={zone}
              className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2.5"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black text-white font-display font-semibold flex-shrink-0">
                {zone}
              </span>
              <span className="font-data text-gray-500 w-8 text-center flex-shrink-0">
                {player.number || '–'}
              </span>
              <span className="font-medium flex-1 truncate">{player.name || '—'}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
