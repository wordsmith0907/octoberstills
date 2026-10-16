import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SolvoPreloaderProps {
  images?: { src: string; srcSet?: string }[];
  useLogo?: boolean;
  logo?: { src: string };
  title?: string;
  titleBlendMode?: any;
  glitchEffect?: boolean;
  glitchIntensity?: number;
  glitchColorA?: string;
  glitchColorB?: string;
  showCounter?: boolean;
  counterEnd?: number;
  counterFont?: React.CSSProperties;
  imageWidth?: number;
  imageHeight?: number;
  loaderColor?: string;
  textColor?: string;
  font?: React.CSSProperties;
  speed?: number;
  startDelay?: number;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
}

// Fisher-Yates with LCG pseudo-random generator
function seededShuffle(arr: number[], seed = 7) {
  const result = [...arr];
  let r = seed;
  const lcg = () => {
    r = (r * 9301 + 49297) % 233280;
    return r / 233280;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function useLetterOrder(len: number, seed = 7) {
  return useMemo(() => {
    const shuffled = seededShuffle(
      Array.from({ length: len }, (_, i) => i),
      seed
    );
    const order = Array(len);
    shuffled.forEach((shuffledIdx, rank) => {
      order[shuffledIdx] = rank;
    });
    return order;
  }, [len, seed]);
}

const CLIP_CLOSED = "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)";
const CLIP_OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const WIPE_START = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const WIPE_END = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";

export const PRELOADER_SESSION_KEY = "octoberstills_preloader_seen";

/**
 * Determines whether the preloader animation should be skipped.
 * Respects:
 * 1. prefers-reduced-motion accessibility preference
 * 2. Browser Navigation Timing (actual reload or back_forward navigation)
 * 3. Per-tab sessionStorage state (distinguishes reload/SPA vs genuinely new tab)
 */
export function shouldSkipPreloader(): boolean {
  if (typeof window === "undefined") return false;

  // 1. Accessibility: reduced motion preference
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
  } catch {}

  // 2. Navigation Timing API Level 2 (detects reload or back_forward)
  try {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries && navEntries.length > 0) {
      const navEntry = navEntries[0] as PerformanceNavigationTiming;
      if (navEntry.type === "reload" || navEntry.type === "back_forward") {
        return true;
      }
    }
  } catch {}

  // 3. Fallback Navigation Timing API Level 1 (legacy reload/back_forward)
  try {
    const legacyNav = (performance as any).navigation;
    if (legacyNav) {
      if (legacyNav.type === 1 || legacyNav.type === 2) {
        return true;
      }
    }
  } catch {}

  // 4. Per-tab session storage check (conservative tab session tracking)
  try {
    if (sessionStorage.getItem(PRELOADER_SESSION_KEY) === "true") {
      return true;
    }
  } catch {}

  return false;
}

