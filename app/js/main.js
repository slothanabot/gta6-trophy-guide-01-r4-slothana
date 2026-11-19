// main.js — boot, hash routing, toolbar wiring for the Vice City Trophy Ledger.

import { loadSavedProgress, saveProgress, toggleEarned, earnedCount, exportProgressFile, parseImportedProgress, demoSeedState } from './store.js';
import { applyTrophyFilters } from './filters.js';
import { renderChecklist, renderRoadmap, renderMissables, renderGuideIndex } from './views.js';

const DATA_URL = './data/trophies.json';

let allTrophies = [];
let appState = loadSavedProgress();
let currentView = 'checklist';
let openGuideId = null;
let searchQuery = '';
let kindFilter = 'all';
let gradeFilter = 'all';
let earnedOnly = false;

const viewEl = document.getElementById('view');
const searchInput = document.getElementById('searchInput');
const spoilerToggle = document.getElementById('spoilerToggle');
const earnedOnlyToggle = document.getElementById('earnedOnlyToggle');
const listMeta = document.getElementById('listMeta');
const toolbar = document.getElementById('toolbar');

function readHashView() {
  const hash = window.location.hash || '#/checklist';
  const match = hash.match(/^#\/(checklist|roadmap|missables|guide)/);
  return match ? match[1] : 'checklist';
}

function updateProgressHeader() {
  const earned = earnedCount(appState);
  const total = allTrophies.length || 55;
  document.getElementById('earnedCount').textContent = String(earned);
  document.getElementById('totalCount').textContent = String(total);
  document.getElementById('progressPct').textContent = Math.round((earned / total) * 100) + '%';
  const fill = document.getElementById('progressFill');
  fill.style.width = (earned / total) * 100 + '%';
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  bar.setAttribute('aria-valuemax', String(total));
  const grades = ['Platinum', 'Gold', 'Silver', 'Bronze'];
  document.getElementById('gradeCounts').textContent = grades
    .map((g) => {
      const inGrade = allTrophies.filter((t) => t.grade === g);
      const got = inGrade.filter((t) => appState.earned[t.id]).length;
      return g + ' ' + got + '/' + inGrade.length;
    })
    .join(' · ');
  const missables = allTrophies.filter((t) => t.missable);
  const missGot = missables.filter((t) => appState.earned[t.id]).length;
  document.getElementById('missablePill').textContent = missGot + '/' + missables.length;
}

function currentFilters() {
  return {
    query: searchQuery,
    kind: kindFilter,
    grade: gradeFilter,
    earnedOnly,
    earned: appState.earned,
  };
}

function handleToggleTrophy(trophyId) {
  appState = toggleEarned(appState, trophyId);
  updateProgressHeader();
  renderCurrentView();
}

function handleOpenGuide(trophyId) {
  openGuideId = openGuideId === trophyId ? null : trophyId;
  if (currentView !== 'checklist' && currentView !== 'guide') {
    window.location.hash = '#/checklist';
  }
  renderCurrentView();
  if (openGuideId) {
    const card = viewEl.querySelector('.guide-box');
    if (card) card.scrollIntoView({ block: 'nearest' });
  }
}

function renderCurrentView() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === currentView);
  });
  toolbar.style.display = currentView === 'checklist' ? '' : 'none';
  if (currentView === 'roadmap') {
    listMeta.textContent = 'Six stages, in the order to earn them. Story first, clean-up after.';
    renderRoadmap(viewEl, allTrophies, appState);
    return;
  }
  if (currentView === 'missables') {
    listMeta.textContent = '14 trophies that can be missed in a single run — save before each one.';
    renderMissables(viewEl, allTrophies, appState, handleToggleTrophy, handleOpenGuide);
    return;
  }
  if (currentView === 'guide') {
    listMeta.textContent = 'All 55 guides, each with its sources. Use the checklist to tick trophies off as you earn them.';
    renderGuideIndex(viewEl, allTrophies, appState, handleOpenGuide);
    return;
  }
  const filtered = applyTrophyFilters(allTrophies, currentFilters());
  listMeta.textContent =
    'Showing ' + filtered.length + ' of ' + allTrophies.length + ' trophies · ' +
    earnedCount(appState) + ' earned · ' +
    (appState.spoiler ? 'spoilers hidden until earned' : 'spoilers shown');
  renderChecklist(viewEl, filtered, appState, openGuideId, handleToggleTrophy, handleOpenGuide);
}

function wireToolbar() {
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderCurrentView();
  });
  document.querySelectorAll('input[name="kind"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      kindFilter = radio.value;
      renderCurrentView();
    });
  });
  document.querySelectorAll('input[name="grade"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      gradeFilter = radio.value;
      renderCurrentView();
    });
  });
  spoilerToggle.checked = appState.spoiler !== false;
  spoilerToggle.addEventListener('change', () => {
    appState = { ...appState, spoiler: spoilerToggle.checked };
    saveProgress(appState);
    renderCurrentView();
  });
  earnedOnlyToggle.addEventListener('change', () => {
    earnedOnly = earnedOnlyToggle.checked;
    renderCurrentView();
  });
  document.getElementById('exportBtn').addEventListener('click', () => exportProgressFile(appState));
  const importFile = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      appState = parseImportedProgress(text);
      saveProgress(appState);
      spoilerToggle.checked = appState.spoiler !== false;
      updateProgressHeader();
      renderCurrentView();
    } catch (err) {
      alert('That file is not a valid Vice City Trophy Ledger progress export.');
    }
    importFile.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies and reset progress?')) {
      appState = { earned: {}, spoiler: spoilerToggle.checked, notes: {} };
      saveProgress(appState);
      updateProgressHeader();
      renderCurrentView();
    }
  });
}

async function loadTrophyData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('Could not load trophy data.');
  const data = await response.json();
  const list = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(list)) throw new Error('Trophy data is not a list.');
  return list;
}

async function bootLedger() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === '1') {
    try {
      if (!localStorage.getItem('vice-city-trophy-ledger-v1')) {
        appState = demoSeedState();
        saveProgress(appState);
      }
    } catch (err) {
      appState = demoSeedState();
    }
  }
  try {
    allTrophies = await loadTrophyData();
  } catch (err) {
    viewEl.innerHTML = '<p class="callout">Could not load the trophy list. Open this app from its own files (app/index.html served over HTTP) and try again.</p>';
    return;
  }
  currentView = readHashView();
  wireToolbar();
  const guideParam = params.get('guide');
  if (guideParam && allTrophies.some((t) => t.id === guideParam)) {
    currentView = 'checklist';
    openGuideId = guideParam;
  }
  const queryParam = params.get('q');
  if (queryParam) {
    searchQuery = queryParam;
    searchInput.value = queryParam;
  }
  window.addEventListener('hashchange', () => {
    currentView = readHashView();
    openGuideId = null;
    renderCurrentView();
  });
  updateProgressHeader();
  renderCurrentView();
}

bootLedger();
