// inline.js — Parse کردن Inline (Bold، Italic، Link، Code)

import { escapeHtml } from './block.js';

// ===== Code Inline =====
function parseInlineCode(text) {
  return text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code>${escapeHtml(code)}</code>`;
  });
}

// ===== Bold و Italic =====
function parseBoldItalic(text) {
  // Bold: **text** یا __text__
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic: *text* یا _text_
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

  return text;
}

// ===== Link =====
function parseLink(text) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    const safeUrl = url.replace(/"/g, '%22');
    const safeText = escapeHtml(linkText);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
  });
}

// ===== تابع اصلی =====
function parseInline(text) {
  // اگه متن خالی بود
  if (!text) return '';

  // ترتیب مهمه!
  // ۱. Code → چون داخلش نباید Bold/Italic کار کنه
  text = parseInlineCode(text);

  // ۲. Bold و Italic
  text = parseBoldItalic(text);

  // ۳. Link
  text = parseLink(text);

  return text;
}

export {
  parseInlineCode,
  parseBoldItalic,
  parseLink,
  parseInline
};