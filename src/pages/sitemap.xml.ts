import type { APIRoute } from 'astro';
import { CATEGORIES } from '../site.config';
import { getAllTags, getPrompts, getSkills } from '../lib/content';
import { href } from '../lib/url';

type UrlEntry = { loc: string; lastmod?: string };

const escapeXml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      })[char]!,
  );

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('http://localhost:4321');
  const abs = (path: string) => new URL(href(path), origin).toString();

  const [prompts, skills, tags] = await Promise.all([
    getPrompts(),
    getSkills(),
    getAllTags(),
  ]);

  const urls: UrlEntry[] = [
    { loc: abs('/') },
    { loc: abs('/prompts/') },
    { loc: abs('/skills/') },
    { loc: abs('/catalog/') },
    { loc: abs('/search/') },
    { loc: abs('/about/') },
    ...CATEGORIES.map((category) => ({
      loc: abs(`/categories/${category.slug}/`),
    })),
    ...tags.map((tag) => ({ loc: abs(`/tags/${tag.slug}/`) })),
    ...prompts.map((entry) => ({
      loc: abs(`/prompts/${entry.id}/`),
      lastmod: entry.data.updated.toISOString(),
    })),
    ...skills.map((entry) => ({
      loc: abs(`/skills/${entry.id}/`),
      lastmod: entry.data.updated.toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url><loc>${escapeXml(url.loc)}</loc>${
        url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''
      }</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
