import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { SolvoPreloader, shouldSkipPreloader } from "../components/SolvoPreloader";
import { AdaptiveHeader } from "../components/AdaptiveHeader";
import { GovardhanHero } from "../components/GovardhanHero";
import { BrandMarquee } from "../components/BrandMarquee";
import { QuoteSection } from "../components/QuoteSection";
import { SelectedStories } from "../components/SelectedStories";
import { CreativeDisciplines } from "../components/CreativeDisciplines";
import { BehindTheLens } from "../components/BehindTheLens";
import { TestimonialAccordion } from "../components/TestimonialAccordion";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { StudioAssistant } from "../components/Chatbot/StudioAssistant";
import { BackgroundColorTransitions } from "../components/BackgroundColorTransitions";
import "../components/octoberstills.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OCTOBERSTILLS — Chaitya Shah | Photography, Films & Creative Direction" },
      {
        name: "description",
        content:
          "Octoberstills by Chaitya Shah — An editorial portfolio of photography, cinematic films, creative direction, and high-aesthetic UGC brand storytelling.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  return (
    <div
      id="page-container"
      className="min-h-screen w-full"
      style={{ backgroundColor: "#F3EADF" }}
    >
      {/* Scroll-Linked Background Color Transitions Controller (Ritesh Photos behavior) */}
      <BackgroundColorTransitions />

      {/* 1. Solvo-Inspired Preloader (preserved) */}
      <SolvoPreloader
        title="CHAITYA SHAH"
        speed={1}
        startDelay={0.5}
        showCounter={true}
        onLoadComplete={handlePreloaderComplete}
      />

      {/* 2. Adaptive Navigation Header (hidden during loading sequence) */}
      {preloaderDone && <AdaptiveHeader visible={preloaderDone} />}

      {/* 2b. Oktober Notes AI Assistant (hidden during loading sequence) */}
      {preloaderDone && <StudioAssistant visible={preloaderDone} />}

      {/* 3. Govardhan Art-Inspired Interactive Hero (preserved) */}
      <GovardhanHero />

      {/* 4. Trusted Brands Collaboration Marquee (preserved) */}
      <BrandMarquee />

      {/* 4b. Editorial Quote Section — Scroll-Linked Word Reveal (Ritesh Photos Reference) */}
      <QuoteSection />

      {/* 5. Selected Stories / Featured Work — Section 05 */}
      <SelectedStories />

      {/* 7. Creative Disciplines / Ways of Seeing — Section 06 */}
      <CreativeDisciplines />

      {/* 8. Behind the Lens / Chaitya Shah — Section 07 */}
      <BehindTheLens />

      {/* 9. Testimonial Accordion / Stories, through their eyes — Section 08 */}
      <TestimonialAccordion />

      {/* 10. Let's Create Together / Contact Finale — Section 09 */}
      <ContactSection />

      {/* 11. Minimal Editorial Footer — Section 10 */}
      <Footer />
    </div>
  );
}