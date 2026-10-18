import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ToolDefinition, getCategoryBySlug } from '../data/toolRegistry';
import { ToolIcon } from './ToolIcon';

interface ToolCardProps {
  tool: ToolDefinition;
  onNavigate: (path: string) => void;
  compact?: boolean;
  usageCount?: number;
}

export function ToolCard({ tool, onNavigate, compact = false, usageCount }: ToolCardProps) {
  const category = getCategoryBySlug(tool.category);
  const href = `/${tool.category}/${tool.slug}/`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate(href);
  };

  const isTealAccent = tool.category === 'images' || tool.category === 'converters' || tool.category === 'file-utilities';

  if (compact) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className="group flex items-center justify-between gap-3.5 p-4 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#4F46E5]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isTealAccent
                ? 'bg-[#14B8A6]/10 text-[#0D9488] group-hover:bg-[#14B8A6]/15'
                : 'bg-[#4F46E5]/10 text-[#4F46E5] group-hover:bg-[#4F46E5]/15'
            }`}
          >
            <ToolIcon name={tool.icon} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors truncate">
              {tool.name}
            </h3>
            <p className="text-xs text-[#64748B] truncate mt-0.5">
              {category?.shortName}
              {typeof usageCount === 'number' && usageCount > 0 ? ` · Used ${usageCount}×` : ''}
            </p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#4F46E5] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    );
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="group flex flex-col justify-between p-5 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#4F46E5]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isTealAccent
                ? 'bg-[#14B8A6]/10 text-[#0D9488] group-hover:bg-[#14B8A6]/15'
                : 'bg-[#4F46E5]/10 text-[#4F46E5] group-hover:bg-[#4F46E5]/15'
            }`}
          >
            <ToolIcon name={tool.icon} className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#64748B]/60 group-hover:text-[#4F46E5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed line-clamp-2">
          {tool.shortDescription}
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-[#E2E8F0]/60 flex items-center gap-2 text-xs text-[#64748B]">
        <span>{category?.shortName}</span>
        <span aria-hidden="true">·</span>
        <span>{tool.subcategory}</span>
      </div>
    </a>
  );
}
