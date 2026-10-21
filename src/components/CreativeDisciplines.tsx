import React from "react";
import { motion } from "framer-motion";

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
  return (
    <section
      id="services"
      className="relative w-full py-16 md:py-24 px-6 sm:px-12 md:px-20 lg:px-28 overflow-hidden text-[#30231D] scroll-mt-20 md:scroll-mt-24"
      style={{ backgroundColor: "#D5B99C" }}
      aria-label="Creative Disciplines"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-2xl mx-auto pb-8 md:pb-10 border-b border-[#30231D]/15">
          <div>
            <span
              className="text-[11px] md:text-[12px] uppercase font-medium tracking-[0.28em] text-[#30231D]/75"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Ways of Seeing
            </span>
          </div>

          <h2
            className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-light text-[#30231D] tracking-tight leading-[1.05]"
            style={{
              fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
            }}
          >
            Creative Disciplines
          </h2>

          <p
            className="text-[14px] md:text-[15px] text-[#30231D]/70 font-normal max-w-md mx-auto"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            Still and moving image shaped with quiet intention.
          </p>
        </div>

        {/* Three Minimal Editorial Photographic Columns */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-10">
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
                {/* Large Portrait Photograph / Video Window (Strict 4:5 ratio, curved matching Selected Work) */}
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
      </div>
    </section>
  );
}
