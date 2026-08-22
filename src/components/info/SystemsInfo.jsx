import { InfoSection, RulesDisclaimer } from './InfoShared';

export default function SystemsInfo() {
  return (
    <div>
      <InfoSection title="What the Numbers Mean">
        <p>
          "5-1," "6-2," and "4-2" describe how many attackers and setters a team runs — attackers
          first, setters second. They're about who sets and from where, not a different way of
          rotating: this app's rotation math works identically no matter which system you run,
          since it's just tracking six fixed serving-order slots. The system only changes which
          position label you'd put on each of those six players.
        </p>
      </InfoSection>

      <InfoSection title="4-2 — Two Setters, Front Row">
        <p>
          Four hitters, two setters, positioned opposite each other in the serving order (three
          rotations apart) so one is always in the front row. That front-row setter sets; the team
          effectively has two attackers that rotation. Simplest system to learn and the most common
          starting point for beginners — the release to the net is short and there's less
          decision-making pressure on young setters.
        </p>
      </InfoSection>

      <InfoSection title="6-2 — Two Setters, Back Row">
        <p>
          Six hitters, two setters — but unlike the 4-2, the setters only set when they're in the
          <em> back</em> row. When a setter rotates to the front row, they become a pure attacker,
          and the other setter (now in back row) takes over setting duties. The payoff: three
          front-row attackers in every single rotation, the most offensive firepower of the three
          systems. The cost: it requires two players skilled enough to both set accurately from
          the back row and attack effectively from the front — a demanding ask.
        </p>
      </InfoSection>

      <InfoSection title="5-1 — One Setter, All Six Rotations">
        <p>
          Five hitters, one setter who plays every single rotation without exception. When that
          setter is in the front row, the team plays like a 4-2 (two attackers). When they're in
          the back row, it plays like a 6-2 (three attackers). Multiple coaching sources describe
          the 5-1 as literally a hybrid of the other two, depending on where the setter happens to
          be that rotation.
        </p>
        <p>
          This is the most common system at competitive club, high school, and college levels — it
          demands the most from a single setter (both offensively and physically, given they never
          come off the court to rest), but rewards a team with one truly complete setter with
          consistent, predictable offense all match long.
        </p>
      </InfoSection>

      <RulesDisclaimer />
    </div>
  );
}
