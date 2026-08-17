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
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        {order.map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`w-8 h-9 rounded text-sm font-display font-semibold transition-colors ${
              current === n
                ? 'bg-gold text-ink'
                : 'bg-ink text-chalk-dim border border-ink-line hover:border-gold/50 hover:text-chalk'
            }`}
            aria-pressed={current === n}
            aria-label={`Rotation ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      <select
        value={startRotation}
        onChange={(e) => onSetStart(Number(e.target.value))}
        title="Which rotation the buttons start counting from"
        className="h-9 bg-ink border border-ink-line rounded px-1.5 text-chalk-dim font-data"
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n} value={n}>
            Start R{n}
          </option>
        ))}
      </select>
    </div>
  );
}
