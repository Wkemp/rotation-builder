import { InfoSection, RulesDisclaimer } from './InfoShared';

export default function RotationsInfo() {
  return (
    <div>
      <InfoSection title="How Rotation Works">
        <p>
          Every time your team wins the serve back (a side-out), all six players rotate one
          position clockwise before the next serve: whoever's in zone 2 moves to zone 1 and
          serves, zone 1 moves to zone 6, zone 6 to zone 5, zone 5 to zone 4, zone 4 to zone 3, and
          zone 3 to zone 2. Six rotations later, everyone's back where they started.
        </p>
        <p>
          The serving order itself never changes for the whole set — it's fixed the moment you
          submit your starting lineup. Rotating just moves everyone through that same fixed order,
          one zone at a time.
        </p>
      </InfoSection>

      <InfoSection title="The Overlap Rule">
        <p>
          At the exact moment the ball is served — and only at that moment — every player must be
          in the correct position relative to their immediate neighbors:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Each front-row player must be closer to the net than their back-row counterpart.</li>
          <li>Within each row, left-to-right order must be maintained (e.g. the left-front
            player must stay left of the middle-front player).</li>
        </ul>
        <p>
          This binds both teams, not just the one receiving serve — though the serving team has
          more practical freedom since their own server is exempt from the comparison. Break this
          and it's an overlap fault: a point and the serve for the other team.
        </p>
      </InfoSection>

      <InfoSection title="Court Position vs. Playing Position">
        <p>
          This is the idea behind this app's Base, Serving, and Receiving views. Overlap only has
          to be legal at the instant of contact — the moment the ball is served, everyone is free
          to move anywhere. Teams use this constantly: a setter can start in a legal-but-awkward
          spot, then release toward the net the instant the ball is live. A middle blocker rotated
          out to left-front can slide back to the middle once it's safe to move.
        </p>
        <p>
          This app calls that transition a <strong className="text-chalk">switch</strong> — visible
          as a small swap-icon badge on the court diagram, available specifically on the Receiving
          view since that's where the tension between a legal passing shape and a team's preferred
          attacking positions matters most.
        </p>
      </InfoSection>

      <InfoSection title="The Libero">
        <p>
          The libero is a back-row defensive specialist who can substitute in and out for a
          back-row player without counting against the team's regular substitution limit, and
          without needing to check in with the referee first. They can never attack the ball in
          front of the attack line, can never block, and — depending on your league's rule — may
          only be allowed to serve in one specific spot in the rotation, if at all.
        </p>
      </InfoSection>

      <RulesDisclaimer />
    </div>
  );
}
