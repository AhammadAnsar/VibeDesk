/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  getCategoryBySlug,
  getToolBySlug,
} from './data/toolRegistry';
import { Layout } from './components/Layout';
import { SearchModal } from './components/SearchModal';
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { ToolPageView } from './views/ToolPageView';
import { StaticPagesView } from './views/StaticPagesView';

function normalizePath(rawPath: string): string {
  if (!rawPath || rawPath === '/') return '/';
  const cleaned = rawPath.split('?')[0].split('#')[0];
  return cleaned.endsWith('/') ? cleaned : `${cleaned}/`;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Global keyboard shortcut Cmd/Ctrl + K for tool search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchInitialQuery('');
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNavigate = (targetPath: string) => {
    const norm = normalizePath(targetPath);
    if (norm !== currentPath) {
      window.history.pushState({}, '', norm);
      setCurrentPath(norm);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleOpenSearch = (initialQuery = '') => {
    setSearchInitialQuery(initialQuery);
    setSearchOpen(true);
  };

  // Resolve route segments
  const segments = currentPath.split('/').filter(Boolean);

  // Dynamic SEO Title & Meta Description synchronization
  useEffect(() => {
    let pageTitle = 'VibeDesk – Everyday Digital Tools, Beautifully Simple';
    let pageDesc =
      'Edit, convert, calculate and get things done with free, privacy-first browser utilities. Merge PDFs, compress images, convert units, and format code locally.';

    if (segments.length === 1) {
      const seg = segments[0];
      if (seg === 'tools') {
        pageTitle = 'All Published Online Tools – VibeDesk Directory';
        pageDesc = 'Browse all 27 free, local browser-based utilities on VibeDesk.';
      } else if (seg === 'about') {
        pageTitle = 'About VibeDesk – A SoftDows Venture';
      } else if (seg === 'contact') {
        pageTitle = 'Contact VibeDesk';
      } else if (seg === 'privacy') {
        pageTitle = 'Privacy Policy – Local Browser Processing | VibeDesk';
      } else if (seg === 'cookies') {
        pageTitle = 'Cookie & Local Storage Preferences | VibeDesk';
      } else if (seg === 'terms') {
        pageTitle = 'Terms of Use | VibeDesk';
      } else {
        const cat = getCategoryBySlug(seg);
        if (cat) {
          pageTitle = `${cat.name} – Free Local Browser Utilities | VibeDesk`;
          pageDesc = cat.description;
        }
      }
    } else if (segments.length === 2) {
      const tool = getToolBySlug(segments[0], segments[1]);
      if (tool) {
        pageTitle = tool.seoMetadata.title;
        pageDesc = tool.seoMetadata.description;
      }
    }

    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', pageDesc);
    }
  }, [currentPath, segments]);

  const renderRouteContent = () => {
    if (segments.length === 0) {
      return <HomeView onNavigate={handleNavigate} />;
    }

    if (segments.length === 1) {
      const seg = segments[0];
      if (seg === 'tools') {
        return <CategoryView onNavigate={handleNavigate} />;
      }
      if (seg === 'about') return <StaticPagesView page="about" onNavigate={handleNavigate} />;
      if (seg === 'contact') return <StaticPagesView page="contact" onNavigate={handleNavigate} />;
      if (seg === 'privacy') return <StaticPagesView page="privacy" onNavigate={handleNavigate} />;
      if (seg === 'cookies') return <StaticPagesView page="cookies" onNavigate={handleNavigate} />;
      if (seg === 'terms') return <StaticPagesView page="terms" onNavigate={handleNavigate} />;

      const cat = getCategoryBySlug(seg);
      if (cat) {
        return <CategoryView category={cat} onNavigate={handleNavigate} />;
      }
      return <StaticPagesView page="404" onNavigate={handleNavigate} />;
    }

    if (segments.length === 2) {
      const tool = getToolBySlug(segments[0], segments[1]);
      if (tool) {
        return <ToolPageView tool={tool} onNavigate={handleNavigate} />;
      }
      return <StaticPagesView page="404" onNavigate={handleNavigate} />;
    }

    return <StaticPagesView page="404" onNavigate={handleNavigate} />;
  };

  return (
    <Layout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      onOpenSearch={handleOpenSearch}
    >
      {renderRouteContent()}
      <SearchModal
        isOpen={searchOpen}
        initialQuery={searchInitialQuery}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />
    </Layout>
  );
}
