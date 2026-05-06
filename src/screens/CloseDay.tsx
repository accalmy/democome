import { useMemo, useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ACCENT_HEX, Task } from '../types';
import AvatarView from '../components/AvatarView';
import BrutButton from '../components/BrutButton';
import { todayISO, addDays } from '../lib/dates';
import { celebrate } from '../lib/confetti';
import { vibrate } from '../lib/notifications';

interface Props { onClose: () => void; }

type Verdict = 'done' | 'undone';

export default function CloseDay({ onClose }: Props) {
  const tasks = useStore((s) => s.tasks);
  const groups = useStore((s) => s.groups);
  const avatar = useStore((s) => s.avatar)!;
  const completeTask = useStore((s) => s.completeTask);
  const updateTask = useStore((s) => s.updateTask);

  const today = todayISO();
  const list = useMemo(
    () => tasks.filter((t) => t.dueDate === today && !t.done),
    [tasks, today]
  );
  const completedToday = useMemo(
    () => tasks.filter((t) => t.dueDate === today && t.done).length,
    [tasks, today]
  );

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Record<string, Verdict>>({});
  const [finished, setFinished] = useState(list.length === 0);

  const totalReview = list.length;
  const reviewed = idx;
  const current: Task | undefined = list[idx];

  const judge = (v: Verdict) => {
    if (!current) return;
    if (v === 'done') {
      celebrate('small');
      vibrate(15);
      completeTask(current.id);
    } else {
      vibrate([10, 40, 10]);
      updateTask(current.id, { dueDate: addDays(current.dueDate, 1) });
    }
    setResults((r) => ({ ...r, [current.id]: v }));
    if (idx + 1 >= list.length) {
      setFinished(true);
    } else {
      setIdx(idx + 1);
    }
  };

  const doneCount = completedToday + Object.values(results).filter((v) => v === 'done').length;
  const totalDay = completedToday + list.length;
  const ratio = totalDay === 0 ? 1 : doneCount / totalDay;
  const message = ratio >= 0.8
    ? 'Journée puissante. Bravo.'
    : ratio >= 0.5
    ? 'Belle progression. Continue.'
    : ratio >= 0.2
    ? 'Petits pas comptent aussi.'
    : 'Demain est une nouvelle route.';

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-bg overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-screen-sm mx-auto px-5 py-6 min-h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="display text-2xl">Clôturer 🌙</h1>
          <button onClick={onClose} className="display text-sub">✕</button>
        </div>

        {!finished && current && (
          <>
            <p className="text-sub text-sm mb-3">
              {reviewed} / {totalReview} reviewées
            </p>
            <FlashCard task={current} onJudge={judge} />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <BrutButton accent="coral" size="lg" block onClick={() => judge('undone')}>
                Pas faite
              </BrutButton>
              <BrutButton accent="green" size="lg" block onClick={() => judge('done')}>
                Réalisée ✅
              </BrutButton>
            </div>
            <p className="text-sub text-xs mt-3 text-center">
              Swipe droite ✅ · Swipe gauche ⏭️
            </p>
          </>
        )}

        {finished && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10">
            <h2 className="display text-5xl">{doneCount} / {totalDay} ✅</h2>
            <RingProgress value={ratio} />
            <p className="text-lg">{message}</p>
            <motion.div animate={{ rotate: [0, 18, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
              <AvatarView cfg={avatar} size={130} ring />
            </motion.div>
            <BrutButton accent="violet" size="lg" block onClick={onClose}>
              Bonne nuit 🌙
            </BrutButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FlashCard({ task, onJudge }: { task: Task; onJudge: (v: Verdict) => void }) {
  const groups = useStore((s) => s.groups);
  const g = groups.find((x) => x.id === task.groupId);
  const x = useMotionValue(0);
  const rot = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const bg = useTransform(x, [-160, -40, 0, 40, 160], ['#FF4D4D', '#1A1A2E', '#1A1A2E', '#1A1A2E', '#00FF88']);
  if (!g) return null;
  const onEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110) onJudge('done');
    else if (info.offset.x < -110) onJudge('undone');
  };
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onEnd}
      style={{ x, rotate: rot, background: bg, border: `2px solid ${ACCENT_HEX[g.accent]}`, borderRadius: 16, boxShadow: '6px 6px 0 #262626' }}
      className="p-6 min-h-72 flex flex-col items-center justify-center text-center"
    >
      <span
        className="display text-xs px-2 py-1 rounded-brut mb-4"
        style={{ background: ACCENT_HEX[g.accent], color: '#0F0F1A', border: '2px solid #0F0F1A' }}
      >
        {g.name}
      </span>
      <h3 className="display text-3xl mb-3">{task.title}</h3>
      {task.durationMin && <p className="text-sub">~ {task.durationMin} min</p>}
    </motion.div>
  );
}

function RingProgress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  const r = 56;
  const c = 2 * Math.PI * r;
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={70} cy={70} r={r} stroke="#1A1A2E" strokeWidth={12} fill="none" />
      <circle
        cx={70}
        cy={70}
        r={r}
        stroke="#00FF88"
        strokeWidth={12}
        fill="none"
        strokeLinecap="butt"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 70 70)"
      />
      <text x={70} y={78} textAnchor="middle" fill="#F5F5F5" fontSize={26} fontFamily="Space Grotesk" fontWeight={700}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}
