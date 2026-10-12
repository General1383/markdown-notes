// storage.js — ذخیره/بازیابی در localStorage

const KEY = 'markdown-notes';

function loadNotes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { notes: [], folders: [], tags: [] };

    const parsed = JSON.parse(raw);

    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      folders: Array.isArray(parsed.folders) ? parsed.folders : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : []
    };
  } catch (error) {
    console.error('Load error:', error);
    return { notes: [], folders: [], tags: [] };
  }
}

function saveNotes(notes, folders, tags) {
  try {
    const data = { notes, folders, tags };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Save error:', error);
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('markdown-settings');
    if (!raw) return { theme: 'light', language: 'fa' };

    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme || 'light',
      language: parsed.language || 'fa'
    };
  } catch (error) {
    return { theme: 'light', language: 'fa' };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem('markdown-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Settings save error:', error);
  }
}

export {
  loadNotes,
  saveNotes,
  loadSettings,
  saveSettings
};
