import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { CATEGORY_NAMES, type CategoryName } from './site.config';

const base = z.object({
  title: z.string().min(1),
  summary: z.string().min(1).max(200),
  category: z.enum([...CATEGORY_NAMES] as [CategoryName, ...CategoryName[]]),
  tags: z.array(z.string()).default([]),
  models: z.array(z.string()).default([]),
  version: z.string().default('0.1.0'),
  updated: z.coerce.date(),
  author: z.string().default(''),
  license: z.string().default(''),
  source: z.string().default(''),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

const prompts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/prompts' }),
  schema: base.extend({
    usage: z.string().optional(),
    variables: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
        }),
      )
      .default([]),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/skills' }),
  schema: base.extend({
    install: z.string().optional(),
    compatibility: z.array(z.string()).default([]),
  }),
});

export const collections = { prompts, skills };
