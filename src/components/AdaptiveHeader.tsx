import { useRef, useEffect, useState } from "react";

interface AdaptiveHeaderProps {
  forceLight?: boolean;
  visible?: boolean;
}

const NAV_LINKS = [
  { label: "WORK", href: "#work" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

export function AdaptiveHeader({ forceLight, visible = true }: AdaptiveHeaderProps) {
  if (!visible) return null;
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  // Handle explicit forceLight prop override if supplied
  useEffect(() => {
    if (forceLight === undefined) return;
    const color = forceLight ? "#F3EADF" : "#30231D";
    document.documentElement.style.setProperty("--navbar-text-color", color);
  }, [forceLight]);

  return (
    <>
      <header
        ref={headerRef}
        className={`adaptive-header ${mobileOpen ? "mobile-menu-active" : ""}`}
        role="banner"
      >
        <a href="/" className="header-wordmark" aria-label="Octoberstills Home">
          <span style={{ fontStyle: "italic", fontWeight: 400, marginRight: "0.02em" }}>O</span>
          <span>CTOBERSTILL</span>
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>S</span>
          <span>.</span>
        </a>

        {/* Desktop nav */}
        <nav className="header-nav-desktop" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="header-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="header-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          <span className={`hamburger-line ${mobileOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${mobileOpen ? "open" : ""}`} />
        </button>
      </header>

      {/* Mobile nav overlay */}
      <div
        id="mobile-nav"
        className={`mobile-nav-overlay ${mobileOpen ? "mobile-nav-open" : ""}`}
        role="dialog"
        aria-modal={mobileOpen}
        aria-label="Mobile navigation"
      >
        <nav className="mobile-nav-content" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
