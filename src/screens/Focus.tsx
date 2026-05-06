import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ACCENT_HEX } from '../types';
import BrutButton from '../components/BrutButton';
import AvatarView from '../components/AvatarView';
import { celebrate } from '../lib/confetti';
import { vibrate } from '../lib/notifications';

interface Props { taskId: string; onClose: () => void; }

export default function Focus({ taskId, onClose }: Props) {
  const tasks = useStore((s) => s.tasks);
  const groups = useStore((s) => s.groups);
  const memos = useStore((s) => s.memos);
  const avatar = useStore((s) => s.avatar)!;
  const completeTask = useStore((s) => s.completeTask);
  const settings = useStore((s) => s.settings);
  const task = tasks.find((t) => t.id === taskId);
  const totalSec = useMemo(() => {
    if (!task) return settings.pomodoroWorkMin * 60;
    return (task.durationMin ?? settings.pomodoroWorkMin) * 60;
  }, [task, settings.pomodoroWorkMin]);

  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const associatedMemo = task?.memoId ? memos.find((m) => m.id === task.memoId) : undefined;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current!);
          vibrate([100, 60, 100, 60, 200]);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  if (!task) {
    return null;
  }
  const g = groups.find((x) => x.id === task.groupId);
  if (!g) return null;
  const accent = ACCENT_HEX[g.accent];

  const pct = 1 - remaining / totalSec;
  const r = 90;
  const c = 2 * Math.PI * r;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const finish = () => {
    celebrate('big');
    vibrate([60, 40, 60]);
    completeTask(task.id);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: '#0F0F1A', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-screen-sm mx-auto px-5 py-6 min-h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="display text-sub">← Sortir</button>
          <span
            className="display text-xs px-2 py-1 rounded-brut"
            style={{ background: accent, color: '#0F0F1A', border: '2px solid #0F0F1A' }}
          >
            {g.name}
          </span>
        </div>

        <h1 className="display text-3xl mb-1">{task.title}</h1>
        <p className="text-sub mb-6">
          {task.durationMin ? `Durée définie : ${task.durationMin} min` : `Pomodoro ${settings.pomodoroWorkMin} min`}
        </p>

        <div className="grid place-items-center my-6">
          <svg width={220} height={220} viewBox="0 0 220 220">
            <circle cx={110} cy={110} r={r} stroke="#1A1A2E" strokeWidth={16} fill="none" />
            <motion.circle
              cx={110}
              cy={110}
              r={r}
              stroke={accent}
              strokeWidth={16}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={c}
              animate={{ strokeDashoffset: c * (1 - pct) }}
              transition={{ duration: 0.4 }}
              transform="rotate(-90 110 110)"
            />
            <text
              x={110}
              y={120}
              textAnchor="middle"
              fill="#F5F5F5"
              fontSize={44}
              fontFamily="Space Grotesk"
              fontWeight={700}
            >
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </text>
          </svg>
        </div>

        <motion.div
          animate={{ y: running ? [0, -4, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="grid place-items-center mb-6"
        >
          <AvatarView cfg={avatar} size={84} ring />
        </motion.div>

        {associatedMemo && (
          <div
            className="rounded-brut p-3 mb-4"
            style={{ background: '#1A1A2E', border: '2px solid #00D4FF', boxShadow: '4px 4px 0 #262626' }}
          >
            <p className="display text-sm mb-1">📝 Mémo : {associatedMemo.title}</p>
            {associatedMemo.kind === 'note' && <p className="text-sm text-sub line-clamp-3">{associatedMemo.text}</p>}
            {associatedMemo.kind === 'checklist' && (
              <p className="text-sm text-sub">
                {(associatedMemo.items ?? []).filter((i) => i.done).length} / {(associatedMemo.items ?? []).length} cochées
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <BrutButton accent={running ? 'orange' : 'turquoise'} size="lg" block onClick={() => setRunning((r) => !r)}>
            {running ? '⏸️ Pause' : '▶️ Reprendre'}
          </BrutButton>
          <BrutButton accent="green" size="lg" block onClick={finish}>
            ✅ Terminer
          </BrutButton>
        </div>
      </div>
    </motion.div>
  );
}
