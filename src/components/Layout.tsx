import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { CATEGORIES, getPublishedTools } from '../data/toolRegistry';

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: (initialQuery?: string) => void;
  children: React.ReactNode;
}

export function Layout({
  currentPath,
  onNavigate,
  onOpenSearch,
  children,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  // Strict 5 single-line navigation links in Zone 2
  const navItems = [
    { label: 'All Tools', path: '/tools/' },
    { label: 'PDF Management', path: '/pdf/' },
    { label: 'Image Tools', path: '/images/' },
    { label: 'Calculators', path: '/calculators/' },
    { label: 'Converters', path: '/converters/' },
  ];

  const publishedCount = getPublishedTools().length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Bar Contract: 1-row, 3-zone header separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
          {/* Zone 1: Brand wordmark (single text element, whitespace-nowrap shrink-0) */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="font-display text-lg font-bold tracking-tight text-[#0F172A] hover:text-[#4F46E5] transition-colors whitespace-nowrap shrink-0"
          >
            VibeDesk
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-[#64748B]">
            {navItems.map((item) => {
              const isActive =
                currentPath === item.path ||
                (item.path !== '/tools/' && currentPath.startsWith(item.path));
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'text-[#0F172A] border-[#4F46E5]'
                      : 'border-transparent hover:text-[#0F172A] hover:border-[#E2E8F0]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action on desktop (Search trigger); Mobile menu toggle on small screens */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenSearch('')}
              aria-label="Find Tools"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0]/50 border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Find Tool</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-3">
            <div className="text-xs font-semibold text-[#64748B] px-2">Categories</div>
            <div className="grid grid-cols-1 gap-1">
              <a
                href="/tools/"
                onClick={(e) => handleLinkClick(e, '/tools/')}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                All Tools ({publishedCount})
              </a>
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/${cat.slug}/`}
                  onClick={(e) => handleLinkClick(e, `/${cat.slug}/`)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Multicolumn Footer (Section 10 & 18) */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="font-display text-lg font-bold tracking-tight text-[#0F172A]"
              >
                VibeDesk
              </a>
              <p className="text-sm text-[#64748B] mt-2.5 max-w-sm leading-relaxed">
                Free, fast, and privacy-first browser utilities. Find it instantly, use it effortlessly, and finish your everyday tasks privately on your own device.
              </p>
              <p className="text-xs text-[#64748B] mt-4">
                Domain: <span className="font-mono text-[#0F172A]">vibedesk.si</span> · {publishedCount} Verified Local Utilities
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#0F172A] tracking-wide mb-3">
                Explore
              </h3>
              <ul className="space-y-2.5 text-sm text-[#64748B]">
                <li>
                  <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="hover:text-[#0F172A] transition-colors">
                    Home Workspace
                  </a>
                </li>
                <li>
                  <a href="/tools/" onClick={(e) => handleLinkClick(e, '/tools/')} className="hover:text-[#0F172A] transition-colors">
                    All Tools Directory
                  </a>
                </li>
                <li>
                  <a href="/pdf/merge-pdf/" onClick={(e) => handleLinkClick(e, '/pdf/merge-pdf/')} className="hover:text-[#0F172A] transition-colors">
                    Merge PDF
                  </a>
                </li>
                <li>
                  <a href="/images/compress-image/" onClick={(e) => handleLinkClick(e, '/images/compress-image/')} className="hover:text-[#0F172A] transition-colors">
                    Compress Image
                  </a>
                </li>
                <li>
                  <a href="/calculators/percentage/" onClick={(e) => handleLinkClick(e, '/calculators/percentage/')} className="hover:text-[#0F172A] transition-colors">
                    Percentage Calculator
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#0F172A] tracking-wide mb-3">
                Categories
              </h3>
              <ul className="space-y-2.5 text-sm text-[#64748B]">
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <a
                      href={`/${cat.slug}/`}
                      onClick={(e) => handleLinkClick(e, `/${cat.slug}/`)}
                      className="hover:text-[#0F172A] transition-colors"
                    >
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#0F172A] tracking-wide mb-3">
                Company & Legal
              </h3>
              <ul className="space-y-2.5 text-sm text-[#64748B]">
                <li>
                  <a href="/about/" onClick={(e) => handleLinkClick(e, '/about/')} className="hover:text-[#0F172A] transition-colors">
                    About VibeDesk
                  </a>
                </li>
                <li>
                  <a href="/contact/" onClick={(e) => handleLinkClick(e, '/contact/')} className="hover:text-[#0F172A] transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/privacy/" onClick={(e) => handleLinkClick(e, '/privacy/')} className="hover:text-[#0F172A] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/cookies/" onClick={(e) => handleLinkClick(e, '/cookies/')} className="hover:text-[#0F172A] transition-colors">
                    Cookie Preferences
                  </a>
                </li>
                <li>
                  <a href="/terms/" onClick={(e) => handleLinkClick(e, '/terms/')} className="hover:text-[#0F172A] transition-colors">
                    Terms of Use
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div>
              <span className="font-medium text-[#0F172A]">VibeDesk — A SoftDows Venture</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <a
                href="https://softdows.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#4F46E5] underline underline-offset-2 transition-colors"
              >
                SoftDows
              </a>
            </div>
            <div>
              © {new Date().getFullYear()} VibeDesk (vibedesk.si). Local browser processing by architecture.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
