export const SITE = {
  name: 'PROMPT + SKILL',
  subtitle: '提示词与技能收藏',
  title: 'PROMPT + SKILL · 提示词与技能索引',
  description:
    '个人提示词与技能收藏：可直接复制的提示词、可安装的 agent 技能、使用说明与已知限制。',
  author: '',
  // Fill after creating the GitHub repository, e.g. https://github.com/<you>/prompts-and-skills
  repo: 'https://github.com/knink-owo/prompts-and-skills',
  locale: 'zh-CN',
  nav: [
    { href: '/prompts/', label: '提示词' },
    { href: '/skills/', label: '技能' },
    { href: '/catalog/', label: '目录' },
    { href: '/search/', label: '搜索' },
    { href: '/about/', label: '关于' },
  ],
} as const;

export const TONES = [
  'lake',
  'sky',
  'moss',
  'lotus',
  'wheat',
  'clay',
  'stone',
  'rouge',
] as const;

export type Tone = (typeof TONES)[number];
