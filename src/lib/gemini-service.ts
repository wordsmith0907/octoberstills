/**
 * Octoberstills Studio Concierge — Server-Side Gemini Integration
 *
 * Wraps and delegates to the upgraded Concierge Engine (src/lib/concierge-engine.ts):
 * 1. Smart 3-Tier Routing (Path A: Instant FAQ <50ms, Path B: Cached Knowledge, Path C: Gemini Streamed)
 * 2. Multi-layer rate limiting (IP burst, session limits)
 * 3. Strict brand-only scope defense & prompt injection guards
 * 4. Token-bounded progressive memory & lead intent classification
 * 5. Full backward compatibility for RPC and REST callers
 */

import {
  executeConciergeChat,
  streamConciergeChat,
  conciergeMetrics,
  checkConciergeRateLimit,
  sanitizeInput,
  isInjectionAttempt,
  detectIntent,
  type ConciergeMessage,
  type ProjectRequirements,
  type ConciergeRequestPayload,
  type ConciergeResponsePayload,
} from "./concierge-engine";

export type ChatMessage = ConciergeMessage;

export interface ProjectSummaryContext {
  brandOrClient?: string;
  services?: string[];
  deliverables?: string;
  timeline?: string;
  budget?: string;
  notes?: string[];
  location?: string;
}

export interface ChatRequestPayload {
  messages: ChatMessage[];
  currentSection?: string;
  projectId?: string;
  projectSummary?: ProjectSummaryContext;
  conversationId?: string;
  sessionId?: string;
  stream?: boolean;
}

export interface ChatResponsePayload {
  reply: string;
  detectedIntent?: "exploration" | "project_interest" | "high_intent" | "ready_to_inquire";
  suggestedActions?: string[];
  suggestedProject?: {
    id: string;
    title: string;
    category: string;
    anchor: string;
  };
  updatedProjectSummary?: Partial<ProjectSummaryContext>;
  error?: string;
  isFallback?: boolean;
  path?: string;
  latencyMs?: number;
}

export function checkChatRateLimit(clientIp: string): boolean {
  return checkConciergeRateLimit(clientIp).allowed;
}

export function sanitizeUserInput(input: string): string {
  return sanitizeInput(input);
}

export function isPotentialPromptInjection(input: string): boolean {
  return isInjectionAttempt(input);
}

export function detectLeadIntent(
  text: string
): "exploration" | "project_interest" | "high_intent" | "ready_to_inquire" {
  return detectIntent(text);
}

/**
 * Main execution handler delegating to Concierge Engine
 */
export async function executeChat(
  payload: ChatRequestPayload,
  clientIp = "unknown"
): Promise<ChatResponsePayload> {
  const sessionId = payload.sessionId || payload.conversationId;

  const conciergePayload: ConciergeRequestPayload = {
    messages: payload.messages || [],
    currentSection: payload.currentSection,
    sessionId,
    projectSummary: payload.projectSummary as Partial<ProjectRequirements>,
    stream: payload.stream,
  };

  const response: ConciergeResponsePayload = await executeConciergeChat(conciergePayload, clientIp);

  return {
    reply: response.reply,
    detectedIntent: response.detectedIntent,
    suggestedActions: response.suggestedActions,
    updatedProjectSummary: response.updatedProjectSummary as Partial<ProjectSummaryContext>,
    isFallback: response.isFallback,
    path: response.path,
    latencyMs: response.latencyMs,
  };
}

export {
  executeConciergeChat,
  streamConciergeChat,
  conciergeMetrics,
  checkConciergeRateLimit,
};
