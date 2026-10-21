import React, { useRef, useState, useEffect, useCallback } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface SelectedWorkProject {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  image: string;
  video?: string;
  poster?: string;
  alt: string;
}

// Backward-compatibility aliases
export type StoryProject = SelectedWorkProject;

export const SELECTED_WORK_PROJECTS: SelectedWorkProject[] = [
  {
    id: "udaipur-sanctuary",
    number: "01",
    title: "Udaipur: Sanctuary on the Water",
    category: "Luxury Hospitality & Destination",
    description:
      "Capturing the island palace in Udaipur across calm rippling waters, glowing marble silhouettes, and the soft amber light of dusk.",
    image: "/selected-work/sw-1-poster.webp",
    video: "/selected-work/sw-1.mp4",
    poster: "/selected-work/sw-1-poster.webp",
    alt: "Lake Pichola and Taj Lake Palace at sunset in Udaipur",
  },
  {
    id: "theater-noir",
    number: "02",
    title: "Theater: Noir Leather & Footwear",
    category: "Editorial Fashion & Accessories",
    description:
      "Sculpted leather silhouettes, timeless vintage textures, and deliberate styling photographed in intimate natural sunset light.",
    image: "/selected-work/sw-2-poster.webp",
    video: "/selected-work/sw-2.mp4",
    poster: "/selected-work/sw-2-poster.webp",
    alt: "Theater noir leather accessories and Mary Jane heels",
  },
  {
    id: "coastal-cadence",
    number: "03",
    title: "Everywhere with a Camera: Coastal Journey",
    category: "Travel & Lifestyle Cinematography",
    description:
      "An intimate visual diary following the rhythm of coastal roads, swaying coconut palms, and honest, spontaneous moments.",
    image: "/selected-work/sw-3-poster.webp",
    video: "/selected-work/sw-3.mp4",
    poster: "/selected-work/sw-3-poster.webp",
    alt: "Visual storyteller with camera along a tropical coastal avenue",
  },
  {
    id: "bath-and-body-works",
    number: "04",
    title: "Bath & Body Works: Luminous Silk Fragrance",
    category: "Product & Apothecary Still Life",
    description:
      "Macro light refractions, sparkling fine fragrance mist vessels, and flowing champagne silk textiles designed for commercial sensory allure.",
    image: "/selected-work/sw-4-poster.webp",
    video: "/selected-work/sw-4.mp4",
    poster: "/selected-work/sw-4-poster.webp",
    alt: "Bath & Body Works fragrance mist collection on champagne silk satin",
  },
  {
    id: "open-air-atelier",
    number: "05",
    title: "The Open-Air Atelier: Plein Air Study",
    category: "Creative Disciplines & Brand Story",
    description:
      "Artisan brushwork, contemplative morning focus, and tactile painting processes documented amidst organic grove greenery.",
    image: "/selected-work/sw-5-poster.webp",
    video: "/selected-work/sw-5.mp4",
    poster: "/selected-work/sw-5-poster.webp",
    alt: "Artist plein air painting under a shaded tree with easel and palette",
  },
  {
    id: "meadow-solitude",
    number: "06",
    title: "Meadow Solitude: Movement & Earth",
    category: "Artisanal Lifestyle & Motion",
    description:
      "Free-flowing movement, earthy linen draping, and the quiet cadence of solitary afternoon warmth in the mango grove.",
    image: "/selected-work/sw-6-poster.webp",
    video: "/selected-work/sw-6.mp4",
    poster: "/selected-work/sw-6-poster.webp",
    alt: "Walking through a sunlit mango orchard in organic linen apparel",
  },
];

export const FEATURED_STORIES = SELECTED_WORK_PROJECTS;

interface SWCardProps {
  project: SelectedWorkProject;
  onOpen: (p: SelectedWorkProject) => void;
}

