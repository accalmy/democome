import { motion } from 'framer-motion';

export type TabKey = 'home' | 'route' | 'tasks' | 'memos' | 'settings';

const TABS: { id: TabKey; label: string; emoji: string }[] = [
  { id: 'home', label: 'Accueil', emoji: '🏠' },
  { id: 'route', label: 'Route', emoji: '🗺️' },
  { id: 'tasks', label: 'Tâches', emoji: '✅' },
  { id: 'memos', label: 'Mémos', emoji: '📝' },
  { id: 'settings', label: 'Paramètres', emoji: '⚙️' },
];

interface Props {
  active: TabKey;
  onChange: (k: TabKey) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-30 nav-safe"
      style={{ background: '#0F0F1A', borderTop: '2px solid #F5F5F5' }}
    >
      <div className="max-w-screen-sm mx-auto grid grid-cols-5">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="relative flex flex-col items-center justify-center py-2 gap-0.5"
              style={{ color: isActive ? '#FFE500' : '#8888AA' }}
            >
              <span className="text-2xl leading-none">{t.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{t.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -top-0.5 left-1/3 right-1/3 h-1"
                  style={{ background: '#FFE500' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
