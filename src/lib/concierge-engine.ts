/**
 * OCTOBERSTILLS — High-Performance Studio Concierge Engine
 * 
 * Implements:
 * 1. Smart 3-Tier Routing:
 *    - Path A: Instant Deterministic Responses (<50ms, zero token cost)
 *    - Path B: Cached Brand Knowledge Layer (versioned, low latency)
 *    - Path C: Gemini Streamed / Grounded Response (contextual, tailored sales qualification)
 * 2. Strict Brand-Only Scope Enforcement & Prompt-Injection Resistance
 * 3. Layered Security & Rate Limiting (IP burst, per-session, per-IP)
 * 4. Token-Bounded Context & Progressive Entity Extraction
 * 5. SSE Streaming Support with Graceful Non-Streaming Fallback
 * 6. In-Memory Operational Diagnostics
 */

import { GoogleGenAI } from "@google/genai";
import { BRAND_KNOWLEDGE, BRAND_KNOWLEDGE_VERSION, type VerifiedFAQ } from "../data/brand-knowledge";

export interface ConciergeMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ProjectRequirements {
  brandOrClient?: string;
  services: string[];
  deliverables?: string;
  timeline?: string;
  budget?: string;
  location?: string;
  notes: string[];
}

export interface ConciergeRequestPayload {
  messages: ConciergeMessage[];
  currentSection?: string;
  sessionId?: string;
  projectSummary?: Partial<ProjectRequirements>;
  stream?: boolean;
}

export interface ConciergeResponsePayload {
  reply: string;
  path: "instant_faq" | "cached_knowledge" | "gemini_stream" | "gemini_sync" | "scope_refusal" | "fallback";
  detectedIntent?: "exploration" | "project_interest" | "high_intent" | "ready_to_inquire";
  suggestedActions?: string[];
  updatedProjectSummary?: Partial<ProjectRequirements>;
  isFallback?: boolean;
  latencyMs?: number;
  knowledgeVersion?: string;
}

// ---------------------------------------------------------------------------
// 1. IN-MEMORY OPERATIONAL METRICS & RATE LIMITING
// ---------------------------------------------------------------------------

export interface ConciergeMetrics {
  totalRequests: number;
  instantFaqHits: number;
  cachedKnowledgeHits: number;
  geminiCalls: number;
  scopeRefusals: number;
  rateLimitHits: number;
  errorCount: number;
  latencies: number[];
}

export const conciergeMetrics: ConciergeMetrics = {
  totalRequests: 0,
  instantFaqHits: 0,
  cachedKnowledgeHits: 0,
  geminiCalls: 0,
  scopeRefusals: 0,
  rateLimitHits: 0,
  errorCount: 0,
  latencies: [],
};

// Rate limit structures (sliding window)
interface RateLimitBucket {
  count: number;
  burstCount: number;
  resetAt: number;
  burstResetAt: number;
}

const ipBuckets = new Map<string, RateLimitBucket>();
const sessionBuckets = new Map<string, RateLimitBucket>();

// Maximum limits
const MAX_IP_REQ_5MIN = 35;
const MAX_IP_BURST_10SEC = 6;
const MAX_SESSION_REQ_5MIN = 25;

