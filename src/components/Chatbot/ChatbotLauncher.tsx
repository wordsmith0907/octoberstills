import React from "react";
import { X } from "lucide-react";

interface ChatbotLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

export function ChatbotLauncher({
  isOpen,
  onToggle,
  unreadCount = 0,
}: ChatbotLauncherProps) {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[10006]">
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Close Oktober Notes" : "Open Oktober Notes"}
        aria-expanded={isOpen}
        title={isOpen ? "Close Oktober Notes" : "Oktober Notes — A little space for big ideas."}
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#30231D] text-[#F3EADF] border border-[#B9784E]/40 shadow-[0_8px_30px_rgba(48,35,29,0.35)] hover:bg-[#251b16] hover:border-[#B9784E] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[#F3EADF] transition-transform duration-200 group-hover:rotate-90" />
        ) : (
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
            <img
              src="/oktober-notes/leaf-icon-56.webp"
              alt="Oktober Notes"
              width={56}
              height={56}
              className="w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-105"
              loading="eager"
            />
            {/* Subtle warm status dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#B9784E] border border-[#30231D]" />
          </div>
        )}

        {/* Unread badge indicator */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#B9784E] text-[#F3EADF] text-[10px] font-semibold border border-[#30231D] shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

