import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * BackgroundColorTransitions
 * 
 * Recreates the scroll-linked background color transition system inspired by Ritesh Photos (https://riteshphotos.vercel.app/).
 * Interpolates smoothly between adjacent section background colors as they scroll across the viewport
 * using GSAP ScrollTrigger with scrub: 0.8 and power1.inOut easing.
 * 
 * Section Color Sequence:
 * 1. Hero, Brands Marquee, Quote: Warm Ivory #F3EADF
 * 2. Selected Work: Deep Espresso #30231D
 * 3. Creative Disciplines: Soft Sand #D5B99C
 * 4. Behind the Lens: Warm Ivory #F3EADF
 * 5. UGC Showcase (Creator Partnerships): Muted Sage #8C9275
 * 6. Contact and Footer: Deep Espresso #30231D
 */
// Relative luminance calculation according to WCAG 2.1 specifications
function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function parseRgb(colorStr: string): [number, number, number] {
  if (colorStr.startsWith("#")) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  const match = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (match) {
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  return [243, 234, 223];
}

/**
 * Updates navbar text color and contrast styling based on current background color.
 * Threshold 0.20:
 * - Deep Espresso (#30231D, lum=0.019) -> Dark background -> Navbar text: Warm Ivory #F3EADF
 * - Muted Sage (#8C9275, lum=0.274) -> Medium background -> Navbar text: Deep Espresso #30231D (4.7:1 WCAG AA)
 * - Soft Sand (#D5B99C, lum=0.505) -> Light background -> Navbar text: Deep Espresso #30231D
 * - Warm Ivory (#F3EADF, lum=0.817) -> Light background -> Navbar text: Deep Espresso #30231D
 */
export function updateNavbarTheme(bgColor: string) {
  if (typeof document === "undefined") return;
  const [r, g, b] = parseRgb(bgColor);
  const lum = getLuminance(r, g, b);

  const isDarkBg = lum < 0.20;
  const textColor = isDarkBg ? "#F3EADF" : "#30231D";
  const textShadow = isDarkBg
    ? "0 1px 3px rgba(48, 35, 29, 0.45), 0 0 1px rgba(0, 0, 0, 0.3)"
    : "0 1px 2px rgba(243, 234, 223, 0.35)";

  document.documentElement.style.setProperty("--navbar-text-color", textColor);
  document.documentElement.style.setProperty("--nav-text-shadow", textShadow);

  const header = document.querySelector(".adaptive-header");
  if (header) {
    header.classList.toggle("header--light-text", isDarkBg);
    header.classList.toggle("header--dark-text", !isDarkBg);
  }
}

export function BackgroundColorTransitions() {
  useEffect(() => {
    // Respect user's motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      updateNavbarTheme("#F3EADF");
      return;
    }

    // Query target section DOM nodes
    const quote = document.getElementById("quote");
    const workDesktop = document.getElementById("work");
    const workMobile = document.getElementById("work-mobile");
    const disciplines = document.getElementById("services");
    const about = document.getElementById("about");
    const testimonials = document.getElementById("testimonials");
    const contact = document.getElementById("contact");
    const footer = document.getElementById("footer");
    const pageContainer = document.getElementById("page-container");

    const getWorkElements = () =>
      [workDesktop, workMobile].filter(Boolean) as HTMLElement[];

    // Ensure elements have seamless baseline backgrounds on mount
    if (quote) quote.style.backgroundColor = "#F3EADF";
    getWorkElements().forEach((el) => {
      el.style.backgroundColor = "#F3EADF";
    });
    if (disciplines) disciplines.style.backgroundColor = "#30231D";
    if (about) about.style.backgroundColor = "#D5B99C";
    if (testimonials) testimonials.style.backgroundColor = "#F3EADF";
    if (contact) contact.style.backgroundColor = "#F3EADF";
    if (footer) footer.style.backgroundColor = "#F3EADF";

    // Immediate scroll-based navbar theme synchronization
    const syncCurrentScrollTheme = () => {
      const sections = [
        { el: document.getElementById("footer"), color: "#30231D" },
        { el: document.getElementById("contact"), color: "#30231D" },
        { el: document.getElementById("testimonials"), color: "#F3EADF" },
        { el: document.getElementById("about"), color: "#F3EADF" },
        { el: document.getElementById("services"), color: "#D5B99C" },
        { el: window.innerWidth < 768 ? workMobile : workDesktop, color: "#30231D" },
        { el: document.getElementById("quote"), color: "#F3EADF" },
      ];

      for (const sec of sections) {
        if (!sec.el) continue;
        const rect = sec.el.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom > 0) {
          updateNavbarTheme(sec.color);
          return;
        }
      }
      updateNavbarTheme("#F3EADF");
    };

    syncCurrentScrollTheme();

    // 4 Sequential section transitions
    const transitions = [
      // Transition 1: Quote (Warm Ivory) -> Selected Work (Deep Espresso)
      {
        getTrigger: () => (window.innerWidth < 768 ? workMobile : workDesktop),
        fromColor: "#F3EADF",
        toColor: "#30231D",
        getTargets: () =>
          [quote, ...getWorkElements(), pageContainer, document.body].filter(
            Boolean
          ) as HTMLElement[],
      },
      // Transition 2: Selected Work (Deep Espresso) -> Creative Disciplines (Soft Sand)
      {
        getTrigger: () => disciplines,
        fromColor: "#30231D",
        toColor: "#D5B99C",
        getTargets: () =>
          [...getWorkElements(), disciplines, pageContainer, document.body].filter(
            Boolean
          ) as HTMLElement[],
      },
      // Transition 3: Creative Disciplines (Soft Sand) -> Behind the Lens & Testimonials (Warm Ivory)
      {
        getTrigger: () => about,
        fromColor: "#D5B99C",
        toColor: "#F3EADF",
        getTargets: () =>
          [disciplines, about, pageContainer, document.body].filter(
            Boolean
          ) as HTMLElement[],
      },
      // Transition 4: Behind the Lens & Testimonials (Warm Ivory) -> Contact & Footer (Deep Espresso)
      {
        getTrigger: () => contact,
        fromColor: "#F3EADF",
        toColor: "#30231D",
        getTargets: () =>
          [
            contact,
            footer,
            pageContainer,
            document.body,
          ].filter(Boolean) as HTMLElement[],
      },
    ];

    const ease = gsap.parseEase("power1.inOut");
    const createdTriggers: ScrollTrigger[] = [];

    transitions.forEach((t) => {
      const trigger = t.getTrigger();
      if (!trigger) return;

      const targets = t.getTargets();

      const st = ScrollTrigger.create({
        trigger,
        start: "top 80%",
        end: "top 20%",
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const eased = ease(self.progress);
          const color = gsap.utils.interpolate(t.fromColor, t.toColor, eased);
          targets.forEach((el) => {
            el.style.backgroundColor = color;
          });
          updateNavbarTheme(color);
        },
        onLeave: () => {
          targets.forEach((el) => {
            el.style.backgroundColor = t.toColor;
          });
          updateNavbarTheme(t.toColor);
        },
        onLeaveBack: () => {
          targets.forEach((el) => {
            el.style.backgroundColor = t.fromColor;
          });
          updateNavbarTheme(t.fromColor);
        },
      });

      createdTriggers.push(st);
    });

    // Refresh ScrollTrigger when DOM / fonts are fully rendered
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      syncCurrentScrollTheme();
    }, 250);

    return () => {
      clearTimeout(refreshTimer);
      createdTriggers.forEach((st) => st.kill());
    };
  }, []);

  return null;
}
