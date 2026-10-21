import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Discipline {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  poster?: string;
}

const DISCIPLINES: Discipline[] = [
  {
    id: "photography",
    number: "01",
    title: "Photography",
    subtitle: "Editorial portraiture, campaigns & architectural still life.",
    mediaType: "image",
    mediaSrc: "/hero-images/simons-vertical.webp",
  },
  {
    id: "cinematography",
    number: "02",
    title: "Films & Cinematography",
    subtitle: "Atmospheric brand films, motion poems & cinematic direction.",
    mediaType: "video",
    mediaSrc: "/ringview/5.mp4",
    poster: "/ringview/5-poster.webp",
  },
  {
    id: "ugc-content",
    number: "03",
    title: "UGC & Brand Content",
    subtitle: "Tactile creator storytelling, organic aesthetic & luxury social reels.",
    mediaType: "video",
    mediaSrc: "/ringview/7.mp4",
    poster: "/ringview/7-poster.webp",
  },
];

export function CreativeDisciplines() {
  const sectionRef = useRef<HTMLElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const c1 = card1Ref.current;
        const c2 = card2Ref.current;
        const c3 = card3Ref.current;
        if (!c1 || !c2 || !c3) return;

        // Calculate card height and strip offset (approximately 6–7% of card height)
        const updateStacking = () => {
          const cardH = c1.offsetHeight || 300;
          const strip = Math.max(18, Math.round(cardH * 0.065));
          const viewportH = window.innerHeight;

          // Initial positions: Card 1 stationary; Cards 2 & 3 off-screen below
          gsap.set(c1, { y: 0, zIndex: 10 });
          gsap.set(c2, { y: viewportH + 60, zIndex: 20 });
          gsap.set(c3, { y: viewportH * 1.5 + 60, zIndex: 30 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=1600",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: 1,
            },
          });

          // Stage 1: Card 1 settled and stationary
          tl.to({}, { duration: 0.1 });

          // Stage 2: Card 2 rises directly over Card 1, settling at strip offset
          tl.to(c2, {
            y: strip,
            ease: "power1.inOut",
            duration: 0.8,
          });

          // Brief settling pause for Card 2
          tl.to({}, { duration: 0.15 });

          // Stage 3: Card 3 rises directly over Card 2, settling at 2 * strip offset
          tl.to(c3, {
            y: strip * 2,
            ease: "power1.inOut",
            duration: 0.8,
          });

          // Settling pause so Card 3 is fully appreciated before unpinning
          tl.to({}, { duration: 0.25 });
        };

        updateStacking();
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-24 px-5 sm:px-12 md:px-20 lg:px-28 overflow-hidden text-[#30231D] scroll-mt-20 md:scroll-mt-24"
      style={{ backgroundColor: "#D5B99C" }}
      aria-label="Creative Disciplines"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto pb-6 sm:pb-8 md:pb-10 border-b border-[#30231D]/15">
          <div>
            <span
              className="text-[11px] md:text-[12px] uppercase font-medium tracking-[0.28em] text-[#30231D]/75"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Ways of Seeing
            </span>
          </div>

          <h2
            className="text-[clamp(2.15rem,5.5vw,4.5rem)] font-light text-[#30231D] tracking-tight leading-[1.05]"
            style={{
              fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
            }}
          >
            Creative Disciplines
          </h2>

          <p
            className="text-[13px] sm:text-[14px] md:text-[15px] text-[#30231D]/70 font-normal max-w-md mx-auto"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            Still and moving image shaped with quiet intention.
          </p>
        </div>

        {/* =====================================================================
            DESKTOP & TABLET LAYOUT (>= 768px): Exact Existing 3-Column Grid
            ===================================================================== */}
        <div className="hidden md:grid mt-10 md:mt-14 grid-cols-1 md:grid-cols-3 gap-8 xl:gap-10">
          {DISCIPLINES.map((discipline, idx) => (
            <motion.div
              key={discipline.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.7,
                delay: idx * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="h-full"
            >
              <div className="discipline-card group flex flex-col cursor-pointer h-full">
                {/* Large Portrait Photograph / Video Window (Strict 4:5 ratio) */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] bg-[#30231D]/10">
                  {discipline.mediaType === "image" ? (
                    <img
                      src={discipline.mediaSrc}
                      alt={discipline.title}
                      className="discipline-card-media w-full h-full object-cover motion-reduce:transform-none"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={discipline.mediaSrc}
                      poster={discipline.poster}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="discipline-card-media w-full h-full object-cover motion-reduce:transform-none"
                    />
                  )}
                </div>

                {/* Number and Title beneath Photograph */}
                <div className="pt-4 md:pt-5 space-y-1.5">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-[12px] md:text-[13px] font-medium tracking-[0.22em] text-[#30231D]/60 group-hover:text-[#B9784E] transition-colors duration-300 select-none"
                      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                    >
                      {discipline.number}
                    </span>
                    <span className="text-[#30231D]/25 font-light select-none">/</span>
                    <h3
                      className="text-[clamp(1.4rem,2vw,1.9rem)] font-light text-[#30231D] tracking-tight leading-tight group-hover:text-[#B9784E] transition-colors duration-300"
                      style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                    >
                      {discipline.title}
                    </h3>
                  </div>

                  <p
                    className="text-[13px] md:text-[14px] text-[#30231D]/70 font-light leading-relaxed pl-8 md:pl-9"
                    style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                  >
                    {discipline.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* =====================================================================
            MOBILE LAYOUT (< 768px): Pinned Card Stacking Stage
            ===================================================================== */}
        <div className="block md:hidden mt-6 relative w-full max-w-sm mx-auto h-[410px] sm:h-[440px]">
          {/* Card 1: Photography */}
          <div
            ref={card1Ref}
            className="cd-mobile-card absolute top-0 left-0 right-0 w-full rounded-2xl bg-[#F3EADF] border border-[#30231D]/15 p-4 shadow-[0_12px_32px_-6px_rgba(48,35,29,0.16)] flex flex-col"
          >
            {/* Number and Title */}
            <div className="flex items-baseline gap-2.5 pb-1">
              <span
                className="text-[11.5px] font-medium tracking-[0.22em] text-[#B9784E] select-none"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                01
              </span>
              <span className="text-[#30231D]/25 font-light select-none">/</span>
              <h3
                className="text-[1.35rem] font-light text-[#30231D] tracking-tight leading-tight"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                Photography
              </h3>
            </div>

            <p
              className="text-[12px] text-[#30231D]/75 font-normal leading-relaxed pb-2.5 pl-6"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Editorial portraiture, campaigns & architectural still life.
            </p>

            {/* Media Window */}
            <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden rounded-xl bg-[#30231D]/10">
              <img
                src="/hero-images/simons-vertical.webp"
                alt="Photography"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 2: Films & Cinematography */}
          <div
            ref={card2Ref}
            className="cd-mobile-card absolute top-0 left-0 right-0 w-full rounded-2xl bg-[#F3EADF] border border-[#30231D]/15 p-4 shadow-[0_14px_36px_-6px_rgba(48,35,29,0.20)] flex flex-col"
          >
            {/* Number and Title */}
            <div className="flex items-baseline gap-2.5 pb-1">
              <span
                className="text-[11.5px] font-medium tracking-[0.22em] text-[#B9784E] select-none"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                02
              </span>
              <span className="text-[#30231D]/25 font-light select-none">/</span>
              <h3
                className="text-[1.35rem] font-light text-[#30231D] tracking-tight leading-tight"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                Films & Cinematography
              </h3>
            </div>

            <p
              className="text-[12px] text-[#30231D]/75 font-normal leading-relaxed pb-2.5 pl-6"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Atmospheric brand films, motion poems & cinematic direction.
            </p>

            {/* Media Window */}
            <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden rounded-xl bg-[#30231D]/10">
              <video
                src="/ringview/5.mp4"
                poster="/ringview/5-poster.webp"
                muted
                loop
                playsInline
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card 3: UGC & Brand Content */}
          <div
            ref={card3Ref}
            className="cd-mobile-card absolute top-0 left-0 right-0 w-full rounded-2xl bg-[#F3EADF] border border-[#30231D]/15 p-4 shadow-[0_16px_40px_-6px_rgba(48,35,29,0.24)] flex flex-col"
          >
            {/* Number and Title */}
            <div className="flex items-baseline gap-2.5 pb-1">
              <span
                className="text-[11.5px] font-medium tracking-[0.22em] text-[#B9784E] select-none"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                03
              </span>
              <span className="text-[#30231D]/25 font-light select-none">/</span>
              <h3
                className="text-[1.35rem] font-light text-[#30231D] tracking-tight leading-tight"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                UGC & Brand Content
              </h3>
            </div>

            <p
              className="text-[12px] text-[#30231D]/75 font-normal leading-relaxed pb-2.5 pl-6"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Tactile creator storytelling, organic aesthetic & luxury social reels.
            </p>

            {/* Media Window */}
            <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden rounded-xl bg-[#30231D]/10">
              <video
                src="/ringview/7.mp4"
                poster="/ringview/7-poster.webp"
                muted
                loop
                playsInline
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
