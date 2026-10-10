// main.js — تست Parser
import { parseBlock } from './markdown/block.js';

const test = `# سلام دنیا

این یه پاراگراف ساده‌ست.

## بخش دوم

- آیتم اول
- آیتم دوم
- آیتم سوم

> این یه نقل قوله

\`\`\`js
console.log('hello');
\`\`\`

پاراگراف آخر.`;

console.log('=== HTML ===');
console.log(parseBlock(test));