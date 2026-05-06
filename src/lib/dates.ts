export const todayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export const isoToDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatLongFR = (iso: string) => {
  const d = isoToDate(iso);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const isToday = (iso: string) => iso === todayISO();

export const isThisWeek = (iso: string) => {
  const d = isoToDate(iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const day = (now.getDay() + 6) % 7; // monday = 0
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
};

export const isThisMonth = (iso: string) => {
  const d = isoToDate(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export const isOverdue = (iso: string) => {
  const d = isoToDate(iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d < now;
};

export const addDays = (iso: string, n: number) => {
  const d = isoToDate(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const addMonths = (iso: string, n: number) => {
  const d = isoToDate(iso);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};

export const dayName = (iso: string) =>
  isoToDate(iso).toLocaleDateString('fr-FR', { weekday: 'short' });
