import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import {
  updateNavbarTheme,
  getCurrentScrollBackgroundColor,
} from "./BackgroundColorTransitions";

// Exact 12 items matrix from Govardhan Art
const GOVARDHAN_ITEMS = [
  { id: 1, w: 633, h: 944, top: "-5.4vw", left: "-7.6vw", parallax: 1, parallaxPositive: false },
  { id: 2, w: 705, h: 489, top: "7.1vw", left: "-6.8vw", parallax: null, parallaxPositive: true },
  { id: 3, w: 523, h: 781, top: "-7vw", left: "2vw", parallax: 2, parallaxPositive: false },
  { id: 4, w: 523, h: 784, top: "4.2vw", left: "-2.1vw", parallax: null, parallaxPositive: true },
  { id: 5, w: 523, h: 784, top: "-8.7vw", left: "-2.1vw", parallax: 4, parallaxPositive: true },
  { id: 6, w: 507, h: 761, top: "9.2vw", left: "-4.3vw", parallax: 2, parallaxPositive: true },
  { id: 7, w: 451, h: 676, top: "-11.1vw", left: "10.4vw", parallax: 2, parallaxPositive: true },
  { id: 8, w: 375, h: 563, top: "-3.7vw", left: "13.2vw", parallax: 5, parallaxPositive: true },
  { id: 9, w: 523, h: 784, top: "-9vw", left: "-10.6vw", parallax: null, parallaxPositive: true },
  { id: 10, w: 422, h: 632, top: "7.1vw", left: "1.8vw", parallax: 2, parallaxPositive: false },
  { id: 11, w: 523, h: 370, top: "-8.2vw", left: "0.7vw", parallax: 3, parallaxPositive: true },
  { id: 12, w: 423, h: 620, top: "5.4vw", left: "3.3vw", parallax: null, parallaxPositive: true },
];

const GOVARDHAN_MEDIA = [
  "/hero-videos/hero-1.mp4", // Item 1 (Portrait: 633x944 - Coconut road)
  "/hero-videos/hero-horizontal-2.mp4", // Item 2 (Landscape: 705x489 - Chaitya in mountain forest with camera)
  "/hero-videos/hero-2.mp4", // Item 3 (Portrait: 523x781 - City of lakes architecture)
  "/hero-videos/hero-3.mp4", // Item 4 (Portrait: 523x784 - Flowing hair in nature)
  "/hero-videos/hero-4.mp4", // Item 5 (Portrait: 523x784 - Luxury handbag in garden)
  "/hero-videos/hero-5.mp4", // Item 6 (Portrait: 507x761 - Orchard twirl)
  "/hero-videos/hero-6.mp4", // Item 7 (Portrait: 451x676 - Silk shirt luxury UGC)
  "/hero-videos/hero-7.mp4", // Item 8 (Portrait: 375x563 - Mountain meadow sheep)
  "/hero-images/simons-vertical.jpg", // Item 9 (Portrait: 523x784 - Simon's Groot Constantia exterior)
  "/hero-videos/hero-8.mp4", // Item 10 (Portrait: 422x632 - Nature field walk)
  "/hero-images/maison-table.jpg", // Item 11 (Landscape: 523x370 - Maison Twenty Seven table spread)
  "/hero-videos/hero-9.mp4", // Item 12 (Portrait: 423x620 - Golden hour sunbeam editorial)
];

const LERP_FACTOR = 0.03;

function lerp(start: number, end: number) {
  return start + (end - start) * LERP_FACTOR;
}

