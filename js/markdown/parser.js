// parser.js — تابع اصلی Parser (Block + Inline)

import { parseBlock } from './block.js';
import { parseInline } from './inline.js';

function parse(markdown) {
  // ۱. اول Block → خط‌ها به HTML
  let html = parseBlock(markdown);

  // ۲. بعد Inline → داخل هر HTML، متن رو فرمت کن
  html = parseInline(html);

  return html;
}

export {
  parse
};