// toc.js — Table of Contents خودکار

// ===== شمارش کلمات =====
function countWords(text) {
  if (!text || !text.trim()) return 0;

  const cleanText = text
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '');

  const words = cleanText.trim().split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

// ===== زمان مطالعه =====
function getReadingTime(wordCount) {
  const WPM = 200;
  const minutes = Math.ceil(wordCount / WPM);
  return Math.max(1, minutes);
}

// ===== آپدیت Word Count و Reading Time =====
function updateStats() {
  const editorEl = document.getElementById('note-editor');
  if (!editorEl) return;

  const content = editorEl.value || '';
  const words = countWords(content);
  const minutes = getReadingTime(words);

  const wordEl = document.getElementById('word-count');
  const timeEl = document.getElementById('reading-time');

  if (wordEl) {
    wordEl.innerHTML = `<span class="stat-icon">✏️</span><span>${toPersianNum(words)} کلمه</span>`;
  }

  if (timeEl) {
    timeEl.innerHTML = `<span class="stat-icon">⏱️</span><span>${toPersianNum(minutes)} دقیقه</span>`;
  }
}

// ===== تبدیل عدد به فارسی =====
function toPersianNum(num) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

// ===== استخراج TOC از Preview =====
function generateTOC() {
  const preview = document.getElementById('preview');
  if (!preview) return null;

  const headings = preview.querySelectorAll('h1, h2, h3');
  if (headings.length === 0) return null;

  const tocList = [];

  headings.forEach((heading, idx) => {
    const id = 'heading-' + idx;
    heading.id = id;

    tocList.push({
      id,
      level: parseInt(heading.tagName[1]),
      text: heading.textContent
    });
  });

  return tocList;
}

// ===== رندر TOC (اگر خواستی تو جای خاصی نمایش بدی) =====
function renderTOC(tocList) {
  if (!tocList || tocList.length === 0) return '';

  let html = '<nav class="toc"><h3 class="toc-title">📑 فهرست مطالب</h3><ul class="toc-list">';

  tocList.forEach((item) => {
    html += `<li class="toc-item toc-level-${item.level}">
      <a href="#${item.id}">${item.text}</a>
    </li>`;
  });

  html += '</ul></nav>';
  return html;
}

export {
  countWords,
  getReadingTime,
  updateStats,
  toPersianNum,
  generateTOC,
  renderTOC
};