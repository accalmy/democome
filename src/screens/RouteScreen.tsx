import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import AvatarView from '../components/AvatarView';
import BrutChip from '../components/BrutChip';
import { ACCENT_HEX, AccentKey } from '../types';
import { isOverdue, isThisMonth, isThisWeek, isToday, isoToDate, todayISO } from '../lib/dates';

type Scale = 'day' | 'week' | 'month';

interface Props {
  onFocus: (id: string) => void;
}

export default function RouteScreen({ onFocus }: Props) {
  const tasks = useStore((s) => s.tasks);
  const groups = useStore((s) => s.groups);
  const avatar = useStore((s) => s.avatar)!;
  const [scale, setScale] = useState<Scale>('week');
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter !== 'all' && t.groupId !== filter) return false;
        if (scale === 'day') return isToday(t.dueDate) || (isOverdue(t.dueDate) && !t.done);
        if (scale === 'week') return isThisWeek(t.dueDate) || (isOverdue(t.dueDate) && !t.done);
        return isThisMonth(t.dueDate) || (isOverdue(t.dueDate) && !t.done);
      })
      .sort((a, b) => isoToDate(a.dueDate).getTime() - isoToDate(b.dueDate).getTime());
  }, [tasks, scale, filter]);

  const today = todayISO();
  const futureCount = filtered.filter((t) => !t.done && t.dueDate >= today).length;
  const completedCount = filtered.filter((t) => t.done).length;
  const totalLen = filtered.length;
  // Avatar position: from bottom upward, after overdue/done tasks
  const avatarIdx = filtered.findIndex((t) => !t.done && t.dueDate >= today);
  const cursor = avatarIdx === -1 ? totalLen : avatarIdx;

  return (
    <div className="px-5 pt-6">
      <h1 className="display text-2xl mb-3">La route</h1>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
        <BrutChip
          label="Tout"
          active={filter === 'all'}
          accent="yellow"
          onClick={() => setFilter('all')}
        />
        {groups.map((g) => (
          <BrutChip
            key={g.id}
            label={g.name}
            active={filter === g.id}
            accent={g.accent}
            onClick={() => setFilter(g.id)}
          />
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(['day', 'week', 'month'] as Scale[]).map((s) => (
          <BrutChip
            key={s}
            label={s === 'day' ? "Aujourd'hui" : s === 'week' ? 'Cette semaine' : 'Ce mois'}
            active={scale === s}
            accent="turquoise"
            onClick={() => setScale(s)}
          />
        ))}
      </div>

      <p className="text-sub text-sm mb-4">
        {completedCount} faites · {futureCount} à venir
      </p>

      <div className="relative pl-12 pr-4 py-4">
        {/* Vertical road */}
        <div
          className="absolute top-0 bottom-0 w-10"
          style={{
            left: 16,
            background: '#1A1A2E',
            border: '2px solid #F5F5F5',
            borderRadius: 12,
            boxShadow: '4px 4px 0 #262626',
          }}
        >
          {/* dashed center line */}
          <div
            className="absolute top-2 bottom-2 left-1/2 w-1 -translate-x-1/2"
            style={{
              backgroundImage: 'repeating-linear-gradient(#FFE500 0 12px, transparent 12px 24px)',
            }}
          />
        </div>

        {filtered.length === 0 && (
          <div className="text-sub py-12 text-center">Route vide. Ajoute des tâches.</div>
        )}

        <div className="relative flex flex-col-reverse gap-4">
          {filtered.map((t, i) => {
            const g = groups.find((x) => x.id === t.groupId);
            const accent: AccentKey = g?.accent ?? 'yellow';
            const past = t.done || isOverdue(t.dueDate);
            const isAvatarHere = i === cursor;
            return (
              <div key={t.id} className="relative">
                {isAvatarHere && (
                  <div
                    className="absolute -left-12 top-1/2 -translate-y-1/2"
                    style={{ zIndex: 5 }}
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    >
                      <AvatarView cfg={avatar} size={44} ring />
                    </motion.div>
                  </div>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => !t.done && onFocus(t.id)}
                  className="w-full text-left rounded-brut p-3"
                  style={{
                    background: '#1A1A2E',
                    border: `2px solid ${ACCENT_HEX[accent]}`,
                    boxShadow: '4px 4px 0 #262626',
                    color: '#F5F5F5',
                    opacity: past ? 0.55 : 1,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`display ${t.done ? 'line-through' : ''}`}>{t.title}</p>
                      <p className="text-xs text-sub">
                        {g?.name} · {t.dueDate}
                        {t.recurrence !== 'none' && ' · 🔁'}
                      </p>
                    </div>
                    {t.done && <span>✅</span>}
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>

        <Sign label="Aujourd'hui" position="bottom" />
        {scale !== 'day' && <Sign label={scale === 'week' ? 'Cette semaine' : 'Ce mois'} position="middle" />}
        <Sign label="Futur" position="top" />
      </div>
    </div>
  );
}

function Sign({ label, position }: { label: string; position: 'bottom' | 'middle' | 'top' }) {
  const top = position === 'top' ? '4%' : position === 'middle' ? '48%' : 'auto';
  const bottom = position === 'bottom' ? '4%' : 'auto';
  return (
    <div
      className="absolute right-0 px-3 py-1.5 display text-xs"
      style={{
        top,
        bottom,
        background: '#FFE500',
        color: '#0F0F1A',
        border: '2px solid #0F0F1A',
        boxShadow: '4px 4px 0 #262626',
        borderRadius: 8,
      }}
    >
      {label}
    </div>
  );
}
