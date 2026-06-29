export const QUOTES = [
  { text: 'The body keeps the vow the mind forgot it made.', author: 'Maximus' },
  { text: 'A man is not tested by the mountain, but by Tuesday.', author: 'Maximus' },
  { text: 'Discipline is the only altar that answers every prayer.', author: 'Maximus' },
  { text: 'What you avoid in the morning, you carry until night.', author: 'Maximus' },
  { text: 'The shadow does not vanish. It waits for an unguarded habit.', author: 'Maximus' },
  { text: 'Sovereignty begins the moment you keep a promise no one is watching.', author: 'Maximus' },
  { text: 'A warrior is built in the repetitions no one applauds.', author: 'Maximus' },
  { text: 'Service to others starts with mastery over your own morning.', author: 'Maximus' },
  { text: 'The count does not lie. It only reflects.', author: 'Maximus' },
  { text: 'Comfort is the quiet enemy that never raises its voice.', author: 'Maximus' },
  { text: 'Initiation is not an event. It is a hundred small refusals to quit.', author: 'Maximus' },
  { text: 'You do not find your edge. You build it, daily, on purpose.', author: 'Maximus' },
];

export function quoteForDate(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
