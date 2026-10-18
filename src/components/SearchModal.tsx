import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import {
  searchPublishedTools,
  getFeaturedTools,
  getCategoryBySlug,
  ToolDefinition,
} from '../data/toolRegistry';
import { ToolIcon } from './ToolIcon';

interface SearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function SearchModal({
  isOpen,
  initialQuery = '',
  onClose,
  onNavigate,
}: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const results: ToolDefinition[] = query.trim()
    ? searchPublishedTools(query)
    : getFeaturedTools(6);

  const handleSelectTool = (tool: ToolDefinition) => {
    onClose();
    onNavigate(`/${tool.category}/${tool.slug}/`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectTool(results[selectedIndex]);
    }
  };

  const quickExamples = [
    { label: 'reduce image size', query: 'reduce image size' },
    { label: 'combine PDFs', query: 'combine PDFs' },
    { label: 'calculate percentage', query: 'calculate percentage' },
    { label: 'compare text', query: 'compare text' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Find a tool"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#0F172A]/40 backdrop-blur-[2px]"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E2E8F0]">
          <Search className="w-5 h-5 text-[#64748B] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search by tool name, task, or keyword (e.g. 'reduce image size', 'combine PDFs')..."
            aria-label="Search tools"
            className="w-full text-base text-[#0F172A] placeholder:text-[#64748B] bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search dialog"
            className="px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] rounded-md whitespace-nowrap shrink-0"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-3">
          <div className="px-2 py-1.5 flex items-center justify-between text-xs text-[#64748B]">
            <span>{query.trim() ? `Matching tools (${results.length})` : 'Popular tools'}</span>
            <span>Use ↑↓ arrows and Enter to open</span>
          </div>

          {results.length > 0 ? (
            <ul role="listbox" aria-label="Tool results" className="mt-1 space-y-1">
              {results.map((tool, index) => {
                const category = getCategoryBySlug(tool.category);
                const isSelected = index === selectedIndex;
                return (
                  <li key={tool.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelectTool(tool)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                        isSelected ? 'bg-[#F8FAFC] text-[#4F46E5]' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
                          <ToolIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#0F172A] truncate">
                            {tool.name}
                          </div>
                          <div className="text-xs text-[#64748B] truncate mt-0.5">
                            {category?.shortName} · {tool.shortDescription}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-[#4F46E5] translate-x-0.5' : 'text-[#64748B]/50'
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-10 px-4 text-center">
              <p className="text-sm font-medium text-[#0F172A]">
                No published tools match "{query}"
              </p>
              <p className="text-xs text-[#64748B] mt-1">
                Try searching for a task phrase or browse all available categories:
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {quickExamples.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => setQuery(ex.query)}
                    className="px-3 py-1.5 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0]/60 border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    "{ex.label}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
