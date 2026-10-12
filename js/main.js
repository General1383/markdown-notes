// main.js — اتصال همه‌ی ماژول‌ها و راه‌اندازی اپ

import { getState, setState } from './state.js';
import { loadNotes, loadSettings } from './storage.js';
import { setupEditor, loadActiveNote } from './editor.js';
import { renderPreview } from './preview.js';
import { setupTheme } from './theme.js';

// ===== ساخت یادداشت جدید =====
function createNote() {
  return {
    id: 'n' + Date.now(),
    title: 'یادداشت بدون عنوان',
    content: '',
    tags: [],
    folder: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// ===== راه‌اندازی =====
function init() {
  // ۱. تنظیمات رو لود کن
  const settings = loadSettings();
  setState(settings);

  // ۲. یادداشت‌ها رو لود کن
  const data = loadNotes();
  setState({
    notes: data.notes,
    folders: data.folders,
    tags: data.tags
  });

  // ۳. اگه هیچ یادداشتی نبود، یه یادداشت پیش‌فرض بساز
  if (data.notes.length === 0) {
    const firstNote = createNote();
    setState({
      notes: [firstNote],
      activeNoteId: firstNote.id
    });
  } else {
    setState({ activeNoteId: data.notes[0].id });
  }

  // ۴. راه‌اندازی‌ها
  setupTheme();
  setupEditor();
  loadActiveNote();
  renderPreview();
}

init();