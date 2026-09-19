import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.tsx';
import { PublicFooter } from '../../components/layout/PublicFooter.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { pickLocale } from '../../content/docs.ts';
import { getDocBySlug } from '../../content/docsHelpers.ts';

export function DocsArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t, locale } = useLanguage();
  const doc = getDocBySlug(slug);

  if (!doc) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
        <PublicNavbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-2xl font-bold mb-3">{t('docs.notFoundTitle')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">{t('docs.notFoundBody')}</p>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('docs.backToDocs')}
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('docs.backToDocs')}
          </Link>

          <header className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <span>{doc.type === 'blog' ? t('docs.typeBlog') : t('docs.typeDoc')}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={doc.publishedAt}>{doc.publishedAt}</time>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 mb-4">
              {pickLocale(doc.title, locale)}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {pickLocale(doc.description, locale)}
            </p>
          </header>

          <div className="space-y-5 text-base sm:text-[17px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {doc.body.map((paragraph, index) => (
              <p key={index}>{pickLocale(paragraph, locale)}</p>
            ))}
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
