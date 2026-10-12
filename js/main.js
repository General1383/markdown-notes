// main.js — اتصال همه‌ی ماژول‌ها و راه‌اندازی اپ

import { getState, setState } from './state.js';
import { loadNotes, loadSettings } from './storage.js';
import { setupEditor, loadActiveNote } from './editor.js';
import { renderPreview } from './preview.js';
import { setupTheme } from './theme.js';
import { setupSidebar } from './sidebar.js';
import { setupTags } from './tags.js';
import { setupSearch } from './search.js';
import { setupCommandPalette } from './command-palette.js';
import { setupImportExport } from './import-export.js';
import { setupHistory } from './history.js';

function createNote() {
  return {
    id: 'n' + Date.now(),
    title: 'یادداشت بدون عنوان',
    content: '',
    tags: [],
    folder: null,
    versions: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function init() {
  const settings = loadSettings();
  setState(settings);

  const data = loadNotes();
  setState({
    notes: data.notes,
    folders: data.folders,
    tags: data.tags
  });

  if (data.notes.length === 0) {
    const firstNote = createNote();
    setState({
      notes: [firstNote],
      activeNoteId: firstNote.id
    });
  } else {
    setState({ activeNoteId: data.notes[0].id });
  }

  setupTheme();
  setupEditor();
  setupSidebar();
  setupTags();
  setupSearch();
  setupCommandPalette();
  setupImportExport();
  setupHistory();
  loadActiveNote();
  renderPreview();
}

init();