export function checkConciergeRateLimit(clientIp: string, sessionId?: string): { allowed: boolean; reason?: string } {
  const now = Date.now();

  // 1. Check IP Limits
  let ipEntry = ipBuckets.get(clientIp);
  if (!ipEntry || now > ipEntry.resetAt) {
    ipEntry = { count: 1, burstCount: 1, resetAt: now + 5 * 60 * 1000, burstResetAt: now + 10 * 1000 };
    ipBuckets.set(clientIp, ipEntry);
  } else {
    // Check burst
    if (now > ipEntry.burstResetAt) {
      ipEntry.burstCount = 1;
      ipEntry.burstResetAt = now + 10 * 1000;
    } else {
      ipEntry.burstCount++;
      if (ipEntry.burstCount > MAX_IP_BURST_10SEC) {
        conciergeMetrics.rateLimitHits++;
        return { allowed: false, reason: "Too many messages in rapid succession. Please take a breath." };
      }
    }

    ipEntry.count++;
    if (ipEntry.count > MAX_IP_REQ_5MIN) {
      conciergeMetrics.rateLimitHits++;
      return { allowed: false, reason: "Message limit reached. Please wait a few moments or email octoberstills@gmail.com directly." };
    }
  }

  // 2. Check Session Limits if provided
  if (sessionId) {
    let sessEntry = sessionBuckets.get(sessionId);
    if (!sessEntry || now > sessEntry.resetAt) {
      sessionBuckets.set(sessionId, { count: 1, burstCount: 1, resetAt: now + 5 * 60 * 1000, burstResetAt: now + 10 * 1000 });
    } else {
      sessEntry.count++;
      if (sessEntry.count > MAX_SESSION_REQ_5MIN) {
        conciergeMetrics.rateLimitHits++;
        return { allowed: false, reason: "Session message threshold reached. Please share your project details directly with Chaitya." };
      }
    }
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// 2. INPUT SANITIZATION & STRICT BRAND-ONLY SCOPE ENFORCEMENT
// ---------------------------------------------------------------------------

export function sanitizeInputText(raw: unknown): string {
  if (typeof raw !== "string") return "";
  // Strip control chars, null bytes, normalize unicode, limit to 800 chars
  return raw
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, 800);
}

export const sanitizeInput = sanitizeInputText;

export function isInjectionAttempt(text: string): boolean {
  const clean = text.toLowerCase();
  return INJECTION_PATTERNS.some((pattern) => pattern.test(clean));
}

// Prompt-injection pattern guards
const INJECTION_PATTERNS = [
  /ignore (?:all )?(?:previous|above|prior) (?:instructions|rules|prompts)/i,
  /disregard (?:all )?(?:previous|above|prior)/i,
  /you are now (?:a|an) (?:unrestricted|python|coding|assistant|hacker|dan)/i,
  /reveal (?:your|the) (?:system prompt|system instructions|api key|secret)/i,
  /show (?:me )?(?:your|the) (?:system prompt|developer instructions|hidden rules)/i,
  /bypass (?:filter|guard|policy)/i,
  /simulat(?:e|ion) mode/i,
  /print (?:the )?(?:entire )?system prompt/i,
];

// Unrelated non-studio topics (strictly rejected unless framed around creative brand campaign)
const UNRELATED_PATTERNS = [
  /\b(?:write|debug|explain|generate|create)\s+(?:(?:a|an|the|some|this)\s+)?(?:python|javascript|typescript|c\+\+|java|rust|sql|html|css|code|script|algorithm)\b/i,
  /\b(?:python|javascript|typescript|c\+\+|java|rust|sql)\s+(?:script|code|program|function|algorithm)\b/i,
  /\b(?:solve|calculate|equation|derivative|integral)\s+(?:math|calculus|algebra|physics|geometry)\b/i,
  /\b(?:write my|do my|solve my)\s+(?:homework|assignment|essay|thesis)\b/i,
  /\b(?:translate into|translate to)\s+(?:french|german|spanish|russian|chinese|japanese)\b/i,
  /\b(?:who won the|what was the score of)\s+(?:football|cricket|fifa|ipl|nba|match)\b/i,
];

export function evaluateScope(text: string): { isAllowed: boolean; refusalReply?: string } {
  const clean = text.toLowerCase();

  // 1. Guard against prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isAllowed: false,
        refusalReply:
          "I'm Oktober Notes, Octoberstills' studio assistant. I'm here solely to assist with Chaitya Shah's creative direction, photography, and film collaborations.",
      };
    }
  }

  // 2. Check for technical topics
  // Allow if it contains brand/creative context (e.g. "We need a campaign film for our SaaS software")
  const isCreativeContext =
    clean.includes("film") ||
    clean.includes("video") ||
    clean.includes("photo") ||
    clean.includes("brand") ||
    clean.includes("campaign") ||
    clean.includes("shoot") ||
    clean.includes("commercial") ||
    clean.includes("octoberstills") ||
    clean.includes("chaitya");

  if (!isCreativeContext) {
    for (const pattern of UNRELATED_PATTERNS) {
      if (pattern.test(clean)) {
        return {
          isAllowed: false,
          refusalReply:
            "I'm here to assist with Octoberstills' creative services and collaborations. Are you planning a photography, film, or brand-content project?",
        };
      }
    }
  }

  return { isAllowed: true };
}

