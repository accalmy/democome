import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AvatarConfig,
  DEFAULT_GROUPS,
  Memo,
  Settings,
  Task,
  TaskGroup,
} from '../types';
import { addDays, addMonths, todayISO } from '../lib/dates';

interface AppState {
  bootstrapped: boolean;
  avatar: AvatarConfig | null;
  groups: TaskGroup[];
  tasks: Task[];
  memos: Memo[];
  settings: Settings;
  setAvatar: (a: AvatarConfig) => void;
  setBootstrapped: (b: boolean) => void;
  addGroup: (g: TaskGroup) => void;
  updateGroup: (id: string, patch: Partial<TaskGroup>) => void;
  removeGroup: (id: string) => void;
  addTask: (t: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  removeTask: (id: string) => void;
  addMemo: (m: Memo) => void;
  updateMemo: (id: string, patch: Partial<Memo>) => void;
  removeMemo: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  exportJson: () => string;
}

const defaultSettings: Settings = {
  language: 'fr',
  pomodoroWorkMin: 25,
  pomodoroBreakMin: 5,
  googleConnected: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      bootstrapped: false,
      avatar: null,
      groups: DEFAULT_GROUPS,
      tasks: [],
      memos: [],
      settings: defaultSettings,
      setAvatar: (a) => set({ avatar: a }),
      setBootstrapped: (b) => set({ bootstrapped: b }),
      addGroup: (g) => set((s) => ({ groups: [...s.groups, g] })),
      updateGroup: (id, patch) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      removeGroup: (id) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          tasks: s.tasks.filter((t) => t.groupId !== id),
        })),
      addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      completeTask: (id) => {
        const t = get().tasks.find((x) => x.id === id);
        if (!t) return;
        const next: Task[] = get().tasks.map((x) =>
          x.id === id
            ? { ...x, done: true, completedAt: new Date().toISOString() }
            : x
        );
        if (t.recurrence !== 'none') {
          let nextDue = t.dueDate;
          if (t.recurrence === 'daily') nextDue = addDays(t.dueDate, 1);
          if (t.recurrence === 'weekly') nextDue = addDays(t.dueDate, 7);
          if (t.recurrence === 'monthly') nextDue = addMonths(t.dueDate, 1);
          next.push({
            ...t,
            id: crypto.randomUUID(),
            done: false,
            completedAt: undefined,
            dueDate: nextDue,
            createdAt: new Date().toISOString(),
          });
        }
        set({ tasks: next });
      },
      uncompleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: false, completedAt: undefined } : t
          ),
        })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      addMemo: (m) => set((s) => ({ memos: [...s.memos, m] })),
      updateMemo: (id, patch) =>
        set((s) => ({
          memos: s.memos.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMemo: (id) =>
        set((s) => ({ memos: s.memos.filter((m) => m.id !== id) })),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      exportJson: () =>
        JSON.stringify(
          {
            avatar: get().avatar,
            groups: get().groups,
            tasks: get().tasks,
            memos: get().memos,
            settings: get().settings,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
    }),
    {
      name: 'my-guardian-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const selectGroupById = (id: string) =>
  useStore.getState().groups.find((g) => g.id === id);

export const selectTodayTasks = () => {
  const today = todayISO();
  return useStore.getState().tasks.filter((t) => !t.done && t.dueDate === today);
};
