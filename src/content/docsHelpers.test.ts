import { describe, expect, it } from 'vitest';
import { DOCS } from './docs.ts';
import { filterByType, getAllDocs, getDocBySlug } from './docsHelpers.ts';

describe('docs content', () => {
  it('has unique slugs', () => {
    const slugs = DOCS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('sorts newest first', () => {
    const all = getAllDocs();
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].publishedAt >= all[i].publishedAt).toBe(true);
    }
  });

  it('filters by type', () => {
    expect(filterByType('blog').every((d) => d.type === 'blog')).toBe(true);
    expect(filterByType('doc').every((d) => d.type === 'doc')).toBe(true);
    expect(filterByType('all')).toHaveLength(DOCS.length);
  });

  it('looks up by slug', () => {
    expect(getDocBySlug('getting-started')?.type).toBe('doc');
    expect(getDocBySlug('missing')).toBeUndefined();
  });
});
