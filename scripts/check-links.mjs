import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const rawBase = process.env.BASE_PATH || '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;

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

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function withoutBase(pathname) {
  if (base === '/') return pathname;
  if (pathname === base) return '/';
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length);
  return null;
}

function isExternal(value) {
  return (
    !value ||
    value.startsWith('#') ||
    value.startsWith('//') ||
    /^(?:https?|mailto|tel|data|javascript):/i.test(value)
  );
}

async function resolve(href) {
  const url = new URL(href, 'http://local');
  const pathname = decode(url.pathname);
  const local = withoutBase(pathname);
  if (local === null) return { missingBase: true, target: pathname };
  if (!local.startsWith('/')) return { target: `/${local}` };

  const candidates = [];
  if (local.endsWith('/')) {
    candidates.push(join(DIST, local, 'index.html'));
  } else {
    candidates.push(join(DIST, local));
    candidates.push(join(DIST, `${local}.html`));
    candidates.push(join(DIST, local, 'index.html'));
  }

  for (const candidate of candidates) {
    if (await exists(candidate)) return { target: candidate };
  }
  return { target: candidates[0] };
}

let pages = [];
try {
  pages = await walk(DIST);
} catch {
  console.error(`找不到构建产物：${DIST}`);
  process.exit(1);
}

const linkPattern =
  /<(a|link|script|img|form)\b[^>]*?\b(href|src|action)\s*=\s*["']([^"']*)["'][^>]*>/gi;

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const source = relative(DIST, file).replaceAll('\\', '/');

  for (const match of html.matchAll(linkPattern)) {
    const value = match[3].trim();
    if (isExternal(value)) continue;

    const { missingBase, target } = await resolve(value);
    if (missingBase) {
      errors.push(`${source}: 链接缺少 base（${base}）：${value}`);
      continue;
    }
    if (!(await exists(target))) {
      errors.push(`${source}: 目标不存在：${value}`);
    }
  }
}

if (errors.length) {
  console.error(`链接检查失败（${errors.length} 项）：`);
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  if (errors.length > 80) console.error(`- …另有 ${errors.length - 80} 项`);
  process.exit(1);
}

console.log(`链接检查通过：${pages.length} 个 HTML 页面，内部链接均可解析。`);