// ---------------------------------------------------------------------------
// 3. INTENT DETECTION & ENTITY EXTRACTION
// ---------------------------------------------------------------------------

export function detectIntent(text: string): ConciergeResponsePayload["detectedIntent"] {
  const lower = text.toLowerCase();

  if (
    lower.includes("submit") ||
    lower.includes("send brief") ||
    lower.includes("my email is") ||
    lower.includes("contact me at") ||
    lower.includes("ready to book") ||
    lower.includes("@")
  ) {
    return "ready_to_inquire";
  }

  if (
    lower.includes("hire") ||
    lower.includes("quote") ||
    lower.includes("rates") ||
    lower.includes("cost") ||
    lower.includes("pricing") ||
    lower.includes("availab") ||
    lower.includes("timeline") ||
    lower.includes("dates") ||
    lower.includes("shoot next")
  ) {
    return "high_intent";
  }

  if (
    lower.includes("looking for") ||
    lower.includes("we need") ||
    lower.includes("our brand") ||
    lower.includes("campaign") ||
    lower.includes("video") ||
    lower.includes("photoshoot") ||
    lower.includes("skincare") ||
    lower.includes("fashion") ||
    lower.includes("project")
  ) {
    return "project_interest";
  }

  return "exploration";
}

// ---------------------------------------------------------------------------
// 4. PATH A: INSTANT DETERMINISTIC FAQ ROUTING (<50ms)
// ---------------------------------------------------------------------------

