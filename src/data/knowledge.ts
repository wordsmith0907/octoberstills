/**
 * Octoberstills Official Studio Knowledge Base
 *
 * Source of truth for Chaitya Shah's creative studio.
 * Used for AI Studio Concierge grounding, qualification, and portfolio navigation.
 */

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  discipline: "photography" | "cinematography" | "ugc";
  anchor: string;
}

export interface StudioDiscipline {
  id: string;
  number: string;
  title: string;
  description: string;
  suitableFor: string[];
}

export interface StudioKnowledgeBase {
  identity: {
    studioName: string;
    founder: string;
    spellingNotes: string;
    titles: string[];
    experience: string;
    positioning: string;
    tagline: string;
  };
  contact: {
    verifiedEmail: string;
    verifiedInstagram: string;
    contactFormAnchor: string;
    responseTime: string;
    locationPolicy: string;
  };
  disciplines: StudioDiscipline[];
  portfolio: PortfolioItem[];
  policies: {
    pricing: string;
    scheduling: string;
    guarantees: string;
    leadCaptureConsent: string;
  };
  faqs: Array<{ question: string; answer: string; category: string }>;
}

export const OCTOBERSTILLS_KNOWLEDGE: StudioKnowledgeBase = {
  identity: {
    studioName: "Octoberstills",
    founder: "Chaitya Shah",
    spellingNotes: "Chaitya Shah (not Chaitiya)",
    titles: [
      "Creative Director",
      "Cinematographer",
      "Brand Strategist",
      "Visual Storyteller",
    ],
    experience: "Over 8 years in the creative industry",
    positioning:
      "Combines cinematic aesthetics with commercially purposeful storytelling across photography, films, and creator-led brand content. Octoberstills is an editorial visual studio, not exclusively a wedding photography business.",
    tagline: "Thoughtfully seen. Beautifully told.",
  },
  contact: {
    verifiedEmail: "octoberstills@gmail.com",
    verifiedInstagram: "https://www.instagram.com/octoberstills/",
    contactFormAnchor: "#contact",
    responseTime: "Chaitya typically reviews qualified inquiries within 24 to 48 business hours.",
    locationPolicy:
      "Available for on-location productions worldwide and remote studio shoots.",
  },
  disciplines: [
    {
      id: "photography",
      number: "01",
      title: "Photography",
      description:
        "Editorial fashion, luxury hospitality, architectural compositions, and thoughtful product still life with sculpted natural light.",
      suitableFor: [
        "Editorial & fashion brand campaigns",
        "Luxury hotels, boutique stays & architecture",
        "Apothecary, beauty & skincare product still-life",
        "Artisanal culinary & lifestyle imagery",
      ],
    },
    {
      id: "cinematography",
      number: "02",
      title: "Films & Cinematography",
      description:
        "Cinematic brand films, motion narratives, and commercial visual stories with an intimate, poetic cadence.",
      suitableFor: [
        "Brand origin films & manifestos",
        "Commercial campaigns & social films",
        "Atmospheric hospitality & destination films",
        "Fashion motion lookbooks",
      ],
    },
    {
      id: "ugc-content",
      number: "03",
      title: "UGC & Brand Content",
      description:
        "High-aesthetic, creator-led video content and organic social assets that connect authentically with modern audiences.",
      suitableFor: [
        "Creator-led beauty & skincare rituals",
        "Lifestyle & apparel styling narratives",
        "Sensory travel & hospitality features",
        "High-aesthetic organic reels & short-form video",
      ],
    },
  ],
  portfolio: [
    {
      id: "udaipur-sanctuary",
      title: "Udaipur: Sanctuary on the Water",
      category: "Luxury Hospitality & Destination",
      description:
        "Capturing the island palace in Udaipur across calm rippling waters, glowing marble silhouettes, and the soft amber light of dusk.",
      discipline: "cinematography",
      anchor: "#work",
    },
    {
      id: "theater-noir",
      title: "Theater: Noir Leather & Footwear",
      category: "Editorial Fashion & Accessories",
      description:
        "Sculpted leather silhouettes, timeless vintage textures, and deliberate styling photographed in intimate natural sunset light.",
      discipline: "photography",
      anchor: "#work",
    },
    {
      id: "coastal-cadence",
      title: "Everywhere with a Camera: Coastal Journey",
      category: "Travel & Lifestyle Cinematography",
      description:
        "An intimate visual diary following the rhythm of coastal roads, swaying coconut palms, and honest, spontaneous moments.",
      discipline: "cinematography",
      anchor: "#work",
    },
    {
      id: "bath-and-body-works",
      title: "Bath & Body Works: Luminous Silk Fragrance",
      category: "Product & Apothecary Still Life",
      description:
        "Macro light refractions, sparkling fine fragrance mist vessels, and flowing champagne silk textiles designed for commercial sensory allure.",
      discipline: "photography",
      anchor: "#work",
    },
    {
      id: "open-air-atelier",
      title: "The Open-Air Atelier: Plein Air Study",
      category: "Creative Disciplines & Brand Story",
      description:
        "Artisan brushwork, contemplative morning focus, and tactile painting processes documented amidst organic grove greenery.",
      discipline: "photography",
      anchor: "#work",
    },
    {
      id: "meadow-solitude",
      title: "Meadow Solitude: Movement & Earth",
      category: "Artisanal Lifestyle & Motion",
      description:
        "Free-flowing movement, earthy linen draping, and the quiet cadence of solitary afternoon warmth in the mango grove.",
      discipline: "ugc",
      anchor: "#work",
    },
  ],
  policies: {
    pricing:
      "Every collaboration is uniquely scoped based on concept, production requirements, licensing, and deliverables. Fixed package rates are not published because projects range from single-day studio shoots to multi-week international campaigns. Chaitya provides custom proposals upon reviewing a brief.",
    scheduling:
      "Chaitya's availability is subject to ongoing commissions and travel schedules. The assistant cannot confirm calendar dates directly; preferred dates can be captured in a brief for Chaitya to review.",
    guarantees:
      "Octoberstills delivers intentional artistic excellence and thoughtful brand storytelling, but never makes speculative performance or view count guarantees.",
    leadCaptureConsent:
      "By sharing your project brief, you consent to submitting these details to Chaitya Shah and the Octoberstills studio team for review.",
  },
  faqs: [
    {
      category: "Services",
      question: "What services does Octoberstills offer?",
      answer:
        "Octoberstills specializes in three disciplines: Photography (editorial, hospitality, product), Films & Cinematography (brand films, commercial motion), and UGC & Brand Content (creator-led organic video).",
    },
    {
      category: "Services",
      question: "Do you create UGC or creator-led videos?",
      answer:
        "Yes. Octoberstills produces elevated creator-led content and aesthetic UGC reels for skincare, lifestyle, fashion, and hospitality brands.",
    },
    {
      category: "Pricing",
      question: "How much do your services cost?",
      answer:
        "Each project is custom-priced based on creative scope, deliverables, licensing, and production scale. Share a brief with your vision and we will prepare a tailored estimate.",
    },
    {
      category: "Availability",
      question: "When is Chaitya available to shoot?",
      answer:
        "Availability depends on ongoing productions and travel. Share your target dates and timeframe, and Chaitya will confirm her schedule when reviewing your inquiry.",
    },
    {
      category: "Location",
      question: "Where are you based and do you travel?",
      answer:
        "Chaitya works with brands globally, traveling for on-location productions worldwide as well as accepting product shipments for remote studio production.",
    },
    {
      category: "Weddings",
      question: "Is Octoberstills just a wedding photography business?",
      answer:
        "No. While Chaitya has documented select intimate weddings, Octoberstills is an editorial visual studio focusing primarily on brand films, commercial photography, hospitality, and creator-led storytelling.",
    },
  ],
};
