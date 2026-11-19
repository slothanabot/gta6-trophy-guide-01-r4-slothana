// store.js — saved progress: localStorage, export to file, import back.
const STORAGE_KEY = 'vice-city-trophy-ledger-v1';

export function loadSavedProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: {}, spoiler: true, notes: {} };
    const parsed = JSON.parse(raw);
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      spoiler: parsed.spoiler !== false,
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    };
  } catch (err) {
    return { earned: {}, spoiler: true, notes: {} };
  }
}

export function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Storage full or unavailable (private mode): progress stays in memory only.
  }
}

export function toggleEarned(state, trophyId) {
  const next = { ...state, earned: { ...state.earned } };
  if (next.earned[trophyId]) delete next.earned[trophyId];
  else next.earned[trophyId] = true;
  saveProgress(next);
  return next;
}

export function earnedCount(state) {
  return Object.keys(state.earned).filter((id) => state.earned[id]).length;
}

export function exportProgressFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-city-trophy-ledger-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a progress file.');
  return {
    earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
    spoiler: parsed.spoiler !== false,
    notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
  };
}

// Demo mode: seeds 13 earned trophies so screenshots can show a tracker mid-run.
// Only used when the page is opened with ?demo=1 and nothing is saved yet.
export const DEMO_EARNED_IDS = [
  'just-like-paradise', 'paradise-lost', 'trust', 'baited-my-tackle',
  'stick-fiddler', 'in-the-beginning', 'lets-go-bowling', 'ten-pin',
  'catch-me-if-you-can', 'challenging-tank', 'whip-it-good', 'on-the-spot',
  'treat-yo-self',
];

export function demoSeedState() {
  const earned = {};
  for (const id of DEMO_EARNED_IDS) earned[id] = true;
  return { earned, spoiler: true, notes: {} };
}
