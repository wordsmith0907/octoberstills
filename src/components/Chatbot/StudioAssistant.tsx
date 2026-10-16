import React, { useState, useEffect, useCallback } from "react";
import { ChatbotLauncher } from "./ChatbotLauncher";
import { ChatbotPanel } from "./ChatbotPanel";
import { chatWithStudioAssistant, submitStudioInquiry } from "../../lib/server-fns";
import type { ChatMessage, ChatResponsePayload } from "../../lib/gemini-service";
import type { InquirySubmissionPayload, InquiryResponse } from "../../lib/lead-storage";

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
      conversationId?: string
    ): Promise<ChatResponsePayload> => {
      // Primary: standard REST endpoint /api/chat
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            currentSection,
            projectSummary,
            conversationId,
          }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback to TanStack Start createServerFn RPC
        try {
          return await chatWithStudioAssistant({
            data: {
              messages,
              currentSection,
              projectSummary,
              conversationId,
            },
          });
        } catch (rpcErr) {
          console.error("[StudioAssistant] RPC fallback error:", rpcErr);
        }
      }

      return {
        reply:
          "Welcome to Oktober Notes. Chaitya's studio reviews all creative inquiries directly. Feel free to leave a project brief here or email octoberstills@gmail.com.",
        isFallback: true,
        suggestedActions: ["Explore the work", "Discuss a project", "Ask a question"],
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
      } catch {
        // Fallback to TanStack Start createServerFn RPC
        try {
          return await submitStudioInquiry({
            data: { ...payload, sourceSection: currentSection },
          });
        } catch (rpcErr) {
          console.error("[StudioAssistant] Inquiry RPC error:", rpcErr);
        }
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
