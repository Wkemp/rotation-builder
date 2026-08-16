export default function ServeOrderSheet({ teamName, slots, roster }) {
  const playerAt = (id) => roster[id] || { name: '—', number: '' };

  return (
    <div className="printable bg-white text-black p-6 rounded-lg print:p-0 print:rounded-none">
      <div className="flex items-baseline justify-between mb-4 border-b-2 border-black pb-2 print:mb-6 print:pb-3">
        <h2 className="font-display text-2xl font-semibold print:text-4xl">
          {teamName || 'Team'} — Serve Order
        </h2>
      </div>
      <ol className="space-y-2 print:space-y-5">
        {[1, 2, 3, 4, 5, 6].map((n) => {
          const p = playerAt(slots[n - 1]);
          return (
            <li
              key={n}
              className="flex items-center gap-4 border-b border-gray-200 pb-2 print:pb-4 print:gap-6"
            >
              <span className="font-display font-bold text-3xl text-gray-300 w-10 print:text-6xl print:w-20">
                {n}
              </span>
              <span className="font-data text-lg text-gray-500 print:text-3xl">
                #{p.number || '–'}
              </span>
              <span className="text-lg font-medium print:text-3xl">{p.name || '—'}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
