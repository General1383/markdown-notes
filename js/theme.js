// theme.js — مدیریت تم روشن/تاریک

import { getState, setState } from './state.js';
import { saveSettings } from './storage.js';

function applyTheme(theme) {
  // ۱. اعمال data-theme روی html
  document.documentElement.setAttribute('data-theme', theme);

  // ۲. تغییر آیکون دکمه
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.title = theme === 'light' ? 'تم تاریک' : 'تم روشن';
  }
}

function toggleTheme() {
  const state = getState();
  const newTheme = state.theme === 'light' ? 'dark' : 'light';

  // ۱. آپدیت State
  setState({ theme: newTheme });

  // ۲. اعمال تم
  applyTheme(newTheme);

  // ۳. ذخیره در localStorage
  saveSettings({
    theme: newTheme,
    language: state.language
  });
}

function setupTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', toggleTheme);

  // اعمال تم فعلی
  const state = getState();
  applyTheme(state.theme);
}

export {
  applyTheme,
  toggleTheme,
  setupTheme
};