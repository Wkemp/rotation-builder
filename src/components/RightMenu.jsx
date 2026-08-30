import { useState } from 'react';
import { Menu as MenuIcon, Users, ListOrdered, Shield, Repeat, FileArchive, Printer, HelpCircle } from 'lucide-react';

export const MENU_ITEMS = [
  { id: 'roster', label: 'Roster', icon: Users },
  { id: 'lineup', label: 'Lineup', icon: ListOrdered },
  { id: 'libero', label: 'Libero', icon: Shield },
  { id: 'subs', label: 'Subs', icon: Repeat },
  { id: 'importexport', label: 'Import/Export', icon: FileArchive },
  { id: 'cheatsheet', label: 'Cheat Sheets', icon: Printer },
  { id: 'howto', label: 'How To', icon: HelpCircle },
];

export default function RightMenu({ onSelect }) {
  const [open, setOpen] = useState(false);

  function handleSelect(id) {
    setOpen(false);
    onSelect(id);
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Menu"
        className="flex items-center gap-1.5 h-11 px-3 rounded-lg text-sm font-medium border border-ink-line bg-ink-raised text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors"
      >
        <MenuIcon size={18} />
        <span className="hidden sm:inline">Menu</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-ink-raised border border-ink-line rounded-lg shadow-lg py-1 min-w-[12rem]">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-3 text-sm text-chalk hover:bg-ink transition-colors text-left"
                >
                  <Icon size={16} className="text-chalk-dim flex-shrink-0" /> {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
