import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ACCENT_HEX, DAY_MOMENTS, DayMoment } from '../types';
import BrutButton from '../components/BrutButton';
import { isThisWeek, todayISO } from '../lib/dates';
import { ensureNotificationPermission, notify } from '../lib/notifications';

interface Props {
  onClose: () => void;
}

export default function PlanDay({ onClose }: Props) {
  const tasks = useStore((s) => s.tasks);
  const groups = useStore((s) => s.groups);
  const updateTask = useStore((s) => s.updateTask);
  const [dragging, setDragging] = useState<string | null>(null);

  const weekUnassigned = useMemo(
    () => tasks.filter((t) => !t.done && isThisWeek(t.dueDate) && !t.moment),
    [tasks]
  );

  const todayByMoment = useMemo(() => {
    const today = todayISO();
    const map = new Map<DayMoment, typeof tasks>();
    DAY_MOMENTS.forEach((m) => map.set(m.id, []));
    tasks
      .filter((t) => !t.done && t.dueDate === today && t.moment)
      .forEach((t) => map.get(t.moment as DayMoment)?.push(t));
    return map;
  }, [tasks]);

  const drop = (m: DayMoment) => {
    if (!dragging) return;
    updateTask(dragging, { moment: m, dueDate: todayISO() });
    setDragging(null);
  };

  const validate = async () => {
    await ensureNotificationPermission();
    notify('Journée préparée ✨', 'Bonne route avec My Guardian.');
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-bg overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-screen-sm mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="display text-2xl">Préparer ma journée 🌅</h1>
          <button onClick={onClose} className="display text-sub">✕</button>
        </div>
        <p className="text-sub text-sm mb-5">
          Glisse une tâche vers un moment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <section>
            <p className="display text-xs uppercase tracking-wider text-sub mb-2">Cette semaine — non placées</p>
            <div
              className="rounded-brut p-3 min-h-32"
              style={{
                background: '#1A1A2E',
                border: '2px solid #FFE500',
                boxShadow: '4px 4px 0 #262626',
              }}
            >
              {weekUnassigned.length === 0 && (
                <p className="text-sub text-sm py-4 text-center">Tout est placé. 👌</p>
              )}
              <div className="space-y-2">
                {weekUnassigned.map((t) => {
                  const g = groups.find((x) => x.id === t.groupId);
                  if (!g) return null;
                  return (
                    <motion.div
                      key={t.id}
                      drag
                      dragSnapToOrigin
                      onDragStart={() => setDragging(t.id)}
                      onDragEnd={() => setTimeout(() => setDragging(null), 100)}
                      whileDrag={{ scale: 1.05, zIndex: 100 }}
                      className="rounded-brut p-2.5 cursor-grab active:cursor-grabbing"
                      style={{
                        background: '#0F0F1A',
                        border: `2px solid ${ACCENT_HEX[g.accent]}`,
                        boxShadow: '3px 3px 0 #262626',
                      }}
                    >
                      <p className="display text-sm">{t.title}</p>
                      <p className="text-xs text-sub">{g.name} · {t.dueDate}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <p className="display text-xs uppercase tracking-wider text-sub mb-2">Aujourd'hui — par moment</p>
            <div className="space-y-3">
              {DAY_MOMENTS.map((m) => {
                const items = todayByMoment.get(m.id) ?? [];
                return (
                  <div
                    key={m.id}
                    onPointerUp={() => drop(m.id)}
                    className="rounded-brut p-3"
                    style={{
                      background: '#1A1A2E',
                      border: `2px solid ${dragging ? '#FFE500' : '#F5F5F5'}`,
                      boxShadow: '4px 4px 0 #262626',
                    }}
                  >
                    <p className="display text-sm mb-2">
                      {m.emoji} {m.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((t) => {
                        const g = groups.find((x) => x.id === t.groupId);
                        if (!g) return null;
                        return (
                          <span
                            key={t.id}
                            className="display text-xs px-2 py-1 rounded-brut"
                            style={{
                              background: ACCENT_HEX[g.accent],
                              color: '#0F0F1A',
                              border: '2px solid #0F0F1A',
                            }}
                          >
                            {t.title}
                          </span>
                        );
                      })}
                      {items.length === 0 && (
                        <span className="text-sub text-xs">Glisse ici</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <BrutButton accent="green" size="lg" block onClick={validate}>
          Valider ma journée ✅
        </BrutButton>
      </div>
    </motion.div>
  );
}
