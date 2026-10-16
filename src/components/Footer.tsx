import React from "react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="footer"
      className="relative w-full py-16 md:py-24 px-6 sm:px-12 md:px-20 lg:px-28 border-t border-[#F3EADF]/15 text-[#F3EADF]"
      style={{ backgroundColor: "#30231D" }}
      aria-label="Site Footer"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Main Footer Layout */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
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
              className="text-[12px] text-[#F3EADF]/60 max-w-sm pt-1 leading-relaxed"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              An independent visual journal by Chaitya Shah, celebrating stories told through light
              and feeling.
            </p>
          </div>

          {/* Right Navigation and Social Links */}
          <div className="flex flex-wrap sm:flex-nowrap gap-12 sm:gap-20">
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
                    className="text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors"
                  >
                    Work
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors"
                  >
                    Contact
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
                    className="text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors flex items-center gap-1.5"
                  >
                    <span>Instagram</span>
                    <span className="text-[11px]">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:octoberstills@gmail.com"
                    className="text-[#F3EADF]/80 hover:text-[#B9784E] transition-colors flex items-center gap-1.5"
                  >
                    <span>Email Studio</span>
                    <span className="text-[11px]">↗</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 border-t border-[#F3EADF]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#F3EADF]/60 tracking-[0.1em]">
          <div>
            © {new Date().getFullYear()} OCTOBERSTILLS. All rights reserved. Chaitya Shah.
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="hover:text-[#B9784E] transition-colors flex items-center gap-2 cursor-pointer uppercase tracking-[0.18em] font-medium"
          >
            <span>Back to top</span>
            <span>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
