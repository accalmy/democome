import { useMemo, useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ACCENT_HEX, Task } from '../types';
import BrutChip from '../components/BrutChip';
import TaskForm from './TaskForm';
import { celebrate } from '../lib/confetti';
import { vibrate } from '../lib/notifications';
import { isThisMonth, isThisWeek, isToday } from '../lib/dates';

type Filter = 'today' | 'week' | 'month' | string;

interface Props {
  onFocus: (id: string) => void;
}

export default function Tasks({ onFocus }: Props) {
  const tasks = useStore((s) => s.tasks);
  const groups = useStore((s) => s.groups);
  const [filter, setFilter] = useState<Filter>('today');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter === 'today') return isToday(t.dueDate);
        if (filter === 'week') return isThisWeek(t.dueDate);
        if (filter === 'month') return isThisMonth(t.dueDate);
        return t.groupId === filter;
      })
      .sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate));
  }, [tasks, filter]);

  return (
    <div className="px-5 pt-6">
      <h1 className="display text-2xl mb-4">Tâches</h1>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-3">
        <BrutChip label="Aujourd'hui" active={filter === 'today'} accent="yellow" onClick={() => setFilter('today')} />
        <BrutChip label="Semaine" active={filter === 'week'} accent="turquoise" onClick={() => setFilter('week')} />
        <BrutChip label="Mois" active={filter === 'month'} accent="violet" onClick={() => setFilter('month')} />
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

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-sub text-center py-12">
            Rien ici. Tape <span className="display text-accent-yellow">+</span> pour créer.
          </div>
        )}
        {filtered.map((t) => (
          <SwipeRow key={t.id} task={t} onFocus={() => onFocus(t.id)} onEdit={() => { setEditing(t); setFormOpen(true); }} />
        ))}
      </div>

      <button
        onClick={() => { setEditing(undefined); setFormOpen(true); }}
        className="fixed z-30 right-5 bottom-24 grid place-items-center brut-btn display"
        style={{
          width: 64,
          height: 64,
          background: '#FFE500',
          color: '#0F0F1A',
          borderRadius: 999,
          fontSize: 32,
        }}
        aria-label="Nouvelle tâche"
      >
        +
      </button>

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
    </div>
  );
}

function SwipeRow({ task, onFocus, onEdit }: { task: Task; onFocus: () => void; onEdit: () => void }) {
  const groups = useStore((s) => s.groups);
  const completeTask = useStore((s) => s.completeTask);
  const removeTask = useStore((s) => s.removeTask);
  const x = useMotionValue(0);
  const bg = useTransform(x, [-160, -40, 0, 40, 160], ['#FF4D4D', '#1A1A2E', '#1A1A2E', '#1A1A2E', '#00FF88']);
  const g = groups.find((x) => x.id === task.groupId);
  if (!g) return null;
  const accentColor = ACCENT_HEX[g.accent];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      celebrate('small');
      vibrate(20);
      completeTask(task.id);
    } else if (info.offset.x < -100) {
      if (confirm('Supprimer cette tâche ?')) {
        removeTask(task.id);
      }
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-brut flex items-center justify-between px-5 pointer-events-none">
        <span className="display text-bg">✅ Terminer</span>
        <span className="display text-ink">Supprimer 🗑️</span>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={onDragEnd}
        style={{ x, background: bg, border: `2px solid ${accentColor}`, borderRadius: 12, boxShadow: '4px 4px 0 #262626' }}
        className="relative"
      >
        <button
          onClick={onFocus}
          onContextMenu={(e) => { e.preventDefault(); onEdit(); }}
          className="w-full text-left p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className={`display ${task.done ? 'line-through opacity-60' : ''}`}>
                {task.title} {task.recurrence !== 'none' && '🔁'}
              </p>
              <p className="text-xs text-sub">
                {task.dueDate} · {g.name}
                {task.durationMin ? ` · ${task.durationMin} min` : ''}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="display text-xs text-sub px-2 py-1 rounded-brut"
              style={{ border: '1px solid #8888AA' }}
            >
              ✏️
            </button>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
