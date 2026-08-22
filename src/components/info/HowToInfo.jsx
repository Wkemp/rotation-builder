import { InfoSection } from './InfoShared';

export default function HowToInfo() {
  return (
    <div>
      <InfoSection title="1. Set Up Your Team">
        <p>
          The team switcher at the top of the screen lets you rename, add, or delete teams — each
          team keeps its own separate roster. Add players in the Roster panel with a number, name,
          and position (OH, MB, OPP, RH, S, L, DS) — the position tag is just a label to help you
          remember who's who, it doesn't affect anything on the court.
        </p>
      </InfoSection>

      <InfoSection title="2. Build a Lineup">
        <p>
          Each team can have multiple saved lineups — useful for a different plan against a
          different opponent. Switch or create one with the Lineup control in the roster panel.
          Assign your six starters to zones 1 through 6 in the Starting Lineup section: this is
          your serving order, and zone 1 always serves first.
        </p>
      </InfoSection>

      <InfoSection title="3. Set Up Your Libero and Subs">
        <p>
          Tap the L button next to a starting lineup row to have a libero cover that player — a
          libero can cover more than one player and will automatically swap in whenever whichever
          one they're covering rotates to the back row. Separately, decide who's allowed to serve
          for them in the Libero Setup section.
        </p>
        <p>
          Planned Substitutions work similarly but for regular bench players: group them under the
          starter they're locked to for the set, pick which rotations they're active for (or leave
          it as "any"), and decide who holds serving rights for that group.
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
          The Cheat Sheet tab gives you a printable page per view (Base always, Serving/Receiving
          only if you've customized them) with all six rotations, substitution notes, and any
          rotation notes you've written. The Serve Order tab prints a simple numbered list of your
          lineup. Full screen (the icon next to Zones) blows the whole court panel up to fill the
          screen — handy for showing a formation to the team.
        </p>
      </InfoSection>

      <InfoSection title="6. Back Up or Share a Team">
        <p>
          Backup & Sharing, at the bottom of the roster panel, exports either the active team or
          every team as a file — useful before switching devices, or to hand a lineup to an
          assistant coach. Importing a file always adds it as a new team rather than overwriting
          anything you already have.
        </p>
      </InfoSection>
    </div>
  );
}
