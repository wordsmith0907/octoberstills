// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";

// Populate process.env with server-side secrets from .env.local without exposing to client
const localEnv = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
Object.assign(process.env, localEnv);

function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.resolve({});
    }
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    // If stream already consumed or empty, resolve cleanly after 100ms
    setTimeout(() => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    }, 100);
  });
}

function studioDevApiPlugin(): Plugin {
  return {
    name: "octoberstills-dev-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const url = new URL(req.url, "http://localhost");
        const clientIp =
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          "dev-client";

        if ((url.pathname === "/api/health" || url.pathname === "/api/metrics") && req.method === "GET") {
          try {
            const { conciergeMetrics } = await server.ssrLoadModule("./src/lib/concierge-engine.ts");
            const { BRAND_KNOWLEDGE_VERSION } = await server.ssrLoadModule("./src/data/brand-knowledge.ts");
            const avgLatency = conciergeMetrics.latencies.length > 0
              ? Math.round(conciergeMetrics.latencies.reduce((a: number, b: number) => a + b, 0) / conciergeMetrics.latencies.length)
              : 0;
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify({
              status: "healthy",
              assistant: "Oktober Notes",
              version: BRAND_KNOWLEDGE_VERSION,
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
            }));
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
          return;
        }

        if (url.pathname === "/api/chat" && req.method === "POST") {
          try {
            const parsed = await parseBody(req);
            const { executeConciergeChat, streamConciergeChat } = await server.ssrLoadModule("./src/lib/concierge-engine.ts");
            const wantsStream = parsed.stream === true || (req.headers["accept"] && req.headers["accept"].includes("text/event-stream"));

            if (wantsStream) {
              res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
              });
              const stream = streamConciergeChat(parsed, clientIp);
              const reader = stream.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
              res.end();
              return;
            }

            const result = await executeConciergeChat(parsed, clientIp);
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
          return;
        }

        if (url.pathname === "/api/inquiry" && req.method === "POST") {
          try {
            const parsed = await parseBody(req);
            const { saveInquiry } = await server.ssrLoadModule("./src/lib/lead-storage.ts");
            const result = await saveInquiry(parsed, clientIp);
            res.setHeader("Content-Type", "application/json");
            res.statusCode = result.success ? 200 : 400;
            res.end(JSON.stringify(result));
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [studioDevApiPlugin()],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
