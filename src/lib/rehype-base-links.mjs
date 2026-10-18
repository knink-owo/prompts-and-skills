/**
 * Prefix root-relative links inside Markdown content with Astro's base path.
 * Site components use href() instead; this only covers author-written content.
 */
export function baseLinks(options = {}) {
  const base = (options.base || '/').replace(/\/+$/, '');
  if (!base) return () => {};

  return (tree) => {
    const walk = (node) => {
      if (
        node?.type === 'element' &&
        (node.tagName === 'a' || node.tagName === 'img')
      ) {
        const key = node.tagName === 'a' ? 'href' : 'src';
        const value = node.properties?.[key];
        if (
          typeof value === 'string' &&
          value.startsWith('/') &&
          !value.startsWith('//') &&
          value !== base &&
          !value.startsWith(`${base}/`)
        ) {
          node.properties[key] = `${base}${value}`;
        }
      }
      if (Array.isArray(node?.children)) {
        for (const child of node.children) walk(child);
      }
    };
    walk(tree);
  };
}
