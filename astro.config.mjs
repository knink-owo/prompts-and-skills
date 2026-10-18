import { defineConfig } from 'astro/config';
import { baseLinks } from './src/lib/rehype-base-links.mjs';

const rawBase = process.env.BASE_PATH || '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;
const site = process.env.SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    // A prompt must be copied verbatim; highlighted spans add noise to textContent.
    syntaxHighlight: false,
    rehypePlugins: [[baseLinks, { base }]],
  },
});
