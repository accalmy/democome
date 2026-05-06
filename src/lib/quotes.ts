const QUOTES = [
  'Un pas suffit pour démarrer.',
  'Ton cerveau cherche la dopamine — donne-lui une petite victoire.',
  "Fais petit, fais maintenant.",
  'Pas besoin de finir. Commence.',
  'Le mieux est l\'ennemi du fait.',
  'Hyperfocus is a superpower.',
  'Découpe encore plus petit.',
  '5 minutes valent mieux que 0.',
  'Le futur toi te remerciera.',
  'Une chose à la fois.',
  'Respire. Choisis. Commence.',
];

export function quoteOfDay(): string {
  const d = new Date();
  const seed = d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
  return QUOTES[seed % QUOTES.length];
}
