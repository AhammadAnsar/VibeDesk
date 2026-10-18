import React from 'react';

interface AdSlotProps {
  slotId: string;
  format?: 'horizontal' | 'rectangle';
  enabled?: boolean;
  className?: string;
}

/**
 * Controlled AdSense-compatible AdSlot component (Section 13).
 * Disabled by default until a verified publisher account and site approval are active.
 * Never renders inside file drop zones, calculators, or adjacent to primary download controls.
 */
export function AdSlot({
  slotId,
  format = 'horizontal',
  enabled = false,
  className = '',
}: AdSlotProps) {
  // Per Section 13: Keep actual ads disabled until the real AdSense account and site are approved.
  // Do not fabricate publisher IDs or display placeholder ads as live advertisements.
  if (!enabled) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slotId}
      className={`w-full my-8 flex flex-col items-center justify-center border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-4 ${
        format === 'horizontal' ? 'min-h-[90px]' : 'min-h-[250px]'
      } ${className}`}
    >
      <span className="text-[11px] text-[#64748B] tracking-wide mb-1">Advertisement</span>
    </aside>
  );
}
