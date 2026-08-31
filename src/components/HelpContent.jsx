import { useState } from 'react';
import { MapPin, RotateCw, Layers, HelpCircle } from 'lucide-react';
import ZonesInfo from './info/ZonesInfo';
import RotationsInfo from './info/RotationsInfo';
import SystemsInfo from './info/SystemsInfo';
import HowToInfo from './info/HowToInfo';

const TABS = [
  { id: 'howto', label: 'How To', icon: HelpCircle, Component: HowToInfo },
  { id: 'zones', label: 'Zones', icon: MapPin, Component: ZonesInfo },
  { id: 'rotations', label: 'Rotations', icon: RotateCw, Component: RotationsInfo },
  { id: 'systems', label: 'Systems', icon: Layers, Component: SystemsInfo },
];

export default function HelpContent() {
  const [tab, setTab] = useState('howto');
  const Active = TABS.find((t) => t.id === tab)?.Component;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 flex-shrink-0 h-11 px-3 rounded-lg text-xs font-medium border transition-colors ${
                active
                  ? 'bg-gold text-ink border-gold'
                  : 'bg-ink text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>
      {Active && <Active />}
    </div>
  );
}
