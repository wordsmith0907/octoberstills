import React, { useState, useEffect, useCallback } from "react";
import { ChatbotLauncher } from "./ChatbotLauncher";
import { ChatbotPanel } from "./ChatbotPanel";
import { chatWithStudioAssistant, submitStudioInquiry } from "../../lib/server-fns";
import type { ChatMessage, ChatResponsePayload } from "../../lib/gemini-service";
import type { InquirySubmissionPayload, InquiryResponse } from "../../lib/lead-storage";
import { getCachedClientResponse, setCachedClientResponse } from "../../lib/client-cache";

interface StudioAssistantProps {
  visible?: boolean;
}

export function StudioAssistant({ visible = true }: StudioAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>("home");

  // Track active section for context-aware suggestions
  useEffect(() => {
    const sections = ["hero", "work", "services", "about", "testimonials", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setCurrentSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSendMessage = useCallback(
    async (
      messages: ChatMessage[],
      projectSummary?: any,
      conversationId?: string,
      options?: {
        signal?: AbortSignal;
        onChunk?: (text: string) => void;
      }
    ): Promise<ChatResponsePayload> => {
      const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";

      // 0. Instant Browser Session Cache Hit (0ms latency, zero network overhead)
      const cached = getCachedClientResponse(lastUserMsg);
      if (cached) {
        if (options?.onChunk) {
          options.onChunk(cached.reply);
        }
        return {
          reply: cached.reply,
          suggestedActions: cached.suggestedActions,
          detectedIntent: cached.detectedIntent,
          path: "browser_session_cache",
        };
      }

      // 1. Primary: Streaming SSE endpoint /api/chat
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
          },
          body: JSON.stringify({
            messages,
            currentSection,
            projectSummary,
            conversationId,
            stream: true,
          }),
          signal: options?.signal,
        });

        const contentType = res.headers.get("content-type") || "";

        // Handle SSE streaming
        if (res.ok && contentType.includes("text/event-stream") && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let accumulatedReply = "";
          let finalResponse: ChatResponsePayload | null = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() || "";

            for (const part of parts) {
              const line = part.trim();
              if (line.startsWith("data: ")) {
                try {
                  const event = JSON.parse(line.slice(6));
                  if (event.type === "chunk" && event.text) {
                    accumulatedReply += event.text;
                    if (options?.onChunk) {
                      options.onChunk(accumulatedReply);
                    }
                  } else if (event.type === "done") {
                    finalResponse = {
                      reply: event.reply || accumulatedReply,
                      detectedIntent: event.detectedIntent,
                      suggestedActions: event.suggestedActions,
                      path: event.path,
                      isFallback: event.isFallback,
                    };
                  }
                } catch {
                  // Partial chunk JSON parse fallback
                }
              }
            }
          }

          if (finalResponse) {
            if (!finalResponse.isFallback) {
              setCachedClientResponse(
                lastUserMsg,
                finalResponse.reply,
                finalResponse.suggestedActions,
                finalResponse.detectedIntent,
                false
              );
            }
            return finalResponse;
          }
          if (accumulatedReply.trim().length > 0) {
            setCachedClientResponse(
              lastUserMsg,
              accumulatedReply.trim(),
              ["Discuss a Project", "View Selected Work"],
              undefined,
              false
            );
            return {
              reply: accumulatedReply.trim(),
              suggestedActions: ["Discuss a Project", "View Selected Work"],
            };
          }
        }

        // Handle direct JSON response (e.g. instant FAQ or cached knowledge)
        if (res.ok && contentType.includes("application/json")) {
          const data = await res.json();
          if (data && data.reply) {
            if (!data.isFallback) {
              setCachedClientResponse(
                lastUserMsg,
                data.reply,
                data.suggestedActions,
                data.detectedIntent,
                false
              );
            }
            return data;
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") throw err;
        console.warn("[StudioAssistant] Streaming fetch error, trying non-streaming fallback:", err);
      }

      // 2. Fallback: Standard JSON REST /api/chat
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            currentSection,
            projectSummary,
            conversationId,
            stream: false,
          }),
          signal: options?.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            if (!data.isFallback) {
              setCachedClientResponse(
                lastUserMsg,
                data.reply,
                data.suggestedActions,
                data.detectedIntent,
                false
              );
            }
            return data;
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") throw err;
        console.warn("[StudioAssistant] REST /api/chat error:", err);
      }

      // 3. Fallback: TanStack Start RPC createServerFn
      try {
        const rpcResult = await chatWithStudioAssistant({
          data: {
            messages,
            currentSection,
            projectSummary,
            conversationId,
          },
        });
        if (rpcResult && rpcResult.reply) {
          if (!rpcResult.isFallback) {
            setCachedClientResponse(
              lastUserMsg,
              rpcResult.reply,
              rpcResult.suggestedActions,
              rpcResult.detectedIntent,
              false
            );
          }
          return rpcResult;
        }
      } catch (rpcErr) {
        console.error("[StudioAssistant] RPC fallback error:", rpcErr);
      }

      return {
        reply:
          "I'm having trouble connecting right now. Please try again shortly, or email your project details to octoberstills@gmail.com.",
        isFallback: true,
        suggestedActions: ["Email Studio Directly", "Use Contact Form"],
      };
    },
    [currentSection]
  );

  const handleSubmitInquiry = useCallback(
    async (payload: InquirySubmissionPayload): Promise<InquiryResponse> => {
      // Primary: standard REST endpoint /api/inquiry
      try {
        const res = await fetch("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, sourceSection: currentSection }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn("[StudioAssistant] REST /api/inquiry error:", err);
      }

      // Fallback to TanStack Start createServerFn RPC
      try {
        return await submitStudioInquiry({
          data: { ...payload, sourceSection: currentSection },
        });
      } catch (rpcErr) {
        console.error("[StudioAssistant] Inquiry RPC error:", rpcErr);
      }

      return {
        success: false,
        message:
          "Unable to connect to inquiry server. Please email your brief directly to Chaitya at octoberstills@gmail.com.",
        deliveryStatus: "unconfigured_fallback",
      };
    },
    [currentSection]
  );

  if (!visible) return null;

  return (
    <>
      <ChatbotLauncher isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <ChatbotPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSendMessage={handleSendMessage}
        onSubmitInquiry={handleSubmitInquiry}
        currentSection={currentSection}
      />
    </>
  );
}
