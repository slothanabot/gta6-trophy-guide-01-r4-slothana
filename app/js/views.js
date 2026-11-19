// views.js — renders the checklist, roadmap, missables and guide views.

import { spoilerMasked, displayName, displayDescription } from './filters.js';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gradeLetter(grade) {
  return { Platinum: 'P', Gold: 'G', Silver: 'S', Bronze: 'B' }[grade] || '?';
}

function kindLabel(trophy) {
  if (trophy.kind === 'story') return 'Story';
  if (trophy.kind === 'collectibles') return 'Collectibles';
  if (trophy.kind === 'activities') return 'Activities';
  if (trophy.kind === 'online') return 'Online';
  return 'Activities';
}

export function renderChecklist(container, trophies, state, openGuideId, onToggle, onOpenGuide) {
  if (trophies.length === 0) {
    container.innerHTML =
      '<p class="callout">No trophies match these filters. Clear the search or pick another kind or grade.</p>';
    return;
  }
  const list = document.createElement('ul');
  list.className = 'trophy-list';
  for (const trophy of trophies) {
    const item = document.createElement('li');
    item.className = 'trophy-card' + (state.earned[trophy.id] ? ' earned' : '') +
      (trophy.missable ? ' missable-flag' : '');
    const masked = spoilerMasked(trophy, state);
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'trophy-check';
    check.checked = Boolean(state.earned[trophy.id]);
    check.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
    check.addEventListener('change', () => onToggle(trophy.id));

    const dot = document.createElement('span');
    dot.className = 'grade-dot grade-' + trophy.grade;
    dot.textContent = gradeLetter(trophy.grade);
    dot.title = trophy.grade;

    const body = document.createElement('div');
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy, state);
    if (trophy.hidden) {
      const tag = document.createElement('span');
      tag.className = 'hidden-tag';
      tag.textContent = 'Hidden';
      name.appendChild(tag);
    }
    const desc = document.createElement('p');
    desc.className = 'trophy-desc' + (masked ? ' spoiler-hidden' : '');
    desc.textContent = displayDescription(trophy, state);
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.innerHTML =
      '<span class="badge">' + escapeHtml(trophy.grade) + '</span>' +
      '<span class="badge kind-' + escapeHtml(trophy.kind) + '">' + escapeHtml(kindLabel(trophy)) + '</span>' +
      (trophy.target ? '<span class="badge">Target: ' + escapeHtml(String(trophy.target)) + '</span>' : '') +
      (trophy.missable ? '<span class="badge missable">MISSABLE</span>' : '') +
      (state.earned[trophy.id] ? '<span class="badge">Earned ✓</span>' : '');
    body.append(name, desc, meta);

    const guideBtn = document.createElement('button');
    guideBtn.type = 'button';
    guideBtn.className = 'guide-btn';
    guideBtn.textContent = openGuideId === trophy.id ? 'Hide guide' : 'Guide & sources';
    guideBtn.addEventListener('click', () => onOpenGuide(trophy.id));

    item.append(check, dot, body, guideBtn);
    if (openGuideId === trophy.id) {
      const box = document.createElement('div');
      box.className = 'guide-box';
      const heading = document.createElement('h3');
      heading.textContent = 'Guide — ' + trophy.name;
      const guideText = document.createElement('p');
      guideText.textContent = trophy.guide;
      const sources = document.createElement('p');
      sources.className = 'guide-sources';
      sources.textContent = 'Sources: ' + (trophy.sources || []).join('; ');
      box.append(heading, guideText, sources);
      item.appendChild(box);
    }
    list.appendChild(item);
  }
  container.innerHTML = '';
  container.appendChild(list);
}

