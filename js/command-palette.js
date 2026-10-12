// command-palette.js — پالت دستورات با Ctrl+K

import { getState, setState } from './state.js';
import { renderSidebar } from './sidebar.js';
import { createNewNote, deleteNote } from './sidebar.js';
import { toggleTheme } from './theme.js';
import { exportToHTML, exportToMarkdown } from './import-export.js';
import { fuzzyMatch } from './search.js';

let allCommands = [];
let filteredCommands = [];
let selectedIndex = 0;
let isOpen = false;

function getDefaultCommands() {
  return [
    {
      id: 'new-note',
      title: '➕ یادداشت جدید',
      keywords: 'new note create add',
      action: () => createNewNote()
    },
    {
      id: 'toggle-theme',
      title: '🌙 تغییر تم',
      keywords: 'theme dark light toggle',
      action: () => toggleTheme()
    },
    {
      id: 'export-html',
      title: '📄 Export to HTML',
      keywords: 'export html download save',
      action: () => exportToHTML()
    },
    {
      id: 'export-md',
      title: '📝 Export to Markdown',
      keywords: 'export markdown md download save',
      action: () => exportToMarkdown()
    },
    {
      id: 'clear-search',
      title: '🔍 پاک کردن جستجو',
      keywords: 'clear reset search filter',
      action: () => {
        setState({ searchQuery: '', activeTagFilter: [] });
        const input = document.getElementById('search-input');
        if (input) input.value = '';
        renderSidebar();
      }
    },
    {
      id: 'delete-note',
      title: '🗑️ حذف یادداشت فعال',
      keywords: 'delete remove trash',
      action: () => {
        const state = getState();
        if (state.activeNoteId) deleteNote(state.activeNoteId);
      }
    }
  ];
}

function filterCommands(query) {
  if (!query.trim()) return allCommands;

  const results = [];
  allCommands.forEach((cmd) => {
    const titleMatch = fuzzyMatch(cmd.title, query);
    const keywordMatch = fuzzyMatch(cmd.keywords || '', query);

    if (titleMatch.matches || keywordMatch.matches) {
      const score = (titleMatch.score * 3) + keywordMatch.score;
      results.push({ cmd, score });
    }
  });

  results.sort((a, b) => b.score - a.score);
  return results.map((r) => r.cmd);
}

function renderCommandList() {
  const list = document.getElementById('command-list');
  if (!list) return;

  list.innerHTML = '';

  if (filteredCommands.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'command-empty';
    empty.textContent = 'دستوری پیدا نشد';
    list.appendChild(empty);
    return;
  }

  filteredCommands.forEach((cmd, idx) => {
    const li = document.createElement('li');
    li.className = 'command-item';
    if (idx === selectedIndex) li.classList.add('selected');
    li.textContent = cmd.title;
    li.dataset.index = idx;

    li.addEventListener('mouseenter', () => {
      selectedIndex = idx;
      updateSelection();
    });

    li.addEventListener('click', () => executeCommand(idx));

    list.appendChild(li);
  });
}

function updateSelection() {
  const items = document.querySelectorAll('.command-item');
  items.forEach((item, idx) => {
    if (idx === selectedIndex) item.classList.add('selected');
    else item.classList.remove('selected');
  });
}

function openPalette() {
  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-input');
  if (!palette || !input) return;

  palette.hidden = false;
  isOpen = true;
  selectedIndex = 0;

  input.value = '';
  filteredCommands = allCommands;
  renderCommandList();

  setTimeout(() => input.focus(), 20);
}

function closePalette() {
  const palette = document.getElementById('command-palette');
  if (palette) palette.hidden = true;
  isOpen = false;
}

function executeCommand(index) {
  const cmd = filteredCommands[index];
  if (!cmd) return;

  closePalette();
  setTimeout(() => cmd.action(), 20);
}

function setupCommandPalette() {
  allCommands = getDefaultCommands();
  filteredCommands = allCommands;

  const input = document.getElementById('command-input');
  const btn = document.getElementById('command-btn');
  const overlay = document.getElementById('command-overlay');

  if (btn) btn.addEventListener('click', openPalette);
  if (overlay) overlay.addEventListener('click', closePalette);

  if (input) {
    input.addEventListener('input', (e) => {
      filteredCommands = filterCommands(e.target.value);
      selectedIndex = 0;
      renderCommandList();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
        updateSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isOpen) closePalette();
      else openPalette();
    }

    if (e.key === 'Escape' && isOpen) {
      closePalette();
    }
  });
}

export {
  setupCommandPalette,
  openPalette,
  closePalette
};