// "Midnight" for this challenge means the user's own local midnight, not UTC.
// This returns today's date as YYYY-MM-DD in the browser's local timezone.
export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function yesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateString(d);
}