interface ImageCardProps {
  w: number;
  h: number;
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

function ImageCard({ w, h, src, className, style }: ImageCardProps) {
  const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [isVideo, src]);

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className={`object-cover rounded-sm shadow-md pointer-events-none select-none ${className ?? ""}`}
        style={{
          aspectRatio: `${w}/${h}`,
          ...style,
          maxWidth: "none",
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="eager"
      className={`object-cover rounded-sm ${className ?? ""}`}
      style={{
        aspectRatio: `${w}/${h}`,
        ...style,
        maxWidth: "none",
      }}
    />
  );
}

// Changing animated words required in prompt
const HERO_WORDS = [
  "PHOTOGRAPHY",
  "FILMS",
  "CREATIVE DIRECTION",
  "UGC",
];

export interface GovardhanHeroProps {
  gridInView?: boolean;
}

export function GovardhanHero({ gridInView }: GovardhanHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const targetMouse = useRef({ x: 0.5, y: 0.5 });
  const smoothedMouse = useRef({ x: 0.5, y: 0.5 });
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsMapRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const startTimeRef = useRef<number | null>(null);
  const scaleRef = useRef(0.8);
  const opacityRef = useRef(0);
  const isIntroCompleteRef = useRef(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const isCtaHoveredRef = useRef(false);
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);

  // Smooth page-wide background color transition on hero CTA hover (#F3EADF -> #B9784E)
  const handleCtaHoverStart = useCallback(() => {
    if (typeof window === "undefined") return;
    // Prevent sticky hover states on touch devices
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    isCtaHoveredRef.current = true;
    setIsCtaHovered(true);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReduced ? 0 : 0.6;

    const pageContainer = document.getElementById("page-container");
    const quote = document.getElementById("quote");
    const targets = [stickyRef.current, pageContainer, quote, document.body].filter(Boolean) as HTMLElement[];

    gsap.killTweensOf(targets);
    gsap.to(targets, {
      backgroundColor: "#B9784E",
      duration,
      ease: "power2.out",
      overwrite: "auto",
    });
    updateNavbarTheme("#B9784E");
  }, []);

  const handleCtaHoverEnd = useCallback(() => {
    if (!isCtaHoveredRef.current) return;
    isCtaHoveredRef.current = false;
    setIsCtaHovered(false);

    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReduced ? 0 : 0.6;

    const pageContainer = document.getElementById("page-container");
    const quote = document.getElementById("quote");
    const targets = [stickyRef.current, pageContainer, quote, document.body].filter(Boolean) as HTMLElement[];

    const returnColor = getCurrentScrollBackgroundColor();

    gsap.killTweensOf(targets);
    gsap.to(targets, {
      backgroundColor: returnColor,
      duration,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        if (stickyRef.current) {
          stickyRef.current.style.backgroundColor = returnColor;
        }
      },
    });
    updateNavbarTheme(returnColor);
  }, []);

  // Cleanup on unmount if component unmounts while hovered
  useEffect(() => {
    return () => {
      if (isCtaHoveredRef.current) {
        handleCtaHoverEnd();
      }
    };
  }, [handleCtaHoverEnd]);

  // Word cycling index
  const [wordIndex, setWordIndex] = useState(0);

  // Interval for changing / animated words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % HERO_WORDS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Scroll animations exactly as Govardhan Art
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const springProgress = useSpring(scrollYProgress, {
    damping: 50,
    stiffness: 20,
    restDelta: 1e-4,
  });

  // Scattered images 3D transforms on scroll (exact Govardhan values)
  const y = useTransform(springProgress, [0, 1], ["0%", "-250%"]);
  const scale = useTransform(springProgress, [0, 1], [1, 1.3]);
  const blurVal = useTransform(springProgress, [0, 1], [0, 30]);
  const opacity = useTransform(springProgress, [0, 1], [1, 0]);
  const filter = useMotionTemplate`blur(${blurVal}px)`;

