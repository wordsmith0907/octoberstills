import React, { useState, useRef, useCallback } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS_DATA, type TestimonialItem } from "../data/testimonials";

interface TestimonialAccordionProps {
  testimonials?: TestimonialItem[];
}

export function TestimonialAccordion({
  testimonials = TESTIMONIALS_DATA,
}: TestimonialAccordionProps) {
  // First card expanded by default (index 0)
  const [activeIndex, setActiveIndex] = useState(0);

  // Touch gesture support for mobile
  const touchStartX = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, [testimonials.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  }, [testimonials.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveIndex(index);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    }
  };

  const activeItem = testimonials[activeIndex] || testimonials[0];

  return (
    <section
      id="testimonials"
      className="relative w-full pt-32 pb-20 sm:pt-36 sm:pb-28 md:py-36 px-6 sm:px-12 md:px-16 lg:px-24 overflow-hidden text-[#30231D]"
      style={{ backgroundColor: "#F3EADF" }}
      aria-label="Client Testimonials and Endorsements"
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

          <p
            className="text-xs sm:text-sm text-[#30231D]/70 max-w-md leading-relaxed font-sans"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            Unfiltered words from creative directors, founders, and marketing leaders who entrusted their vision to Octoberstills.
          </p>
        </div>

        {/* Desktop & Tablet Horizontal Expanding Accordion (hidden on mobile) */}
        <div
          className="hidden md:flex gap-3 lg:gap-3.5 h-[420px] lg:h-[450px] w-full items-stretch select-none"
          role="tablist"
          aria-label="Client testimonials accordion"
        >
          {testimonials.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`testimonial-tab-${item.id}`}
                aria-selected={isActive}
                aria-expanded={isActive}
                aria-controls={`testimonial-panel-${item.id}`}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`Testimonial from ${item.clientName}, ${item.brand}`}
                className={`group relative rounded-2xl overflow-hidden border border-[#30231D]/15 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9784E] text-left transition-[flex-grow] duration-550 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${
                  isActive
                    ? "bg-[#30231D] border-[#30231D]/40 shadow-md"
                    : "bg-[#251b16] hover:border-[#B9784E]/50"
                }`}
                style={{
                  flexGrow: isActive ? 5.5 : 1,
                  flexShrink: 1,
                  flexBasis: "0%",
                }}
              >
                {isActive ? (
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
                            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#D5B99C]/80 group-hover:text-[#F3EADF] transition-colors shrink-0"
                            title="View project in Selected Work"
                          >
                            <span className="hidden lg:inline text-[9px]">Featured Work</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
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
                  /* Collapsed Card: Narrow vertical image panel with subtle vertical label */
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

                    {/* Subtle index badge at top */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
                      <span className="text-[10px] font-mono text-[#D5B99C]/80 font-medium">
                        0{index + 1}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile View: Single Testimonial Card with Prev/Next Controls (visible on mobile only) */}
        <div
          className="flex md:hidden flex-col gap-5 w-full select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card Presentation */}
          <div className="relative rounded-2xl overflow-hidden bg-[#30231D] text-[#F3EADF] border border-[#30231D]/15 shadow-md flex flex-col">
            {/* Top Portrait Image */}
            <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-[#201713]">
              <img
                src={activeItem.image}
                alt={activeItem.imageAlt}
                className="w-full h-full object-cover object-center"
                style={{ objectPosition: activeItem.imagePosition || "center center" }}
              />
              <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-mono text-[#F3EADF] border border-white/10">
                0{activeIndex + 1} / 0{testimonials.length}
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9784E]" />
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#D5B99C] font-medium">
                  {activeItem.discipline}
                </span>
              </div>

              <blockquote
                className="text-lg sm:text-xl font-light leading-[1.34] text-[#F3EADF]"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                “{activeItem.quote}”
              </blockquote>

              <div className="pt-3.5 border-t border-[#F3EADF]/15 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium tracking-wide text-[#F3EADF]">
                    {activeItem.clientName}
                  </h4>
                  <p className="text-xs text-[#D5B99C] tracking-wide">
                    {activeItem.clientRole} ·{" "}
                    <span className="text-[#B9784E] font-medium">{activeItem.brand}</span>
                  </p>
                </div>

                {activeItem.verifiedLink && (
                  <a
                    href={activeItem.verifiedLink}
                    className="p-2 rounded-full border border-[#F3EADF]/20 text-[#D5B99C] hover:text-[#F3EADF] hover:bg-white/5 transition-colors"
                    aria-label={`View ${activeItem.brand} work`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
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
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
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
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="p-2.5 rounded-full border border-[#30231D]/20 text-[#30231D] hover:bg-[#30231D] hover:text-[#F3EADF] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
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
