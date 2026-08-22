export function InfoSection({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-display text-sm tracking-wide text-gold uppercase mb-2">{title}</h3>
      <div className="text-sm text-chalk-dim leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export function RulesDisclaimer() {
  return (
    <p className="text-xs text-chalk-dim/70 italic mt-6 pt-4 border-t border-ink-line">
      Rules content is a general reference, not official rules text — always verify specifics
      against your league's current rule book.
    </p>
  );
}
