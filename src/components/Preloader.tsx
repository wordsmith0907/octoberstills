import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";

// ---------------------------------------------------------------------------
// Preloader images — Chaitiya's portfolio images (reusing ringview assets)
// ---------------------------------------------------------------------------
const PRELOADER_IMAGES = [
  "/ringview/0.webp",
  "/ringview/2.webp",
  "/ringview/4.webp",
  "/ringview/6.webp",
  "/ringview/1-poster.webp",
  "/ringview/3-poster.webp",
  "/ringview/5-poster.webp",
  "/ringview/7-poster.webp",
];

// Scattered image positions — inspired by Solvo's burst-from-center composition
// Each image has: x%, y%, width, height, rotation, z-index, scale
const IMAGE_CONFIGS = [
  { x: -38, y: -28, w: 180, h: 240, rot: -12, z: 3, delay: 0 },
  { x: 32, y: -32, w: 160, h: 220, rot: 8, z: 5, delay: 0.06 },
  { x: -30, y: 18, w: 150, h: 200, rot: 6, z: 2, delay: 0.12 },
  { x: 36, y: 22, w: 170, h: 230, rot: -10, z: 4, delay: 0.18 },
  { x: -8, y: -38, w: 140, h: 190, rot: 4, z: 6, delay: 0.08 },
  { x: 0, y: 30, w: 160, h: 210, rot: -6, z: 1, delay: 0.14 },
  { x: -42, y: -2, w: 130, h: 180, rot: 14, z: 7, delay: 0.1 },
  { x: 42, y: -4, w: 145, h: 195, rot: -8, z: 8, delay: 0.04 },
];

const HERO_NAME = "CHAITIYA";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const hasAnimated = useRef(false);

  // Preload images
  useEffect(() => {
    let loaded = 0;
    const total = PRELOADER_IMAGES.length;

    PRELOADER_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded >= total) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
  }, []);

  // Main animation sequence
  useEffect(() => {
    if (!imagesLoaded || hasAnimated.current) return;
    hasAnimated.current = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Skip animation — just reveal
      if (containerRef.current) {
        containerRef.current.style.display = "none";
      }
      document.body.style.overflow = "";
      onComplete();
      return;
    }

    // Lock scroll during preloader
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          onComplete();
        },
      });

      // Set initial states for images — start from center, scaled down, invisible
      imagesRef.current.forEach((el) => {
        if (el) {
          gsap.set(el, {
            scale: 0,
            autoAlpha: 0,
            x: 0,
            y: 0,
            rotation: 0,
          });
        }
      });

      // Set initial states for letters
      lettersRef.current.forEach((el) => {
        if (el) {
          gsap.set(el, {
            autoAlpha: 0,
            y: 60,
            rotationX: -90,
          });
        }
      });

      // PHASE 1: Images burst outward from center with staggered timing
      IMAGE_CONFIGS.forEach((config, i) => {
        const el = imagesRef.current[i];
        if (!el) return;

        tl.to(
          el,
          {
            scale: 1,
            autoAlpha: 1,
            x: `${config.x}vw`,
            y: `${config.y}vh`,
            rotation: config.rot,
            duration: 0.9,
            ease: "power3.out",
          },
          config.delay
        );
      });

      // PHASE 2: Character-by-character text reveal — starts slightly before images fully settle
      lettersRef.current.forEach((el, i) => {
        if (!el) return;

        tl.to(
          el,
          {
            autoAlpha: 1,
            y: 0,
            rotationX: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          0.4 + i * 0.06
        );
      });

      // PHASE 3: Hold for a moment to let the composition register
      tl.to({}, { duration: 0.6 });

      // PHASE 4: Images scale up slightly and fade out
      tl.to(
        imagesRef.current.filter(Boolean),
        {
          scale: 1.15,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.in",
          stagger: {
            each: 0.03,
            from: "random",
          },
        },
        "+=0"
      );

      // PHASE 5: Text slides up and fades
      tl.to(
        lettersRef.current.filter(Boolean),
        {
          y: -40,
          autoAlpha: 0,
          duration: 0.4,
          ease: "power2.in",
          stagger: 0.02,
        },
        "-=0.4"
      );

      // PHASE 6: Wipe transition — overlay slides up to reveal hero
      tl.to(
        overlayRef.current,
        {
          yPercent: -100,
          duration: 0.8,
          ease: "power3.inOut",
        },
        "-=0.2"
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [imagesLoaded, onComplete]);

  return (
    <div
      ref={containerRef}
      className="preloader"
      aria-label="Loading Octoberstills"
      role="status"
    >
      <div ref={overlayRef} className="preloader-overlay">
        {/* Scattered images */}
        <div className="preloader-images">
          {PRELOADER_IMAGES.map((src, i) => (
            <div
              key={i}
              ref={(el) => {
                imagesRef.current[i] = el;
              }}
              className="preloader-image"
              style={{
                width: IMAGE_CONFIGS[i].w,
                height: IMAGE_CONFIGS[i].h,
                zIndex: IMAGE_CONFIGS[i].z,
              }}
            >
              <img
                src={src}
                alt=""
                draggable={false}
                loading="eager"
              />
            </div>
          ))}
        </div>

        {/* Character-by-character text */}
        <div className="preloader-text">
          <h1 className="preloader-name" aria-label={HERO_NAME}>
            {HERO_NAME.split("").map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  lettersRef.current[i] = el;
                }}
                className="preloader-letter"
                aria-hidden="true"
              >
                {char}
              </span>
            ))}
          </h1>
        </div>
      </div>
    </div>
  );
}
