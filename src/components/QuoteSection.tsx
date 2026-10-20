import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const QUOTE_WORDS = [
  "It's",
  "not",
  "just",
  "about",
  "what",
  "you",
  "see.",
  "It's",
  "about",
  "what",
  "you",
  "feel.",
];

export function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      // Check prefers-reduced-motion
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const validWords = wordsRef.current.filter(Boolean) as HTMLSpanElement[];

      if (prefersReduced) {
        gsap.set(validWords, { color: "#30231D" });
        return;
      }

      // Initial state: all quote words begin in muted beige #C9BFB5
      gsap.set(validWords, { color: "#C9BFB5" });

      // ScrollTrigger scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 35%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Progressively reveal words from #C9BFB5 to #30231D with smooth transition
      tl.to(validWords, {
        color: "#30231D",
        stagger: 0.12,
        ease: "none",
        duration: 0.8,
      });

      // Refresh ScrollTrigger once fonts are ready
      if (typeof document !== "undefined" && document.fonts?.ready) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="quote"
      className="relative w-full pt-16 md:pt-24 lg:pt-28 pb-20 md:pb-28 lg:pb-36 px-6 sm:px-12 md:px-20 lg:px-32 overflow-hidden flex flex-col items-center justify-center text-center select-none"
      style={{ backgroundColor: "#F3EADF" }}
      aria-label="Editorial Quote"
    >
      {/* Flush background oversized quote mark (inspired by riteshphotos reference) */}
      <div
        className="absolute top-4 left-6 md:left-12 lg:left-24 text-[12rem] md:text-[18rem] lg:text-[24rem] leading-[0.6] select-none pointer-events-none opacity-[0.045] -z-0"
        style={{
          fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
          color: "#30231D",
        }}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      <div className="max-w-5xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Main quote typography - fully laid out in final position with zero layout shift */}
        <blockquote
          className="text-[clamp(2.2rem,4.8vw,4.4rem)] font-light leading-[1.28] tracking-[-0.01em] max-w-5xl mx-auto m-0"
          style={{
            fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
          }}
        >
          {/* Line 1: "It's not just about [Circle 1] what you see." */}
          <span className="inline md:block">
            {QUOTE_WORDS.slice(0, 4).map((word, i) => {
              const idx = i;
              return (
                <React.Fragment key={idx}>
                  <span
                    ref={(el) => {
                      wordsRef.current[idx] = el;
                    }}
                    className="quote-word inline-block will-change-[color]"
                    style={{ color: "#C9BFB5" }}
                  >
                    {word}
                  </span>
                  {" "}
                </React.Fragment>
              );
            })}
            {/* Circle 1 — Chaitya holding flower */}
            <span
              className="group relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 align-middle -translate-y-[0.06em] mx-2 sm:mx-2.5 md:mx-3 select-none pointer-events-auto w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] md:w-[58px] md:h-[58px]"
              style={{ borderRadius: "50%" }}
              aria-hidden="true"
            >
              <img
                src="/assets/chaitya-flower.png"
                alt="Chaitya Shah holding flower"
                width={58}
                height={58}
                className="w-full h-full object-cover will-change-transform transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] motion-reduce:transition-none"
                style={{
                  objectFit: "cover",
                  objectPosition: "46% 52%",
                }}
                loading="eager"
                draggable={false}
              />
            </span>
            {" "}
            {QUOTE_WORDS.slice(4, 7).map((word, i) => {
              const idx = 4 + i;
              return (
                <React.Fragment key={idx}>
                  <span
                    ref={(el) => {
                      wordsRef.current[idx] = el;
                    }}
                    className="quote-word inline-block will-change-[color]"
                    style={{
                      color: "#C9BFB5",
                      fontStyle: word === "see." ? "italic" : "normal",
                    }}
                  >
                    {word}
                  </span>
                  {i < 2 && " "}
                </React.Fragment>
              );
            })}
          </span>
          {" "}
          {/* Line 2: "It's about [Circle 2] what you feel." */}
          <span className="inline md:block mt-1 md:mt-2">
            {QUOTE_WORDS.slice(7, 9).map((word, i) => {
              const idx = 7 + i;
              return (
                <React.Fragment key={idx}>
                  <span
                    ref={(el) => {
                      wordsRef.current[idx] = el;
                    }}
                    className="quote-word inline-block will-change-[color]"
                    style={{ color: "#C9BFB5" }}
                  >
                    {word}
                  </span>
                  {" "}
                </React.Fragment>
              );
            })}
            {/* Circle 2 — Autumn foliage */}
            <span
              className="group relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 align-middle -translate-y-[0.06em] mx-2 sm:mx-2.5 md:mx-3 select-none pointer-events-auto w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] md:w-[48px] md:h-[48px]"
              style={{ borderRadius: "50%" }}
              aria-hidden="true"
            >
              <img
                src="/assets/autumn-foliage.png"
                alt="Autumn foliage"
                width={48}
                height={48}
                className="w-full h-full object-cover will-change-transform transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] motion-reduce:transition-none"
                style={{
                  objectFit: "cover",
                  objectPosition: "61% 30%",
                }}
                loading="eager"
                draggable={false}
              />
            </span>
            {" "}
            {QUOTE_WORDS.slice(9, 12).map((word, i) => {
              const idx = 9 + i;
              return (
                <React.Fragment key={idx}>
                  <span
                    ref={(el) => {
                      wordsRef.current[idx] = el;
                    }}
                    className="quote-word inline-block will-change-[color]"
                    style={{
                      color: "#C9BFB5",
                      fontStyle: word === "feel." ? "italic" : "normal",
                      fontWeight: word === "feel." ? 400 : 300,
                    }}
                  >
                    {word}
                  </span>
                  {i < 2 && " "}
                </React.Fragment>
              );
            })}
          </span>
        </blockquote>

        {/* 3. Subtle editorial attribution */}
        <cite
          className="block mt-10 md:mt-14 text-[13px] md:text-[15px] tracking-[0.2em] uppercase font-medium not-italic text-[#30231D]/60 select-none"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
          ~ CHAITYA SHAH
        </cite>
      </div>
    </section>
  );
}
