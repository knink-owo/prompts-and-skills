export type TagSummary = {
  name: string;
  slug: string;
  count: number;
};

/** URL-safe tag slug; Chinese characters are kept and encoded by the browser. */
export function tagSlug(tag: string): string {
  const slug = tag
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'tag';
}

/** Deduplicate tags by slug while preserving the first display spelling. */
export function uniqueTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const clean = tag.trim();
    if (!clean) continue;
    const slug = tagSlug(clean);
    if (seen.has(slug)) continue;
    seen.add(slug);
    result.push(clean);
  }
  return result;
}

/** Count each tag occurrence across entries. Pass tags already deduped per entry. */
export function buildTagIndex(tags: string[]): TagSummary[] {
  const map = new Map<string, TagSummary>();
  for (const tag of tags) {
    const clean = tag.trim();
    if (!clean) continue;
    const slug = tagSlug(clean);
    const existing = map.get(slug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(slug, { name: clean, slug, count: 1 });
    }
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'),
  );
}
