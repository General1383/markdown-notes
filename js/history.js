// history.js — تاریخچه‌ی نسخه‌ها

import { getState, setState } from './state.js';
import { saveNotes } from './storage.js';
import { loadActiveNote } from './editor.js';
import { renderPreview } from './preview.js';

const MAX_VERSIONS = 5;
const MIN_INTERVAL = 30000; // ۳۰ ثانیه

// ===== ساخت نسخه‌ی جدید =====
function createVersion(note) {
  return {
    content: note.content || '',
    title: note.title || '',
    savedAt: Date.now()
  };
}

// ===== ذخیره‌ی نسخه =====
function saveVersion(note) {
  if (!note) return note;

  const versions = note.versions || [];
  const lastVersion = versions[versions.length - 1];

  // چک کن محتوا عوض شده؟
  if (lastVersion && lastVersion.content === note.content && lastVersion.title === note.title) {
    return note;
  }

  // چک کن فاصله‌ی زمانی کافیه؟
  if (lastVersion && Date.now() - lastVersion.savedAt < MIN_INTERVAL) {
    return note;
  }

  const newVersion = createVersion(note);
  const newVersions = [...versions, newVersion];

  // سقف
  while (newVersions.length > MAX_VERSIONS) {
    newVersions.shift();
  }

  return { ...note, versions: newVersions };
}

// ===== بازیابی نسخه =====
function restoreVersion(versionIndex) {
  const state = getState();
  const note = state.notes.find((n) => n.id === state.activeNoteId);
  if (!note) return;

  const versions = note.versions || [];
  const version = versions[versionIndex];
  if (!version) return;

  if (!confirm('محتوای فعلی با این نسخه جایگزین بشه؟')) return;

  const updatedNote = {
    ...note,
    title: version.title,
    content: version.content,
    updatedAt: Date.now()
  };

  const newNotes = state.notes.map((n) =>
    n.id === note.id ? updatedNote : n
  );

  setState({ notes: newNotes });
  saveNotes(newNotes, state.folders, state.tags);

  loadActiveNote();
  renderPreview();
  closeVersionsModal();

  alert('نسخه بازیابی شد ✅');
}

// ===== نمایش مودال تاریخچه =====
function showVersionsModal() {
  const state = getState();
  const note = state.notes.find((n) => n.id === state.activeNoteId);

  if (!note) {
    alert('یادداشتی انتخاب نشده');
    return;
  }

  const versions = note.versions || [];

  if (versions.length === 0) {
    alert('هنوز نسخه‌ای ذخیره نشده. یه کم تایپ کن و صبر کن.');
    return;
  }

  // ساخت مودال
  let modal = document.getElementById('versions-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'versions-modal';
  modal.className = 'versions-modal';

  modal.innerHTML = `
    <div class="versions-overlay" data-close="true"></div>
    <div class="versions-content" role="dialog" aria-label="تاریخچه‌ی نسخه‌ها">
      <div class="versions-header">
        <h3>📚 تاریخچه‌ی نسخه‌ها</h3>
        <button class="icon-btn" data-close="true" aria-label="بستن">✕</button>
      </div>
      <ul class="versions-list">
        ${versions
          .slice()
          .reverse()
          .map((v, i) => {
            const realIdx = versions.length - 1 - i;
            const preview = (v.content || '').substring(0, 100).replace(/\n/g, ' ');
            const date = formatDate(v.savedAt);
            return `
              <li class="version-item">
                <div class="version-info">
                  <div class="version-title">${escapeHtml(v.title || 'بدون عنوان')}</div>
                  <div class="version-preview">${escapeHtml(preview)}...</div>
                  <div class="version-date">${date}</div>
                </div>
                <button class="btn-primary version-restore" data-index="${realIdx}">
                  بازیابی
                </button>
              </li>
            `;
          })
          .join('')}
      </ul>
    </div>
  `;

  document.body.appendChild(modal);

  // رویدادها
  modal.addEventListener('click', (e) => {
    if (e.target.dataset.close === 'true') {
      closeVersionsModal();
    }

    if (e.target.classList.contains('version-restore')) {
      const idx = parseInt(e.target.dataset.index);
      restoreVersion(idx);
    }
  });
}

function closeVersionsModal() {
  const modal = document.getElementById('versions-modal');
  if (modal) modal.remove();
}

// ===== Helpers =====
function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const diff = (now - d) / 1000;

  if (diff < 60) return 'همین الان';
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;

  const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// ===== راه‌اندازی =====
function setupHistory() {
  // رویداد گلوبال برای Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVersionsModal();
    }
  });
}

export {
  saveVersion,
  restoreVersion,
  showVersionsModal,
  closeVersionsModal,
  setupHistory
};