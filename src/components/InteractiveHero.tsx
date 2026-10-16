import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Hero images — scattered composition with parallax depth layers
// Inspired by Govardhan Art's interactive hero
// ---------------------------------------------------------------------------
interface HeroImage {
  src: string;
  alt: string;
  /** Position as percentage of viewport */
  x: number;
  y: number;
  /** Image dimensions in px */
  w: number;
  h: number;
  /** Rotation in degrees */
  rot: number;
  /** z-index for layering */
  z: number;
  /** Parallax depth factor — higher = more movement on cursor */
  depth: number;
}

const HERO_IMAGES: HeroImage[] = [
  // Top-left area
  {
    src: "/ringview/0.jpg",
    alt: "Photography by Chaitiya Shah",
    x: 6, y: 12, w: 220, h: 300, rot: -6, z: 3, depth: 0.03,
  },
  // Top-right area
  {
    src: "/ringview/2.jpg",
    alt: "Fashion photography",
    x: 68, y: 8, w: 200, h: 280, rot: 5, z: 5, depth: 0.05,
  },
  // Center-left
  {
    src: "/ringview/4.jpg",
    alt: "Lifestyle content",
    x: 2, y: 50, w: 190, h: 260, rot: 4, z: 2, depth: 0.02,
  },
  // Center-right
  {
    src: "/ringview/6.jpg",
    alt: "Hospitality photography",
    x: 72, y: 48, w: 210, h: 290, rot: -8, z: 4, depth: 0.04,
  },
  // Bottom-left
  {
    src: "/ringview/1-poster.jpg",
    alt: "Creative direction",
    x: 12, y: 72, w: 180, h: 240, rot: 8, z: 6, depth: 0.06,
  },
  // Bottom-right
  {
    src: "/ringview/3-poster.jpg",
    alt: "Film production",
    x: 64, y: 74, w: 195, h: 270, rot: -4, z: 7, depth: 0.035,
  },
  // Top-center overlap
  {
    src: "/ringview/5-poster.jpg",
    alt: "Fashion editorial",
    x: 34, y: 4, w: 170, h: 230, rot: -3, z: 8, depth: 0.045,
  },
  // Bottom-center
  {
    src: "/ringview/7-poster.jpg",
    alt: "Brand campaign",
    x: 38, y: 78, w: 185, h: 250, rot: 6, z: 1, depth: 0.025,
  },
];

// Scroll text sequence — changes as user scrolls through the hero
const SCROLL_WORDS = [
  { word: "Photographer", sub: "Capturing moments that tell stories" },
  { word: "Filmmaker", sub: "Moving images, moving hearts" },
  { word: "Creative Director", sub: "Vision brought to life" },
  { word: "Storyteller", sub: "Every frame has a narrative" },
];

export function InteractiveHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef(
    HERO_IMAGES.map(() => ({ x: 0, y: 0 }))
  );

  // ──── Cursor parallax ────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Normalize to -1..1 from center
    mousePos.current = {
      x: (e.clientX / vw - 0.5) * 2,
      y: (e.clientY / vh - 0.5) * 2,
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      imageRefs.current.forEach((el, i) => {
        if (!el) return;

        const cfg = HERO_IMAGES[i];
        const targetX = mousePos.current.x * cfg.depth * window.innerWidth;
        const targetY = mousePos.current.y * cfg.depth * window.innerHeight;

        // Smooth interpolation — the lag creates a physical depth feeling
        currentPos.current[i].x = lerp(currentPos.current[i].x, targetX, 0.08);
        currentPos.current[i].y = lerp(currentPos.current[i].y, targetY, 0.08);

        el.style.transform = `translate(${currentPos.current[i].x}px, ${currentPos.current[i].y}px) rotate(${cfg.rot}deg)`;
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [handleMouseMove]);

  // ──── Scroll-triggered text changes ──────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;

    if (!section || !titleEl || !subtitleEl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Pin the hero and animate text + images on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Animate through text changes with staggered image movements
      SCROLL_WORDS.forEach((item, i) => {
        const progress = i / SCROLL_WORDS.length;

        // Text change
        tl.to(
          {},
          {
            duration: 0.2,
            onStart: () => {
              // Crossfade text
              gsap.to(titleEl, {
                autoAlpha: 0,
                y: -20,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                  titleEl.textContent = item.word;
                  gsap.fromTo(
                    titleEl,
                    { autoAlpha: 0, y: 20 },
                    { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }
                  );
                },
              });
              gsap.to(subtitleEl, {
                autoAlpha: 0,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                  subtitleEl.textContent = item.sub;
                  gsap.to(subtitleEl, {
                    autoAlpha: 1,
                    duration: 0.3,
                    ease: "power2.out",
                  });
                },
              });
            },
          },
          progress
        );

        // Subtle image drift per scroll segment
        imageRefs.current.forEach((el, imgIdx) => {
          if (!el) return;
          const drift = (imgIdx % 2 === 0 ? 1 : -1) * 15 * (i + 1);
          tl.to(
            el,
            {
              y: drift,
              scale: 1 + (i % 2) * 0.05,
              duration: 0.25,
              ease: "none",
            },
            progress
          );
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // ──── Entrance animation ─────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Show everything immediately
      imageRefs.current.forEach((el) => {
        if (el) el.style.opacity = "1";
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Images fade/scale in on initial load
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          {
            autoAlpha: 0,
            scale: 0.85,
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.8,
            delay: 0.1 + i * 0.08,
            ease: "power2.out",
          }
        );
      });

      // Title entrance
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.5, ease: "power2.out" }
        );
      }
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.7, ease: "power2.out" }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="interactive-hero"
      id="work"
      aria-label="Interactive portfolio showcase"
    >
      {/* Scattered images with parallax */}
      <div ref={imagesContainerRef} className="hero-images-container">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            ref={(el) => {
              imageRefs.current[i] = el;
            }}
            className="hero-scattered-image"
            style={{
              left: `${img.x}%`,
              top: `${img.y}%`,
              width: img.w,
              height: img.h,
              zIndex: img.z,
              transform: `rotate(${img.rot}deg)`,
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              draggable={false}
              loading="eager"
            />
          </div>
        ))}
      </div>

      {/* Center typography */}
      <div className="hero-center-text">
        <p className="hero-tagline">OCTOBERSTILLS.</p>
        <h1 ref={titleRef} className="hero-dynamic-title">
          {SCROLL_WORDS[0].word}
        </h1>
        <p ref={subtitleRef} className="hero-dynamic-sub">
          {SCROLL_WORDS[0].sub}
        </p>
      </div>
    </section>
  );
}
