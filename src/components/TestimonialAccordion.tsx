import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TESTIMONIALS_DATA, type TestimonialItem } from "../data/testimonials";

interface TestimonialAccordionProps {
  testimonials?: TestimonialItem[];
}

export function TestimonialAccordion({
  testimonials = TESTIMONIALS_DATA,
}: TestimonialAccordionProps) {
  // Ordered sequence of testimonial items
  // Initial order: [1, 2, 3, 4, 5] -> circular rotation: [2, 3, 4, 5, 1], etc.
  const [items, setItems] = useState<TestimonialItem[]>(testimonials);
  const itemsRef = useRef<TestimonialItem[]>(testimonials);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // The 4th visual position (0-based index 3) is expanded by default
  const [expandedIndex, setExpandedIndex] = useState(3);

  // Track the ID of the wrapped card and total wrap cycles to ensure fresh mounting at the right slot
  const [wrappedCardId, setWrappedCardId] = useState<string | null>(null);
  const [wrapCount, setWrapCount] = useState(0);

  // Exiting card at index 0 for smooth dissolution without flying across
  const [exitingCard, setExitingCard] = useState<{
    item: TestimonialItem;
    width: number;
    height: number;
  } | null>(null);

  // Mobile active index
  const [mobileIndex, setMobileIndex] = useState(3);

  // Interaction and pause states
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const isManuallyPausedRef = useRef(false);

  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);

  const [isFocused, setIsFocused] = useState(false);
  const isFocusedRef = useRef(false);

  const isInViewRef = useRef(true);
  const prefersReducedMotionRef = useRef(false);

  // Timer accumulation and cooldown refs
  const accumulatedTimeRef = useRef<number>(0);
  const pauseUntilRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    if (mq.matches) {
      setIsManuallyPaused(true);
      isManuallyPausedRef.current = true;
    }
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches) {
        setIsManuallyPaused(true);
        isManuallyPausedRef.current = true;
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver to pause when scrolled out of view
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Rotate circularly to the next sequence
  const rotateNext = useCallback(() => {
    const currentItems = itemsRef.current;
    if (!currentItems || currentItems.length === 0) return;

    // Measure first card dimensions for smooth left-side exit overlay
    if (containerRef.current) {
      const firstChild = containerRef.current.querySelector('button[role="tab"]') as HTMLElement;
      if (firstChild) {
        const rect = firstChild.getBoundingClientRect();
        setExitingCard({
          item: currentItems[0],
          width: rect.width,
          height: rect.height,
        });
      }
    }

    const exiting = currentItems[0];
    setWrappedCardId(exiting.id);
    setWrapCount((c) => c + 1);

    const nextItems = [...currentItems.slice(1), exiting];
    itemsRef.current = nextItems;
    setItems(nextItems);

    // The 4th visual position (index 3) automatically expands
    setExpandedIndex(3);

    // Synchronize mobile view to match
    setMobileIndex((prev) => (prev + 1) % testimonials.length);
    accumulatedTimeRef.current = 0;
  }, [testimonials.length]);

  // Main timer loop: steady 200ms tick that accumulates active time without tearing down on re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      // Check document visibility
      if (typeof document !== "undefined" && document.hidden) {
        // hidden
        return;
      }

      // Check user preference or manual pause
      if (isManuallyPausedRef.current || prefersReducedMotionRef.current) return;

      // Check hover or keyboard focus
      if (isHoveredRef.current || isFocusedRef.current) return;

      // Check viewport visibility
      if (!isInViewRef.current) return;

      // Check 10-second interaction cooldown
      const now = Date.now();
      if (now < pauseUntilRef.current) return;

      // Accumulate active time
      accumulatedTimeRef.current += 200;

      // Check 6-second rotation interval
      if (accumulatedTimeRef.current >= 6000) {
        accumulatedTimeRef.current = 0;
        rotateNext();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [rotateNext]);

  // Toggle play/pause manually from section header
  const togglePlayPause = () => {
    setIsManuallyPaused((prev) => {
      const next = !prev;
      isManuallyPausedRef.current = next;
      return next;
    });
  };

  // User click on desktop card: expand in place without reordering, pause for 10 seconds
  const handleCardClick = (index: number) => {
    setExpandedIndex(index);
    pauseUntilRef.current = Date.now() + 10000;
    accumulatedTimeRef.current = 0;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(index);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (expandedIndex + 1) % items.length;
      handleCardClick(nextIdx);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx = (expandedIndex === 0 ? items.length - 1 : expandedIndex - 1);
      handleCardClick(prevIdx);
    }
  };

  // Mobile navigation handlers (pause for 10 seconds on interaction)
  const handleMobilePrev = () => {
    setMobileIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    pauseUntilRef.current = Date.now() + 10000;
    accumulatedTimeRef.current = 0;
  };

  const handleMobileNext = () => {
    setMobileIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    pauseUntilRef.current = Date.now() + 10000;
    accumulatedTimeRef.current = 0;
  };

  const handleMobileDotClick = (idx: number) => {
    setMobileIndex(idx);
    pauseUntilRef.current = Date.now() + 10000;
    accumulatedTimeRef.current = 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleMobileNext();
    } else if (diff < -40) {
      handleMobilePrev();
    }
    touchStartX.current = null;
  };

  // Current active item for mobile view
  const mobileActiveItem = testimonials[mobileIndex] || testimonials[0];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative w-full pt-32 pb-20 sm:pt-36 sm:pb-28 md:py-36 px-6 sm:px-12 md:px-16 lg:px-24 overflow-hidden text-[#30231D]"
      style={{ backgroundColor: "#F3EADF" }}
      aria-label="Client Testimonials and Endorsements"
      onMouseEnter={() => {
        isHoveredRef.current = true;
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        setIsHovered(false);
      }}
      onFocusCapture={() => {
        isFocusedRef.current = true;
        setIsFocused(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          isFocusedRef.current = false;
          setIsFocused(false);
        }
      }}
    >
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#30231D]/15">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9784E]" />
              <span
                className="text-[11px] md:text-[12px] uppercase font-medium tracking-[0.28em] text-[#30231D]/80"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                A FEW KIND WORDS
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#30231D] tracking-tight leading-[1.08]"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Stories, through their eyes.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 max-w-md">
            <p
              className="text-xs sm:text-sm text-[#30231D]/70 leading-relaxed font-sans"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Unfiltered words from creative directors, founders, and marketing leaders who entrusted their vision to Octoberstills.
            </p>

            {/* Accessibility & Rotation Control Button */}
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isManuallyPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
              aria-pressed={isManuallyPaused}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#30231D]/20 text-[11px] uppercase tracking-wider text-[#30231D]/80 hover:text-[#30231D] hover:border-[#30231D]/40 transition-colors cursor-pointer"
            >
              {isManuallyPaused ? (
                <>
                  <Play className="w-3 h-3 text-[#B9784E] fill-current" />
                  <span>Play</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-[#B9784E] fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Desktop & Tablet Horizontal Expanding Accordion (hidden on mobile) */}
        <div
          ref={containerRef}
          className="hidden md:flex gap-3 lg:gap-3.5 h-[420px] lg:h-[450px] w-full items-stretch select-none relative"
          role="tablist"
          aria-label="Client testimonials accordion"
        >
          {/* Smooth left-side exit overlay for wrapped card to prevent crossing */}
          <AnimatePresence>
            {exitingCard && (
              <motion.div
                key={`exit-${exitingCard.item.id}`}
                initial={{ opacity: 1, x: 0 }}
                animate={{ opacity: 0, x: -60 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                onAnimationComplete={() => setExitingCard(null)}
                className="absolute left-0 top-0 rounded-2xl overflow-hidden border border-[#30231D]/15 bg-[#251b16] pointer-events-none z-10"
                style={{
                  width: exitingCard.width,
                  height: exitingCard.height,
                }}
              >
                <img
                  src={exitingCard.item.image}
                  alt={exitingCard.item.imageAlt}
                  className="w-full h-full object-cover object-center opacity-85"
                  style={{ objectPosition: exitingCard.item.imagePosition || "center center" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center justify-center whitespace-nowrap">
                  <span
                    className="text-[10px] font-sans uppercase tracking-[0.22em] font-medium text-[#F3EADF]/90"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {exitingCard.item.brand}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const isWrapped = item.id === wrappedCardId;
            const cardKey = isWrapped ? `${item.id}-wrap-${wrapCount}` : item.id;

            return (
              <motion.button
                key={cardKey}
                layout={!isWrapped ? "position" : false}
                initial={isWrapped ? { opacity: 0, x: 35 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.7,
                  ease: [0.25, 1, 0.5, 1],
                }}
                type="button"
                role="tab"
                id={`testimonial-tab-${item.id}`}
                aria-selected={isExpanded}
                aria-expanded={isExpanded}
                aria-controls={`testimonial-panel-${item.id}`}
                onClick={() => handleCardClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`Testimonial from ${item.clientName}, ${item.brand}`}
                className={`group relative rounded-2xl overflow-hidden border border-[#30231D]/15 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9784E] text-left transition-[flex-grow] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${
                  isExpanded
                    ? "bg-[#30231D] border-[#30231D]/40 shadow-md"
                    : "bg-[#251b16] hover:border-[#B9784E]/50"
                }`}
                style={{
                  flexGrow: isExpanded ? 5.5 : 1,
                  flexShrink: 1,
                  flexBasis: "0%",
                }}
              >
                {isExpanded ? (
                  /* Expanded Card: Left Text Area (56%) + Right Portrait Image (44%) */
                  <div
                    id={`testimonial-panel-${item.id}`}
                    className="flex h-full w-full overflow-hidden"
                  >
                    {/* Left Editorial Pull Quote Area */}
                    <div
                      className="w-[56%] h-full flex flex-col justify-between p-7 lg:p-9 text-[#F3EADF] bg-[#30231D] shrink-0 overflow-hidden"
                      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                    >
                      {/* Top: Category Tag & Editorial Quote */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B9784E]" />
                          <span className="text-[10px] lg:text-[11px] uppercase tracking-[0.24em] text-[#D5B99C] font-medium">
                            {item.discipline}
                          </span>
                        </div>

                        <blockquote
                          className="text-lg sm:text-xl lg:text-[23px] font-light leading-[1.32] text-[#F3EADF] line-clamp-6"
                          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                        >
                          “{item.quote}”
                        </blockquote>
                      </div>

                      {/* Bottom: Client Attribution */}
                      <div className="pt-4 border-t border-[#F3EADF]/15 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm lg:text-base font-medium tracking-wide text-[#F3EADF] truncate">
                            {item.clientName}
                          </h4>
                          <p className="text-[11px] lg:text-xs text-[#D5B99C] tracking-wide truncate">
                            {item.clientRole} ·{" "}
                            <span className="text-[#B9784E] font-medium">{item.brand}</span>
                          </p>
                        </div>

                        {item.verifiedLink && (
                          <span
                            className="inline-flex items-center text-[10px] uppercase tracking-wider text-[#D5B99C]/80 group-hover:text-[#F3EADF] transition-colors shrink-0"
                            title="View project in Selected Work"
                          >
                            <span className="hidden lg:inline text-[9px]">Featured Work</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Portrait Image */}
                    <div className="w-[44%] h-full relative overflow-hidden bg-[#201713] shrink-0">
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        className="w-full h-full object-cover object-center select-none transition-transform duration-700 ease-out group-hover:scale-105"
                        style={{ objectPosition: item.imagePosition || "center center" }}
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : (
                  /* Collapsed Card: Narrow vertical image panel with subtle vertical label (No serial numbers) */
                  <div className="relative h-full w-full overflow-hidden bg-[#201713]">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className="w-full h-full object-cover object-center select-none transition-transform duration-700 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-100"
                      style={{ objectPosition: item.imagePosition || "center center" }}
                      loading="lazy"
                    />

                    {/* Subtle bottom gradient to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Vertical brand/client label for easy scanning */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none whitespace-nowrap">
                      <span
                        className="text-[10px] font-sans uppercase tracking-[0.22em] font-medium text-[#F3EADF]/90 group-hover:text-[#F3EADF] transition-colors"
                        style={{
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                        }}
                      >
                        {item.brand}
                      </span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Mobile View: Single Testimonial Card with Prev/Next Controls (visible on mobile only) */}
        <div
          className="flex md:hidden flex-col gap-5 w-full select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card Presentation (No serial numbers badge) */}
          <div className="relative rounded-2xl overflow-hidden bg-[#30231D] text-[#F3EADF] border border-[#30231D]/15 shadow-md flex flex-col">
            {/* Top Portrait Image */}
            <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-[#201713]">
              <img
                src={mobileActiveItem.image}
                alt={mobileActiveItem.imageAlt}
                className="w-full h-full object-cover object-center"
                style={{ objectPosition: mobileActiveItem.imagePosition || "center center" }}
              />
            </div>

            {/* Bottom Content Area */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9784E]" />
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#D5B99C] font-medium">
                  {mobileActiveItem.discipline}
                </span>
              </div>

              <blockquote
                className="text-lg sm:text-xl font-light leading-[1.34] text-[#F3EADF]"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                “{mobileActiveItem.quote}”
              </blockquote>

              <div className="pt-3.5 border-t border-[#F3EADF]/15 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium tracking-wide text-[#F3EADF]">
                    {mobileActiveItem.clientName}
                  </h4>
                  <p className="text-xs text-[#D5B99C] tracking-wide">
                    {mobileActiveItem.clientRole} ·{" "}
                    <span className="text-[#B9784E] font-medium">{mobileActiveItem.brand}</span>
                  </p>
                </div>

                {mobileActiveItem.verifiedLink && (
                  <a
                    href={mobileActiveItem.verifiedLink}
                    className="px-3 py-1.5 rounded-full border border-[#F3EADF]/20 text-[#D5B99C] hover:text-[#F3EADF] hover:bg-white/5 transition-colors text-[10px] uppercase tracking-wider font-medium"
                    aria-label={`View ${mobileActiveItem.brand} work`}
                  >
                    Featured Work
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Controls & Pagination Dots */}
          <div className="flex items-center justify-between px-2 pt-1">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleMobileDotClick(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    mobileIndex === idx
                      ? "w-6 bg-[#B9784E]"
                      : "w-1.5 bg-[#30231D]/25 hover:bg-[#30231D]/45"
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMobilePrev}
                aria-label="Previous testimonial"
                className="p-2.5 rounded-full border border-[#30231D]/20 text-[#30231D] hover:bg-[#30231D] hover:text-[#F3EADF] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleMobileNext}
                aria-label="Next testimonial"
                className="p-2.5 rounded-full border border-[#30231D]/20 text-[#30231D] hover:bg-[#30231D] hover:text-[#F3EADF] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
