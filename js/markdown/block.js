// block.js — Parse کردن Block (عنوان، لیست، Code، Blockquote)

// ===== Helper =====
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== Heading =====
function parseHeading(line) {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  if (!match) return null;

  const level = match[1].length;
  const text = match[2].trim();

  return `<h${level}>${escapeHtml(text)}</h${level}>`;
}

// ===== List =====
function parseListItem(line) {
  const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
  if (unordered) {
    return { type: 'ul', text: unordered[1] };
  }

  const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
  if (ordered) {
    return { type: 'ol', text: ordered[1] };
  }

  return null;
}

// ===== Blockquote =====
function parseBlockquote(line) {
  const match = line.match(/^>\s?(.*)$/);
  if (!match) return null;

  return `<blockquote>${escapeHtml(match[1])}</blockquote>`;
}

// ===== Code Block =====
function isCodeFence(line) {
  return /^```/.test(line.trim());
}

// ===== Block Parser (تابع اصلی) =====
function parseBlock(markdown) {
  const lines = markdown.split('\n');
  const html = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // ───── خط خالی ─────
    if (!line.trim()) {
      i++;
      continue;
    }

    // ───── Code Block ─────
    if (isCodeFence(line)) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;

      while (i < lines.length && !isCodeFence(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // رد کردن ``` پایانی

      const code = escapeHtml(codeLines.join('\n'));
      const langClass = lang ? ` class="language-${lang}"` : '';
      html.push(`<pre><code${langClass}>${code}</code></pre>`);
      continue;
    }

    // ───── Heading ─────
    const heading = parseHeading(line);
    if (heading) {
      html.push(heading);
      i++;
      continue;
    }

    // ───── Blockquote ─────
    const quote = parseBlockquote(line);
    if (quote) {
      html.push(quote);
      i++;
      continue;
    }

    // ───── List ─────
    const listItem = parseListItem(line);
    if (listItem) {
      const listType = listItem.type;
      const items = [];

      while (i < lines.length) {
        const current = parseListItem(lines[i]);
        if (!current || current.type !== listType) break;

        items.push(`<li>${escapeHtml(current.text)}</li>`);
        i++;
      }

      html.push(`<${listType}>${items.join('')}</${listType}>`);
      continue;
    }

    // ───── پاراگراف ─────
    const paraLines = [line];
    i++;

    while (i < lines.length && lines[i].trim() && !parseHeading(lines[i]) && !parseListItem(lines[i]) && !parseBlockquote(lines[i]) && !isCodeFence(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }

    html.push(`<p>${escapeHtml(paraLines.join(' '))}</p>`);
  }

  return html.join('\n');
}

export {
  escapeHtml,
  parseHeading,
  parseListItem,
  parseBlockquote,
  isCodeFence,
  parseBlock
};