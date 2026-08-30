import { Printer } from 'lucide-react';
import EntitySwitcher from './EntitySwitcher';

export default function LeftPanelContent({
  rosters,
  activeRosterId,
  onSwitchRoster,
  onCreateRoster,
  onRenameRoster,
  onDeleteRoster,
  rotationSets,
  activeRotationSetId,
  onSwitchRotationSet,
  onCreateRotationSet,
  onDuplicateRotationSet,
  onRenameRotationSet,
  onDeleteRotationSet,
  players,
  slots,
  onShowServeOrder,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-ink border border-ink-line rounded-lg px-2.5 py-2">
        <EntitySwitcher
          items={rosters}
          activeId={activeRosterId}
          onSwitch={onSwitchRoster}
          onCreate={onCreateRoster}
          onRename={onRenameRoster}
          onDelete={onDeleteRoster}
          label="Team"
        />
      </div>

      <div className="bg-ink border border-ink-line rounded-lg px-2.5 py-2">
        <EntitySwitcher
          items={rotationSets}
          activeId={activeRotationSetId}
          onSwitch={onSwitchRotationSet}
          onCreate={onCreateRotationSet}
          onDuplicate={onDuplicateRotationSet}
          onRename={onRenameRotationSet}
          onDelete={onDeleteRotationSet}
          label="Lineup"
        />
      </div>

      <div>
        <h3 className="font-display text-xs tracking-wide text-chalk-dim uppercase mb-2">
          Starting Six
        </h3>
        <ul className="space-y-1.5">
          {[1, 2, 3, 4, 5, 6].map((zone) => {
            const player = players[slots[zone - 1]];
            return (
              <li
                key={zone}
                className="flex items-center gap-2.5 bg-ink border border-ink-line rounded-lg px-2.5 py-2 text-sm"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gold text-ink font-display font-semibold text-xs flex-shrink-0">
                  {zone}
                </span>
                <span className="font-data text-chalk-dim w-7 text-center flex-shrink-0">
                  {player?.number || '–'}
                </span>
                <span className="flex-1 min-w-0 truncate text-chalk">{player?.name || '— empty —'}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={onShowServeOrder}
        className="w-full flex items-center justify-center gap-1.5 h-11 rounded-lg bg-ink border border-ink-line text-sm font-medium text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors"
      >
        <Printer size={16} /> Print Serve Order
      </button>
    </div>
  );
}
