import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ACCENT_HEX, DAY_MOMENTS, DayMoment, Recurrence, Task } from '../types';
import BottomSheet from '../components/BottomSheet';
import BrutButton from '../components/BrutButton';
import { todayISO } from '../lib/dates';

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Task;
}

export default function TaskForm({ open, onClose, initial }: Props) {
  const groups = useStore((s) => s.groups);
  const memos = useStore((s) => s.memos);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [groupId, setGroupId] = useState(initial?.groupId ?? groups[0]?.id ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? todayISO());
  const [duration, setDuration] = useState<number | undefined>(initial?.durationMin);
  const [moment, setMoment] = useState<DayMoment | undefined>(initial?.moment);
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'none');
  const [weeklyDay, setWeeklyDay] = useState<number>(initial?.weeklyDay ?? 1);
  const [memoId, setMemoId] = useState<string | undefined>(initial?.memoId);

  const reset = () => {
    setTitle('');
    setGroupId(groups[0]?.id ?? '');
    setDueDate(todayISO());
    setDuration(undefined);
    setMoment(undefined);
    setRecurrence('none');
    setMemoId(undefined);
  };

  const submit = () => {
    if (!title.trim() || !groupId) return;
    if (initial) {
      useStore.getState().updateTask(initial.id, {
        title: title.trim(),
        groupId,
        dueDate,
        durationMin: duration,
        moment,
        recurrence,
        weeklyDay: recurrence === 'weekly' ? weeklyDay : undefined,
        memoId,
      });
    } else {
      const t: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        groupId,
        dueDate,
        durationMin: duration,
        moment,
        recurrence,
        weeklyDay: recurrence === 'weekly' ? weeklyDay : undefined,
        memoId,
        done: false,
        createdAt: new Date().toISOString(),
      };
      useStore.getState().addTask(t);
    }
    reset();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} accent="green" title={initial ? 'Modifier' : 'Nouvelle tâche'}>
      <div className="space-y-4">
        <Field label="Titre">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Appeler le médecin"
            className="display text-lg w-full px-3 py-2.5 rounded-brut bg-bg"
            style={{ border: '2px solid #F5F5F5', boxShadow: '4px 4px 0px #262626' }}
          />
        </Field>

        <Field label="Groupe">
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => {
              const active = groupId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGroupId(g.id)}
                  className="brut-btn display text-sm px-3 py-1.5"
                  style={{
                    background: active ? ACCENT_HEX[g.accent] : '#1A1A2E',
                    color: active ? '#0F0F1A' : '#F5F5F5',
                    borderColor: ACCENT_HEX[g.accent],
                  }}
                >
                  <span
                    className="inline-block mr-2 align-middle rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      background: ACCENT_HEX[g.accent],
                      border: '1px solid #0F0F1A',
                    }}
                  />
                  {g.name}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Date d'échéance">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="display w-full px-3 py-2.5 rounded-brut bg-bg"
            style={{ border: '2px solid #F5F5F5', boxShadow: '4px 4px 0px #262626' }}
          />
        </Field>

        <Field label="Durée (min) — optionnel">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={180}
              step={5}
              value={duration ?? 0}
              onChange={(e) => setDuration(Number(e.target.value) || undefined)}
              className="flex-1 accent-accent-green"
            />
            <span className="display w-16 text-right">
              {duration ? `${duration} min` : '—'}
            </span>
            {duration !== undefined && (
              <button
                onClick={() => setDuration(undefined)}
                className="text-xs text-sub underline"
              >
                Retirer
              </button>
            )}
          </div>
        </Field>

        <Field label="Moment de journée">
          <div className="grid grid-cols-3 gap-2">
            {DAY_MOMENTS.map((m) => {
              const active = moment === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMoment(active ? undefined : m.id)}
                  className="brut-btn display text-xs py-2 px-1"
                  style={{
                    background: active ? '#FFE500' : '#1A1A2E',
                    color: active ? '#0F0F1A' : '#F5F5F5',
                    borderColor: active ? '#0F0F1A' : '#FFE500',
                  }}
                >
                  <div className="text-2xl mb-0.5">{m.emoji}</div>
                  {m.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Récurrence">
          <div className="flex flex-wrap gap-2">
            {(['none', 'daily', 'weekly', 'monthly'] as Recurrence[]).map((r) => (
              <button
                key={r}
                onClick={() => setRecurrence(r)}
                className="brut-btn display text-sm px-3 py-1.5"
                style={{
                  background: recurrence === r ? '#9B5DE5' : '#1A1A2E',
                  color: recurrence === r ? '#F5F5F5' : '#F5F5F5',
                  borderColor: '#9B5DE5',
                }}
              >
                {r === 'none' ? 'Aucune' : r === 'daily' ? '🔁 Jour' : r === 'weekly' ? '🔁 Semaine' : '🔁 Mois'}
              </button>
            ))}
          </div>
          {recurrence === 'weekly' && (
            <div className="flex flex-wrap gap-2 mt-3">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <button
                  key={i}
                  onClick={() => setWeeklyDay(i + 1 > 6 ? 0 : i + 1)}
                  className="brut-btn display w-9 h-9"
                  style={{
                    background: weeklyDay === (i + 1 > 6 ? 0 : i + 1) ? '#FFE500' : '#1A1A2E',
                    color: weeklyDay === (i + 1 > 6 ? 0 : i + 1) ? '#0F0F1A' : '#F5F5F5',
                    borderColor: '#FFE500',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </Field>

        <Field label="Mémo associé — optionnel">
          <select
            value={memoId ?? ''}
            onChange={(e) => setMemoId(e.target.value || undefined)}
            className="display w-full px-3 py-2.5 rounded-brut bg-bg"
            style={{ border: '2px solid #F5F5F5', boxShadow: '4px 4px 0px #262626' }}
          >
            <option value="">Aucun</option>
            {memos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </Field>

        <BrutButton accent="green" size="lg" block onClick={submit}>
          {initial ? 'Mettre à jour ✅' : 'Créer la tâche ✅'}
        </BrutButton>
      </div>
    </BottomSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="display text-xs uppercase tracking-wider text-sub mb-2">{label}</p>
      {children}
    </div>
  );
}
