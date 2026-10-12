// sidebar.js — لیست یادداشت‌ها، ساخت، حذف

import { getState, setState } from './state.js';
import { loadActiveNote } from './editor.js';
import { renderPreview } from './preview.js';

// ===== ساخت یادداشت جدید =====
function createNewNote() {
  const note = {
    id: 'n' + Date.now(),
    title: 'یادداشت بدون عنوان',
    content: '',
    tags: [],
    folder: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const state = getState();
  setState({
    notes: [note, ...state.notes],
    activeNoteId: note.id
  });

  renderSidebar();
  loadActiveNote();
  renderPreview();

  const titleEl = document.getElementById('note-title');
  if (titleEl) {
    titleEl.focus();
    titleEl.select();
  }
}

// ===== حذف یادداشت =====
function deleteNote(noteId) {
  const state = getState();
  if (!confirm('این یادداشت حذف بشه؟')) return;

  const newNotes = state.notes.filter((n) => n.id !== noteId);

  let newActiveId = state.activeNoteId;
  if (state.activeNoteId === noteId) {
    newActiveId = newNotes.length > 0 ? newNotes[0].id : null;
  }

  setState({
    notes: newNotes,
    activeNoteId: newActiveId
  });

  renderSidebar();
  loadActiveNote();
  renderPreview();
}

// ===== انتخاب یادداشت =====
function selectNote(noteId) {
  const state = getState();
  if (state.activeNoteId === noteId) return;

  setState({ activeNoteId: noteId });

  renderSidebar();
  loadActiveNote();
  renderPreview();
}

// ===== رندر لیست یادداشت‌ها =====
function renderNoteList() {
  const list = document.getElementById('note-list');
  if (!list) return;

  const state = getState();
  const query = state.searchQuery.toLowerCase().trim();

  let notes = state.notes;
  if (query) {
    notes = notes.filter((n) => {
      const inTitle = (n.title || '').toLowerCase().includes(query);
      const inContent = (n.content || '').toLowerCase().includes(query);
      return inTitle || inContent;
    });
  }

  list.innerHTML = '';

  if (notes.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = query ? 'یادداشتی پیدا نشد' : 'هنوز یادداشتی نداری';
    list.appendChild(empty);
    return;
  }

  notes.forEach((note) => {
    const li = document.createElement('li');
    li.className = 'note-item';
    if (note.id === state.activeNoteId) {
      li.classList.add('active');
    }

    const title = document.createElement('span');
    title.className = 'note-item-title';
    title.textContent = note.title || 'بدون عنوان';

    const del = document.createElement('button');
    del.className = 'note-delete-btn';
    del.type = 'button';
    del.textContent = '✕';
    del.title = 'حذف';
    del.setAttribute('aria-label', 'حذف یادداشت');

    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    });

    li.appendChild(title);
    li.appendChild(del);
    li.addEventListener('click', () => selectNote(note.id));

    list.appendChild(li);
  });
}

// ===== رندر Sidebar کامل =====
function renderSidebar() {
  renderNoteList();
}

// ===== راه‌اندازی =====
function setupSidebar() {
  const newBtn = document.getElementById('new-note-btn');
  if (newBtn) {
    newBtn.addEventListener('click', createNewNote);
  }

  renderSidebar();
}

export {
  setupSidebar,
  renderSidebar,
  createNewNote,
  selectNote,
  deleteNote
};