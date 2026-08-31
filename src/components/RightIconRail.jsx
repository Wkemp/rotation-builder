import {
  Users,
  ListOrdered,
  Shield,
  Repeat,
  FileArchive,
  Printer,
  ListChecks,
  HelpCircle,
} from 'lucide-react';

export const RAIL_ITEMS = [
  { id: 'roster', label: 'Roster', icon: Users },
  { id: 'lineup', label: 'Lineup', icon: ListOrdered },
  { id: 'libero', label: 'Libero', icon: Shield },
  { id: 'subs', label: 'Subs', icon: Repeat },
  { id: 'importexport', label: 'Import/Export', shortLabel: 'Import', icon: FileArchive },
  { id: 'cheatsheet', label: 'Cheat Sheets', shortLabel: 'Sheets', icon: Printer },
  { id: 'serveorder', label: 'Serve Order', shortLabel: 'Serves', icon: ListChecks },
  { id: 'howto', label: 'How To', shortLabel: 'Help', icon: HelpCircle },
];

export default function RightIconRail({ activePopup, onSelect }) {
  return (
    <div className="relative z-[60] flex-shrink-0 w-16 bg-ink-raised border-l border-ink-line flex flex-col items-center py-3 gap-1 overflow-y-auto">
      {RAIL_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activePopup === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(active ? null : item.id)}
            aria-pressed={active}
            aria-label={item.label}
            title={item.label}
            className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-lg transition-colors flex-shrink-0 ${
              active ? 'bg-gold text-ink' : 'text-chalk-dim hover:bg-ink hover:text-chalk'
            }`}
          >
            <Icon size={19} />
            <span className="text-[8px] font-medium leading-none text-center">
              {item.shortLabel || item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
