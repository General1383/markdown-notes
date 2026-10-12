// preview.js — پیش‌نمایش زنده + TOC

import { getState } from './state.js';
import { parse } from './markdown/parser.js';
import { generateTOC, renderTOC } from './toc.js';

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

    // ۱. Parse کردن متن
    const html = parse(note.content);
    preview.innerHTML = html;

    // ۲. تولید و درج TOC
    const toc = generateTOC();
    if (toc && toc.length > 0) {
      const tocHTML = renderTOC(toc);
      preview.insertAdjacentHTML('afterbegin', tocHTML);
    }
  }, 100);
}

export {
  renderPreview
};