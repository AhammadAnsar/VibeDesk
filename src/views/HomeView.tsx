import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import {
  CATEGORIES,
  getFeaturedTools,
  getRecentlyAddedTools,
  getToolsByCategory,
  getToolById,
  searchPublishedTools,
} from '../data/toolRegistry';
import { getFrequentToolRecords, clearLocalToolHistory } from '../utils/localUsage';
import { ToolCard } from '../components/ToolCard';
import { ToolIcon } from '../components/ToolIcon';
import { AdSlot } from '../components/AdSlot';

interface HomeViewProps {
  onNavigate: (path: string) => void;
}

const HOME_FAQS = [
  {
    question: 'Is VibeDesk free to use?',
    answer:
      'Yes. Every published utility on VibeDesk is completely free to use without accounts, subscriptions, or paywalls.',
  },
  {
    question: 'Are my files uploaded to a remote server when I use PDF or Image tools?',
    answer:
      'No. VibeDesk is engineered around local browser processing. When you merge a PDF, compress an image, or compute a file checksum, the operation executes directly inside your device memory using WebAssembly, HTML5 Canvas, and Web Crypto APIs.',
  },
  {
    question: 'Which web browsers and devices are supported?',
    answer:
      'VibeDesk works across modern desktop and mobile browsers including Chrome, Firefox, Safari, and Edge on Windows, macOS, Linux, iOS, and Android.',
  },
  {
    question: 'Are there file-size limitations?',
    answer:
      'Because files are processed using your device RAM rather than a cloud server, individual files up to 100 MB (or archives up to 150 MB) run smoothly on standard laptops and smartphones.',
  },
  {
    question: 'How does "Your Frequently Used Tools" work privately?',
    answer:
      'When enabled in your browser, VibeDesk stores only anonymous tool identifiers and visit counts in your local browser storage (`localStorage`). It never stores filenames or file contents, never transmits usage history, and can be cleared with a single click.',
  },
];

