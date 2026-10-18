import { getCollection, type CollectionEntry } from 'astro:content';
import {
  CATEGORIES,
  type Category,
  type CategoryName,
  type Tone,
} from '../site.config';
import { buildTagIndex, tagSlug, uniqueTags, type TagSummary } from './tags';

export type PromptEntry = CollectionEntry<'prompts'>;
export type SkillEntry = CollectionEntry<'skills'>;
export type AnyEntry = PromptEntry | SkillEntry;
export type CollectionName = 'prompts' | 'skills';

const byUpdatedDesc = (a: AnyEntry, b: AnyEntry) =>
  b.data.updated.getTime() - a.data.updated.getTime();

export async function getPrompts(): Promise<PromptEntry[]> {
  const entries = await getCollection('prompts', ({ data }) => !data.draft);
  return entries.sort(
    (a, b) => b.data.updated.getTime() - a.data.updated.getTime(),
  );
}

export async function getSkills(): Promise<SkillEntry[]> {
  const entries = await getCollection('skills', ({ data }) => !data.draft);
  return entries.sort(
    (a, b) => b.data.updated.getTime() - a.data.updated.getTime(),
  );
}

export async function getAllEntries(): Promise<AnyEntry[]> {
  const [prompts, skills] = await Promise.all([getPrompts(), getSkills()]);
  return [...prompts, ...skills].sort(byUpdatedDesc);
}

export function categoryOf(name: string): Category {
  const found = CATEGORIES.find((category) => category.name === name);
  if (found) return found;
  return CATEGORIES[CATEGORIES.length - 1]!;
}

export function categoryHref(name: string): string {
  return `/categories/${categoryOf(name).slug}/`;
}

export function toneOf(name: string): Tone {
  return categoryOf(name).tone;
}

export function entryHref(entry: AnyEntry): string {
  return `/${entry.collection}/${entry.id}/`;
}

export function collectionLabel(entry: AnyEntry): string {
  return entry.collection === 'prompts' ? 'PROMPT' : 'SKILL';
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  })
    .format(date)
    .replaceAll('/', '.');
}

export function searchText(entry: AnyEntry): string {
  const data = entry.data;
  return [
    data.title,
    data.summary,
    data.category,
    ...data.tags,
    ...data.models,
  ]
    .join(' ')
    .toLowerCase();
}

export async function getAllTags(): Promise<TagSummary[]> {
  const entries = await getAllEntries();
  return buildTagIndex(
    entries.flatMap((entry) => uniqueTags(entry.data.tags)),
  );
}

export async function getEntriesByTag(slug: string): Promise<AnyEntry[]> {
  const entries = await getAllEntries();
  return entries.filter((entry) =>
    entry.data.tags.some((tag) => tagSlug(tag) === slug),
  );
}

export async function getEntriesByCategory(name: string): Promise<AnyEntry[]> {
  const entries = await getAllEntries();
  return entries.filter((entry) => entry.data.category === name);
}

export async function getCategoryCounts(): Promise<Record<CategoryName, number>> {
  const entries = await getAllEntries();
  const counts = Object.fromEntries(
    CATEGORIES.map((category) => [category.name, 0]),
  ) as Record<CategoryName, number>;
  for (const entry of entries) {
    counts[entry.data.category] += 1;
  }
  return counts;
}

export async function getStats() {
  const [prompts, skills, tags] = await Promise.all([
    getPrompts(),
    getSkills(),
    getAllTags(),
  ]);
  return {
    prompts: prompts.length,
    skills: skills.length,
    tags: tags.length,
    categories: CATEGORIES.length,
  };
}

export async function getRelated(
  entry: AnyEntry,
  limit = 3,
): Promise<AnyEntry[]> {
  const entries = await getAllEntries();
  const tags = new Set(entry.data.tags.map(tagSlug));
  return entries
    .filter(
      (candidate) =>
        candidate.collection !== entry.collection || candidate.id !== entry.id,
    )
    .map((candidate) => {
      const shared = candidate.data.tags.filter((tag) =>
        tags.has(tagSlug(tag)),
      ).length;
      const sameCategory = candidate.data.category === entry.data.category ? 1 : 0;
      return { candidate, score: shared * 2 + sameCategory };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.data.updated.getTime() -
          a.candidate.data.updated.getTime(),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getSiblings(entry: AnyEntry): Promise<{
  prev?: AnyEntry;
  next?: AnyEntry;
}> {
  const entries =
    entry.collection === 'prompts' ? await getPrompts() : await getSkills();
  const index = entries.findIndex((candidate) => candidate.id === entry.id);
  if (index < 0) return {};
  return {
    prev: index > 0 ? entries[index - 1] : undefined,
    next: index < entries.length - 1 ? entries[index + 1] : undefined,
  };
}
