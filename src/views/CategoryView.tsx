import React, { useState } from 'react';
import { Search, ChevronRight, ArrowRight } from 'lucide-react';
import {
  CATEGORIES,
  CategoryDefinition,
  getToolsByCategory,
  getPublishedTools,
} from '../data/toolRegistry';
import { ToolCard } from '../components/ToolCard';
import { ToolIcon } from '../components/ToolIcon';
import { AdSlot } from '../components/AdSlot';

interface CategoryViewProps {
  category?: CategoryDefinition; // undefined when viewing /tools/ (All Tools)
  onNavigate: (path: string) => void;
}

export function CategoryView({ category, onNavigate }: CategoryViewProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');

  const baseTools = category ? getToolsByCategory(category.slug) : getPublishedTools();

  const filteredTools = baseTools.filter((tool) => {
    const matchesSub =
      !category || activeSubcategory === 'all' || tool.subcategory === activeSubcategory;
    const q = filterQuery.trim().toLowerCase();
    if (!q) return matchesSub;
    return (
      matchesSub &&
      (tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.searchKeywords.some((k) => k.toLowerCase().includes(q)))
    );
  });

  const subcategories = category
    ? category.subcategories.filter((sub) => baseTools.some((t) => t.subcategory === sub))
    : [];

  const relatedCategories = CATEGORIES.filter((c) => c.slug !== category?.slug);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Compact Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#64748B]">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="hover:text-[#0F172A] transition-colors"
        >
          Home
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-[#64748B]/60" />
        <span className="font-medium text-[#0F172A]">
          {category ? category.name : 'All Tools'}
        </span>
      </nav>

      {/* 2 & 3. Category Title & Meaningful Description */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
              <ToolIcon name={category ? category.icon : 'LayoutGrid'} className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-[#64748B] tabular-nums">
              {baseTools.length} verified browser utilities
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
            {category ? category.name : 'All Published VibeDesk Tools'}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-2 leading-relaxed">
            {category
              ? category.description
              : 'Browse the complete directory of verified, privacy-first browser utilities across PDF management, image optimization, calculators, converters, and developer tools.'}
          </p>
        </div>

        {/* 4. Category-Specific Search/Filter */}
        <div className="w-full md:w-72 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={`Filter ${category ? category.shortName : 'all'} tools...`}
              aria-label="Filter category tools"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-2 focus:outline-[#4F46E5]"
            />
          </div>
        </div>
      </div>

      {/* 5. Meaningful Subcategory Filter Tabs */}
      {category && subcategories.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#E2E8F0] rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveSubcategory('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeSubcategory === 'all'
                ? 'bg-[#4F46E5] text-white'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All ({baseTools.length})
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setActiveSubcategory(sub)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeSubcategory === sub
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* 6. Organized Tool Groups */}
      {filteredTools.length === 0 ? (
        <div className="p-10 bg-white border border-[#E2E8F0] rounded-2xl text-center">
          <p className="text-sm font-semibold text-[#0F172A]">
            No tools match "{filterQuery}"
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterQuery('');
              setActiveSubcategory('all');
            }}
            className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#4F46E5] rounded-lg"
          >
            Reset Filter
          </button>
        </div>
      ) : category && activeSubcategory === 'all' && !filterQuery.trim() ? (
        <div className="space-y-10">
          {subcategories.map((sub) => {
            const subTools = filteredTools.filter((t) => t.subcategory === sub);
            if (subTools.length === 0) return null;
            return (
              <section key={sub} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                  <h2 className="font-display text-lg font-bold text-[#0F172A]">{sub}</h2>
                  <span className="text-xs font-mono text-[#64748B] tabular-nums">
                    {subTools.length} {subTools.length === 1 ? 'tool' : 'tools'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      <AdSlot slotId="category-bottom-slot" format="horizontal" enabled={false} />

      {/* 7. Relevant Category FAQs */}
      {category && category.faqs.length > 0 && (
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            {category.name} — Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {category.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-sm font-semibold text-[#0F172A]">{faq.question}</h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Related Categories */}
      <section className="pt-4 border-t border-[#E2E8F0]">
        <h2 className="font-display text-base font-bold text-[#0F172A] mb-4">
          Explore Other Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {relatedCategories.map((rel) => (
            <a
              key={rel.slug}
              href={`/${rel.slug}/`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/${rel.slug}/`);
              }}
              className="group p-4 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#4F46E5]/40 flex items-center justify-between gap-2 transition-colors"
            >
              <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#4F46E5] truncate">
                {rel.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#4F46E5] shrink-0" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
