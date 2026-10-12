// tags.js — استخراج و مدیریت تگ‌ها

import { getState, setState } from './state.js';
import { renderSidebar } from './sidebar.js';

// ===== استخراج تگ‌ها از متن =====
function extractTags(text) {
  if (!text) return [];

  const regex = /#([\u0600-\u06FF\w-]+)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const tag = match[1].trim();
    if (tag && !matches.includes(tag)) {
      matches.push(tag);
    }
  }

  return matches;
}

// ===== جمع‌آوری همه‌ی تگ‌ها =====
function collectAllTags(notes) {
  const all = new Set();

  notes.forEach((note) => {
    const tags = extractTags(note.content);
    tags.forEach((t) => all.add(t));
  });

  return Array.from(all).sort();
}

// ===== آپدیت تگ‌های State =====
function updateTags() {
  const state = getState();
  const tags = collectAllTags(state.notes);
  setState({ tags });
  return tags;
}

// ===== رندر لیست تگ‌ها =====
function renderTagList() {
  const container = document.getElementById('tag-list');
  if (!container) return;

  const state = getState();
  const tags = state.tags;
  const activeTags = state.activeTagFilter || [];

  container.innerHTML = '';

  if (tags.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'empty-state';
    empty.textContent = 'هنوز تگی نداری';
    container.appendChild(empty);
    return;
  }

  tags.forEach((tag) => {
    const el = document.createElement('span');
    el.className = 'tag';
    el.textContent = '#' + tag;
    el.dataset.tag = tag;

    if (activeTags.includes(tag)) {
      el.classList.add('active');
    }

    el.addEventListener('click', () => toggleTagFilter(tag));

    container.appendChild(el);
  });
}

// ===== فیلتر تگ =====
function toggleTagFilter(tag) {
  const state = getState();
  const current = state.activeTagFilter || [];

  let updated;
  if (current.includes(tag)) {
    updated = current.filter((t) => t !== tag);
  } else {
    updated = [...current, tag];
  }

  setState({ activeTagFilter: updated });
  renderSidebar();
  renderTagList();
}

// ===== راه‌اندازی =====
function setupTags() {
  updateTags();
  renderTagList();
}

export {
  extractTags,
  collectAllTags,
  updateTags,
  renderTagList,
  toggleTagFilter,
  setupTags
};