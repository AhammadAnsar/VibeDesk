import React, { useEffect } from 'react';
import { ChevronRight, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import {
  ToolDefinition,
  getCategoryBySlug,
  getRelatedTools,
} from '../data/toolRegistry';
import { recordToolVisit } from '../utils/localUsage';
import { ToolIcon } from '../components/ToolIcon';
import { ToolCard } from '../components/ToolCard';
import { AdSlot } from '../components/AdSlot';
import { PdfToolRunner } from '../components/workspaces/PdfToolRunner';
import { ImageToolRunner } from '../components/workspaces/ImageToolRunner';
import { CalculatorToolRunner } from '../components/workspaces/CalculatorToolRunner';
import { ConverterToolRunner } from '../components/workspaces/ConverterToolRunner';
import { TextToolRunner } from '../components/workspaces/TextToolRunner';
import { FileUtilityRunner } from '../components/workspaces/FileUtilityRunner';

interface ToolPageViewProps {
  tool: ToolDefinition;
  onNavigate: (path: string) => void;
}

export function ToolPageView({ tool, onNavigate }: ToolPageViewProps) {
  const category = getCategoryBySlug(tool.category);
  const relatedTools = getRelatedTools(tool, 4);

  useEffect(() => {
    recordToolVisit(tool.id);
  }, [tool.id]);

  const renderWorkspace = () => {
    switch (tool.category) {
      case 'pdf':
        return <PdfToolRunner tool={tool} />;
      case 'images':
        return <ImageToolRunner tool={tool} />;
      case 'calculators':
        return <CalculatorToolRunner tool={tool} />;
      case 'converters':
        return <ConverterToolRunner tool={tool} />;
      case 'text-tools':
        return <TextToolRunner tool={tool} />;
      case 'file-utilities':
        return <FileUtilityRunner tool={tool} />;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
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
        <a
          href={`/${tool.category}/`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/${tool.category}/`);
          }}
          className="hover:text-[#0F172A] transition-colors"
        >
          {category?.name}
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-[#64748B]/60" />
        <span className="font-medium text-[#0F172A]">{tool.name}</span>
      </nav>

      {/* 2 & 3. Compact Tool Heading & Short Explanation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
            <ToolIcon name={tool.icon} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {tool.name}
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] mt-1 max-w-3xl leading-relaxed">
              {tool.introduction}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#059669] font-medium shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Browser Processing</span>
        </div>
      </header>

      {/* 4 & 5. Main Interactive Workspace & Processing Feedback */}
      <section aria-label={`${tool.name} workspace`}>{renderWorkspace()}</section>

      {/* Safe AdSlot separation below workspace (disabled by default) */}
      <AdSlot slotId={`tool-below-${tool.id}`} format="horizontal" enabled={false} />

      {/* 6 & 7. Brief Instructions, Capabilities & Limitations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-base font-bold text-[#0F172A]">
            How to Use {tool.name}
          </h2>
          <ol className="space-y-2.5 text-xs text-[#64748B] leading-relaxed">
            {tool.instructions.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="font-mono font-bold text-[#4F46E5] shrink-0">0{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-base font-bold text-[#0F172A]">
            Verified Capabilities
          </h2>
          <ul className="space-y-2 text-xs text-[#64748B] leading-relaxed">
            {tool.verifiedCapabilities.map((cap, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-[#E2E8F0]/60 text-[11px] text-[#64748B]">
            Engine: <span className="font-mono text-[#0F172A]">{tool.processingEngine}</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-base font-bold text-[#0F172A]">
            Supported Formats & Notes
          </h2>
          <div className="space-y-2 text-xs text-[#64748B]">
            <div>
              <strong className="text-[#0F172A]">Inputs:</strong> {tool.supportedInputs.join(', ')}
            </div>
            <div>
              <strong className="text-[#0F172A]">Outputs:</strong> {tool.supportedOutputs.join(', ')}
            </div>
          </div>
          <ul className="space-y-2 pt-2 border-t border-[#E2E8F0]/60 text-xs text-[#64748B]">
            {tool.limitations.map((lim, i) => (
              <li key={i} className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. Relevant FAQs */}
      {tool.faqs.length > 0 && (
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tool.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-sm font-semibold text-[#0F172A]">{faq.question}</h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Related Tools */}
      <section className="pt-4 border-t border-[#E2E8F0]">
        <h2 className="font-display text-lg font-bold text-[#0F172A] mb-4">
          Related Tools in {category?.shortName}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedTools.map((rel) => (
            <ToolCard key={rel.id} tool={rel} onNavigate={onNavigate} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
