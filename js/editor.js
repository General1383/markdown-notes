// editor.js — ویرایشگر متن + Auto-save

import { getState, setState } from './state.js';
import { saveNotes } from './storage.js';

let debounceTimer = null;
let isSettingValues = false;

// ===== ذخیره‌ی خودکار (با Debounce) =====
function scheduleSave() {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const state = getState();

    saveNotes(state.notes, state.folders, state.tags);

    setState({
      lastSavedAt: Date.now(),
      isDirty: false
    });

    updateSaveStatus('ذخیره شد', 'saved');
  }, 500);

  updateSaveStatus('در حال ذخیره...', 'saving');
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
  const title = e.target.value;
  updateActiveNote({ title });
  scheduleSave();
}

function handleContentInput(e) {
  if (isSettingValues) return;
  const content = e.target.value;
  updateActiveNote({ content });
  scheduleSave();
}

// ===== مقداردهی اولیه =====
function setupEditor() {
  const titleEl = document.getElementById('note-title');
  const editorEl = document.getElementById('note-editor');

  titleEl.addEventListener('input', handleTitleInput);
  editorEl.addEventListener('input', handleContentInput);
}

// ===== بارگذاری یادداشت فعال به editor =====
function loadActiveNote() {
  const state = getState();
  const note = state.notes.find((n) => n.id === state.activeNoteId);

  const titleEl = document.getElementById('note-title');
  const editorEl = document.getElementById('note-editor');

  if (!note) {
    isSettingValues = true;
    titleEl.value = '';
    editorEl.value = '';
    titleEl.disabled = true;
    editorEl.disabled = true;
    isSettingValues = false;
    return;
  }

  isSettingValues = true;
  titleEl.value = note.title || '';
  editorEl.value = note.content || '';
  titleEl.disabled = false;
  editorEl.disabled = false;
  isSettingValues = false;
}

export {
  setupEditor,
  loadActiveNote,
  scheduleSave
};