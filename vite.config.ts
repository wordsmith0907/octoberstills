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

        if (url.pathname === "/api/chat" && req.method === "POST") {
          try {
            const parsed = await parseBody(req);
            const { executeChat } = await server.ssrLoadModule("./src/lib/gemini-service.ts");
            const result = await executeChat(parsed, clientIp);
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
