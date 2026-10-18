/**
 * Anonymous, privacy-first local usage tracker for VibeDesk.
 * Stores ONLY tool IDs and usage counts in localStorage.
 * Never records filenames, file contents, or personal identifiers, and never transmits data.
 */

const USAGE_STORAGE_KEY = 'vibedesk_local_tool_usage_v1';
const CONSENT_STORAGE_KEY = 'vibedesk_privacy_preferences_v1';

export interface ToolUsageRecord {
  toolId: string;
  count: number;
  lastUsedAt: string;
}

export interface PrivacyPreferences {
  localHistoryEnabled: boolean;
  advertisingConsent: boolean;
  updatedAt: string;
}

export function getPrivacyPreferences(): PrivacyPreferences {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return {
        localHistoryEnabled: true,
        advertisingConsent: false,
        updatedAt: '2026-10-01',
      };
    }
    return JSON.parse(raw) as PrivacyPreferences;
  } catch {
    return {
      localHistoryEnabled: true,
      advertisingConsent: false,
      updatedAt: '2026-10-01',
    };
  }
}

export function savePrivacyPreferences(prefs: Partial<PrivacyPreferences>): PrivacyPreferences {
  const current = getPrivacyPreferences();
  const next: PrivacyPreferences = {
    ...current,
    ...prefs,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
    if (!next.localHistoryEnabled) {
      localStorage.removeItem(USAGE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
  return next;
}

export function getFrequentToolRecords(limit = 6): ToolUsageRecord[] {
  const prefs = getPrivacyPreferences();
  if (!prefs.localHistoryEnabled) return [];

  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return [];
    const records = JSON.parse(raw) as ToolUsageRecord[];
    if (!Array.isArray(records)) return [];
    return records
      .filter((r) => r && typeof r.toolId === 'string' && typeof r.count === 'number' && r.count > 0)
      .sort((a, b) => b.count - a.count || b.lastUsedAt.localeCompare(a.lastUsedAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function recordToolVisit(toolId: string): void {
  const prefs = getPrivacyPreferences();
  if (!prefs.localHistoryEnabled) return;

  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    const records: ToolUsageRecord[] = raw ? JSON.parse(raw) : [];
    const existingIdx = records.findIndex((r) => r.toolId === toolId);
    const today = new Date().toISOString();

    if (existingIdx >= 0) {
      records[existingIdx].count += 1;
      records[existingIdx].lastUsedAt = today;
    } else {
      records.push({ toolId, count: 1, lastUsedAt: today });
    }

    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function clearLocalToolHistory(): void {
  try {
    localStorage.removeItem(USAGE_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
