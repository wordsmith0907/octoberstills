/**
 * OCTOBERSTILLS — Client-Side Browser Session Cache
 *
 * Fast temporary cache stored directly in browser sessionStorage (with memory fallback).
 * - Avoids redundant API calls when a visitor asks the same question multiple times.
 * - Resolves identical or normalized questions instantly (0ms latency).
 * - Expires automatically when the browser tab is closed, or after 30 minutes.
 * - Safely ignores sensitive inputs (emails, phones, personal project briefs).
 */

export interface CachedChatResult {
  reply: string;
  suggestedActions?: string[];
  detectedIntent?: "exploration" | "project_interest" | "high_intent" | "ready_to_inquire";
  timestamp: number;
}

const CACHE_KEY_PREFIX = "oktober_session_faq_";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// In-memory fallback if sessionStorage is blocked/restricted
const memoryCache = new Map<string, CachedChatResult>();

export function normalizeCacheKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks whether a user message is eligible for client-side caching.
 * Excludes messages containing emails, phone numbers, or personal briefs.
 */
function isCacheEligible(query: string): boolean {
  if (!query || query.trim().length === 0) return false;
  const clean = query.trim().toLowerCase();

  // Exclude potential sensitive data or explicit submission commands
  if (clean.includes("@")) return false;
  if (/\b\d{7,}\b/.test(clean)) return false; // Phone numbers
  if (clean.includes("my budget is") || clean.includes("my email is")) return false;
  if (clean.length > 200) return false; // Overly long custom briefs shouldn't collide

  return true;
}

/**
 * Retrieves a cached answer if available and unexpired.
 */
export function getCachedClientResponse(query: string): CachedChatResult | null {
  if (!isCacheEligible(query)) return null;
  const key = normalizeCacheKey(query);
  if (!key) return null;

  const now = Date.now();

  // 1. Check in-memory first (fastest)
  const memHit = memoryCache.get(key);
  if (memHit) {
    if (now - memHit.timestamp < CACHE_TTL_MS) {
      return memHit;
    }
    memoryCache.delete(key);
  }

  // 2. Check browser sessionStorage
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(CACHE_KEY_PREFIX + key);
      if (stored) {
        const parsed = JSON.parse(stored) as CachedChatResult;
        if (now - parsed.timestamp < CACHE_TTL_MS) {
          // Re-populate in-memory for instant next access
          memoryCache.set(key, parsed);
          return parsed;
        } else {
          window.sessionStorage.removeItem(CACHE_KEY_PREFIX + key);
        }
      }
    }
  } catch {
    // sessionStorage disabled / sandboxed
  }

  return null;
}

/**
 * Caches a successful assistant response for subsequent identical queries.
 */
export function setCachedClientResponse(
  query: string,
  reply: string,
  suggestedActions?: string[],
  detectedIntent?: "exploration" | "project_interest" | "high_intent" | "ready_to_inquire",
  isFallback?: boolean
): void {
  // Never cache fallback error messages or empty replies
  if (isFallback || !reply || reply.trim().length === 0) return;
  if (!isCacheEligible(query)) return;

  const key = normalizeCacheKey(query);
  if (!key) return;

  const entry: CachedChatResult = {
    reply: reply.trim(),
    suggestedActions,
    detectedIntent,
    timestamp: Date.now(),
  };

  // 1. Store in memory
  memoryCache.set(key, entry);

  // 2. Store in sessionStorage
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
    }
  } catch {
    // Quota exceeded or restricted
  }
}

/**
 * Clears the session cache (e.g. if visitor requests a fresh reset)
 */
export function clearClientSessionCache(): void {
  memoryCache.clear();
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i);
        if (k && k.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
    }
  } catch {
    // ignore
  }
}
