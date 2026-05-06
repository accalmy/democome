export type AccentKey =
  | 'yellow'
  | 'coral'
  | 'green'
  | 'violet'
  | 'turquoise'
  | 'orange';

export const ACCENT_HEX: Record<AccentKey, string> = {
  yellow: '#FFE500',
  coral: '#FF4D4D',
  green: '#00FF88',
  violet: '#9B5DE5',
  turquoise: '#00D4FF',
  orange: '#FF8C00',
};

export type EnergyLevel = 'low' | 'mid' | 'high';

export type DayMoment =
  | 'wakeup'
  | 'morning'
  | 'afterMeal'
  | 'afternoon'
  | 'endOfDay'
  | 'evening';

export const DAY_MOMENTS: { id: DayMoment; emoji: string; label: string }[] = [
  { id: 'wakeup', emoji: '🌅', label: 'Réveil / Matin' },
  { id: 'morning', emoji: '☕', label: 'Avant-midi' },
  { id: 'afterMeal', emoji: '🍽️', label: 'Après manger' },
  { id: 'afternoon', emoji: '🌤️', label: 'Après-midi' },
  { id: 'endOfDay', emoji: '🌆', label: 'Fin de journée' },
  { id: 'evening', emoji: '🌙', label: 'Soirée' },
];

export interface AvatarConfig {
  seed: string;
  name: string;
  skin: string;
  hair: string;
  hairColor: string;
  outfitColor: string;
  glasses: boolean;
  hat: boolean;
}

export interface TaskGroup {
  id: string;
  name: string;
  accent: AccentKey;
}

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  groupId: string;
  dueDate: string; // ISO date (yyyy-mm-dd)
  durationMin?: number;
  moment?: DayMoment;
  recurrence: Recurrence;
  weeklyDay?: number; // 0-6 if weekly
  memoId?: string;
  done: boolean;
  completedAt?: string;
  createdAt: string;
}

export type MemoKind = 'note' | 'checklist' | 'document';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Memo {
  id: string;
  kind: MemoKind;
  title: string;
  text?: string;
  items?: ChecklistItem[];
  fileDataUrl?: string;
  fileName?: string;
  taskId?: string;
  createdAt: string;
}

export interface Settings {
  language: 'fr' | 'en';
  pomodoroWorkMin: number;
  pomodoroBreakMin: number;
  hyperfocusUntil?: string;
  googleConnected: boolean;
}

export const DEFAULT_GROUPS: TaskGroup[] = [
  { id: 'admin', name: 'Administratif', accent: 'turquoise' },
  { id: 'work', name: 'Travail', accent: 'violet' },
  { id: 'chores', name: 'Corvées', accent: 'orange' },
  { id: 'home', name: 'Maison', accent: 'green' },
  { id: 'personal', name: 'Personnel', accent: 'coral' },
];
