import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const errors = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function attr(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'),
  );
  return match?.[1] ?? '';
}

function stripCode(html) {
  return html
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, '')
    .replace(/<code\b[\s\S]*?<\/code>/gi, '');
}

let pages = [];
try {
  pages = await walk(DIST);
} catch {
  console.error(`找不到构建产物：${DIST}`);
  process.exit(1);
}

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const clean = stripCode(html);
  const name = relative(DIST, file).replaceAll('\\', '/');

  const h1 = clean.match(/<h1\b/gi) ?? [];
  if (h1.length !== 1) {
    errors.push(`${name}: 期望恰好 1 个 <h1>，实际 ${h1.length} 个`);
  }

  if (/<style\b/i.test(clean)) {
    errors.push(`${name}: 出现 <style>`);
  }
  if (/\sstyle\s*=/i.test(clean)) {
    errors.push(`${name}: 出现 style=`);
  }

  if (!/<html[^>]*\blang\s*=\s*["']zh-CN["']/i.test(html)) {
    errors.push(`${name}: <html lang="zh-CN"> 缺失`);
  }
  if (!/<meta[^>]*\bname\s*=\s*["']viewport["']/i.test(html)) {
    errors.push(`${name}: viewport meta 缺失`);
  }

  for (const tag of clean.match(/<link\b[^>]*>/gi) ?? []) {
    if (!/\brel\s*=\s*["'][^"']*stylesheet/i.test(tag)) continue;
    const href = attr(tag, 'href');
    const ok =
      href.endsWith('/design/tokens.css') || href.endsWith('/design/site.css');
    if (!ok) errors.push(`${name}: 非 INK 样式表 ${href}`);
  }

  for (const tag of clean.match(/<script\b[^>]*>/gi) ?? []) {
    const src = attr(tag, 'src');
    if (!src) {
      errors.push(`${name}: 出现内联 <script>`);
      continue;
    }
    if (/^(?:https?:)?\/\//i.test(src)) {
      errors.push(`${name}: 外链脚本 ${src}`);
    } else if (!src.endsWith('/design/site.js')) {
      errors.push(`${name}: 非 INK 脚本 ${src}`);
    }
  }
}

if (!pages.some((file) => file.endsWith('404.html'))) {
  errors.push('dist/404.html 缺失');
}

const css = await readFile(join(ROOT, 'public', 'design', 'site.css'), 'utf8');
for (const match of css.matchAll(/border-radius\s*:\s*([^;]+);/gi)) {
  const value = match[1].trim().replace(/\s+/g, ' ');
  const parts = value.split(' ');
  const allZero = parts.every((part) => /^0(?:px|rem|em|%)?$/.test(part));
  const isToken = /^var\(--[\w-]+\)$/.test(value);
  if (!allZero && !isToken) {
    errors.push(`site.css: 非零圆角 border-radius: ${value}`);
  }
}

if (errors.length) {
  console.error(`构建审查失败（${errors.length} 项）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`构建审查通过：${pages.length} 个 HTML 页面；无内联样式/脚本、无外链资源、圆角为 0。`);
