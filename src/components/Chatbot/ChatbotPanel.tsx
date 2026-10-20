import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  Info,
} from "lucide-react";
import { InquiryFormCard } from "./InquiryFormCard";
import type { ChatMessage, ChatResponsePayload } from "../../lib/gemini-service";
import type { InquirySubmissionPayload, InquiryResponse } from "../../lib/lead-storage";
import {
  getActiveConversation,
  saveConversation,
  createNewConversation,
  clearConversationHistory,
  extractProjectSummary,
  generateMessageId,
  type StoredConversation,
  type StoredChatMessage,
  type ProjectSummary,
  DEFAULT_RETENTION_DAYS,
} from "../../lib/conversation-store";

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (
    messages: ChatMessage[],
    projectSummary?: ProjectSummary,
    conversationId?: string
  ) => Promise<ChatResponsePayload>;
  onSubmitInquiry: (payload: InquirySubmissionPayload) => Promise<InquiryResponse>;
  currentSection?: string;
}

const DEFAULT_SUGGESTIONS = [
  "Explore the work",
  "Discuss a project",
  "Ask a question",
];

const INITIAL_WELCOME =
  "Welcome to Oktober Notes. Have a project in mind, or just exploring? I'm here to help you connect with Octoberstills.";


export function ChatbotPanel({
  isOpen,
  onClose,
  onSendMessage,
  onSubmitInquiry,
  currentSection,
}: ChatbotPanelProps) {
  const [conversation, setConversation] = useState<StoredConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [isRestoredFromMemory, setIsRestoredFromMemory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showNewConfirm, setShowNewConfirm] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or restore persistent conversation on mount
  useEffect(() => {
    let isMounted = true;

    async function initMemory() {
      try {
        const stored = await getActiveConversation();
        if (!isMounted) return;

        if (stored && stored.messages && stored.messages.length > 0) {
          // Existing active conversation found!
          // NEVER show the initial welcome greeting again if an active conversation already exists!
          const userHasSpoken = stored.messages.some((m) => m.role === "user");
          const threadMessages = userHasSpoken
            ? stored.messages.filter(
                (m) =>
                  m.content !== INITIAL_WELCOME &&
                  !m.content.startsWith("Hello, welcome to Octoberstills")
              )
            : [{ id: "welcome_init", role: "assistant" as const, content: INITIAL_WELCOME, timestamp: Date.now() }];

          setConversation({
            ...stored,
            messages: threadMessages,
          });
          setMessages(threadMessages.map((m) => ({ role: m.role, content: m.content })));
          setIsRestoredFromMemory(userHasSpoken);
          setShowInquiryForm(stored.inquiryStage === "brief_ready");

          // Tailor suggestions to current project stage
          if (stored.projectSummary?.services?.length > 0) {
            setSuggestions([
              "Share project brief",
              "Discuss a project",
              "Explore the work",
              "Ask a question",
            ]);
          }

        } else {
          // No previous active conversation: initialize fresh session
          const fresh = await createNewConversation();
          if (!isMounted) return;

          setConversation(fresh);
          const initialMsgs: ChatMessage[] = [
            {
              role: "assistant",
              content: INITIAL_WELCOME,
            },
          ];
          setMessages(initialMsgs);
          setIsRestoredFromMemory(false);
        }
      } catch (err) {
        console.warn("[ChatbotPanel] Memory restoration error, fallback to memory:", err);
        const fallbackId = `conv_${Date.now()}`;
        setConversation({
          id: fallbackId,
          createdAt: Date.now(),
          lastActive: Date.now(),
          messages: [],
          projectSummary: { services: [], notes: [], updatedAt: Date.now() },
          inquiryStage: "exploration",
          servicesInterested: [],
          detailsAlreadySupplied: {},
        });
        setMessages([{ role: "assistant", content: INITIAL_WELCOME }]);
      }
    }

    initMemory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, showInquiryForm, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showClearConfirm || showNewConfirm || showPrivacyInfo) {
          setShowClearConfirm(false);
          setShowNewConfirm(false);
          setShowPrivacyInfo(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose, showClearConfirm, showNewConfirm, showPrivacyInfo]);

  // Save changes to persistent storage
  const persistConversationState = useCallback(
    async (
      updatedMsgs: ChatMessage[],
      updatedSummary?: ProjectSummary,
      stage?: StoredConversation["inquiryStage"]
    ) => {
      if (!conversation) return;

      const userHasSpoken = updatedMsgs.some((m) => m.role === "user");
      const msgsToStore = userHasSpoken
        ? updatedMsgs.filter((m) => m.content !== INITIAL_WELCOME)
        : updatedMsgs;

      const storedMessages: StoredChatMessage[] = msgsToStore.map((m, idx) => ({
        id: `msg_${idx}_${Date.now()}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: Date.now(),
      }));

      const updatedConv: StoredConversation = {
        ...conversation,
        messages: storedMessages,
        projectSummary: updatedSummary || conversation.projectSummary,
        inquiryStage: stage || conversation.inquiryStage,
        servicesInterested: updatedSummary?.services || conversation.servicesInterested,
        lastActive: Date.now(),
      };

      setConversation(updatedConv);
      await saveConversation(updatedConv);
    },
    [conversation]
  );

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isLoading) return;

    // Check if user clicked on-page navigation action
    if (
      text.toLowerCase() === "explore the work" ||
      text.toLowerCase() === "view selected work" ||
      text.toLowerCase() === "view photography work"
    ) {
      const el = document.getElementById("work");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (text.toLowerCase() === "explore services") {
      const el = document.getElementById("services");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (text.toLowerCase() === "contact chaitya") {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }

    // Check if user clicked an inquiry action
    if (
      text.toLowerCase() === "discuss a project" ||
      text.toLowerCase() === "submit a project brief" ||
      text.toLowerCase() === "share project brief"
    ) {
      const updatedMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: text },
        {
          role: "assistant",
          content:
            "Wonderful. You can outline your project brief below, and it will be sent directly to Chaitya Shah for review.",
        },
      ];
      setMessages(updatedMessages);
      setInputText("");
      setShowInquiryForm(true);
      setSuggestions(["Explore the work", "Ask a question", "Contact Chaitya"]);
      persistConversationState(updatedMessages, conversation?.projectSummary, "brief_ready");
      return;
    }

    // Check if user clicked "ask a question"
    if (text.toLowerCase() === "ask a question") {
      const updatedMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: text },
        {
          role: "assistant",
          content:
            "I'm here to help. What would you like to know about Octoberstills' creative work, services, or collaboration process?",
        },
      ];
      setMessages(updatedMessages);
      setInputText("");
      setSuggestions(["Explore the work", "Discuss a project", "Explore services"]);
      persistConversationState(updatedMessages, conversation?.projectSummary);
      return;
    }

    // 1. Extract and update structured project requirements from the visitor's statement
    const currentSummary = conversation?.projectSummary;
    const updatedSummary = extractProjectSummary(text, currentSummary);

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    // Save user message immediately to IndexedDB
    await persistConversationState(newMessages, updatedSummary);

    try {
      // 2. Send only recent conversation turns (last 6) + structured project summary to minimize tokens and latency
      const recentTurns = newMessages.slice(-6);
      const response = await onSendMessage(recentTurns, updatedSummary, conversation?.id);

      const finalizedMessages: ChatMessage[] = [
        ...newMessages,
        {
          role: "assistant",
          content: response.reply,
        },
      ];
      setMessages(finalizedMessages);

      if (response.suggestedActions && response.suggestedActions.length > 0) {
        setSuggestions(response.suggestedActions);
      } else {
        setSuggestions(DEFAULT_SUGGESTIONS);
      }

      let nextStage = conversation?.inquiryStage || "exploration";
      if (
        response.detectedIntent === "ready_to_inquire" ||
        response.detectedIntent === "high_intent"
      ) {
        setShowInquiryForm(true);
        nextStage = "brief_ready";
      }

      // Persist full conversation with assistant reply to IndexedDB
      await persistConversationState(finalizedMessages, updatedSummary, nextStage);
    } catch {
      const errorMessages: ChatMessage[] = [
        ...newMessages,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again shortly, or email your project details to octoberstills@gmail.com.",
        },
      ];
      setMessages(errorMessages);
      setSuggestions(["Email Studio Directly", "View Selected Work"]);
      await persistConversationState(errorMessages, updatedSummary);
    } finally {
      setIsLoading(false);
    }
  };

  // Start new conversation handler
  const handleStartNewConversation = async () => {
    setShowNewConfirm(false);
    setIsLoading(true);

    try {
      const fresh = await createNewConversation();
      setConversation(fresh);
      const initialMsgs: ChatMessage[] = [
        {
          role: "assistant",
          content: INITIAL_WELCOME,
        },
      ];
      setMessages(initialMsgs);
      setShowInquiryForm(false);
      setSuggestions(DEFAULT_SUGGESTIONS);
      setIsRestoredFromMemory(false);
    } catch (err) {
      console.error("[ChatbotPanel] Error starting new conversation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history handler (with confirmation)
  const handleClearHistory = async () => {
    setShowClearConfirm(false);
    setIsLoading(true);

    try {
      await clearConversationHistory();
      const fresh = await createNewConversation();
      setConversation(fresh);
      const initialMsgs: ChatMessage[] = [
        {
          role: "assistant",
          content: INITIAL_WELCOME,
        },
      ];
      setMessages(initialMsgs);
      setShowInquiryForm(false);
      setSuggestions(DEFAULT_SUGGESTIONS);
      setIsRestoredFromMemory(false);
    } catch (err) {
      console.error("[ChatbotPanel] Error clearing conversation history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format relative timestamp for resumed indicator
  const getLastActiveText = () => {
    if (!conversation?.lastActive) return "";
    const date = new Date(conversation.lastActive);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (isToday) return `Today at ${timeStr}`;
    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Oktober Notes"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          if (showClearConfirm || showNewConfirm || showPrivacyInfo) {
            setShowClearConfirm(false);
            setShowNewConfirm(false);
            setShowPrivacyInfo(false);
            return;
          }
          onClose();
        }
      }}
      className="fixed z-[10020] bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-[420px] h-[100dvh] sm:h-[640px] sm:max-h-[85vh] bg-[#F3EADF] text-[#30231D] sm:rounded-2xl border border-[#30231D]/15 shadow-2xl flex flex-col overflow-hidden font-sans animate-in slide-in-from-bottom-6 duration-300"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Studio Header */}
      <div className="relative px-4 sm:px-5 py-3.5 bg-[#30231D] text-[#F3EADF] border-b border-[#B9784E]/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Autumn Leaf Icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#B9784E]/40 bg-[#251b16] flex items-center justify-center p-1 shrink-0 shadow-xs">
            <img
              src="/oktober-notes/leaf-icon-32.png"
              alt="Oktober Notes"
              width={32}
              height={32}
              className="w-full h-full object-contain select-none"
              loading="eager"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="text-base sm:text-lg leading-tight font-medium text-[#F3EADF] tracking-wide"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}
              >
                Oktober Notes
              </h3>
              {/* Unobtrusive AI disclosure */}
              <span
                className="px-1.5 py-0.2 text-[9px] uppercase tracking-wider text-[#D5B99C] bg-[#B9784E]/20 border border-[#B9784E]/30 rounded font-medium"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                AI
              </span>
            </div>
            <p
              className="text-[11px] sm:text-xs text-[#D5B99C]/90 italic font-normal leading-tight truncate"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              A little space for big ideas.
            </p>
          </div>
        </div>

        {/* Conversation Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Start New Conversation Button */}
          <button
            type="button"
            onClick={() => {
              if (messages.length > 1) {
                setShowNewConfirm(true);
              } else {
                handleStartNewConversation();
              }
            }}
            title="Start new conversation"
            aria-label="Start new conversation"
            className="p-1.5 rounded-full text-[#F3EADF]/70 hover:text-[#F3EADF] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Clear History Button */}
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            title="Clear conversation history"
            aria-label="Clear conversation history"
            className="p-1.5 rounded-full text-[#F3EADF]/70 hover:text-[#F3EADF] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Privacy & Storage Info */}
          <button
            type="button"
            onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
            title="Memory and privacy information"
            aria-label="Memory and privacy information"
            className="p-1.5 rounded-full text-[#F3EADF]/70 hover:text-[#F3EADF] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Close Panel Button */}
          <button
            type="button"
            onClick={onClose}
            title="Close Oktober Notes"
            aria-label="Close Oktober Notes"
            className="p-1.5 rounded-full text-[#F3EADF]/80 hover:text-[#F3EADF] hover:bg-white/10 transition-colors ml-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Start New Conversation */}
      {showNewConfirm && (
        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#30231D]/15 rounded-xl p-5 shadow-xl max-w-[340px] text-center space-y-3 animate-in zoom-in-95 duration-150">
            <h4
              className="text-lg font-light text-[#30231D]"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Start New Conversation?
            </h4>
            <p className="text-xs text-[#30231D]/70 leading-relaxed">
              Your ongoing project notes will be reset for a fresh inquiry.
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowNewConfirm(false)}
                className="px-3 py-1.5 rounded-md text-xs border border-[#30231D]/20 text-[#30231D] hover:bg-black/5 transition-colors cursor-pointer"
              >
                Continue Current
              </button>
              <button
                type="button"
                data-action="confirm-start-new"
                onClick={handleStartNewConversation}
                className="px-3 py-1.5 rounded-md text-xs bg-[#30231D] text-[#F3EADF] hover:bg-[#B9784E] transition-colors cursor-pointer"
              >
                Start New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear History */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#30231D]/15 rounded-xl p-5 shadow-xl max-w-[340px] text-center space-y-3 animate-in zoom-in-95 duration-150">
            <h4
              className="text-lg font-light text-[#30231D]"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Clear Conversation History?
            </h4>
            <p className="text-xs text-[#30231D]/70 leading-relaxed">
              This permanently deletes your saved messages and project details from this browser. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-md text-xs border border-[#30231D]/20 text-[#30231D] hover:bg-black/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                data-action="confirm-clear-history"
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-md text-xs bg-[#B9784E] text-white hover:bg-[#a66940] transition-colors cursor-pointer font-medium"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Storage Info Popover */}
      {showPrivacyInfo && (
        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#30231D]/15 rounded-xl p-5 shadow-xl max-w-[350px] text-left space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#B9784E]">
                <ShieldCheck className="w-4 h-4" />
                <h4
                  className="text-base font-light text-[#30231D]"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  Browser Memory & Privacy
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyInfo(false)}
                className="text-[#30231D]/50 hover:text-[#30231D] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[11.5px] text-[#30231D]/75 space-y-2 leading-relaxed">
              <p>
                • <strong>30-Day Browser Memory:</strong> Your conversations and project requirements are stored privately in this browser (IndexedDB) for up to {DEFAULT_RETENTION_DAYS} days.
              </p>
              <p>
                • <strong>No Cross-Device Sync:</strong> Memory is confined to this specific browser and device profile.
              </p>
              <p>
                • <strong>Full Control:</strong> You can clear your local chat history anytime using the trash icon in the header.
              </p>
              <p>
                • <strong>Server Security:</strong> API keys remain isolated exclusively on our secure server.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyInfo(false)}
              className="w-full py-1.5 text-xs bg-[#30231D] text-[#F3EADF] rounded-md hover:bg-[#B9784E] transition-colors cursor-pointer mt-2"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Resumed Conversation Indicator */}
      {isRestoredFromMemory && messages.length > 0 && (
        <div className="px-4 py-2 bg-[#D5B99C]/30 border-b border-[#30231D]/10 flex items-center justify-between text-[11px] text-[#30231D]/75 shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#B9784E]" />
            <span>Resumed conversation · {getLastActiveText()}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowNewConfirm(true)}
            className="text-[10px] uppercase tracking-wider text-[#B9784E] hover:underline cursor-pointer font-medium"
          >
            New chat
          </button>
        </div>
      )}

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 text-sm">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
            >
              <div
                className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                  isUser
                    ? "bg-[#30231D] text-[#F3EADF] rounded-br-xs"
                    : "bg-[#FFFFFF] text-[#30231D] border border-[#30231D]/10 rounded-bl-xs shadow-xs"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Interactive Lead Submission Form Card */}
        {showInquiryForm && (
          <div className="pt-2">
            <InquiryFormCard
              initialProjectType={
                conversation?.projectSummary?.services?.[0] || "Photography"
              }
              sourceSection={currentSection || "chatbot"}
              onSubmit={async (payload) => {
                const res = await onSubmitInquiry(payload);
                if (res.success) {
                  persistConversationState(messages, conversation?.projectSummary, "submitted");
                }
                return res;
              }}
              onClose={() => setShowInquiryForm(false)}
            />
          </div>
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#30231D]/10 w-fit text-[#30231D]/60 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9784E] animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#B9784E] animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#B9784E] animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-[#30231D]/10 bg-[#F3EADF]/60 shrink-0">
          {suggestions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(action)}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-white/90 border border-[#30231D]/15 text-[#30231D] hover:bg-[#30231D] hover:text-[#F3EADF] transition-colors cursor-pointer"
            >
              <span>{action.replace(/\s*↗/g, "")}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 bg-[#FFFFFF] border-t border-[#30231D]/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder="Ask about creative direction, photography, or projects..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs md:text-sm bg-[#F3EADF]/40 border border-[#30231D]/15 rounded-full focus:outline-none focus:border-[#30231D] text-[#30231D] placeholder:text-[#30231D]/45"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
            className="p-2 rounded-full bg-[#30231D] text-[#F3EADF] hover:bg-[#B9784E] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 px-1 flex items-center justify-between text-[10px] text-[#30231D]/55">
          <button
            type="button"
            onClick={() => setShowPrivacyInfo(true)}
            className="flex items-center gap-1 hover:text-[#B9784E] transition-colors cursor-pointer"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#B9784E]" />
            <span>Oktober Notes · Private browser memory</span>
          </button>
          <a
            href="mailto:octoberstills@gmail.com"
            className="hover:text-[#B9784E] underline underline-offset-2"
          >
            octoberstills@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