export const SolvoPreloader: React.FC<SolvoPreloaderProps> = ({
  images = [
    { src: "https://framerusercontent.com/images/IHjzOLto0KE6LvIrgXuPIJUpXRY.webp?width=1920&height=1072" },
    { src: "https://framerusercontent.com/images/nwrP6ESs0BDNE74AnFmtmbAy8.webp?width=1920&height=1072" },
    { src: "https://framerusercontent.com/images/YWSacFYVAKWUF5RxaeSuBU7k.webp?width=1920&height=1072" },
    { src: "https://framerusercontent.com/images/U1XztYBT3hnwWxnuBgKdWz6lxU.webp?width=1376&height=768" },
    { src: "https://framerusercontent.com/images/rmuq5TBRacTaZ3RaOGZP9OYernQ.webp?width=1920&height=1072" },
  ],
  useLogo = false,
  logo,
  title = "CHAITYA SHAH",
  titleBlendMode = "difference",
  glitchEffect = true,
  glitchIntensity = 6,
  glitchColorA = "#ff2b4e",
  glitchColorB = "#00e0ff",
  showCounter = true,
  counterEnd = 100,
  counterFont = {
    fontFamily: '"Libre Baskerville", serif',
    fontSize: "70px",
    fontStyle: "italic",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: "1em",
  },
  imageWidth = 250,
  imageHeight = 300,
  loaderColor = "#30231D",
  textColor = "#FFFFFF",
  font = {
    fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
    fontWeight: 400,
  },
  speed = 1,
  startDelay = 0.5,
  onLoadStart,
  onLoadComplete,
}) => {
  const [status, setStatus] = useState<"idle" | "in" | "hold" | "out" | "wipe" | "revealed">(() => {
    if (typeof window !== "undefined" && shouldSkipPreloader()) {
      return "revealed";
    }
    return "idle";
  });
  const [counter, setCounter] = useState(0);
  const [isFastExit, setIsFastExit] = useState(false);
  const isDismissedRef = useRef(false);
  const isSkippingRef = useRef(false);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const rafId = useRef<number | null>(null);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);

  const letters = useMemo(() => title.split(""), [title]);
  const letterOrder = useLetterOrder(letters.length, 11);
  const imgList = useMemo(() => (images && images.length > 0 ? images : []), [images]);

  const rotations = useMemo(() => {
    const defaultAngles = [7.5, -2.5, -10, 12.5, -5, 5, -8, 9];
    return imgList.map((_, i) => defaultAngles[i % defaultAngles.length]);
  }, [imgList]);

  const effectiveSpeed = Math.max(0.4, speed || 1);
  const time = useCallback((s: number) => s / effectiveSpeed, [effectiveSpeed]);

  const statusRef = useRef(status);
  statusRef.current = status;

  const onLoadCompleteRef = useRef(onLoadComplete);
  onLoadCompleteRef.current = onLoadComplete;

  // Smooth skip dismissal handler
  const handleSkip = useCallback(() => {
    if (isDismissedRef.current || statusRef.current === "revealed") return;
    isDismissedRef.current = true;
    isSkippingRef.current = true;

    // Clear all pending animation timeouts and frames
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (watchdogRef.current) clearTimeout(watchdogRef.current);

    // Persist per-tab session state
    try {
      sessionStorage.setItem(PRELOADER_SESSION_KEY, "true");
    } catch {}

    // Trigger fast upward wipe transition
    setIsFastExit(true);
    setStatus("wipe");

    const exitTimer = setTimeout(() => {
      setStatus("revealed");
      onLoadCompleteRef.current?.();
    }, 320);
    timeouts.current.push(exitTimer);
  }, []);

  // Watchdog failsafe dismissal handler (6 seconds)
  const handleWatchdogDismiss = useCallback(() => {
    if (isDismissedRef.current || statusRef.current === "revealed") return;
    isDismissedRef.current = true;

    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    if (rafId.current) cancelAnimationFrame(rafId.current);

    try {
      sessionStorage.setItem(PRELOADER_SESSION_KEY, "true");
    } catch {}

    setIsFastExit(true);
    setStatus("wipe");

    const exitTimer = setTimeout(() => {
      setStatus("revealed");
      onLoadCompleteRef.current?.();
    }, 250);
    timeouts.current.push(exitTimer);
  }, []);

  useEffect(() => {
    // If navigation state or preferences dictate skipping, bypass immediately
    if (shouldSkipPreloader()) {
      setStatus("revealed");
      isDismissedRef.current = true;
      onLoadCompleteRef.current?.();
      return;
    }

    // Immediately mark tab session as initiated to ensure F5/reload skips
    try {
      sessionStorage.setItem(PRELOADER_SESSION_KEY, "true");
    } catch {}

    onLoadStart?.();

    // 6-second watchdog timer failsafe
    watchdogRef.current = setTimeout(() => {
      if (!isDismissedRef.current) {
        console.warn("[Octoberstills Preloader] Failsafe watchdog triggered (6s limit). Dismissing.");
        handleWatchdogDismiss();
      }
    }, 6000);

    // Listen for BFCache restore (pageshow with persisted)
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        handleSkip();
      }
    };
    window.addEventListener("pageshow", onPageShow);

    const schedule = (fn: () => void, s: number) => {
      timeouts.current.push(
        setTimeout(fn, startDelay * 1000 + (s * 1000) / effectiveSpeed)
      );
    };

    setStatus("in");
    schedule(() => setStatus("hold"), 0.35);

    const counterStart = 0.85;
    if (showCounter) {
      schedule(() => {
        const start = performance.now();
        const duration = ((3 - counterStart) * 1000) / effectiveSpeed;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCounter(Math.round(eased * counterEnd));
          if (progress < 1) {
            rafId.current = requestAnimationFrame(tick);
          }
        };
        rafId.current = requestAnimationFrame(tick);
      }, counterStart);
    }

    schedule(() => setStatus("out"), 3);
    schedule(() => setStatus("wipe"), 4.1);
    schedule(() => {
      isDismissedRef.current = true;
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      setStatus("revealed");
      onLoadCompleteRef.current?.();
    }, 5.1);

    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [
    effectiveSpeed,
    startDelay,
    showCounter,
    counterEnd,
    onLoadStart,
    handleSkip,
    handleWatchdogDismiss,
  ]);

  const customFont = font ?? { fontFamily: "system-ui, sans-serif", fontWeight: 500 };
  const customCounterFont = {
    fontSize: 70,
    fontFamily: '"Libre Baskerville", serif',
    fontWeight: 400,
    ...counterFont,
  };

  const isVisible = status === "in" || status === "hold";
  const hasLogo = useLogo && logo?.src;

  return (
    <AnimatePresence>
      {status !== "revealed" && (
        <motion.div
          key="solvo-loader"
          initial={{ clipPath: WIPE_START }}
          animate={{ clipPath: status === "wipe" ? WIPE_END : WIPE_START }}
          transition={{
            duration: isFastExit ? 0.32 : time(1),
            ease: [0.8, 0, 0.2, 1],
          }}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            background: loaderColor,
            color: textColor,
            zIndex: 99999,
            overflow: "hidden",
            pointerEvents: status === "revealed" ? "none" : "auto",
          }}
        >
          {/* Subtle Skip Intro control (Warm Ivory & DM Sans, keyboard accessible) */}
          {status !== "revealed" && status !== "wipe" && (
            <button
              type="button"
              onClick={handleSkip}
              aria-label="Skip introduction animation"
              className="solvo-skip-btn"
              style={{
                position: "absolute",
                top: "clamp(1.25rem, 3vw, 2.25rem)",
                right: "clamp(1.25rem, 3vw, 2.25rem)",
                zIndex: 1000,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(243, 234, 223, 0.08)",
                color: "#F3EADF",
                border: "1px solid rgba(243, 234, 223, 0.22)",
                borderRadius: "9999px",
                padding: "0.45rem 0.95rem",
                fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                outline: "none",
              }}
            >
              <span>SKIP INTRO</span>
            </button>
          )}

          {/* Scattered image cards */}
          <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {imgList.map((img, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, clipPath: CLIP_CLOSED }}
                animate={{
                  scale: isVisible ? 1 : 0,
                  clipPath: isVisible ? CLIP_OPEN : CLIP_CLOSED,
                }}
                transition={{
                  duration: time(1),
                  ease: [0.8, 0, 0.2, 1],
                  delay:
                    status === "in"
                      ? time(0.2) * i
                      : status === "out"
                      ? time(0.075) * (imgList.length - 1 - i)
                      : 0,
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: imageWidth,
                  height: imageHeight,
                  transformOrigin: "center center",
                  translateX: "-50%",
                  translateY: "-50%",
                  rotate: rotations[i],
                }}
              >
                <img
                  src={img?.src}
                  srcSet={img?.srcSet}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </motion.div>
            ))}
          </div>

          {/* Center text / logo container */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {hasLogo ? (
              <div style={{ overflow: "hidden" }}>
                <div style={{ position: "relative" }}>
                  <motion.img
                    src={logo!.src}
                    alt=""
                    initial={{ y: "100%" }}
                    animate={{ y: isVisible ? "0%" : "-100%" }}
                    transition={{
                      duration: time(status === "out" ? 0.75 : 1),
                      ease: [0.9, 0, 0.1, 1],
                    }}
                    style={{
                      display: "block",
                      width: "clamp(120px, 20vw, 320px)",
                      height: "auto",
                      objectFit: "contain",
                      mixBlendMode: titleBlendMode,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <h1
                  style={{
                    ...customFont,
                    color: textColor,
                    textTransform: "uppercase",
                    fontSize: "clamp(2rem, 8.5vw, 13rem)",
                    lineHeight: 0.85,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    mixBlendMode: titleBlendMode,
                  }}
                >
                  {letters.map((char, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        overflow: "hidden",
                        minWidth: char === " " ? "0.3em" : undefined,
                      }}
                    >
                      <motion.span
                        style={{ display: "inline-block" }}
                        initial={{ y: "100%" }}
                        animate={{ y: isVisible ? "0%" : "-100%" }}
                        transition={{
                          duration: time(status === "out" ? 0.75 : 1),
                          ease: [0.9, 0, 0.1, 1],
                          delay: time(0.125) * letterOrder[i],
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    </span>
                  ))}
                </h1>

                {/* Glitch RGB Chromatic Split during hold state */}
                {glitchEffect && status === "hold" && (
                  <>
                    <motion.h1
                      aria-hidden="true"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.9, 0, 0.7, 0],
                        x: [0, -glitchIntensity, glitchIntensity * 0.5, -glitchIntensity * 0.3, 0],
                        clipPath: [
                          "inset(0% 0% 100% 0%)",
                          "inset(20% 0% 55% 0%)",
                          "inset(60% 0% 15% 0%)",
                          "inset(10% 0% 75% 0%)",
                          "inset(0% 0% 100% 0%)",
                        ],
                      }}
                      transition={{
                        duration: time(0.4),
                        repeat: Infinity,
                        repeatDelay: time(0.9),
                        ease: "linear",
                      }}
                      style={{
                        ...customFont,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        color: glitchColorA,
                        textTransform: "uppercase",
                        fontSize: "clamp(2rem, 8.5vw, 13rem)",
                        lineHeight: 0.85,
                        margin: 0,
                        pointerEvents: "none",
                        mixBlendMode: "screen",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {title}
                    </motion.h1>

                    <motion.h1
                      aria-hidden="true"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.9, 0, 0.7, 0],
                        x: [0, glitchIntensity, -glitchIntensity * 0.5, glitchIntensity * 0.3, 0],
                        clipPath: [
                          "inset(0% 0% 100% 0%)",
                          "inset(45% 0% 30% 0%)",
                          "inset(5% 0% 80% 0%)",
                          "inset(65% 0% 10% 0%)",
                          "inset(0% 0% 100% 0%)",
                        ],
                      }}
                      transition={{
                        duration: time(0.4),
                        repeat: Infinity,
                        repeatDelay: time(0.9),
                        ease: "linear",
                        delay: time(0.15),
                      }}
                      style={{
                        ...customFont,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        color: glitchColorB,
                        textTransform: "uppercase",
                        fontSize: "clamp(2rem, 8.5vw, 13rem)",
                        lineHeight: 0.85,
                        margin: 0,
                        pointerEvents: "none",
                        mixBlendMode: "screen",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {title}
                    </motion.h1>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom-right numeric counter */}
          {showCounter && (
            <div
              style={{
                position: "absolute",
                bottom: "2rem",
                right: "2rem",
                overflow: "hidden",
              }}
            >
              <motion.p
                initial={{ y: "100%" }}
                animate={{ y: isVisible ? "0%" : "-100%" }}
                transition={{
                  duration: time(status === "out" ? 0.75 : 1),
                  ease: [0.9, 0, 0.1, 1],
                }}
                style={{
                  ...customCounterFont,
                  color: textColor,
                  lineHeight: 0.85,
                  margin: 0,
                }}
              >
                {String(counter).padStart(3, "0")}
              </motion.p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