const ROADMAP_STAGES = [
  {
    title: 'Stage 1 — Play the story, save often (Chapters 1–2)',
    note: 'Finish Gone Fishing, then Chapters 1 and 2. Keep a manual save before every named mission — the missable mission trophies live here.',
    ids: ['just-like-paradise', 'paradise-lost', 't-s-ass-drug-money', 'trust', 'family-matters'],
  },
  {
    title: 'Stage 2 — Chapters 3–4 and the finale',
    note: 'Chapters 3 and 4, then the final mission. The two Gold trophies sit at the end of this stage: the final mission and 100% completion.',
    ids: ['vice-city-baby', 'top-of-the-world-ma', 'break-the-bank', 'dwnfall', 'hi-jacked', 'snow-storm', 'you-gotta-know-when-to-get-off'],
  },
  {
    title: 'Stage 3 — Strangers, side missions and choices',
    note: 'Finish every stranger mission strand and the named side characters. Do the choice-based trophies here, before moving on.',
    ids: ['strangers-and-freaks', 'road-to-rehabilitation', 'this-was-no-boat-accident', 'the-lone-rider', 'supply-and-demand', 'spin-on-this', 'actions-speak-louder', 'personal-best', 'bad-luck-i-guess'],
  },
  {
    title: 'Stage 4 — Collectibles and exploration',
    note: 'The long grind: cards, WAiNK spots, meditation spots, vehicles and the whole map. All counts come from PSNProfiles targets.',
    ids: ['dont-touch-my-deck', 'you-wainker', 'positive-mental-attitude', 'whip-it-good', 'the-goodtime-state', 'fair-game'],
  },
  {
    title: 'Stage 5 — Activities, races and the shooting range',
    note: 'Gold medals at all 42 shooting-range challenges, 250 stunts, 20 different races and a drone race win at every location.',
    ids: ['the-shootist', 'cunning-stunts', 'earn-cash-not-kudos', 'top-fun', 'master-of-none', 'baited-my-tackle', 'stick-fiddler'],
  },
  {
    title: 'Stage 6 — Robberies, money and clean-up',
    note: 'Bank vaults, armored trucks, jewelry stores, gang operations and the money trophies. Finish with 100% completion for A Long Road, then the Platinum pops.',
    ids: ['maximum-withdrawal', 'a-classic-blitz-play', 'sneakthief', 'pest-control', 'retail-therapy', 'hot-together', 'dime-on-the-dollar', 'treat-yo-self', 'little-boxes', 'on-the-spot', 'one-last-thing', 'a-long-road', 'vice-got-a-price'],
  },
];

export function renderRoadmap(container, trophies, state) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  container.innerHTML = '';
  const intro = document.createElement('p');
  intro.className = 'callout';
  intro.textContent =
    'Roadmap to the Platinum (Vice Got a Price!) — built from the official trophy descriptions and PSN count targets. ' +
    'One playthrough, no online trophies. Stages 1–2 are the story; stages 3–6 are the clean-up. Estimated effort: a long haul — the story alone is reported at around 60 hours.';
  container.appendChild(intro);
  for (const stage of ROADMAP_STAGES) {
    const box = document.createElement('section');
    box.className = 'roadmap-stage';
    const earnedHere = stage.ids.filter((id) => state.earned[id]).length;
    const heading = document.createElement('h3');
    heading.textContent = stage.title + ' — ' + earnedHere + '/' + stage.ids.length + ' earned';
    const note = document.createElement('p');
    note.className = 'stage-note';
    note.textContent = stage.note;
    const list = document.createElement('ol');
    for (const id of stage.ids) {
      const trophy = byId.get(id);
      if (!trophy) continue;
      const li = document.createElement('li');
      li.textContent =
        (state.earned[id] ? '✓ ' : '') + trophy.name + ' (' + trophy.grade + ')' +
        (trophy.missable ? ' — MISSABLE' : '') + ' — ' + trophy.description;
      list.appendChild(li);
    }
    box.append(heading, note, list);
    container.appendChild(box);
  }
}

export function renderMissables(container, trophies, state, onToggle, onOpenGuide) {
  const missables = trophies.filter((t) => t.missable);
  container.innerHTML = '';
  const note = document.createElement('div');
  note.className = 'missable-note';
  note.innerHTML =
    '<strong>14 missable trophies.</strong> These are our calls from the official descriptions: one-off ' +
    'missions, one-shot conditions (undetected, a single attempt) and choice-based moments that the ' +
    'description suggests cannot be replayed in the same run. Keep a manual save before each named mission ' +
    'and before any big story choice. Nothing here is confirmed in-game yet — the game launched 19 November 2026.';
  container.appendChild(note);
  const listHost = document.createElement('div');
  container.appendChild(listHost);
  renderChecklist(listHost, missables, state, null, onToggle, onOpenGuide);
}

export function renderGuideIndex(container, trophies, state, onOpenGuide) {
  container.innerHTML = '';
  const intro = document.createElement('p');
  intro.className = 'callout';
  intro.textContent =
    'Every guide below is written in our own words from the official trophy description, and names its sources. ' +
    'Pick a trophy to read its guide, what to do, when it can be missed, and where each fact comes from.';
  container.appendChild(intro);
  const list = document.createElement('ul');
  list.className = 'trophy-list';
  for (const trophy of trophies) {
    const item = document.createElement('li');
    item.className = 'trophy-card' + (trophy.missable ? ' missable-flag' : '');
    const dot = document.createElement('span');
    dot.className = 'grade-dot grade-' + trophy.grade;
    dot.textContent = gradeLetter(trophy.grade);
    const body = document.createElement('div');
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy, state);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy, state);
    body.append(name, desc);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guide-btn';
    btn.textContent = 'Read guide';
    btn.addEventListener('click', () => onOpenGuide(trophy.id));
    item.append(dot, body, btn);
    list.appendChild(item);
  }
  container.appendChild(list);
}
