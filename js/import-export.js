// import-export.js — Import و Export یادداشت‌ها

import { getState } from './state.js';
import { parse } from './markdown/parser.js';

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
    body {
      font-family: 'Vazirmatn', system-ui, sans-serif;
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
      line-height: 1.8;
      color: #1a1d21;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 { color: #111827; margin: 1.5rem 0 0.8rem; }
    h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3rem; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; color: #db2777; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; color: #1a1d21; padding: 0; }
    a { color: #4f46e5; text-decoration: none; border-bottom: 1px dashed currentColor; }
    blockquote { border-right: 4px solid #6366f1; background: #f9fafb; padding: 0.8rem 1rem; margin: 1rem 0; border-radius: 6px 0 0 6px; color: #6b7280; font-style: italic; }
    ul, ol { padding-right: 1.5rem; }
    li { margin: 0.3rem 0; }
    li::marker { color: #6366f1; }
  </style>
</head>
<body>
  <h1>${note.title || 'یادداشت'}</h1>
  ${htmlContent}
</body>
</html>`;

  const filename = (note.title || 'note').replace(/[^\u0600-\u06FF\w\-]/g, '-') + '.html';
  downloadFile(fullHtml, filename, 'text/html');
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
  const filename = (note.title || 'note').replace(/[^\u0600-\u06FF\w\-]/g, '-') + '.md';
  downloadFile(md, filename, 'text/markdown');
}

// ===== Import از فایل =====
function importFromFile(file, onSuccess) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;
    const title = file.name.replace(/\.(md|markdown|txt)$/i, '');

    const note = {
      id: 'n' + Date.now(),
      title: title || 'یادداشت وارد شده',
      content: content,
      tags: [],
      folder: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (onSuccess) onSuccess(note);
  };

  reader.readAsText(file, 'UTF-8');
}

export {
  downloadFile,
  exportToHTML,
  exportToMarkdown,
  importFromFile
};