export function HomeView({ onNavigate }: HomeViewProps) {
  const [heroQuery, setHeroQuery] = useState('');
  const [frequentRecords, setFrequentRecords] = useState(() => getFrequentToolRecords(4));
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const liveResults = heroQuery.trim() ? searchPublishedTools(heroQuery).slice(0, 6) : [];
  const featuredTools = getFeaturedTools(8);
  const recentTools = getRecentlyAddedTools(4);

  const frequentTools = frequentRecords
    .map((rec) => {
      const tool = getToolById(rec.toolId);
      return tool ? { tool, count: rec.count } : null;
    })
    .filter((item): item is { tool: NonNullable<ReturnType<typeof getToolById>>; count: number } =>
      Boolean(item)
    );

  // Quick Picks fallback when visitor has no local history yet (Section 5.3)
  const quickPickIds = [
    'merge-pdf',
    'compress-image',
    'percentage-calculator',
    'measurement-converter',
  ];
  const quickPicks = quickPickIds
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const heroShortcuts = [
    { label: 'Merge PDF', path: '/pdf/merge-pdf/' },
    { label: 'Compress Image', path: '/images/compress-image/' },
    { label: 'Percentage Calculator', path: '/calculators/percentage/' },
    { label: 'Convert Files', path: '/converters/csv-json-converter/' },
  ];

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveResults.length > 0) {
      const first = liveResults[0];
      onNavigate(`/${first.category}/${first.slug}/`);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-8">
      {/* SECTION 2: HERO */}
      <section className="bg-white border-b border-[#E2E8F0] py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="font-display text-3xl sm:text-5xl font-bold text-[#0F172A] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Everyday tools. Beautifully simple.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Edit, convert, calculate and get things done with free tools that work right in your browser.
          </p>

          {/* Working Search Field */}
          <div className="mt-8 relative max-w-2xl mx-auto text-left">
            <form onSubmit={handleHeroSearchSubmit} className="relative">
              <Search className="w-5 h-5 text-[#64748B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="Search for a tool or task..."
                aria-label="Search for a tool or task"
                className="w-full pl-12 pr-28 py-4 text-base text-[#0F172A] bg-[#F8FAFC] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#4F46E5] rounded-2xl transition-colors focus:outline-none shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                Find Tool
              </button>
            </form>

            {/* Instant Search Results Dropdown */}
            {heroQuery.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg z-20 p-2">
                {liveResults.length > 0 ? (
                  <ul className="divide-y divide-[#E2E8F0]/60">
                    {liveResults.map((tool) => (
                      <li key={tool.id}>
                        <button
                          type="button"
                          onClick={() => onNavigate(`/${tool.category}/${tool.slug}/`)}
                          className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-[#F8FAFC] rounded-xl text-left transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
                              <ToolIcon name={tool.icon} className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-[#0F172A] truncate">
                                {tool.name}
                              </div>
                              <div className="text-xs text-[#64748B] truncate">
                                {tool.shortDescription}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#4F46E5] shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-4 px-3 text-center text-xs text-[#64748B]">
                    No published tools found for "{heroQuery}". Try "merge pdf", "compress image", or "percentage".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shortcut Action Buttons below search */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[#64748B] mr-1">Quick access:</span>
            {heroShortcuts.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className="px-3 py-1.5 font-medium text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0]/60 border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-16 sm:space-y-20">
        {/* SECTION 3: FREQUENTLY USED / QUICK PICKS */}
        <section aria-labelledby="frequent-tools-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
            <div>
              <h2 id="frequent-tools-heading" className="font-display text-xl font-bold text-[#0F172A]">
                {frequentTools.length > 0 ? 'Your Frequently Used Tools' : 'Quick Picks to Get Started'}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {frequentTools.length > 0
                  ? 'Stored privately in your local browser — never transmitted.'
                  : 'Curated essentials for everyday documents, images, and calculations.'}
              </p>
            </div>
            {frequentTools.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearLocalToolHistory();
                  setFrequentRecords([]);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Local History</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {frequentTools.length > 0
              ? frequentTools.map(({ tool, count }) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onNavigate={onNavigate}
                    compact
                    usageCount={count}
                  />
                ))
              : quickPicks.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} compact />
                ))}
          </div>
        </section>

        {/* SECTION 4: POPULAR PICKS / FEATURED TOOLS */}
        <section aria-labelledby="popular-picks-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <div>
              <h2 id="popular-picks-heading" className="font-display text-2xl font-bold text-[#0F172A]">
                Popular Picks
              </h2>
              <p className="text-sm text-[#64748B] mt-1">
                High-priority browser utilities for documents, images, and quick math.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/tools/')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA] whitespace-nowrap shrink-0"
            >
              <span>View All Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        {/* Controlled AdSlot (disabled until approved) */}
        <AdSlot slotId="home-mid-leaderboard" format="horizontal" enabled={false} />

        {/* SECTION 5: EXPLORE CATEGORIES */}
        <section aria-labelledby="explore-categories-heading">
          <div className="mb-6">
            <h2 id="explore-categories-heading" className="font-display text-2xl font-bold text-[#0F172A]">
              Explore Tools by Category
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Six focused workspaces with a unified, distraction-free interface.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const availableTools = getToolsByCategory(cat.slug);
              const isTeal =
                cat.slug === 'images' ||
                cat.slug === 'converters' ||
                cat.slug === 'file-utilities';

              return (
                <a
                  key={cat.slug}
                  href={`/${cat.slug}/`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/${cat.slug}/`);
                  }}
                  className="group p-6 bg-white border border-[#E2E8F0] rounded-2xl hover:border-[#4F46E5]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isTeal
                            ? 'bg-[#14B8A6]/10 text-[#0D9488]'
                            : 'bg-[#4F46E5]/10 text-[#4F46E5]'
                        }`}
                      >
                        <ToolIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[#64748B]">
                        {availableTools.length} tools
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#E2E8F0]/60 flex items-center justify-between text-xs font-semibold text-[#4F46E5]">
                    <span>Explore {cat.shortName}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: CATEGORY-BASED TOOLS */}
        <section aria-label="Curated tools by category" className="space-y-12">
          {CATEGORIES.slice(0, 4).map((cat) => {
            const catTools = getToolsByCategory(cat.slug).slice(0, 4);
            return (
              <div key={cat.slug} className="pt-8 border-t border-[#E2E8F0]">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A]">{cat.name}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {cat.subcategories.join(' · ')}
                    </p>
                  </div>
                  <a
                    href={`/${cat.slug}/`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/${cat.slug}/`);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] whitespace-nowrap shrink-0"
                  >
                    <span>View All {cat.shortName}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {catTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* SECTION 7: RECENTLY ADDED */}
        {recentTools.length > 0 && (
          <section aria-labelledby="recently-added-heading" className="pt-8 border-t border-[#E2E8F0]">
            <div className="mb-5">
              <h2 id="recently-added-heading" className="font-display text-xl font-bold text-[#0F172A]">
                Recently Added
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Latest verified utilities released to the VibeDesk catalog.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {recentTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-4 bg-white border border-[#E2E8F0] rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                      <span>Released {tool.publishedAt}</span>
                      <span className="font-mono">{tool.category}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/${tool.category}/${tool.slug}/`)}
                      className="text-sm font-semibold text-[#0F172A] hover:text-[#4F46E5] text-left transition-colors"
                    >
                      {tool.name}
                    </button>
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                      {tool.shortDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 8: SHORT TRUST STATEMENT */}
        <section
          aria-label="Core product guarantees"
          className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Private by Design</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Your files stay on your device when using local processing tools.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 text-[#0D9488] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Fast & Convenient</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Get results without unnecessary steps.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Free to Use</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Useful everyday tools, accessible without subscriptions.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 9: HELPFUL FAQ */}
        <section aria-labelledby="home-faq-heading" className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 id="home-faq-heading" className="font-display text-2xl font-bold text-[#0F172A]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Clear answers about local processing, browser support, and privacy.
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden">
            {HOME_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
