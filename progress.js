export const STORAGE_KEY = 'hao-progress-v1';
export const emptyProgress = () => ({ completed: [], results: {}, reviews: {}, activity: [] });
export function sanitizeProgress(raw, ids) {
  const state = emptyProgress();
  if (!raw || typeof raw !== 'object') return state;
  // Only accept a continuous completed prefix, so damaged storage cannot skip lessons.
  for (const id of ids) { if (!Array.isArray(raw.completed) || !raw.completed.includes(id)) break; state.completed.push(id); }
  for (const id of ids) {
    const r = raw.results?.[id];
    if (r && Number.isInteger(r.correct) && r.correct >= 0 && r.correct <= 3) state.results[id] = {correct:r.correct, total:3};
  }
  if (raw.reviews && typeof raw.reviews === 'object') for (const [key,value] of Object.entries(raw.reviews)) {
    if (Number.isInteger(value) && value >= 0 && value <= 100000) state.reviews[key] = value;
  }
  state.activity = Array.isArray(raw.activity) ? [...new Set(raw.activity.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-366) : [];
  return state;
}
export function isUnlocked(index, state, lessons) { return index === 0 || state.completed.includes(lessons[index - 1].id); }
export function normalizeAnswer(value) { return value.normalize('NFC').toLocaleLowerCase('de').trim().replace(/\s+/g,''); }
export function matchesAnswer(value, answers) { return answers.some(answer => normalizeAnswer(value) === normalizeAnswer(answer)); }
export function localDay(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
