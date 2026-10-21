import React, { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ABOUT_POLAROIDS, type PolaroidItem } from "../data/aboutPolaroids";

gsap.registerPlugin(ScrollTrigger);

interface DraggablePolaroidProps {
  item: PolaroidItem;
  className?: string;
  style?: React.CSSProperties;
  isMobile?: boolean;
}

function DraggablePolaroid({
  item,
  className = "",
  style = {},
  isMobile = false,
}: DraggablePolaroidProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStateRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    pointerId: number | null;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    pointerId: null,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }
    };
  }, []);

  // Pointer Down (Start Drag)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only handle primary pointer (left mouse click or touch)
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const el = cardRef.current;
    if (!el) return;

    // 1. Cancel any active return timer for this card
    if (returnTimerRef.current) {
      clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }

    // 2. Interrupt any ongoing return animation immediately
    gsap.killTweensOf(el);

    // 3. Read current transform position
    const curX = (gsap.getProperty(el, "x") as number) || 0;
    const curY = (gsap.getProperty(el, "y") as number) || 0;

    // 4. Elevate z-index so active card rises above others
    el.style.zIndex = "50";

    // 5. Update state
    setIsDragging(true);
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: curX,
      currentY: curY,
      pointerId: e.pointerId,
    };

    // 6. Capture pointer for mouse immediately; for touch, capture once intentional drag threshold exceeded
    if (e.pointerType !== "touch") {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
    }

    // 7. Subtle drag lift/scale
    gsap.to(el, {
      scale: 1.04,
      duration: 0.2,
      ease: "power1.out",
    });
  };

  // Pointer Move (Dragging)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.isDragging || !cardRef.current) return;

    const deltaX = e.clientX - state.startX;
    const deltaY = e.clientY - state.startY;

    // On touch devices, if gesture is primarily vertical, release drag so page scrolls smoothly
    if (e.pointerType === "touch" && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      state.isDragging = false;
      setIsDragging(false);
      return;
    }

    if (e.pointerType === "touch" && Math.abs(deltaX) > 8 && state.pointerId !== null) {
      try {
        cardRef.current.setPointerCapture(state.pointerId);
      } catch {}
    }

    const newX = state.currentX + deltaX;
    const newY = state.currentY + deltaY;

    gsap.set(cardRef.current, {
      x: newX,
      y: newY,
    });
  };

  // Pointer Up / Cancel (Release at dropped location, hold for 3 seconds, then return)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.isDragging || !cardRef.current) return;

    const el = cardRef.current;
    state.isDragging = false;
    setIsDragging(false);

    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(el, { x: 0, y: 0, scale: 1 });
      el.style.zIndex = "";
      return;
    }

    // Settle scale to hover state (1.02)
    gsap.to(el, {
      scale: isHovered ? 1.025 : 1,
      duration: 0.25,
      ease: "power1.out",
    });

    // 1. Release at dropped location & keep stationary for exactly 3 seconds
    // 2. Each photograph has an independent inactivity timer
    returnTimerRef.current = setTimeout(() => {
      // Smoothly animate back to original position over 800ms with soft spring-like easing
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          if (el) {
            el.style.zIndex = "";
          }
          returnTimerRef.current = null;
        },
      });
    }, 3000);
  };

  const initialRotation = isMobile
    ? item.mobileRotation ?? item.rotation
    : item.rotation;

  return (
    <div
      className={`polaroid-outer-wrapper select-none ${className}`}
      style={{
        ...style,
        transform: `rotate(${initialRotation}deg)`,
      }}
    >
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => {
          if (!isDragging) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!isDragging) setIsHovered(false);
        }}
        className={`group relative bg-[#FAF8F5] p-2.5 sm:p-3 pb-8 sm:pb-9 rounded-[3px] border border-[#30231D]/12 select-none will-change-transform ${
          isDragging
            ? "cursor-grabbing shadow-[0_22px_45px_-8px_rgba(48,35,29,0.28),0_10px_20px_-4px_rgba(48,35,29,0.18)]"
            : isHovered
            ? "cursor-grab shadow-[0_14px_30px_-5px_rgba(48,35,29,0.18),0_5px_12px_-2px_rgba(48,35,29,0.12)] -translate-y-1.5 scale-[1.025]"
            : "cursor-grab shadow-[0_6px_20px_-3px_rgba(48,35,29,0.12),0_2px_6px_-2px_rgba(48,35,29,0.08)]"
        } transition-shadow transition-transform duration-300 ease-out`}
        style={{
          touchAction: "pan-y",
        }}
        title="Drag to inspect · releases and returns automatically"
      >
        {/* Photographic Framing (approx. 3:4) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px] bg-[#201713]/5">
          <img
            src={item.image}
            alt={item.alt}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        </div>

        {/* Polaroid Characteristic Bottom Chin with Subtle Editorial Caption */}
        {item.caption && (
          <div className="pt-2 px-1 text-center pointer-events-none select-none">
            <span
              className="text-[10px] sm:text-[11px] text-[#30231D]/75 tracking-wide italic font-serif leading-tight line-clamp-1"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              {item.caption}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function BehindTheLens() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const polaroidsContainerRef = useRef<HTMLDivElement>(null);

  // Entrance animation: plays only once per page load when section enters viewport
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          once: true,
        },
      });

      // 1. Reveal central text smoothly
      if (textRef.current) {
        tl.fromTo(
          textRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }
        );
      }

      // 2. Gently place Polaroids around the text
      const polaroids =
        polaroidsContainerRef.current?.querySelectorAll(".polaroid-outer-wrapper");
      if (polaroids && polaroids.length > 0) {
        tl.fromTo(
          polaroids,
          {
            opacity: 0,
            scale: 0.92,
            y: (i: number) => (i < 2 ? -24 : 24),
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: "power2.out",
          },
          "-=0.6"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      data-bg="#F3EADF"
      className="relative w-full py-28 md:py-36 lg:py-40 px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 overflow-hidden text-[#30231D] scroll-mt-24 md:scroll-mt-28"
      style={{ backgroundColor: "#F3EADF" }}
      aria-label="Behind the Lens — Chaitya Shah Biography"
    >
      {/* Subtle Autumn Botanical Leaf Shadow — Primary Leaf (Uncropped with complete stem in lower-right) */}
      <div
        aria-hidden="true"
        role="presentation"
        className="hidden md:block absolute right-8 lg:right-14 xl:right-20 bottom-8 lg:bottom-12 xl:bottom-14 pointer-events-none select-none z-0"
      >
        <img
          src="/assets/autumn-leaf.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-[270px] md:h-[290px] lg:h-[315px] w-auto max-w-none pointer-events-none select-none"
          style={{
            transform: "rotate(-18deg)",
            transformOrigin: "center center",
            opacity: 0.08,
            mixBlendMode: "multiply",
          }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Subtle Autumn Botanical Leaf Shadow — Upper-Left Leaf (Flipped horizontally & vertically) */}
      <div
        aria-hidden="true"
        role="presentation"
        className="hidden md:block absolute left-8 lg:left-14 xl:left-20 top-8 lg:top-12 xl:top-14 pointer-events-none select-none z-0"
      >
        <img
          src="/assets/autumn-leaf.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-[250px] md:h-[270px] lg:h-[295px] w-auto max-w-none pointer-events-none select-none"
          style={{
            transform: "scale(-1, -1) rotate(-18deg)",
            transformOrigin: "center center",
            opacity: 0.07,
            mixBlendMode: "multiply",
          }}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div
        ref={polaroidsContainerRef}
        className="max-w-7xl mx-auto relative min-h-[560px] md:min-h-[620px] lg:min-h-[660px] flex flex-col justify-center items-center"
      >
        {/* Desktop & Tablet Asymmetrical Corner Polaroids (4 Photographs) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          {ABOUT_POLAROIDS.map((item) => (
            <div
              key={item.id}
              className="absolute pointer-events-auto"
              style={{
                top: item.desktopPosition.top,
                bottom: item.desktopPosition.bottom,
                left: item.desktopPosition.left,
                right: item.desktopPosition.right,
              }}
            >
              <DraggablePolaroid
                item={item}
                className="w-[180px] lg:w-[215px] xl:w-[230px]"
              />
            </div>
          ))}
        </div>

        {/* Central Protected Biography Column (Never Obscured) */}
        <div
          ref={textRef}
          className="relative z-10 max-w-xl mx-auto text-center space-y-6 md:space-y-7 pointer-events-auto px-4"
        >
          {/* Eyebrow */}
          <div>
            <span
              className="text-[11px] md:text-[12px] uppercase font-medium tracking-[0.28em] text-[#30231D]/80"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Behind the Lens
            </span>
          </div>

          {/* Main Heading & Descriptor */}
          <div className="space-y-3">
            <h2
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-light leading-[1.05] tracking-tight text-[#30231D]"
              style={{
                fontFamily:
                  '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
              }}
            >
              Chaitya Shah
            </h2>
            <p
              className="text-[11px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.22em] text-[#B9784E] font-medium"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Creative Director · Cinematographer · Visual Storyteller
            </p>
          </div>

          {/* Controlled Concise Biography */}
          <div
            className="space-y-4 text-[#30231D]/85 font-normal text-[15px] sm:text-[16px] md:text-[17px] leading-[1.75]"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            <p>I&apos;m Chaitya, the creative eye behind Octoberstills.</p>

            <p className="text-[#30231D]/80">
              With over eight years of experience, I bring together creative
              direction, cinematography, and brand storytelling to create visuals
              that feel as intentional as they look.
            </p>

            <p className="text-[#30231D]/80">
              From cinematic films to thoughtful lifestyle imagery, I tell
              stories that connect, resonate, and leave a lasting impression.
            </p>
          </div>

          {/* Understated Editorial CTA */}
          <div className="pt-2 sm:pt-4">
            <a
              href="#contact"
              className="oct-inward-btn oct-inward-btn-dark inline-flex items-center justify-center rounded-full uppercase tracking-[0.2em] text-[11px] sm:text-[12px] px-8 py-3.5 font-medium cursor-pointer"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              <span>Let&apos;s Collaborate</span>
            </a>
          </div>
        </div>

        {/* Mobile Dedicated Composition (2 Polaroids Placed Below Biography Without Obstructing Reading) */}
        <div className="flex md:hidden items-center justify-center gap-4 sm:gap-6 pt-10 pb-2 z-10">
          <DraggablePolaroid
            item={ABOUT_POLAROIDS[0]}
            isMobile
            className="w-[145px] sm:w-[170px]"
          />
          <DraggablePolaroid
            item={ABOUT_POLAROIDS[1]}
            isMobile
            className="w-[150px] sm:w-[175px]"
          />
        </div>
      </div>
    </section>
  );
}
