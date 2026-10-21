import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { executeConciergeChat, streamConciergeChat, conciergeMetrics } from "./lib/concierge-engine";
import { BRAND_KNOWLEDGE_VERSION } from "./data/brand-knowledge";
import { saveInquiry } from "./lib/lead-storage";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const clientIp = request.headers.get("x-forwarded-for") || "unknown";

      // Health and Diagnostics Endpoint
      if ((url.pathname === "/api/health" || url.pathname === "/api/metrics") && request.method === "GET") {
        const avgLatency = conciergeMetrics.latencies.length > 0
          ? Math.round(conciergeMetrics.latencies.reduce((a, b) => a + b, 0) / conciergeMetrics.latencies.length)
          : 0;

        return new Response(
          JSON.stringify({
            status: "healthy",
            assistant: "Oktober Notes",
            version: BRAND_KNOWLEDGE_VERSION,
            uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
            metrics: {
              totalRequests: conciergeMetrics.totalRequests,
              instantFaqHits: conciergeMetrics.instantFaqHits,
              cachedKnowledgeHits: conciergeMetrics.cachedKnowledgeHits,
              geminiCalls: conciergeMetrics.geminiCalls,
              scopeRefusals: conciergeMetrics.scopeRefusals,
              rateLimitHits: conciergeMetrics.rateLimitHits,
              errorCount: conciergeMetrics.errorCount,
              averageLatencyMs: avgLatency,
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, max-age=0",
            },
          }
        );
      }

      // Handle Chat Endpoint (SSE Streaming & Standard JSON)
      if (url.pathname === "/api/chat" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const acceptHeader = request.headers.get("accept") || "";
        const wantsStream = body.stream === true || acceptHeader.includes("text/event-stream");

        if (wantsStream) {
          const stream = streamConciergeChat(body, clientIp);
          return new Response(stream, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache, no-transform",
              "Connection": "keep-alive",
            },
          });
        }

        const result = await executeConciergeChat(body, clientIp);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, max-age=0",
          },
        });
      }

      // Handle REST Lead Submission Endpoint
      if (url.pathname === "/api/inquiry" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const result = await saveInquiry(body, clientIp);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
