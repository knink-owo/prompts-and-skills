export const SITE = {
  name: 'PROMPT INDEX',
  subtitle: '提示词与技能收藏',
  title: 'PROMPT INDEX · 提示词索引',
  description:
    '个人提示词与技能收藏：可直接复制的提示词、使用说明、版本与已知限制。',
  author: '',
  // Fill after creating the GitHub repository, e.g. https://github.com/<you>/prompts-and-skills
  repo: '',
  locale: 'zh-CN',
  nav: [
    { href: '/prompts/', label: '提示词' },
    { href: '/skills/', label: '技能' },
    { href: '/catalog/', label: '目录' },
    { href: '/search/', label: '搜索' },
    { href: '/about/', label: '关于' },
  ],
} as const;

export const CATEGORY_NAMES = [
  '翻译',
  '写作',
  '编程',
  '研究',
  '学习',
  '效率',
  '视觉',
  '其他',
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

export type Tone =
  | 'lake'
  | 'sky'
  | 'moss'
  | 'lotus'
  | 'wheat'
  | 'clay'
  | 'stone'
  | 'rouge';

export type Category = {
  name: CategoryName;
  slug: string;
  tone: Tone;
  description: string;
};

export const CATEGORIES: ReadonlyArray<Category> = [
  {
    name: '翻译',
    slug: 'translation',
    tone: 'lake',
    description: '论文、文档与长文的跨语言搬运。',
  },
  {
    name: '写作',
    slug: 'writing',
    tone: 'lotus',
    description: '起草、改写、审稿与语气调整。',
  },
  {
    name: '编程',
    slug: 'coding',
    tone: 'moss',
    description: '代码生成、审查、调试与工程协作。',
  },
  {
    name: '研究',
    slug: 'research',
    tone: 'stone',
    description: '检索、阅读、对比与证据整理。',
  },
  {
    name: '学习',
    slug: 'learning',
    tone: 'wheat',
    description: '拆解概念、练习与反馈。',
  },
  {
    name: '效率',
    slug: 'productivity',
    tone: 'clay',
    description: '把重复流程压缩成可复用的指令。',
  },
  {
    name: '视觉',
    slug: 'visual',
    tone: 'rouge',
    description: '图像、版式与视觉描述。',
  },
  {
    name: '其他',
    slug: 'misc',
    tone: 'sky',
    description: '暂时没有归类的条目。',
  },
];