// Normalize query by removing punctuation and extra whitespace
function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchInstantFAQ(cleanQuery: string, hasPriorConversation: boolean): { reply: string; actions: string[] } | null {
  const norm = normalizeQuery(cleanQuery);

  // Simple Greetings (only if user hasn't supplied complex project info)
  if (!hasPriorConversation) {
    if (["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "greetings"].includes(norm)) {
      return {
        reply: "Hello! Welcome to Oktober Notes—a little space for big ideas. Have a creative project in mind, or just exploring Octoberstills?",
        actions: ["Explore Services", "View Selected Work", "Discuss a Project"],
      };
    }
  }

  // Exact trigger matching against BRAND_KNOWLEDGE.faqs
  for (const faq of BRAND_KNOWLEDGE.faqs) {
    for (const trigger of faq.triggers) {
      const normTrigger = normalizeQuery(trigger);
      // If exact match or begins with trigger with high confidence
      if (norm === normTrigger || norm.startsWith(normTrigger + " ") || norm.endsWith(" " + normTrigger)) {
        return {
          reply: faq.answer,
          actions: faq.suggestedActions,
        };
      }
    }
  }

  // High-confidence general questions
  if (norm === "who is chaitya" || norm === "who is chaitya shah" || norm === "tell me about chaitya") {
    return {
      reply: BRAND_KNOWLEDGE.faqs.find((f) => f.id === "faq-who-is-chaitya")?.answer || "",
      actions: ["Explore Services", "View Selected Work", "Discuss a Project"],
    };
  }

  if (norm === "what is octoberstills" || norm === "about octoberstills" || norm === "tell me about octoberstills") {
    return {
      reply: BRAND_KNOWLEDGE.faqs.find((f) => f.id === "faq-what-is-octoberstills")?.answer || "",
      actions: ["Explore Services", "View Selected Work", "Discuss a Project"],
    };
  }

  if (norm === "contact" || norm === "email" || norm === "what is your email" || norm === "how can i contact you") {
    return {
      reply: `You can reach Chaitya directly at ${BRAND_KNOWLEDGE.contact.verifiedEmail}, connect on Instagram (@octoberstills), or share your project brief right here.`,
      actions: ["Share Project Brief", "View Selected Work", "Instagram"],
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// 5. PATH B: IN-MEMORY CACHED BRAND KNOWLEDGE LAYER
// ---------------------------------------------------------------------------

const knowledgeCache = new Map<string, { reply: string; actions: string[]; timestamp: number }>();
const KNOWLEDGE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function getCachedKnowledge(topic: string): { reply: string; actions: string[] } | null {
  const key = `${BRAND_KNOWLEDGE_VERSION}_${topic}`;
  const entry = knowledgeCache.get(key);
  if (entry && Date.now() - entry.timestamp < KNOWLEDGE_CACHE_TTL) {
    return { reply: entry.reply, actions: entry.actions };
  }
  return null;
}

export function setCachedKnowledge(topic: string, reply: string, actions: string[]): void {
  const key = `${BRAND_KNOWLEDGE_VERSION}_${topic}`;
  knowledgeCache.set(key, { reply, actions, timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// 6. SYSTEM INSTRUCTION COMPOSER (TOPIC-BASED & TOKEN-EFFICIENT)
// ---------------------------------------------------------------------------

function buildConciergeSystemInstruction(contextSection?: string): string {
  const k = BRAND_KNOWLEDGE;

  return `You are Oktober Notes, the personal creative assistant and digital notebook for Octoberstills, representing Chaitya Shah's visual studio.
Your tagline is: "A little space for big ideas."
You are an observant, tasteful, and confident creative partner who helps visitors understand services, explore work, and prepare project briefs for Chaitya Shah.
You are NOT Chaitya Shah; you speak as her thoughtful studio assistant.

AUTHENTIC FACTS:
- Studio: ${k.studio.name} (${k.studio.positioning})
- Founder: ${k.about.founder} (${k.about.roles.join(", ")}, ${k.about.experience})
- Email: ${k.contact.verifiedEmail}
- Location: ${k.contact.location}
- Response Time: ${k.contact.responseTime}
- Note: Octoberstills is an editorial visual studio, NOT exclusively a wedding photography business.

SERVICES:
1. Photography: Editorial fashion, hospitality, architecture, product still life with sculpted natural light.
2. Films & Cinematography: Cinematic brand films, commercial narratives, atmospheric rhythm.
3. UGC & Brand Content: High-aesthetic creator-led video content for modern social audiences.
4. Creative Direction: Comprehensive concept development, moodboarding, and art direction.

STRICT POLICIES:
- Identity: Always introduce or refer to yourself as Oktober Notes ("A little space for big ideas").
- Pricing: Every project is custom-scoped based on deliverables, concept, and licensing. We do NOT have fixed packages. Never invent prices, discounts, or guarantees.
- Availability: You cannot confirm calendar bookings directly. Collect preferred shoot dates in a brief for Chaitya's review.
- Response Length: Keep answers concise (1–3 sentences maximum). Be warm, editorial, professional, and naturally focused on next creative steps.
- One Question: Ask at most one qualifying question at a time.
- Scope: Answer only questions regarding Octoberstills, Chaitya Shah, and creative productions. Reject unrelated requests politely.
- Format: Output ONLY the direct response to the visitor. Never output reasoning, internal checks, or meta-commentary.
${contextSection ? `[Visitor is currently browsing section: ${contextSection}]` : ""}
`;
}

// ---------------------------------------------------------------------------
// 7. PATH C: GEMINI STREAMING & SYNCHRONOUS EXECUTION
// ---------------------------------------------------------------------------

const SUPPORTED_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
].filter(Boolean) as string[];

/**
 * Executes a full Gemini query with bounded retries and model failover.
 */
export async function executeConciergeChat(
  payload: ConciergeRequestPayload,
  clientIp: string = "unknown"
): Promise<ConciergeResponsePayload> {
  const startTime = performance.now();
  conciergeMetrics.totalRequests++;

  // 1. Rate Limiting Check
  const rateCheck = checkConciergeRateLimit(clientIp, payload.sessionId);
  if (!rateCheck.allowed) {
    return {
      reply: rateCheck.reason || "Please wait a moment before sending another message.",
      path: "fallback",
      isFallback: true,
      suggestedActions: ["Email Studio Directly", "View Selected Work"],
    };
  }

  // 2. Validate messages
  if (!payload.messages || !Array.isArray(payload.messages) || payload.messages.length === 0) {
    return {
      reply: "Welcome to Oktober Notes. Have a creative project in mind, or just exploring? I'm here to help.",
      path: "instant_faq",
      suggestedActions: ["Explore Services", "View Selected Work", "Discuss a Project"],
    };
  }

  const lastUserMsg = [...payload.messages].reverse().find((m) => m.role === "user");
  const rawQuery = lastUserMsg ? lastUserMsg.content : "";
  const cleanQuery = sanitizeInputText(rawQuery);

  if (!cleanQuery) {
    return {
      reply: "Welcome to Oktober Notes. What kind of visual project are you planning?",
      path: "instant_faq",
      suggestedActions: ["Photography", "Films & Motion", "UGC Content"],
    };
  }

  // 3. Strict Brand-Only Scope Check
  const scopeResult = evaluateScope(cleanQuery);
  if (!scopeResult.isAllowed) {
    conciergeMetrics.scopeRefusals++;
    return {
      reply: scopeResult.refusalReply || "I'm here to assist with Octoberstills' creative services and collaborations.",
      path: "scope_refusal",
      suggestedActions: ["Explore Services", "View Selected Work", "Discuss a Project"],
    };
  }

  const hasPriorHistory = payload.messages.filter((m) => m.role === "user").length > 1;

  // 4. PATH A: Check Instant Deterministic FAQs (<50ms)
  const faqMatch = matchInstantFAQ(cleanQuery, hasPriorHistory);
  if (faqMatch) {
    conciergeMetrics.instantFaqHits++;
    const latency = performance.now() - startTime;
    return {
      reply: faqMatch.reply,
      path: "instant_faq",
      detectedIntent: detectIntent(cleanQuery),
      suggestedActions: faqMatch.actions,
      latencyMs: Math.round(latency),
      knowledgeVersion: BRAND_KNOWLEDGE_VERSION,
    };
  }

  // 5. PATH B: Check Cached Brand Knowledge
  const cached = getCachedKnowledge(normalizeQuery(cleanQuery));
  if (cached) {
    conciergeMetrics.cachedKnowledgeHits++;
    const latency = performance.now() - startTime;
    return {
      reply: cached.reply,
      path: "cached_knowledge",
      detectedIntent: detectIntent(cleanQuery),
      suggestedActions: cached.actions,
      latencyMs: Math.round(latency),
      knowledgeVersion: BRAND_KNOWLEDGE_VERSION,
    };
  }

  // 6. PATH C: Gemini-Powered Response
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "placeholder" || apiKey.trim().length === 0) {
    // Graceful offline fallback
    const intent = detectIntent(cleanQuery);
    return {
      reply:
        "Octoberstills crafts high-aesthetic brand films, editorial photography, and UGC content. Tell me a bit about what you're planning, or share your brief directly.",
      path: "fallback",
      detectedIntent: intent,
      suggestedActions: ["Share Project Brief", "Email Studio Directly", "View Selected Work"],
      isFallback: true,
      latencyMs: Math.round(performance.now() - startTime),
    };
  }

  conciergeMetrics.geminiCalls++;
  const ai = new GoogleGenAI({ apiKey });

  // Limit conversation history to last 6 turns (bounded token budget)
  const recentTurns = payload.messages.slice(-6);
  const historyWithoutLast = recentTurns.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: sanitizeInputText(m.content) }],
  }));

  // Contextual project summary injection
  let projectContextNote = "";
  if (payload.projectSummary) {
    const ps = payload.projectSummary;
    const parts: string[] = [];
    if (ps.brandOrClient) parts.push(`Brand: ${ps.brandOrClient}`);
    if (ps.services && ps.services.length > 0) parts.push(`Services: ${ps.services.join(", ")}`);
    if (ps.deliverables) parts.push(`Deliverables: ${ps.deliverables}`);
    if (ps.timeline) parts.push(`Timeline: ${ps.timeline}`);
    if (ps.budget) parts.push(`Budget: ${ps.budget}`);
    if (parts.length > 0) {
      projectContextNote = `\n[KNOWN VISITOR CONTEXT: ${parts.join(" | ")}. Seamlessly build on this; do not re-ask details already established.]\n`;
    }
  }

  const candidateModels = Array.from(new Set(SUPPORTED_MODELS));
  let responseText = "";

  for (const activeModel of candidateModels) {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const apiPromise = ai.models.generateContent({
          model: activeModel,
          contents: [
            ...historyWithoutLast,
            {
              role: "user",
              parts: [{ text: cleanQuery + projectContextNote }],
            },
          ],
          config: {
            systemInstruction: buildConciergeSystemInstruction(payload.currentSection),
            temperature: 0.6,
            maxOutputTokens: 300,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API request timed out after 20000ms")), 20000)
        );

        const response = await Promise.race([apiPromise, timeoutPromise]);
        let rawText = response.text ? response.text.trim() : "";

        if (rawText) {
          responseText = rawText
            .replace(/^(\*?\*?Check Constraints:?[\s\S]*?\n\n|\*?\*?Draft Response:?\*?\*?|\*?\*?Response:?\*?\*?|Assistant:?\s*\*?\*?)/i, "")
            .trim();
          break;
        }
      } catch (err: unknown) {
        attempts++;
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Fast transient backoff on 503/429
        if (attempts < maxAttempts && (errorMessage.includes("503") || errorMessage.includes("429"))) {
          await new Promise((r) => setTimeout(r, 750));
          continue;
        }

        console.warn(`[ConciergeEngine] ${activeModel} warning (${errorMessage.slice(0, 80)}...), trying candidate...`);
        break;
      }
    }

    if (responseText) break;
  }

  const latency = performance.now() - startTime;
  conciergeMetrics.latencies.push(latency);
  if (conciergeMetrics.latencies.length > 100) conciergeMetrics.latencies.shift();

  if (!responseText) {
    conciergeMetrics.errorCount++;
    return {
      reply:
        "I'm having a little trouble connecting right now. You can try again shortly, or email your project details directly to octoberstills@gmail.com.",
      path: "fallback",
      isFallback: true,
      suggestedActions: ["Email Studio Directly", "View Selected Work"],
      latencyMs: Math.round(latency),
    };
  }

  const detectedIntent = detectIntent(cleanQuery + " " + responseText);

  // Suggest context-sensitive actions
  const actions: string[] = [];
  if (detectedIntent === "ready_to_inquire" || detectedIntent === "high_intent") {
    actions.push("Share Project Brief", "Email Chaitya Directly");
  } else if (cleanQuery.toLowerCase().includes("ugc")) {
    actions.push("View UGC Showcase", "Discuss a Project");
  } else if (cleanQuery.toLowerCase().includes("photo")) {
    actions.push("View Photography Stills", "Discuss a Project");
  } else if (cleanQuery.toLowerCase().includes("film")) {
    actions.push("View Films & Motion", "Discuss a Project");
  } else {
    actions.push("Discuss a Project", "View Selected Work", "Contact Studio");
  }

  // Cache response if general query and no sensitive visitor entities
  if (!payload.projectSummary?.budget && !payload.projectSummary?.brandOrClient && cleanQuery.length < 50) {
    setCachedKnowledge(normalizeQuery(cleanQuery), responseText, actions);
  }

  return {
    reply: responseText,
    path: "gemini_sync",
    detectedIntent,
    suggestedActions: actions,
    latencyMs: Math.round(latency),
    knowledgeVersion: BRAND_KNOWLEDGE_VERSION,
  };
}

