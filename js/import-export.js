// import-export.js — Import و Export یادداشت‌ها

import { getState, setState } from './state.js';
import { parse } from './markdown/parser.js';
import { loadActiveNote } from './editor.js';
import { renderPreview } from './preview.js';
import { updateTags, renderTagList } from './tags.js';
import { renderSidebar } from './sidebar.js';
import { saveNotes } from './storage.js';

// ===== دانلود فایل =====
function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== نام فایل امن =====
function safeFilename(name) {
  return (name || 'note')
    .replace(/[^\u0600-\u06FF\w\s\-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

// ===== Export HTML =====
function exportToHTML() {
  const state = getState();
  const note = state.notes.find((n) => n.id === state.activeNoteId);
  if (!note) {
    alert('یادداشتی انتخاب نشده');
    return;
  }

  const htmlContent = parse(note.content || '');

  const fullHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title || 'یادداشت'}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Vazirmatn', system-ui, sans-serif;
      max-width: 800px;
      margin: 2rem auto;
      padding: 1.5rem;
      line-height: 1.8;
      color: #1a1d21;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 { color: #111827; margin: 1.5rem 0 0.8rem; line-height: 1.4; }
    h1 { font-size: 1.9em; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3rem; }
    h3 { font-size: 1.25em; }
    p { margin: 1rem 0; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; color: #db2777; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 8px; overflow-x: auto; border: 1px solid #e5e7eb; }
    pre code { background: none; color: #1a1d21; padding: 0; }
    a { color: #4f46e5; text-decoration: none; border-bottom: 1px dashed currentColor; }
    blockquote { border-right: 4px solid #6366f1; background: #f9fafb; padding: 0.8rem 1rem; margin: 1rem 0; border-radius: 6px 0 0 6px; color: #6b7280; font-style: italic; }
    ul, ol { padding-right: 1.5rem; }
    li { margin: 0.3rem 0; }
    li::marker { color: #6366f1; }
    strong { color: #111827; font-weight: 700; }
    em { font-style: italic; color: #6b7280; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  downloadFile(fullHtml, safeFilename(note.title) + '.html', 'text/html');
}

// ===== Export Markdown =====
function exportToMarkdown() {
  const state = getState();
  const note = state.notes.find((n) => n.id === state.activeNoteId);
  if (!note) {
    alert('یادداشتی انتخاب نشده');
    return;
  }

  const md = `# ${note.title || 'یادداشت'}\n\n${note.content || ''}`;
  downloadFile(md, safeFilename(note.title) + '.md', 'text/markdown');
}

// ===== Import از فایل =====
function importFromFile(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result || '';
    const title = file.name.replace(/\.(md|markdown|txt)$/i, '') || 'یادداشت وارد شده';

    const note = {
      id: 'n' + Date.now(),
      title: title,
      content: content,
      tags: [],
      folder: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const state = getState();
    const newNotes = [note, ...state.notes];

    setState({
      notes: newNotes,
      activeNoteId: note.id
    });

    // ذخیره تو localStorage
    saveNotes(newNotes, state.folders, state.tags);

    // رفرش UI
    renderSidebar();
    loadActiveNote();
    renderPreview();
    updateTags();
    renderTagList();
  };

  reader.readAsText(file, 'UTF-8');
}

// ===== منوی Export =====
function toggleExportMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('export-menu');
  if (!menu) return;

  const rect = e.currentTarget.getBoundingClientRect();
  menu.style.top = (rect.bottom + 8) + 'px';
  menu.style.right = (window.innerWidth - rect.right) + 'px';

  menu.hidden = !menu.hidden;
}

function hideExportMenu() {
  const menu = document.getElementById('export-menu');
  if (menu) menu.hidden = true;
}

// ===== راه‌اندازی =====
function setupImportExport() {
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-input');
  const exportMenu = document.getElementById('export-menu');

  // Export Menu
  if (exportBtn) {
    exportBtn.addEventListener('click', toggleExportMenu);
  }

  if (exportMenu) {
    exportMenu.querySelectorAll('.export-option').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const format = e.currentTarget.dataset.format;
        if (format === 'html') exportToHTML();
        else if (format === 'md') exportToMarkdown();
        hideExportMenu();
      });
    });
  }

  // بستن منو با کلیک جای دیگه
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#export-menu') && !e.target.closest('#export-btn')) {
      hideExportMenu();
    }
  });

  // Import
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());

    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) importFromFile(file);
      e.target.value = '';
    });
  }
}

export {
  downloadFile,
  exportToHTML,
  exportToMarkdown,
  importFromFile,
  setupImportExport
};