// preview.js — پیش‌نمایش زنده

import { getState } from './state.js';
import { parse } from './markdown/parser.js';

let debounceTimer = null;

function renderPreview() {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const state = getState();
    const note = state.notes.find((n) => n.id === state.activeNoteId);
    const preview = document.getElementById('preview');
    if (!preview) return;

    if (!note || !note.content) {
      preview.innerHTML = '';
      return;
    }

    const html = parse(note.content);
    preview.innerHTML = html;
  }, 100);
}

export {
  renderPreview
};