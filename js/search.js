// search.js — جستجوی Fuzzy

import { getState, setState } from './state.js';
import { renderSidebar } from './sidebar.js';

// ===== الگوریتم Fuzzy =====
function fuzzyMatch(text, query) {
  if (!query) return { matches: true, score: 0 };

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  let textIdx = 0;
  let queryIdx = 0;
  let score = 0;
  let lastMatchIdx = -1;

  while (textIdx < textLower.length && queryIdx < queryLower.length) {
    if (textLower[textIdx] === queryLower[queryIdx]) {
      // امتیاز بیشتر برای حروف پشت سر هم
      if (lastMatchIdx === textIdx - 1) {
        score += 2;
      } else {
        score += 1;
      }
      lastMatchIdx = textIdx;
      queryIdx++;
    }
    textIdx++;
  }

  const matches = queryIdx === queryLower.length;
  return { matches, score };
}

// ===== جستجو تو یادداشت‌ها =====
function searchNotes(notes, query) {
  if (!query.trim()) return notes;

  const results = [];

  notes.forEach((note) => {
    const titleMatch = fuzzyMatch(note.title || '', query);
    const contentMatch = fuzzyMatch(note.content || '', query);

    if (titleMatch.matches || contentMatch.matches) {
      // امتیاز کل: عنوان مهم‌تره
      const totalScore = (titleMatch.score * 3) + contentMatch.score;
      results.push({ note, score: totalScore });
    }
  });

  // مرتب‌سازی بر اساس امتیاز
  results.sort((a, b) => b.score - a.score);

  return results.map((r) => r.note);
}

// ===== آپدیت query تو State =====
function setSearchQuery(query) {
  setState({ searchQuery: query });
  renderSidebar();
}

// ===== راه‌اندازی =====
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    setSearchQuery(e.target.value);
  });

  // پاک کردن با Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      setSearchQuery('');
      input.blur();
    }
  });
}

export {
  fuzzyMatch,
  searchNotes,
  setSearchQuery,
  setupSearch
};