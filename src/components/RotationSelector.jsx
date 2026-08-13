// Builds the display order of the 6 buttons starting from `startRotation`,
// while each button still shows and selects its TRUE rotation number.
function orderedRotations(startRotation) {
  const order = [];
  for (let i = 0; i < 6; i++) {
    order.push(((startRotation - 1 + i) % 6) + 1);
  }
  return order;
}

export default function RotationSelector({ current, startRotation, onSelect, onSetStart }) {
  const order = orderedRotations(startRotation);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm tracking-wide text-chalk-dim uppercase">Rotation</h3>
        <label className="flex items-center gap-1.5 text-xs text-chalk-dim">
          Start at
          <select
            value={startRotation}
            onChange={(e) => onSetStart(Number(e.target.value))}
            className="bg-ink-raised border border-ink-line rounded px-2 py-2 text-base text-chalk font-data"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                R{n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {order.map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`aspect-square min-h-11 rounded-lg font-display font-semibold text-lg transition-colors ${
              current === n
                ? 'bg-gold text-ink'
                : 'bg-ink-raised text-chalk-dim border border-ink-line hover:border-gold/50 hover:text-chalk'
            }`}
            aria-pressed={current === n}
            aria-label={`Rotation ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
