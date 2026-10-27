export const STORAGE_KEY = 'hao-progress-v1';
export const emptyProgress = () => ({ completed: [], results: {}, reviews: {}, activity: [] });
export function sanitizeProgress(raw, ids, reviewKeys = []) {
  const state = emptyProgress();
  if (!raw || typeof raw !== 'object') return state;
  // Only accept a continuous completed prefix, so damaged storage cannot skip lessons.
  for (const id of ids) { if (!Array.isArray(raw.completed) || !raw.completed.includes(id)) break; state.completed.push(id); }
  for (const id of ids) {
    const r = raw.results?.[id];
    if (r && Number.isInteger(r.correct) && r.correct >= 0 && r.correct <= 3) state.results[id] = {correct:r.correct, total:3};
  }
  if (raw.reviews && typeof raw.reviews === 'object') for (const key of reviewKeys) {
    if (['__proto__','constructor','prototype'].includes(key) || !Object.hasOwn(raw.reviews,key)) continue;
    const value=raw.reviews[key];
    if (Number.isInteger(value) && value >= 0 && value <= 100000) state.reviews[key] = value;
  }
  state.activity = Array.isArray(raw.activity) ? [...new Set(raw.activity.filter(x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-366) : [];
  return state;
}
export function isUnlocked(index, state, lessons) { return index === 0 || state.completed.includes(lessons[index - 1].id); }
export function normalizeAnswer(value) { return value.normalize('NFC').toLocaleLowerCase('en').trim().replace(/\s+/g,''); }
export function matchesAnswer(value, answers) { return answers.some(answer => normalizeAnswer(value) === normalizeAnswer(answer)); }
export function localDay(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function createProgressBackup(state) {
  return JSON.stringify({app:'hao-mandarin',version:1,progress:state},null,2);
}
export function parseProgressBackup(text,ids,reviewKeys) {
  if(typeof text!=='string'||text.length>100000)throw new Error('Invalid progress backup.');
  const backup=JSON.parse(text);
  const progress=backup?.progress;
  if(backup?.app!=='hao-mandarin'||backup.version!==1||!progress||
    !Array.isArray(progress.completed)||!Array.isArray(progress.activity)||
    !progress.results||typeof progress.results!=='object'||Array.isArray(progress.results)||
    !progress.reviews||typeof progress.reviews!=='object'||Array.isArray(progress.reviews)) {
    throw new Error('Invalid progress backup.');
  }
  return sanitizeProgress(progress,ids,reviewKeys);
}