/**
 * Creates an SSE ReadableStream that streams Gemini chunks progressively to the client.
 */
export function streamConciergeChat(
  payload: ConciergeRequestPayload,
  clientIp: string = "unknown"
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  // 1. Rate Limiting Check
  const rateCheck = checkConciergeRateLimit(clientIp, payload.sessionId);
  if (!rateCheck.allowed) {
    return new ReadableStream({
      start(controller) {
        const data = JSON.stringify({
          type: "done",
          reply: rateCheck.reason || "Please wait a moment before sending another message.",
          path: "fallback",
          isFallback: true,
          suggestedActions: ["Email Studio Directly", "View Selected Work"],
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      },
    });
  }

  // If query is an instant FAQ or out-of-scope, stream it as a single fast event!
  const cleanQuery = sanitizeInputText(payload.messages[payload.messages.length - 1]?.content || "");
  const scopeResult = evaluateScope(cleanQuery);

  if (!scopeResult.isAllowed) {
    return new ReadableStream({
      start(controller) {
        const data = JSON.stringify({
          type: "done",
          reply: scopeResult.refusalReply || "I'm here to assist with Octoberstills' creative services and collaborations.",
          path: "scope_refusal",
          suggestedActions: ["Explore Services", "View Selected Work", "Discuss a Project"],
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      },
    });
  }

  const hasPriorHistory = payload.messages.filter((m) => m.role === "user").length > 1;
  const instantMatch = matchInstantFAQ(cleanQuery, hasPriorHistory);
  if (instantMatch) {
    return new ReadableStream({
      start(controller) {
        const data = JSON.stringify({
          type: "done",
          reply: instantMatch.reply,
          path: "instant_faq",
          suggestedActions: instantMatch.actions,
          detectedIntent: detectIntent(cleanQuery),
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "placeholder") {
    return new ReadableStream({
      start(controller) {
        const data = JSON.stringify({
          type: "done",
          reply: "Octoberstills crafts high-aesthetic brand films, editorial photography, and UGC content. Share your vision directly with Chaitya.",
          path: "fallback",
          suggestedActions: ["Share Project Brief", "Email Studio Directly"],
          isFallback: true,
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      },
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  const recentTurns = payload.messages.slice(-6);
  const historyWithoutLast = recentTurns.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: sanitizeInputText(m.content) }],
  }));

  let projectContextNote = "";
  if (payload.projectSummary) {
    const ps = payload.projectSummary;
    const parts: string[] = [];
    if (ps.brandOrClient) parts.push(`Brand: ${ps.brandOrClient}`);
    if (ps.services && ps.services.length > 0) parts.push(`Services: ${ps.services.join(", ")}`);
    if (parts.length > 0) {
      projectContextNote = `\n[KNOWN VISITOR CONTEXT: ${parts.join(" | ")}]\n`;
    }
  }

  const activeModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await ai.models.generateContentStream({
          model: activeModel,
          contents: [
            ...historyWithoutLast,
            {
              role: "user",
              parts: [{ text: cleanQuery + projectContextNote }],
            },
          ],
          config: {
            systemInstruction: buildConciergeSystemInstruction(payload.currentSection),
            temperature: 0.6,
            maxOutputTokens: 300,
          },
        });

        let accumulated = "";

        for await (const chunk of stream) {
          const chunkText = chunk.text;
          if (chunkText) {
            accumulated += chunkText;
            const chunkEvent = JSON.stringify({ type: "chunk", text: chunkText });
            controller.enqueue(encoder.encode(`data: ${chunkEvent}\n\n`));
          }
        }

        const detectedIntent = detectIntent(cleanQuery + " " + accumulated);
        const doneEvent = JSON.stringify({
          type: "done",
          reply: accumulated.trim(),
          path: "gemini_stream",
          detectedIntent,
          suggestedActions:
            detectedIntent === "ready_to_inquire" || detectedIntent === "high_intent"
              ? ["Share Project Brief", "Email Studio Directly"]
              : ["Discuss a Project", "View Selected Work"],
        });
        controller.enqueue(encoder.encode(`data: ${doneEvent}\n\n`));
        controller.close();
      } catch (err) {
        console.error("[ConciergeStream] Stream error:", err);
        const fallbackEvent = JSON.stringify({
          type: "done",
          reply: "I'm having a little trouble connecting right now. You can try again shortly, or email your project details directly to octoberstills@gmail.com.",
          path: "fallback",
          isFallback: true,
          suggestedActions: ["Email Studio Directly", "Use Contact Form"],
        });
        controller.enqueue(encoder.encode(`data: ${fallbackEvent}\n\n`));
        controller.close();
      }
    },
  });
}
