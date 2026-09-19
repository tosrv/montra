import { DOCS, type ContentDoc, type ContentDocType } from './docs.ts';

export function getAllDocs(): ContentDoc[] {
  return [...DOCS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getDocBySlug(slug: string): ContentDoc | undefined {
  return DOCS.find((doc) => doc.slug === slug);
}

export function filterByType(type: ContentDocType | 'all'): ContentDoc[] {
  const all = getAllDocs();
  if (type === 'all') return all;
  return all.filter((doc) => doc.type === type);
}
