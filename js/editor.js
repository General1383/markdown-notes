// editor.js — ویرایشگر متن + Auto-save + Version

import { getState, setState } from './state.js';
import { saveNotes } from './storage.js';
import { renderPreview } from './preview.js';
import { updateTags, renderTagList } from './tags.js';
import { renderSidebar } from './sidebar.js';
import { updateStats } from './toc.js';
import { saveVersion } from './history.js';

let debounceTimer = null;
let isSettingValues = false;

function scheduleSave() {
  clearTimeout(debounceTimer);

  updateSaveStatus('در حال ذخیره...', 'saving');
  renderPreview();
  updateStats();

  debounceTimer = setTimeout(() => {
    const state = getState();

    // ذخیره‌ی نسخه
    const activeNote = state.notes.find((n) => n.id === state.activeNoteId);
    if (activeNote) {
      const updatedNote = saveVersion(activeNote);
      const newNotes = state.notes.map((n) =>
        n.id === activeNote.id ? updatedNote : n
      );
      setState({ notes: newNotes });
    }

    // ذخیره در localStorage
    const finalState = getState();
    saveNotes(finalState.notes, finalState.folders, finalState.tags);

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
  updateTags();
  renderTagList();
}

function setupEditor() {
  const titleEl = document.getElementById('note-title');
  const editorEl = document.getElementById('note-editor');

  if (titleEl) titleEl.addEventListener('input', handleTitleInput);
  if (editorEl) editorEl.addEventListener('input', handleContentInput);
}

function loadActiveNote() {
  const state = getState();
  const note = state.notes.find((n) => n.id === state.activeNoteId);

  const titleEl = document.getElementById('note-title');
  const editorEl = document.getElementById('note-editor');

  if (!note) {
    isSettingValues = true;
    if (titleEl) { titleEl.value = ''; titleEl.disabled = true; }
    if (editorEl) { editorEl.value = ''; editorEl.disabled = true; }
    isSettingValues = false;
    updateStats();
    return;
  }

  isSettingValues = true;
  if (titleEl) { titleEl.value = note.title || ''; titleEl.disabled = false; }
  if (editorEl) { editorEl.value = note.content || ''; editorEl.disabled = false; }
  isSettingValues = false;

  updateStats();
}

export {
  setupEditor,
  loadActiveNote,
  scheduleSave
};