  // Exact Govardhan Art scroll disappearance trigger
  // Collapses when scrolling down, reverses back to expanded state when returning to top
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const isNowCollapsed = latest > 0.02;
    setIsCollapsed(isNowCollapsed);
    if (isNowCollapsed && isCtaHoveredRef.current) {
      handleCtaHoverEnd();
    }
  });

  const collapsed = gridInView || isCollapsed;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetMouse.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    function tick(now: number) {
      if (!isIntroCompleteRef.current) {
        if (startTimeRef.current === null) startTimeRef.current = now;
        const elapsed = now - startTimeRef.current;
        const introDelay = 800;
        const introDuration = 1400;

        if (elapsed < introDelay) {
          scaleRef.current = 0.8;
          opacityRef.current = 0;
        } else {
          const progress = Math.min((elapsed - introDelay) / introDuration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          scaleRef.current = 0.8 + 0.2 * eased;
          opacityRef.current = eased;
          if (progress >= 1) isIntroCompleteRef.current = true;
        }
      }

      const curr = smoothedMouse.current;
      const target = targetMouse.current;
      const smoothX = lerp(curr.x, target.x);
      const smoothY = lerp(curr.y, target.y);
      smoothedMouse.current = { x: smoothX, y: smoothY };

      const gridPanX = 20 - smoothX * 40;
      const gridPanY = 20 - smoothY * 40;

      if (gridRef.current) {
        const s = scaleRef.current;
        gridRef.current.style.transform = `translate3d(${gridPanX}vw, ${gridPanY}vw, 0px) scale3d(${s}, ${s}, 1)`;
        gridRef.current.style.opacity = String(opacityRef.current);
      }

      itemsMapRef.current.forEach((el, id) => {
        const itemConfig = GOVARDHAN_ITEMS.find((it) => it.id === id);
        if (!itemConfig || itemConfig.parallax === null) return;
        const D = itemConfig.parallax;
        const sign = itemConfig.parallaxPositive ? 1 : -1;
        const deltaX = sign * (D - smoothX * D * 2);
        const deltaY = sign * (D - smoothY * D * 2);
        el.style.transform = `translate3d(${deltaX}vw, ${deltaY}vw, 0)`;
      });

      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const registerItem = useCallback((id: number) => (el: HTMLDivElement | null) => {
    if (el) itemsMapRef.current.set(id, el);
    else itemsMapRef.current.delete(id);
  }, []);

  return (
    <>
      <div ref={containerRef} className="relative" style={{ height: "250vh" }}>
        <div
          ref={stickyRef}
          className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden"
          style={{
            backgroundColor: "#F3EADF",
          }}
        >
          {/* 3D Scattered Images on scroll - Exactly as Govardhan Art */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{
              y,
              scale,
              opacity,
              filter,
              transformStyle: "preserve-3d",
              willChange: "opacity, filter, transform",
            }}
          >
            <div
              ref={gridRef}
              className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-[15vw] lg:gap-[10vw] absolute"
              style={{
                gridTemplateRows: "auto auto",
                gridAutoColumns: "1fr",
                placeItems: "center stretch",
                opacity: 0,
                transform: "translate3d(0,0,0) scale3d(0.8, 0.8, 1)",
                willChange: "transform, opacity",
              }}
            >
              {GOVARDHAN_ITEMS.map((item) => (
                <div
                  key={item.id}
                  ref={registerItem(item.id)}
                  className="will-change-transform"
                  style={{ transform: "translate3d(0,0,0)" }}
                >
                  <ImageCard
                    w={item.w}
                    h={item.h}
                    src={GOVARDHAN_MEDIA[item.id - 1]}
                    className="w-[40vw] md:w-[30vw] lg:w-[20vw]"
                    style={{
                      maxWidth: "none",
                      position: "relative",
                      top: item.top,
                      left: item.left,
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Main Hero Copy Container - Placed after images in DOM so it naturally renders on top without isolated stacking context */}
          <div className="relative flex flex-col justify-start items-center text-center px-[7%] md:px-0 pointer-events-none">
            {/* 1. Main Heading: OCTOBERSTILLS in Cormorant Garamond */}
            <motion.div
              className="overflow-hidden"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              transition={{ delay: 0.1, duration: 0.7, ease: "easeInOut" }}
            >
              <div className="w-[90vw] max-w-[90vw] lg:max-w-[850px] flex items-center justify-center py-[2vw]">
                <h1
                  className="text-[clamp(2.5rem,7vw,5.5rem)] font-light tracking-[0.06em] leading-[1.0] text-balance select-none transition-colors duration-500 ease-out"
                  style={{
                    color: isCtaHovered ? "#F3EADF" : "#FFFFFF",
                    fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
                    letterSpacing: "0.08em",
                    fontVariantLigatures: "common-ligatures discretionary-ligatures",
                    mixBlendMode: isCtaHovered ? "normal" : "difference",
                  }}
                >
                  <span style={{ fontStyle: "italic", fontWeight: 400, marginRight: "0.02em" }}>O</span>
                  <span>CTOBERSTILL</span>
                  <span style={{ fontStyle: "italic", fontWeight: 400 }}>S</span>
                </h1>
              </div>
            </motion.div>

            {/* 2. Supporting Content (Divider, Discipline Words, Subheading, CTA) */}
            {/* Disappears seamlessly on scroll down, reappears when scrolling back to top */}
            <motion.div
              className="flex flex-col justify-start items-center overflow-hidden pointer-events-auto"
              initial={{ height: 0, opacity: 1 }}
              animate={{
                height: collapsed ? 0 : "auto",
                opacity: collapsed ? 0 : 1,
              }}
              transition={{
                height: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
                opacity: { duration: collapsed ? 0.35 : 0.6, ease: "easeOut" },
              }}
            >
              {/* Thin Divider Line */}
              <div
                className="flex items-center justify-center mt-[14px] mb-[22px] md:mb-[26px] lg:mb-[32px] transition-colors duration-500 ease-out"
                style={{
                  width: 54,
                  height: 1,
                  backgroundColor: isCtaHovered
                    ? "rgba(243, 234, 223, 0.35)"
                    : "rgba(48, 35, 29, 0.25)",
                }}
              >
                <div
                  className="transition-colors duration-500 ease-out"
                  style={{
                    width: 12,
                    height: 1,
                    backgroundColor: isCtaHovered ? "#F3EADF" : "#30231D",
                  }}
                />
              </div>

              {/* Animated / Changing word: PHOTOGRAPHY, FILMS, CREATIVE DIRECTION, UGC */}
              <div className="h-[28px] md:h-[32px] flex items-center justify-center overflow-hidden mb-[10px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={HERO_WORDS[wordIndex]}
                    initial={{ y: 22, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -22, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-[12px] md:text-[13px] tracking-[0.24em] uppercase font-medium select-none transition-colors duration-500 ease-out"
                    style={{
                      color: isCtaHovered ? "#F3EADF" : "#30231D",
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      opacity: isCtaHovered ? 0.95 : 0.85,
                    }}
                  >
                    {HERO_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Subheading: STORIES TOLD THROUGH LIGHT & FEELING */}
              <h5
                className="uppercase mb-[26px] md:mb-[30px] lg:mb-[36px] max-w-[420px] md:max-w-[480px] lg:max-w-[540px] text-[15px] md:text-[17px] lg:text-[19px] font-normal leading-[135%] select-none transition-colors duration-500 ease-out"
                style={{
                  color: isCtaHovered ? "#F3EADF" : "#30231D",
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  letterSpacing: "0.08em",
                  opacity: isCtaHovered ? 0.95 : 0.9,
                }}
              >
                Stories Told Through Light &amp; Feeling
              </h5>

              {/* CTA: LET'S CREATE with signature inward flood fill */}
              <button
                type="button"
                onClick={() => setConnectOpen(true)}
                onMouseEnter={handleCtaHoverStart}
                onMouseLeave={handleCtaHoverEnd}
                onFocus={handleCtaHoverStart}
                onBlur={handleCtaHoverEnd}
                className="oct-inward-btn oct-inward-btn-dark rounded-full uppercase tracking-[1.85px] text-[13px] lg:text-[14px] px-[36px] py-[18px] lg:px-[40px] lg:py-[20px] leading-[120%] font-medium cursor-pointer"
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  letterSpacing: "0.16em",
                }}
              >
                <span>LET&apos;S CREATE</span>
              </button>
            </motion.div>
          </div>

          {/* Scroll Indicator - Exactly as Govardhan Art */}
          <motion.div
            className="absolute bottom-[30px] z-50 flex flex-col justify-end items-center overflow-hidden pointer-events-none"
            initial={{ opacity: 0, height: "auto" }}
            animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
            transition={{
              opacity: { duration: collapsed ? 0.4 : 0.7, delay: collapsed ? 0 : 0.1, ease: "easeOut" },
              height: { duration: 0.4, ease: "easeInOut" },
            }}
          >
            <div
              className="overflow-hidden transition-colors duration-500 ease-out"
              style={{
                width: 1,
                height: 26,
                backgroundColor: isCtaHovered
                  ? "rgba(243, 234, 223, 0.35)"
                  : "rgba(48, 35, 29, 0.25)",
              }}
            >
              <motion.div
                className="transition-colors duration-500 ease-out"
                style={{
                  width: 1,
                  height: 26,
                  backgroundColor: isCtaHovered ? "#F3EADF" : "#30231D",
                }}
                animate={{ y: ["-100%", "-100%", "100%", "-120%"] }}
                transition={{
                  duration: 2.1,
                  times: [0, 0.33, 0.66, 0.67],
                  ease: ["easeInOut", "easeInOut", "easeInOut", "linear"],
                  repeat: Infinity,
                  repeatDelay: 0,
                }}
              />
            </div>
            <motion.span
              className="mt-3 text-[13px] uppercase font-medium leading-[120%] transition-colors duration-500 ease-out"
              style={{
                letterSpacing: "1.85px",
                fontFamily: '"DM Sans", system-ui, sans-serif',
                color: isCtaHovered ? "#F3EADF" : undefined,
                opacity: isCtaHovered ? 0.9 : undefined,
              }}
              animate={
                isCtaHovered
                  ? undefined
                  : {
                      color: [
                        "rgba(48,35,29,0.4)",
                        "rgba(48,35,29,0.4)",
                        "rgba(48,35,29,1)",
                        "rgba(48,35,29,0.4)",
                      ],
                    }
              }
              transition={{
                duration: 2.1,
                times: [0, 0.33, 0.66, 0.67],
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              Scroll
            </motion.span>
          </motion.div>
        </div>
      </div>
    </>
  );
}
