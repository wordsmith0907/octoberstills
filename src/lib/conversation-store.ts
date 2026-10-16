/**
 * Octoberstills AI Studio Assistant — Persistent Conversational Memory
 *
 * Implements:
 * 1. Primary storage in IndexedDB (octoberstills_concierge_db).
 * 2. Non-sensitive settings & active pointer in localStorage.
 * 3. Structured project requirements & entity extraction.
 * 4. 30-day retention enforcement & automatic expiration.
 * 5. Memory fallback for private browsing or restricted environments.
 * 6. Granular conversation controls: continue, start new, clear history.
 */

export interface StoredChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ProjectSummary {
  brandOrClient?: string;
  services: string[];
  deliverables?: string;
  timeline?: string;
  budget?: string;
  notes: string[];
  updatedAt: number;
}

export type InquiryStage =
  | "exploration"
  | "project_definition"
  | "brief_ready"
  | "submitted";

export interface StoredConversation {
  id: string;
  createdAt: number;
  lastActive: number;
  messages: StoredChatMessage[];
  projectSummary: ProjectSummary;
  inquiryStage: InquiryStage;
  servicesInterested: string[];
  detailsAlreadySupplied: Record<string, string>;
  isSubmitted?: boolean;
}

const DB_NAME = "octoberstills_concierge_db";
const DB_VERSION = 1;
const STORE_NAME = "conversations";
export const DEFAULT_RETENTION_DAYS = 30;

// LocalStorage keys
const ACTIVE_CONV_KEY = "octoberstills_active_conv_id";
const RETENTION_DAYS_KEY = "octoberstills_retention_days";

// In-memory fallback if IndexedDB is blocked or unavailable
const memoryFallback = new Map<string, StoredConversation>();
let memoryActiveId: string | null = null;

// Safe localStorage accessors
function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // LocalStorage blocked (private mode / sandboxed)
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // LocalStorage blocked
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // LocalStorage blocked
  }
}

// Open IndexedDB connection with promise
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available in current environment"));
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("lastActive", "lastActive", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
    } catch (err) {
      reject(err);
    }
  });
}

// Generate unique conversation ID
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Generate message ID
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Get configured retention period in ms
export function getRetentionPeriodMs(): number {
  const daysStr = safeGetItem(RETENTION_DAYS_KEY);
  const days = daysStr ? parseInt(daysStr, 10) : DEFAULT_RETENTION_DAYS;
  const validDays = isNaN(days) || days <= 0 ? DEFAULT_RETENTION_DAYS : days;
  return validDays * 24 * 60 * 60 * 1000;
}

// Set custom retention period in days
export function setRetentionPeriodDays(days: number): void {
  safeSetItem(RETENTION_DAYS_KEY, String(days));
}

/**
 * Intelligent entity extraction from visitor statements.
 * Updates the structured ProjectSummary without overwriting explicit visitor statements.
 */
