import React, { useState, useRef, useEffect } from "react";
import { Instagram } from "lucide-react";
import {
  INSTAGRAM_POSTS,
  INSTAGRAM_PROFILE_URL,
  type InstagramPost,
} from "../data/instagram";

interface JournalCardProps {
  post: InstagramPost;
  index: number;
}

function JournalCard({ post, index }: JournalCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(post.videoPreview) && !videoError;
  const handleMouseEnter = () => {
    if (!hasVideo || !videoRef.current) return;
    videoRef.current.currentTime = 0;
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const handleMouseLeave = () => {
    if (!hasVideo || !videoRef.current) return;
    setIsPlaying(false);
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  const handleMobileCardClick = (e: React.MouseEvent) => {
    if (!hasVideo) return;
    if (window.innerWidth < 768) {
      e.preventDefault();
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      }
    }
  };

  return (
    <div className="w-full">
      <a
        href={post.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View Instagram post: ${post.alt}`}
        onClick={handleMobileCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative block w-full aspect-[4/5] rounded-[10px] overflow-hidden bg-[#251b16] select-none transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-[5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9784E]"
      >
        {/* Base Cover Image */}
        <img
          src={post.coverImage}
          alt={post.alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center select-none transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />

        {/* Optional Video Preview (Smooth Crossfade on Hover / Play) */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={post.videoPreview}
            preload="none"
            muted
            playsInline
            loop
            onError={() => setVideoError(true)}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-400 ease-out group-hover:scale-[1.025] ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Subtle Bottom Gradient for Caption Readability */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

        {/* Centered Instagram Icon with Translucent Dark Overlay on Hover */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none">
          <Instagram
            className="w-[52px] h-[52px] text-[#F3EADF] drop-shadow-md transform scale-[0.65] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-focus-visible:scale-100"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        {/* Editorial Caption / Context Inset (Bottom) */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-4 z-10 flex flex-col justify-end pointer-events-none">
          {post.location && (
            <span
              className="text-[9px] uppercase tracking-[0.24em] text-[#D5B99C] font-medium truncate mb-1"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              {post.location}
            </span>
          )}
          {post.caption && (
            <p
              className="text-[11px] md:text-xs text-[#F3EADF]/90 font-light leading-snug line-clamp-2"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              {post.caption}
            </p>
          )}
        </div>
      </a>
    </div>
  );
}

export function OctoberJournal() {
  const sectionRef = useRef<HTMLElement>(null);

  // Pause all playing videos when section leaves viewport or tab is backgrounded
  useEffect(() => {
    if (!sectionRef.current) return;

    const handleVisibilityChange = () => {
      if (document.hidden && sectionRef.current) {
        const videos = sectionRef.current.querySelectorAll("video");
        videos.forEach((v) => {
          v.pause();
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting && sectionRef.current) {
          const videos = sectionRef.current.querySelectorAll("video");
          videos.forEach((v) => {
            v.pause();
          });
        }
      },
      { threshold: 0.1 }
    );

    document.addEventListener("visibilitychange", handleVisibilityChange);
    observer.observe(sectionRef.current);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journal"
      data-bg="#F3EADF"
      className="relative w-full pt-20 pb-24 md:pt-28 md:pb-36 px-6 sm:px-12 md:px-16 lg:px-24 overflow-hidden text-[#30231D] scroll-mt-20 md:scroll-mt-24"
      style={{ backgroundColor: "#F3EADF" }}
      aria-label="The October Journal — Instagram Diary"
    >
      <div className="max-w-7xl mx-auto space-y-10 md:space-y-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#30231D]/15">
          <div className="space-y-2 text-left">
            <div>
              <span
                className="text-[11px] md:text-[12px] uppercase font-medium tracking-[0.28em] text-[#30231D]/80"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                THE SOCIAL DIARY
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-light text-[#30231D] tracking-tight leading-[1.08]"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              The October Journal
            </h2>
            <p
              className="text-sm md:text-base text-[#30231D]/70 font-light italic pt-0.5"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Little moments, lately.
            </p>
          </div>
        </div>

        {/* Desktop Layout: 4 Prominent Cards with Subtle Editorial Stagger (md and up) */}
        <div className="hidden md:grid md:grid-cols-4 gap-3.5 lg:gap-4 items-start pt-2 pb-6">
          {INSTAGRAM_POSTS.map((post, index) => (
            <JournalCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Mobile Experience: Horizontal Swipeable Row (1.2–1.4 cards in viewport with snapping) */}
        <div className="flex md:hidden gap-3.5 overflow-x-auto snap-x snap-mandatory scrollbar-none px-6 -mx-6 pb-4 pt-1">
          {INSTAGRAM_POSTS.map((post, index) => (
            <div
              key={post.id}
              className="w-[74vw] sm:w-[50vw] shrink-0 snap-center"
            >
              <JournalCard post={post} index={index} />
            </div>
          ))}
        </div>

        {/* Bottom CTA: Follow along on Instagram */}
        <div className="pt-4 md:pt-8 flex justify-center">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="oct-inward-btn oct-inward-btn-dark inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.22em] font-medium cursor-pointer"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            <span>Follow along on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
}
