import { InfoSection, RulesDisclaimer } from './InfoShared';

const ZONE_LAYOUT = [
  { zone: 4, label: 'LF' },
  { zone: 3, label: 'MF' },
  { zone: 2, label: 'RF' },
  { zone: 5, label: 'LB' },
  { zone: 6, label: 'MB' },
  { zone: 1, label: 'RB' },
];

export default function ZonesInfo() {
  return (
    <div>
      <InfoSection title="The Six Zones">
        <p>
          Every volleyball court is divided into six numbered zones — three in the front row
          (nearest the net) and three in the back row. Every player occupies exactly one zone at
          any given rotation, and the numbering is standard across the sport: 1 through 6, always
          in the same layout relative to the net.
        </p>
      </InfoSection>

      <div className="max-w-sm mx-auto mb-6">
        <div className="relative w-full aspect-[3/2]">
          <div className="absolute -top-2 left-0 right-0 h-1 bg-chalk rounded-full" />
          <div className="absolute inset-0 rounded-lg border-2 border-chalk/40 overflow-hidden bg-ink-raised">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-chalk/20" />
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-chalk/10" />
            <div className="absolute top-0 bottom-0 left-2/3 w-px bg-chalk/10" />
          </div>
          {ZONE_LAYOUT.map(({ zone, label }, i) => {
            const col = i % 3;
            const row = i < 3 ? 0 : 1;
            return (
              <div
                key={zone}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${((col + 0.5) / 3) * 100}%`,
                  top: `${((row + 0.5) / 2) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`flex items-center justify-center rounded-full w-12 h-12 font-display font-semibold text-xl ${
                    row === 0 ? 'bg-gold text-ink' : 'bg-ink text-chalk border-2 border-chalk-dim'
                  }`}
                >
                  {zone}
                </div>
                <span className="mt-1 text-[11px] font-data text-chalk-dim">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <InfoSection title="Front Row vs. Back Row">
        <p>
          Zones 2, 3, and 4 are the front row — closest to the net. Zones 1, 5, and 6 are the back
          row. This distinction matters constantly: back-row players can't attack the ball in
          front of the attack line (unless they jump from behind it), and it's the basis for the
          overlap rule covered on the Rotations tab.
        </p>
      </InfoSection>

      <InfoSection title="Zone 1 — Serving">
        <p>
          Zone 1 (right back) is always the serving position. Whoever's in zone 1 when it's your
          team's turn serves — that's not a coaching choice, it's just where the serving order
          places them. This app's court diagram marks the server with a small red dot.
        </p>
      </InfoSection>

      <RulesDisclaimer />
    </div>
  );
}
