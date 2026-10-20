import React from "react";

export function Footer() {
  return (
    <footer
      id="footer"
      className="relative w-full py-16 md:py-20 lg:py-24 px-6 sm:px-12 md:px-20 lg:px-28 border-t border-[#F3EADF]/15 text-[#F3EADF]"
      style={{ backgroundColor: "#30231D" }}
      aria-label="Site Footer"
    >
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        {/* Main Footer Layout */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16">
          {/* Left Brand Identity */}
          <div className="space-y-3">
            <h3
              className="text-[28px] md:text-[36px] font-light tracking-[0.06em] text-[#F3EADF]"
              style={{
                fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
              }}
            >
              OCTOBERSTILLS<span className="text-[#B9784E]">.</span>
            </h3>

            <p
              className="text-[13px] md:text-[14px] uppercase tracking-[0.2em] text-[#F3EADF]/70 font-normal"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Photography · Films · Creative Direction
            </p>

            <p
              className="text-[14px] italic text-[#B9784E] font-serif pt-1"
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}
            >
              Thoughtfully seen. Beautifully told.
            </p>

            <p
              className="text-[12px] md:text-[13px] text-[#F3EADF]/60 max-w-sm pt-1 leading-relaxed"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              An independent creative practice by Chaitya Shah, crafting stories through imagery,
              motion, and feeling.
            </p>
          </div>

          {/* Right Navigation and Social Links */}
          <div className="grid grid-cols-2 gap-10 sm:gap-16 md:gap-20 w-full sm:w-auto">
            {/* Exploration Navigation */}
            <div className="space-y-4">
              <div
                className="text-[11px] uppercase tracking-[0.24em] font-medium text-[#B9784E]"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                Navigation
              </div>
              <ul className="space-y-2.5 text-[14px]">
                <li>
                  <a
                    href="#work"
                    className="group relative inline-flex items-center text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors duration-300"
                  >
                    <span className="relative">
                      Work
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#B9784E] transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="group relative inline-flex items-center text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors duration-300"
                  >
                    <span className="relative">
                      About
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#B9784E] transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="group relative inline-flex items-center text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors duration-300"
                  >
                    <span className="relative">
                      Contact
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#B9784E] transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Presence & Social */}
            <div className="space-y-4">
              <div
                className="text-[11px] uppercase tracking-[0.24em] font-medium text-[#B9784E]"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                Presence
              </div>
              <ul className="space-y-2.5 text-[14px]">
                <li>
                  <a
                    href="https://www.instagram.com/octoberstills/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors duration-300"
                  >
                    <span className="relative">
                      Instagram
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#B9784E] transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.threads.net/@octoberstills"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors duration-300"
                  >
                    <span className="relative">
                      Threads
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#B9784E] transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/chaityashah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors duration-300"
                  >
                    <span className="relative">
                      LinkedIn
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#B9784E] transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:octoberstills@gmail.com"
                    className="group relative inline-flex items-center text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors duration-300"
                  >
                    <span className="relative">
                      Email Studio
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#B9784E] transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div
          className="pt-6 sm:pt-8 border-t border-[#F3EADF]/15 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-[12px] text-[#D5B99C]/70 tracking-[0.14em] uppercase"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
          <div className="text-center sm:text-left">
            © 2026 OCTOBERSTILLS
          </div>

          <div className="text-center sm:text-right">
            MADE WITH INTENTION.
          </div>
        </div>
      </div>
    </footer>
  );
}
