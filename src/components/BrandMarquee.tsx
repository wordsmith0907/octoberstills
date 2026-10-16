import { useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Verified Brands from Chaitya Shah's Portfolio & Official Collaborations
// Sized with optical visual weight normalization
// ---------------------------------------------------------------------------
interface BrandItem {
  name: string;
  logo: string;
  desktopHeight: number;
  mobileHeight: number;
}

const VERIFIED_BRANDS: BrandItem[] = [
  {
    name: "Dell",
    logo: "/brands/dell.svg",
    desktopHeight: 24,
    mobileHeight: 20,
  },
  {
    name: "Myntra",
    logo: "/brands/myntra.png",
    desktopHeight: 24,
    mobileHeight: 19,
  },
  {
    name: "Bath & Body Works",
    logo: "/brands/bath-and-body-works.svg",
    desktopHeight: 19,
    mobileHeight: 15,
  },
  {
    name: "AJIO",
    logo: "/brands/ajio.svg",
    desktopHeight: 21,
    mobileHeight: 17,
  },
  {
    name: "Lenskart",
    logo: "/brands/lenskart.svg",
    desktopHeight: 27,
    mobileHeight: 21,
  },
  {
    name: "The Misnomer",
    logo: "/brands/the-misnomer.png",
    desktopHeight: 23,
    mobileHeight: 18,
  },
  {
    name: "Theater",
    logo: "/brands/theater.png",
    desktopHeight: 19,
    mobileHeight: 15,
  },
  {
    name: "Botnia",
    logo: "/brands/botnia.svg",
    desktopHeight: 17,
    mobileHeight: 14,
  },
  {
    name: "Rathi Silks",
    logo: "/brands/rathi-silks.png",
    desktopHeight: 27,
    mobileHeight: 22,
  },
];

export function BrandMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Pause on prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => {
      if (trackRef.current) {
        trackRef.current.style.animationPlayState = mq.matches
          ? "paused"
          : "running";
      }
    };

    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <section
      className="brand-collaborations-section"
      aria-label="Brands and Collaborations"
    >
      {/* 1. Top heading: TRUSTED BY 50+ BRANDS */}
      <div className="brand-collab-heading-wrapper">
        <h3 className="brand-collab-heading">TRUSTED BY 50+ BRANDS</h3>
      </div>

      {/* 2. Middle: Continuous brand-logo marquee from right to left */}
      <div className="brand-collab-marquee-container">
        <div ref={trackRef} className="brand-collab-track">
          {/* Track 1 */}
          <div className="brand-collab-group" aria-hidden="false">
            {VERIFIED_BRANDS.map((brand, i) => (
              <div
                key={`track1-${brand.name}-${i}`}
                className="brand-collab-logo-item"
                tabIndex={0}
                role="img"
                aria-label={`${brand.name} official logo`}
              >
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="brand-collab-img"
                  style={
                    {
                      "--brand-height-desktop": `${brand.desktopHeight}px`,
                      "--brand-height-mobile": `${brand.mobileHeight}px`,
                    } as React.CSSProperties
                  }
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Track 2 (exact duplicate for seamless infinite loop) */}
          <div className="brand-collab-group" aria-hidden="true">
            {VERIFIED_BRANDS.map((brand, i) => (
              <div
                key={`track2-${brand.name}-${i}`}
                className="brand-collab-logo-item"
                tabIndex={-1}
                aria-hidden="true"
              >
                <img
                  src={brand.logo}
                  alt=""
                  className="brand-collab-img"
                  style={
                    {
                      "--brand-height-desktop": `${brand.desktopHeight}px`,
                      "--brand-height-mobile": `${brand.mobileHeight}px`,
                    } as React.CSSProperties
                  }
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom text: and many more... */}
      <div className="brand-collab-footer-wrapper">
        <p className="brand-collab-footer">and many more...</p>
      </div>
    </section>
  );
}
