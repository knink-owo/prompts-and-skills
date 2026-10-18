import type { APIRoute } from 'astro';
import { SITE } from '../site.config';
import { getPrompts, getSkills } from '../lib/content';
import { href } from '../lib/url';

const escapeLabel = (value: string) => value.replace(/\]/g, '\\]');

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('http://localhost:4321');
  const abs = (path: string) => new URL(href(path), origin).toString();

  const [prompts, skills] = await Promise.all([getPrompts(), getSkills()]);

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    '本站内容为个人提示词与技能收藏，可自由阅读；转载或复用请遵守条目内标注的许可。',
    '',
    '## Prompts',
    ...prompts.map(
      (entry) =>
        `- [${escapeLabel(entry.data.title)}](${abs(`/prompts/${entry.id}/`)}): ${entry.data.summary}`,
    ),
  ];

  if (skills.length > 0) {
    lines.push(
      '',
      '## Skills',
      ...skills.map(
        (entry) =>
          `- [${escapeLabel(entry.data.title)}](${abs(`/skills/${entry.id}/`)}): ${entry.data.summary}`,
      ),
    );
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
