import React from "react";
import { motion } from "framer-motion";

export function BehindTheLens() {
  return (
    <section
      id="about"
      className="relative w-full pt-28 pb-20 sm:py-28 lg:py-32 px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 overflow-hidden text-[#30231D] scroll-mt-24 md:scroll-mt-28"
      style={{ backgroundColor: "#F3EADF" }}
      aria-label="Behind the Lens"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-14 xl:gap-20 items-center">
          {/* Left Column: Authentic Color Portrait (approx. 45% on desktop) */}
          <div className="lg:col-span-5 order-1">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-sm sm:max-w-md lg:max-w-none mx-auto"
            >
              <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[731/1024] overflow-hidden rounded-sm bg-[#30231D]/5">
                <img
                  src="/portfolio/about_portrait.jpg"
                  alt="Chaitya Shah sitting with camera and vintage objects"
                  className="w-full h-full object-cover object-center"
                  decoding="async"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Editorial Narrative & Copy (approx. 55% on desktop) */}
          <div className="lg:col-span-7 order-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 lg:space-y-8 max-w-xl"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9784E]" />
                <span
                  className="text-[11px] md:text-[12px] uppercase font-medium tracking-[0.28em] text-[#30231D]/75"
                  style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                >
                  Behind the Lens
                </span>
              </div>

              {/* Dominant Heading & Professional Identity */}
              <div className="space-y-2.5">
                <h2
                  className="text-4xl sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-light leading-[1.05] tracking-tight text-[#30231D]"
                  style={{
                    fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
                  }}
                >
                  Chaitya Shah
                </h2>
                <p
                  className="text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-[0.2em] text-[#B9784E] font-medium"
                  style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                >
                  Creative Director · Cinematographer · Visual Storyteller
                </p>
              </div>

              {/* Biography Paragraphs */}
              <div
                className="space-y-4 sm:space-y-5 text-[#30231D]/85 font-normal text-[15px] sm:text-[16px] md:text-[17px] leading-[1.7]"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                <p>
                  I&apos;m Chaitya, the creative eye behind Octoberstills.
                </p>

                <p className="text-[#30231D]/80">
                  With over eight years in the creative industry, I bring together creative direction, cinematography, and brand strategy to tell stories that feel as intentional as they look.
                </p>

                <p className="text-[#30231D]/80">
                  From cinematic brand films to thoughtful lifestyle imagery and creator-led content, I create visuals that connect, resonate, and leave a lasting impression.
                </p>
              </div>

              {/* Understated CTA */}
              <div className="pt-2 sm:pt-4">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2.5 rounded-full uppercase tracking-[0.2em] text-[11px] sm:text-[12px] px-7 py-3.5 font-medium transition-all duration-300 text-[#30231D] border border-[#30231D]/30 hover:bg-[#30231D] hover:text-[#F3EADF]"
                  style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                >
                  <span>More About Me</span>
                  <span className="text-xs">↗</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
