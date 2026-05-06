import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import AvatarView from '../components/AvatarView';
import BrutButton from '../components/BrutButton';
import BrutCard from '../components/BrutCard';
import BrutProgress from '../components/BrutProgress';
import { ACCENT_HEX, DAY_MOMENTS, EnergyLevel } from '../types';
import { formatLongFR, todayISO } from '../lib/dates';
import { quoteOfDay } from '../lib/quotes';

interface Props {
  onPlan: () => void;
  onClose: () => void;
  onFocus: (taskId: string) => void;
  onGoTasks: () => void;
}

const ENERGY: { id: EnergyLevel; emoji: string; label: string; accent: 'coral' | 'yellow' | 'green' }[] = [
  { id: 'low', emoji: '🪫', label: 'Faible', accent: 'coral' },
  { id: 'mid', emoji: '⚡', label: 'Moyen', accent: 'yellow' },
  { id: 'high', emoji: '🚀', label: 'Élevé', accent: 'green' },
];

export default function Home({ onPlan, onClose, onFocus, onGoTasks }: Props) {
  const avatar = useStore((s) => s.avatar)!;
  const tasks = useStore((s) => s.tasks);
  const groups = useStore((s) => s.groups);
  const [energy, setEnergy] = useState<EnergyLevel>('mid');

  const today = todayISO();
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === today),
    [tasks, today]
  );
  const done = todayTasks.filter((t) => t.done).length;
  const total = todayTasks.length;
  const progress = total === 0 ? 0 : done / total;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof todayTasks>();
    DAY_MOMENTS.forEach((m) => map.set(m.id, []));
    map.set('__none', []);
    todayTasks.forEach((t) => {
      const k = t.moment ?? '__none';
      const arr = map.get(k) ?? [];
      arr.push(t);
      map.set(k, arr);
    });
    return map;
  }, [todayTasks]);

  return (
    <div className="px-5 pt-6 pb-2">
      <header className="flex items-center gap-4 mb-2">
        <AvatarView cfg={avatar} size={64} ring />
        <div className="min-w-0">
          <h1 className="display text-2xl truncate">Bonjour {avatar.name}</h1>
          <p className="text-sub text-sm capitalize">{formatLongFR(today)}</p>
        </div>
      </header>

      <p className="italic text-sub mb-6">« {quoteOfDay()} »</p>

      <p className="display text-sm uppercase tracking-wider text-sub mb-2">Énergie du moment</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {ENERGY.map((e) => (
          <BrutCard
            key={e.id}
            accent={e.accent}
            selected={energy === e.id}
            pressable
            onClick={() => setEnergy(e.id)}
            className="text-center !p-3"
          >
            <div className="text-3xl">{e.emoji}</div>
            <p className="display text-sm mt-1">{e.label}</p>
          </BrutCard>
        ))}
      </div>

      <div className="mb-6">
        <BrutProgress
          value={progress}
          accent="green"
          label={total === 0 ? 'Pas encore de tâches aujourd\'hui' : `${done} sur ${total} tâches`}
        />
      </div>

      <p className="display text-sm uppercase tracking-wider text-sub mb-3">Ma journée</p>
      <div className="space-y-3 mb-6">
        {DAY_MOMENTS.map((m) => {
          const items = grouped.get(m.id) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={m.id}>
              <p className="display text-sm mb-2">
                {m.emoji} {m.label}
              </p>
              <div className="space-y-2">
                {items.map((t) => {
                  const g = groups.find((x) => x.id === t.groupId);
                  if (!g) return null;
                  return (
                    <motion.button
                      key={t.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFocus(t.id)}
                      className="w-full text-left rounded-brut p-3 brut-btn"
                      style={{
                        background: '#1A1A2E',
                        border: `2px solid ${ACCENT_HEX[g.accent]}`,
                        color: '#F5F5F5',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`display ${t.done ? 'line-through opacity-60' : ''}`}>
                          {t.title}
                        </span>
                        <span className="text-xs text-sub">{g.name}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {(grouped.get('__none') ?? []).length > 0 && (
          <div>
            <p className="display text-sm mb-2 text-sub">Sans moment</p>
            <div className="space-y-2">
              {(grouped.get('__none') ?? []).map((t) => {
                const g = groups.find((x) => x.id === t.groupId);
                if (!g) return null;
                return (
                  <button
                    key={t.id}
                    onClick={() => onFocus(t.id)}
                    className="w-full text-left rounded-brut p-3 brut-btn"
                    style={{
                      background: '#1A1A2E',
                      border: `2px solid ${ACCENT_HEX[g.accent]}`,
                      color: '#F5F5F5',
                    }}
                  >
                    <span className="display">{t.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {total === 0 && (
          <BrutCard accent="violet" className="text-center">
            <p className="text-sub mb-3">Rien de prévu pour aujourd'hui.</p>
            <BrutButton accent="yellow" onClick={onGoTasks}>
              Ajouter une tâche
            </BrutButton>
          </BrutCard>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pb-6">
        <BrutButton accent="coral" size="lg" block onClick={onPlan}>
          Préparer 🌅
        </BrutButton>
        <BrutButton accent="violet" size="lg" block onClick={onClose}>
          Clôturer 🌙
        </BrutButton>
      </div>
    </div>
  );
}
