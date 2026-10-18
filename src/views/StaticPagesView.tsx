import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import {
  getPrivacyPreferences,
  savePrivacyPreferences,
  clearLocalToolHistory,
} from '../utils/localUsage';

interface StaticPagesViewProps {
  page: 'about' | 'contact' | 'privacy' | 'cookies' | 'terms' | '404';
  onNavigate: (path: string) => void;
}

export function StaticPagesView({ page, onNavigate }: StaticPagesViewProps) {
  const [prefs, setPrefs] = useState(() => getPrivacyPreferences());
  const [savedNotice, setSavedNotice] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTopic, setContactTopic] = useState('Tool Feedback');
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (page === 'about') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-6">
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">About VibeDesk</h1>
          <p className="text-base font-medium text-[#0F172A] leading-relaxed">
            VibeDesk is a SoftDows venture focused on making everyday digital tasks simpler, faster and more accessible.
          </p>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Built around the principle <em>"Find it instantly. Use it effortlessly. Finish it privately."</em>, VibeDesk provides a calm, distraction-free workspace for managing PDF documents, optimizing images, running financial or date calculations, converting measurements, and formatting developer data.
          </p>

          <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Our Architecture & Privacy Boundary
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Unlike traditional utility portals that upload your sensitive documents to remote cloud queues, VibeDesk executes its core tools right inside your browser tab using modern WebAssembly, HTML5 Canvas, and Web Crypto standards. Your files remain on your device from start to finish.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Parent Venture
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              VibeDesk (<span className="font-mono text-[#0F172A]">https://vibedesk.si</span>) is developed and maintained as an independent web utility portal under{' '}
              <a
                href="https://softdows.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4F46E5] font-medium hover:underline"
              >
                SoftDows
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'contact') {
    const handleContactSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setContactError(null);
      if (!contactName.trim() || !contactEmail.includes('@') || !contactMessage.trim()) {
        setContactError('Please enter your name, a valid email address, and a message.');
        return;
      }
      setContactSubmitted(true);
    };

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0F172A]">Contact VibeDesk</h1>
              <p className="text-xs text-[#64748B]">
                Report a browser compatibility issue, suggest a utility, or reach our team.
              </p>
            </div>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-xl bg-[#059669]/5 border border-[#059669]/25 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#059669]">
                <CheckCircle2 className="w-5 h-5" />
                <span>Message Prepared</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Thank you, {contactName}. Because VibeDesk operates as a static privacy-first portal without a tracking backend, you can send your inquiry directly to{' '}
                <a
                  href={`mailto:contact@vibedesk.si?subject=${encodeURIComponent(
                    `[VibeDesk] ${contactTopic}`
                  )}&body=${encodeURIComponent(contactMessage)}`}
                  className="font-mono font-semibold text-[#4F46E5] underline"
                >
                  contact@vibedesk.si
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => {
                  setContactSubmitted(false);
                  setContactMessage('');
                }}
                className="px-4 py-2 text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {contactError && (
                <div className="p-3 rounded-lg bg-[#DC2626]/5 border border-[#DC2626]/20 text-xs text-[#DC2626]">
                  {contactError}
                </div>
              )}
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="contact-topic" className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Subject
                </label>
                <select
                  id="contact-topic"
                  value={contactTopic}
                  onChange={(e) => setContactTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                >
                  <option value="Tool Feedback">Tool Feedback</option>
                  <option value="Bug or Browser Issue">Bug or Browser Issue</option>
                  <option value="Privacy or Legal Question">Privacy or Legal Question</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-msg" className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Message
                </label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full p-3.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-[#059669]">
            <ShieldCheck className="w-4 h-4" />
            <span>Local Processing Privacy Architecture</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Privacy Policy</h1>
          <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
            <p>
              <strong className="text-[#0F172A]">1. Local File Processing Boundary:</strong> When you select PDF documents, images, spreadsheets, or files on VibeDesk, processing takes place locally inside your web browser memory. Your files are never uploaded to VibeDesk, SoftDows, or Cloudflare servers.
            </p>
            <p>
              <strong className="text-[#0F172A]">2. No File Retention:</strong> VibeDesk does not store, log, or inspect the contents or filenames of the files you process. Once you close your browser tab or reset a workspace, temporary memory buffers and object URLs are released.
            </p>
            <p>
              <strong className="text-[#0F172A]">3. Optional Anonymous Local Usage History:</strong> To power the "Your Frequently Used Tools" section on the homepage, VibeDesk optionally records only anonymous tool IDs (e.g., <code className="font-mono text-xs">merge-pdf</code>) and usage counts inside your browser's <code className="font-mono text-xs">localStorage</code>. This data never leaves your device and can be disabled or wiped at any time on our Cookie Preferences page.
            </p>
            <p>
              <strong className="text-[#0F172A]">4. Static Hosting & Advertising Separation:</strong> Static site delivery is handled via Cloudflare Static Assets. Any optional future Google AdSense placements are strictly separated from local file-processing workspaces and governed by user consent choices.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'cookies') {
    const handleSavePrefs = () => {
      const updated = savePrivacyPreferences(prefs);
      setPrefs(updated);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    };

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-6">
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">
            Cookie & Local Storage Preferences
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Manage how VibeDesk stores optional preferences in your browser and configure consent for future advertising slots.
          </p>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Essential Local Tool Execution
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Required for in-browser PDF, image, and calculator execution. Does not track you across websites.
                </p>
              </div>
              <span className="text-xs font-mono text-[#059669] font-semibold shrink-0">
                Always Active
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Anonymous Frequently Used Tools History (localStorage)
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Remembers which tools you open most often on this device. Never stores filenames or file data.
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Enable anonymous local tool history"
                checked={prefs.localHistoryEnabled}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, localHistoryEnabled: e.target.checked }))
                }
                className="w-5 h-5 accent-[#4F46E5] rounded mt-1"
              />
            </div>

            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Google AdSense Advertising Consent (CMP Ready)
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Controls whether non-intrusive display advertisements may load when AdSense monetization is active.
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Enable advertising consent"
                checked={prefs.advertisingConsent}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, advertisingConsent: e.target.checked }))
                }
                className="w-5 h-5 accent-[#4F46E5] rounded mt-1"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                clearLocalToolHistory();
                setSavedNotice(true);
                setTimeout(() => setSavedNotice(false), 2500);
              }}
              className="px-4 py-2 text-xs font-semibold text-[#DC2626] bg-[#DC2626]/5 hover:bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-lg"
            >
              Clear Local Usage History Now
            </button>

            <button
              type="button"
              onClick={handleSavePrefs}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg"
            >
              Save Preferences
            </button>
          </div>

          {savedNotice && (
            <div className="text-xs font-semibold text-[#059669] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Your privacy preferences have been saved locally.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (page === 'terms') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-6">
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Terms of Use</h1>
          <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
            <p>
              <strong className="text-[#0F172A]">1. Acceptance of Terms:</strong> By accessing VibeDesk (vibedesk.si), a SoftDows venture, you agree to use our browser-based utilities responsibly and in compliance with applicable laws.
            </p>
            <p>
              <strong className="text-[#0F172A]">2. Local Processing & User Responsibility:</strong> Because all document, image, and data transformations happen locally on your device, you retain full ownership and responsibility for the files you process. Always keep backups of important original documents before modifying or redacting them.
            </p>
            <p>
              <strong className="text-[#0F172A]">3. No Warranty:</strong> Utilities and calculators are provided "as is" without warranties of any kind. Financial and tax calculations are for informational estimation and do not constitute certified accounting advice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 404 Page
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 space-y-4">
        <span className="font-mono text-xs font-semibold text-[#4F46E5]">404 · Page Not Found</span>
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">
          We couldn't find that tool or page
        </h1>
        <p className="text-sm text-[#64748B]">
          The utility you requested may have moved or is not part of the published catalog.
        </p>
        <div className="pt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to VibeDesk Home</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/tools/')}
            className="px-4 py-2.5 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
          >
            Browse All Tools
          </button>
        </div>
      </div>
    </div>
  );
}
