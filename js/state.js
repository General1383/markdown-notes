// state.js — State مرکزی + subscription + setState

const initialState = {
  // ───── داده‌ها ─────
  notes: [],
  folders: [],
  tags: [],

  // ───── حالت فعال ─────
  activeNoteId: null,

  // ───── فیلترها ─────
  searchQuery: '',
  activeTagFilter: [],
  activeFolderFilter: null,

  // ───── Command Palette ─────
  commandPaletteOpen: false,

  // ───── تنظیمات ─────
  theme: 'light',
  language: 'fa',

  // ───── وضعیت ذخیره ─────
  lastSavedAt: null,
  isDirty: false
};

let state = { ...initialState };
let listeners = [];

export function getState() {
  return { ...state };
}

export function setState(patch) {
  state = { ...state, ...patch };

  listeners.forEach((callback) => {
    try {
      callback(state);
    } catch (error) {
      console.error('Listener error:', error);
    }
  });
}

export function subscribe(callback) {
  listeners.push(callback);

  return function unsubscribe() {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function resetState() {
  const { theme, language } = state;

  state = {
    ...initialState,
    theme,
    language
  };

  listeners.forEach((callback) => callback(state));
}