import { InfoSection } from './InfoShared';

export default function HowToInfo() {
  return (
    <div>
      <InfoSection title="Getting Around">
        <p>
          The court diagram is home base — it's always what you land on. Two panels handle
          everything else, and they work differently on purpose:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-chalk">Left panel</strong> (the player icon) is quick
            reference: which team and lineup you're on, your starting six, and a Serve Order
            print button. It's read-only, and it stays open once you open it — good to leave
            up while you work.
          </li>
          <li>
            <strong className="text-chalk">Right panel</strong> (Menu) is where you configure and
            edit — Roster, Lineup, Libero, Subs, Import/Export, Cheat Sheets, How To. Everything
            in there opens as a popup and returns you to exactly where you were on the court when
            you close it.
          </li>
        </ul>
        <p>Opening one panel closes the other, so the court's never squeezed between both at once.</p>
      </InfoSection>

      <InfoSection title="1. Set Up Your Team">
        <p>
          Open Menu → Roster to add players with a number, name, and position (OH, MB, OPP, RH, S,
          L, DS) — the position tag is just a label to help you remember who's who. The team
          switcher in the left panel lets you rename, add, or delete teams; each keeps its own
          separate roster.
        </p>
      </InfoSection>

      <InfoSection title="2. Build a Lineup">
        <p>
          Open Menu → Lineup to assign your six starters to zones 1 through 6 — this is your
          serving order, and zone 1 always serves first. A team can have multiple saved lineups
          (useful for a different plan against a different opponent); switch between them from the
          left panel or manage them from the Lineup popup itself.
        </p>
      </InfoSection>

      <InfoSection title="3. Set Up Your Libero and Subs">
        <p>
          Menu → Libero lets you assign a libero to cover one or more players — they'll
          automatically swap in whenever whichever player they cover rotates to the back row —
          and decide who's allowed to serve for them. Menu → Subs works similarly for regular
          bench players: group them under the starter they're locked to for the set, pick which
          rotations they're active for (or leave it as "any"), and decide who holds serving
          rights for that group.
        </p>
      </InfoSection>

      <InfoSection title="4. Use the Court Diagram">
        <p>
          The Base / Serving / Receiving toggle switches what the diagram shows. Base is your
          starting lineup as entered. Serving and Receiving let you tap Edit and place players
          anywhere on a 5x5-per-zone grid — including a strip just past the end line, for showing
          a server realistically standing off the court. On Receiving, an additional Switch toggle
          lets you show where players release to after the ball is live; anyone with a switch
          defined gets a small swap-icon badge, visible even when Switch isn't toggled on.
        </p>
        <p>
          Use the numbered buttons, the "Start at" dropdown, or the prev/next arrows below the
          diagram to move between rotations. The Notes tab (next to Court, above the diagram) holds
          a free-text note per rotation — specifics, reminders, anything worth writing down.
        </p>
      </InfoSection>

      <InfoSection title="5. Print or Share">
        <p>
          Menu → Cheat Sheets gives you a printable page per view (Base always, Serving/Receiving
          only if you've customized them) with all six rotations, substitution notes, and any
          rotation notes you've written. Serve Order prints a simple numbered list of your lineup
          — available from the left panel or from Menu. Full screen (next to Zones, on the court
          card) blows the court panel up to fill the screen — handy for showing a formation to the
          team.
        </p>
      </InfoSection>

      <InfoSection title="6. Back Up or Share a Team">
        <p>
          Menu → Import/Export exports either the active team or every team as a file — useful
          before switching devices, or to hand a lineup to an assistant coach. Importing a file
          always adds it as a new team rather than overwriting anything you already have.
        </p>
      </InfoSection>
    </div>
  );
}