export function extractProjectSummary(
  text: string,
  currentSummary?: ProjectSummary
): ProjectSummary {
  const summary: ProjectSummary = currentSummary
    ? { ...currentSummary, services: [...currentSummary.services], notes: [...currentSummary.notes] }
    : {
        services: [],
        notes: [],
        updatedAt: Date.now(),
      };

  const lower = text.toLowerCase();

  // 1. Detect Services
  if (
    lower.includes("photo") ||
    lower.includes("editorial") ||
    lower.includes("lookbook") ||
    lower.includes("still life") ||
    lower.includes("portrait")
  ) {
    if (!summary.services.includes("Photography")) {
      summary.services.push("Photography");
    }
  }

  if (
    lower.includes("film") ||
    lower.includes("cinematograph") ||
    lower.includes("commercial video") ||
    lower.includes("motion")
  ) {
    if (!summary.services.includes("Films & Cinematography")) {
      summary.services.push("Films & Cinematography");
    }
  }

  if (
    lower.includes("ugc") ||
    lower.includes("creator-led") ||
    lower.includes("reels") ||
    lower.includes("tiktok") ||
    lower.includes("social content")
  ) {
    if (!summary.services.includes("UGC & Brand Content")) {
      summary.services.push("UGC & Brand Content");
    }
  }

  // 2. Detect Budget (e.g. "budget is ₹25,000", "25k budget", "$5000", "₹50,000")
  const budgetMatch = text.match(
    /(?:budget(?: is| of)?\s*(?:around|approx|roughly)?:?\s*)([₹$€£RsINR.\d,\s]+(?:k|lakh|thousand|lac)?)/i
  ) || text.match(/([₹$€£]\s*[\d,]+(?:\s*(?:k|lakh|thousand|lac))?)/i);

  if (budgetMatch && budgetMatch[1]) {
    const rawBudget = budgetMatch[1].trim();
    if (rawBudget.length > 1) {
      summary.budget = rawBudget;
    }
  }

  // 3. Detect Deliverables (e.g. "five UGC videos", "5 videos", "10 photos", "campaign shoot")
  const deliverableMatch = text.match(
    /(\b(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(?:ugc\s+)?(?:videos?|photos?|reels?|deliverables?|assets?|stills?)\b)/i
  );
  if (deliverableMatch && deliverableMatch[1]) {
    summary.deliverables = summary.deliverables
      ? `${summary.deliverables}, ${deliverableMatch[1]}`
      : deliverableMatch[1];
  }

  // 4. Detect Timeline (e.g. "next month", "in 2 weeks", "by December", "launching next month")
  const timelineMatch = text.match(
    /(?:timeline|launching|shoot|start|ready)?\s*(?:is\s*)?(next month|next week|in \d+ (?:weeks?|months?|days?)|by [a-z]+|soon|immediately|q[1-4])/i
  );
  if (timelineMatch && timelineMatch[1]) {
    summary.timeline = timelineMatch[1].trim();
  }

  // 5. Detect Brand / Business Category (e.g. "skincare brand", "jewelry label", "fashion line", "hospitality")
  const brandMatch = text.match(
    /(?:launching|for|running|own|represent)\s+(?:a|an|our)?\s*([a-z\s]+(?:brand|label|line|hotel|resort|restaurant|agency|company|store))/i
  );
  if (brandMatch && brandMatch[1]) {
    summary.brandOrClient = brandMatch[1].trim();
  }

  summary.updatedAt = Date.now();
  return summary;
}

/**
 * Retrieve the active conversation from IndexedDB (or fallback).
 * Automatically validates 30-day retention.
 */
export async function getActiveConversation(): Promise<StoredConversation | null> {
  const activeId = safeGetItem(ACTIVE_CONV_KEY) || memoryActiveId;
  if (!activeId) return null;

  try {
    const db = await openDatabase();
    const conv = await new Promise<StoredConversation | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(activeId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (!conv) {
      // Not found in IndexedDB, check memory fallback
      const memConv = memoryFallback.get(activeId);
      if (memConv) return checkRetention(memConv);
      return null;
    }

    return checkRetention(conv);
  } catch (err) {
    console.warn("[ConversationStore] IndexedDB read fallback to memory:", err);
    const memConv = memoryFallback.get(activeId);
    if (memConv) return checkRetention(memConv);
    return null;
  }
}

// Check if conversation has expired based on retention period
function checkRetention(conv: StoredConversation): StoredConversation | null {
  const maxAge = getRetentionPeriodMs();
  const age = Date.now() - conv.lastActive;
  if (age > maxAge) {
    // Expired: cleanup
    deleteConversation(conv.id).catch(() => {});
    safeRemoveItem(ACTIVE_CONV_KEY);
    memoryActiveId = null;
    return null;
  }
  return conv;
}

/**
 * Save conversation to IndexedDB (and memory fallback).
 */
export async function saveConversation(conv: StoredConversation): Promise<void> {
  conv.lastActive = Date.now();
  safeSetItem(ACTIVE_CONV_KEY, conv.id);
  memoryActiveId = conv.id;
  memoryFallback.set(conv.id, { ...conv });

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(conv);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[ConversationStore] IndexedDB write fallback to memory:", err);
  }
}

/**
 * Start a brand-new conversation.
 * Creates a fresh session while keeping previous sessions in history if within retention.
 */
export async function createNewConversation(): Promise<StoredConversation> {
  const newId = generateConversationId();
  const newConv: StoredConversation = {
    id: newId,
    createdAt: Date.now(),
    lastActive: Date.now(),
    messages: [],
    projectSummary: {
      services: [],
      notes: [],
      updatedAt: Date.now(),
    },
    inquiryStage: "exploration",
    servicesInterested: [],
    detailsAlreadySupplied: {},
  };

  await saveConversation(newConv);
  return newConv;
}

/**
 * Permanently clear conversation history on this browser.
 * Removes all conversations from IndexedDB, clears active pointer and memory fallback.
 */
export async function clearConversationHistory(): Promise<void> {
  safeRemoveItem(ACTIVE_CONV_KEY);
  memoryActiveId = null;
  memoryFallback.clear();

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[ConversationStore] IndexedDB clear fallback:", err);
  }
}

/**
 * Delete a specific conversation by ID.
 */
export async function deleteConversation(id: string): Promise<void> {
  memoryFallback.delete(id);
  if (memoryActiveId === id) {
    memoryActiveId = null;
    safeRemoveItem(ACTIVE_CONV_KEY);
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[ConversationStore] IndexedDB delete error:", err);
  }
}

/**
 * Cleanup conversations older than retention period (default 30 days).
 */
export async function cleanupExpiredConversations(retentionDays = DEFAULT_RETENTION_DAYS): Promise<number> {
  const maxAge = retentionDays * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - maxAge;
  let deletedCount = 0;

  try {
    const db = await openDatabase();
    const expiredIds: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("lastActive");
      const range = IDBKeyRange.upperBound(cutoff);
      const req = index.openCursor(range);

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          expiredIds.push(cursor.value.id);
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });

    for (const id of expiredIds) {
      await deleteConversation(id);
      deletedCount++;
    }
  } catch (err) {
    console.warn("[ConversationStore] Expired cleanup error:", err);
  }

  return deletedCount;
}
