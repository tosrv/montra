import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Newspaper } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.tsx';
import { PublicFooter } from '../../components/layout/PublicFooter.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { pickLocale, type ContentDocType } from '../../content/docs.ts';
import { filterByType } from '../../content/docsHelpers.ts';

type Filter = 'all' | ContentDocType;

export function DocsIndexPage() {
  const { t, locale } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => filterByType(filter), [filter]);

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t('docs.filterAll') },
    { id: 'doc', label: t('docs.filterDocs') },
    { id: 'blog', label: t('docs.filterBlog') },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        <section className="border-b border-neutral-100 dark:border-neutral-800 bg-linear-to-b from-neutral-50/70 dark:from-neutral-900/50 to-white dark:to-neutral-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3">
              {t('nav.docs')}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 mb-3">
              {t('docs.title')}
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {t('docs.subtitle')}
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label={t('docs.filtersLabel')}>
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={[
                    'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
                    active
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('docs.empty')}</p>
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800">
              {items.map((doc) => {
                const TypeIcon = doc.type === 'blog' ? Newspaper : BookOpen;
                return (
                  <li key={doc.slug}>
                    <Link
                      to={`/docs/${doc.slug}`}
                      className="group flex items-start gap-4 py-5 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="mt-0.5 w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <TypeIcon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            {doc.type === 'blog' ? t('docs.typeBlog') : t('docs.typeDoc')}
                          </span>
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                            {doc.publishedAt}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
                          {pickLocale(doc.title, locale)}
                        </h2>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {pickLocale(doc.description, locale)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 mt-2 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0 transition-colors" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