function SWCard({ project, onOpen }: SWCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (project.video && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [project.video]);

  return (
    <article className="sw-card">
      <div
        className="sw-card-media"
        onClick={() => onOpen(project)}
        role="button"
        tabIndex={0}
        aria-label={`View ${project.title}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(project);
          }
        }}
      >
        {project.video ? (
          <video
            ref={videoRef}
            src={project.video}
            poster={project.poster || project.image}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          <img
            src={project.image}
            alt={project.alt}
            loading="lazy"
            draggable={false}
          />
        )}
      </div>

      <div className="sw-card-info">
        <h3 className="sw-card-title">{project.title}</h3>
        <p className="sw-card-category">{project.category}</p>
      </div>
    </article>
  );
}

export function SelectedStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [selectedModal, setSelectedModal] = useState<SelectedWorkProject | null>(null);

  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollYRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const openLightbox = useCallback((p: SelectedWorkProject) => {
    setSelectedModal(p);
    document.body.style.overflow = "hidden";
  }, []);

  const handleCardClick = useCallback((p: SelectedWorkProject) => {
    if (hasDraggedRef.current) return;
    openLightbox(p);
  }, [openLightbox]);

  const closeLightbox = useCallback(() => {
    setSelectedModal(null);
    document.body.style.overflow = "";
  }, []);

  // Keyboard Escape listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedModal) {
        closeLightbox();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModal, closeLightbox]);

  // Clean up body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const maxTrackScrollRef = useRef(0);

  // Dynamic calculation for maximum horizontal scroll:
  // Ensures the final card is completely visible with right-side breathing room
  // equal to exactly 50% of the dynamic gap between adjacent cards.
  const calculateMaxTrackScroll = useCallback((track: HTMLElement): number => {
    const cards = track.querySelectorAll<HTMLElement>(".sw-card");
    if (cards.length === 0) return 0;

    const lastCard = cards[cards.length - 1];
    const trackStyle = window.getComputedStyle(track);
    const paddingRight = parseFloat(trackStyle.paddingRight) || parseFloat(trackStyle.paddingLeft) || 48;
    const trailingSpacing = paddingRight;
    const containerWidth = track.parentElement ? track.parentElement.clientWidth : window.innerWidth;

    const currentTransformMatch = track.style.transform.match(/translate3d\(([-0-9.]+)px/);
    const currentX = currentTransformMatch ? parseFloat(currentTransformMatch[1]) : 0;
    const lastCardRightAtZero = lastCard.getBoundingClientRect().right - currentX;

    const targetMaxScroll = lastCardRightAtZero - containerWidth + trailingSpacing;
    return Math.max(0, targetMaxScroll);
  }, []);

  // Sticky horizontal scroll calculation matching reference
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = () => window.innerWidth < 768;
    let isTicking = false;

    const updateMeasurements = () => {
      if (!trackRef.current) return;
      maxTrackScrollRef.current = calculateMaxTrackScroll(trackRef.current);
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    };

    const handleScroll = () => {
      if (isMobile() || reducedMotion.matches || isTicking) return;
      isTicking = true;

      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const scrollableDist = section.offsetHeight - window.innerHeight;
        if (scrollableDist <= 0) {
          isTicking = false;
          return;
        }

        const scrollY = -rect.top;
        const p = Math.max(0, Math.min(1, scrollY / scrollableDist));

        if (maxTrackScrollRef.current <= 0) {
          maxTrackScrollRef.current = calculateMaxTrackScroll(track);
        }
        const maxTrackScroll = maxTrackScrollRef.current;
        if (maxTrackScroll > 0) {
          const x = -p * maxTrackScroll;
          track.style.transform = `translate3d(${x}px, 0, 0)`;
        }
        isTicking = false;
      });
    };

    const handleResize = () => {
      updateMeasurements();
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    // Recalculate once web fonts have finished loading
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        handleResize();
      });
    }

    // ResizeObserver on track to adapt dynamically to card resizing or layout updates
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(track);
    }

    // Media element load listeners to update measurements once card media resolves
    const mediaElements = track.querySelectorAll("img, video");
    mediaElements.forEach((el) => {
      el.addEventListener("load", handleResize, { once: true });
      el.addEventListener("loadeddata", handleResize, { once: true });
    });

    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      resizeObserver?.disconnect();
    };
  }, [calculateMaxTrackScroll]);

  // Drag interaction for desktop carousel
  const handlePointerDown = (e: React.PointerEvent) => {
    if (window.innerWidth < 768 || e.button !== 0) return;
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    startScrollYRef.current = window.scrollY;
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !sectionRef.current || !trackRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }
    if (hasDraggedRef.current) {
      const scrollableDist = sectionRef.current.offsetHeight - window.innerHeight;
      const maxTrackScroll = maxTrackScrollRef.current || calculateMaxTrackScroll(trackRef.current);
      if (scrollableDist > 0 && maxTrackScroll > 0) {
        const scrollRatio = scrollableDist / maxTrackScroll;
        const targetScroll = startScrollYRef.current - deltaX * scrollRatio;
        window.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "auto",
        });
      }
    }
  };

  const handlePointerUpOrLeave = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  // Custom Cursor trailing logic matching reference
  useEffect(() => {
    const track = trackRef.current;
    const cursor = cursorRef.current;
    if (!track || !cursor) return;

    const hoverFine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!hoverFine.matches || reducedMotion.matches) return;

    let animId = 0;
    let isHovering = false;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const tick = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      if (cursor) {
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${
          isHovering ? 1 : 0.4
        })`;
        cursor.style.opacity = isHovering ? "1" : "0";
      }
      animId = requestAnimationFrame(tick);
    };

    const updateHoverState = (clientX: number, clientY: number, target?: EventTarget | null) => {
      if (document.body.style.overflow === "hidden") {
        isHovering = false;
        return;
      }
      const mediaEl = (
        (target instanceof HTMLElement ? target : null) || document.elementFromPoint(clientX, clientY)
      )?.closest(".sw-card-media");

      if (mediaEl && track.contains(mediaEl)) {
        if (!isHovering) {
          currentX = clientX;
          currentY = clientY;
          isHovering = true;
        }
      } else {
        isHovering = false;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      updateHoverState(targetX, targetY, e.target);
    };

    const onPointerLeave = () => {
      isHovering = false;
    };

    const onWindowScroll = () => {
      if (targetX >= 0 && targetY >= 0) {
        updateHoverState(targetX, targetY);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onWindowScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Hide cursor when modal opens
  useEffect(() => {
    if (selectedModal && cursorRef.current) {
      cursorRef.current.style.opacity = "0";
    }
  }, [selectedModal]);

  return (
    <>
      {/* =========================================================================
          Desktop & Tablet Horizontal Pinned Track (>= 768px)
          ========================================================================= */}
      <section
        className="sw-section scroll-mt-20 md:scroll-mt-24"
        id="work"
        ref={sectionRef}
        aria-labelledby="sw-heading"
      >
        <div className="sw-sticky">
          {/* Header */}
          <div className="sw-header">
            <p className="sw-eyebrow">SELECTED WORK</p>
            <h2 className="sw-heading" id="sw-heading">
              Stories in motion.
            </h2>
            <p className="sw-description">
              From architectural stillness to intimate brand films, explore commissioned visuals created with quiet luxury and intentional light.
            </p>
          </div>

          {/* Horizontal Track */}
          <div
            className="sw-track"
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpOrLeave}
            onPointerCancel={handlePointerUpOrLeave}
          >
            {SELECTED_WORK_PROJECTS.map((project) => (
              <SWCard
                key={project.id}
                project={project}
                onOpen={handleCardClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          Mobile Horizontal Snap Track (<= 767px)
          ========================================================================= */}
      <section
        className="sw-mobile-section"
        id="work-mobile"
        aria-label="Selected Work Gallery"
      >
        <div className="sw-mobile-header">
          <p className="sw-eyebrow">SELECTED WORK</p>
          <h2 className="sw-heading">Stories in motion.</h2>
          <p className="sw-description">
            From architectural stillness to intimate brand films, explore commissioned visuals created with quiet luxury and intentional light.
          </p>
        </div>

        <div className="sw-mobile-track">
          {SELECTED_WORK_PROJECTS.map((project) => (
            <article key={project.id} className="sw-mobile-card">
              <div
                className="sw-card-media"
                onClick={() => openLightbox(project)}
                role="button"
                tabIndex={0}
                aria-label={`View ${project.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(project);
                  }
                }}
              >
                {project.video ? (
                  <video
                    src={project.video}
                    poster={project.poster || project.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={project.poster || project.image}
                    alt={project.alt}
                    loading="lazy"
                    draggable={false}
                  />
                )}
              </div>

              <div className="sw-card-info">
                <h3 className="sw-card-title">{project.title}</h3>
                <p className="sw-card-category">{project.category}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================================================================
          Custom Trailing Cursor (Desktop fine pointer only)
          ========================================================================= */}
      <div ref={cursorRef} className="sw-custom-cursor" aria-hidden="true">
        <span>VIEW</span>
      </div>

      {/* =========================================================================
          Lightbox Dialog Modal
          ========================================================================= */}
      {selectedModal && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedModal.title} viewer`}
        >
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close viewer"
          >
            ✕
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-media-wrap">
              {selectedModal.video ? (
                <video
                  src={selectedModal.video}
                  poster={selectedModal.poster || selectedModal.image}
                  autoPlay
                  muted
                  loop
                  controls
                  playsInline
                  className="lightbox-video"
                />
              ) : (
                <img
                  src={selectedModal.image}
                  alt={selectedModal.alt}
                  className="lightbox-img"
                />
              )}
            </div>

            <div className="lightbox-info">
              <h3 className="lightbox-title">{selectedModal.title}</h3>
              <p className="lightbox-category">{selectedModal.category}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
