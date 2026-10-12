// editor.js — ویرایشگر متن + Auto-save

import { getState, setState } from './state.js';
import { saveNotes } from './storage.js';
import { renderPreview } from './preview.js';
import { updateTags, renderTagList } from './tags.js';
import { renderSidebar } from './sidebar.js';

let debounceTimer = null;
let isSettingValues = false;

// ===== ذخیره‌ی خودکار =====
function scheduleSave() {
  clearTimeout(debounceTimer);

  updateSaveStatus('در حال ذخیره...', 'saving');
  renderPreview();

  debounceTimer = setTimeout(() => {
    const state = getState();
    saveNotes(state.notes, state.folders, state.tags);

    setState({
      lastSavedAt: Date.now(),
      isDirty: false
    });

    updateSaveStatus('ذخیره شد', 'saved');
  }, 500);
}

function updateSaveStatus(text, className) {
  const status = document.getElementById('save-status');
  if (!status) return;

  status.textContent = text;
  status.className = 'save-status ' + className;
}

// ===== آپدیت یادداشت فعال =====
function updateActiveNote(patch) {
  const state = getState();
  const activeId = state.activeNoteId;
  if (!activeId) return;

  const newNotes = state.notes.map((note) => {
    if (note.id === activeId) {
      return { ...note, ...patch, updatedAt: Date.now() };
    }
    return note;
  });

  setState({ notes: newNotes, isDirty: true });
}

// ===== Event Handlers =====
function handleTitleInput(e) {
  if (isSettingValues) return;
  updateActiveNote({ title: e.target.value });
  scheduleSave();
  renderSidebar();
}

function handleContentInput(e) {
  if (isSettingValues) return;
  updateActiveNote({ content: e.target.value });
  scheduleSave();

  // آپدیت تگ‌ها
  updateTags();
  renderTagList();
}

// ===== راه‌اندازی =====
function setupEditor() {
  const titleEl = document.getElementById('note-title');
  const editorEl = document.getElementById('note-editor');

  if (titleEl) titleEl.addEventListener('input', handleTitleInput);
  if (editorEl) editorEl.addEventListener('input', handleContentInput);
}

// ===== بارگذاری یادداشت فعال =====
function loadActiveNote() {
  const state = getState();
  const note = state.notes.find((n) => n.id === state.activeNoteId);

  const titleEl = document.getElementById('note-title');
  const editorEl = document.getElementById('note-editor');

  if (!note) {
    isSettingValues = true;
    if (titleEl) {
      titleEl.value = '';
      titleEl.disabled = true;
    }
    if (editorEl) {
      editorEl.value = '';
      editorEl.disabled = true;
    }
    isSettingValues = false;
    return;
  }

  isSettingValues = true;
  if (titleEl) {
    titleEl.value = note.title || '';
    titleEl.disabled = false;
  }
  if (editorEl) {
    editorEl.value = note.content || '';
    editorEl.disabled = false;
  }
  isSettingValues = false;
}

export {
  setupEditor,
  loadActiveNote,
  scheduleSave
};