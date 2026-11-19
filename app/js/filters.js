// filters.js — kind, grade, search and spoiler filtering for the trophy list.

export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind]
    .join(' ')
    .toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).every((word) => haystack.includes(word));
}

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return trophy.kind === 'online';
  return trophy.kind === kind;
}

export function trophyMatchesGrade(trophy, grade) {
  if (grade === 'all') return true;
  return trophy.grade === grade;
}

export function applyTrophyFilters(trophies, filters) {
  return trophies.filter(
    (t) =>
      trophyMatchesSearch(t, filters.query) &&
      trophyMatchesKind(t, filters.kind) &&
      trophyMatchesGrade(t, filters.grade) &&
      (!filters.earnedOnly || filters.earned[t.id])
  );
}

// Spoiler rule: when the spoiler setting is on, a hidden story trophy that is
// not yet earned shows a placeholder instead of its real name and description.
export function spoilerMasked(trophy, state) {
  return state.spoiler === true && trophy.hidden === true && !state.earned[trophy.id];
}

export function displayName(trophy, state) {
  return spoilerMasked(trophy, state) ? 'Hidden trophy — earn it to reveal' : trophy.name;
}

export function displayDescription(trophy, state) {
  return spoilerMasked(trophy, state)
    ? 'A hidden story trophy. Its name and description stay hidden until you earn it.'
    : trophy.description;
}
