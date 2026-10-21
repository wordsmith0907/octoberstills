/**
 * OCTOBERSTILLS — Comprehensive Brand Knowledge System
 * 
 * Versioned, immutable single-source-of-truth for Oktober Notes.
 * Grounded strictly in authentic facts about Chaitya Shah & Octoberstills.
 */

export const BRAND_KNOWLEDGE_VERSION = "2026.1";

export interface ServiceDetail {
  id: string;
  name: string;
  category: "photography" | "cinematography" | "ugc" | "direction";
  tagline: string;
  description: string;
  suitableFor: string[];
  deliverables: string[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  discipline: string;
  summary: string;
  anchor: string;
}

export interface VerifiedFAQ {
  id: string;
  topics: string[];
  triggers: string[];
  question: string;
  answer: string;
  suggestedActions: string[];
}

export const BRAND_KNOWLEDGE = {
  version: BRAND_KNOWLEDGE_VERSION,

  studio: {
    name: "Octoberstills",
    tagline: "Thoughtfully seen. Beautifully told.",
    assistantName: "Oktober Notes",
    assistantTagline: "A little space for big ideas.",
    positioning:
      "A boutique editorial visual studio founded by Chaitya Shah, specializing in evocative brand cinematography, sculpted still-life photography, and creator-led visual narratives.",
    identity:
      "Octoberstills is an editorial visual studio. While Chaitya has documented select intimate heritage weddings, Octoberstills is NOT exclusively a wedding photography business.",
    aesthetic:
      "Tactile, restrained, cinematic, sculpted by natural light, timeless, quiet luxury.",
  },

  about: {
    founder: "Chaitya Shah",
    spelling: "Chaitya Shah (not Chaitiya)",
    roles: [
      "Creative Director",
      "Cinematographer",
      "Editorial Photographer",
      "Visual Storyteller",
    ],
    experience: "Over 8 years directing and crafting commercial, editorial, and documentary imagery.",
    background:
      "Chaitya works closely with design-led brands, luxury hotels, aesthetic apothecary labels, and contemporary creators to translate concepts into moving and still images.",
  },

  services: [
    {
      id: "photography",
      name: "Still Photography",
      category: "photography",
      tagline: "Sculpted natural light, tactile forms & architectural composition.",
      description:
        "Editorial fashion lookbooks, luxury hospitality and architectural studies, beauty and apothecary still-life, and artisanal culinary spreads.",
      suitableFor: [
        "Fashion & apparel editorial campaigns",
        "Luxury hotels, villas & architectural spaces",
        "Beauty, fragrance & skincare product compositions",
        "Culinary, tableware & lifestyle still life",
      ],
      deliverables: ["High-resolution editorial color-graded stills", "Web & print-ready licenses", "Detail crops & social cutdowns"],
    },
    {
      id: "cinematography",
      name: "Films & Cinematography",
      category: "cinematography",
      tagline: "Atmospheric brand films, motion poems & narrative direction.",
      description:
        "Cinematic brand manifestos, destination films, motion lookbooks, and evocative commercial stories shot with an intimate, rhythmic cadence.",
      suitableFor: [
        "Brand origin stories & creative manifestos",
        "Commercial campaigns for web & cinema",
        "Hospitality sanctuary & travel films",
        "Seasonal motion lookbooks",
      ],
      deliverables: ["Hero brand film (4K)", "Editorial 60s/30s/15s cutdowns", "Vertical 9:16 reels with bespoke sound design"],
    },
    {
      id: "ugc",
      name: "UGC & Brand Content",
      category: "ugc",
      tagline: "High-aesthetic creator storytelling with organic allure.",
      description:
        "Elevated creator-led video content and sensory product demonstrations designed for modern social audiences that desire authenticity over corporate advertising.",
      suitableFor: [
        "Skincare & beauty ritual demonstrations",
        "Apparel styling & tactile fabric in motion",
        "Sensory unboxing & product interaction",
        "High-aesthetic organic Instagram Reels & TikTok",
      ],
      deliverables: ["Organic 9:16 vertical video stories", "Hook variations & text-overlay options", "Raw aesthetic cuts & B-roll packages"],
    },
    {
      id: "creative-direction",
      name: "Creative Direction",
      category: "direction",
      tagline: "Concept development, moodboarding & holistic visual curation.",
      description:
        "Comprehensive creative vision from initial concept, mood curation, and casting through to on-set directing and final post-production styling.",
      suitableFor: [
        "Brands launching a new collection or identity",
        "Complete campaign overhaul & art direction",
        "End-to-end visual identity consulting",
      ],
      deliverables: ["Creative moodboards & treatment deck", "Shoot shotlists & call sheets", "Post-production art direction & final grade"],
    },
  ] as ServiceDetail[],

  portfolio: [
    {
      id: "udaipur-sanctuary",
      title: "Udaipur: Sanctuary on the Water",
      client: "Raffles Udaipur",
      discipline: "Luxury Hospitality & Cinematography",
      summary: "Island palace architecture across calm waters, glowing marble silhouettes, and amber twilight.",
      anchor: "#work",
    },
    {
      id: "theater-noir",
      title: "Theater: Noir Leather & Footwear",
      client: "Theater",
      discipline: "Brand Campaign & Product Photography",
      summary: "Sculpted footwear silhouettes, deep tactile shadows, and deliberate leather textures in golden light.",
      anchor: "#work",
    },
    {
      id: "coastal-cadence",
      title: "Everywhere with a Camera: Coastal Journey",
      client: "Field Notes",
      discipline: "Travel & Lifestyle Cinematography",
      summary: "Cinematic road diary tracing coastal roads, swaying coconut palms, and authentic spontaneous moments.",
      anchor: "#work",
    },
    {
      id: "bath-and-body-works",
      title: "Bath & Body Works: Luminous Silk Fragrance",
      client: "Bath & Body Works",
      discipline: "Apothecary & Product Still Life",
      summary: "Macro light refractions, fragrance mist vessels, and flowing silk textiles.",
      anchor: "#work",
    },
    {
      id: "open-air-atelier",
      title: "The Open-Air Atelier: Plein Air Study",
      client: "Atelier Series",
      discipline: "Editorial Still Life & Documentary",
      summary: "Artisan brushwork, morning creative focus, and tactile painting processes in natural groves.",
      anchor: "#work",
    },
    {
      id: "meadow-solitude",
      title: "Meadow Solitude: Movement & Earth",
      client: "Botanical Rituals",
      discipline: "Creator UGC & Lifestyle Motion",
      summary: "Earthy linen draping and quiet afternoon light highlighting organic skincare textures.",
      anchor: "#work",
    },
    {
      id: "maison-table",
      title: "Maison Twenty Seven: Culinary Still Life",
      client: "Maison Twenty Seven",
      discipline: "Hospitality & Interior Still Life",
      summary: "Curated tableware, organic sourdough, cold-pressed olive oils, and warm afternoon gathering light.",
      anchor: "#work",
    },
    {
      id: "simons-constantia",
      title: "Simon's Groot Constantia: Historic Estate",
      client: "Groot Constantia",
      discipline: "Architectural & Heritage Photography",
      summary: "Cape Dutch white gables, historic oak trees, and afternoon sunlight across South Africa's oldest wine estate.",
      anchor: "#work",
    },
  ] as PortfolioProject[],

  process: [
    {
      step: "01",
      name: "Inquiry & Discovery",
      description: "You share your concept, target dates, and deliverables via Oktober Notes or the contact form. Chaitya reviews the brief within 24–48 hours.",
    },
    {
      step: "02",
      name: "Creative Proposal",
      description: "We prepare a custom scope detailing creative treatment, mood direction, estimated timeline, and commercial licensing options.",
    },
    {
      step: "03",
      name: "Production & Direction",
      description: "On-location shoot or remote studio production with disciplined attention to natural lighting, styling, and fluid motion.",
    },
    {
      step: "04",
      name: "Grading & Final Delivery",
      description: "Fine-art color grading, sound design for film, and high-resolution master asset delivery for web, social, and print.",
    },
  ],

  contact: {
    verifiedEmail: "octoberstills@gmail.com",
    verifiedInstagram: "https://www.instagram.com/octoberstills/",
    contactFormAnchor: "#contact",
    location: "Ahmedabad, India · Available Worldwide",
    responseTime: "Chaitya reviews qualified inquiries within 24 to 48 business hours.",
    locationPolicy: "Available worldwide for on-location productions and accepts product shipments for remote studio shoots.",
  },

  policies: {
    pricing:
      "Every project is uniquely scoped based on concept, production requirements, deliverables, and commercial licensing. Fixed public package rates are not used. A custom proposal is prepared upon reviewing your brief.",
    scheduling:
      "Availability is subject to ongoing commissions and travel dates. Preferred shoot dates can be submitted in your inquiry for Chaitya to review.",
    guarantees:
      "Octoberstills delivers artistic excellence and commercial aesthetic authority, but never guarantees speculative metrics, viral view counts, or sales numbers.",
    leadConsent:
      "By sharing your project brief, you consent to submitting these details directly to Chaitya Shah for creative review.",
  },

  faqs: [
    {
      id: "faq-who-is-chaitya",
      topics: ["chaitya", "founder", "background", "who are you", "who is chaitya"],
      triggers: ["who is chaitya", "about chaitya", "tell me about chaitya", "who is the photographer", "who is the director"],
      question: "Who is Chaitya Shah?",
      answer:
        "Chaitya Shah is the founder, creative director, and cinematographer behind Octoberstills. With over 8 years in the creative industry, she specializes in evocative brand films, editorial photography, and elevated creator-led content.",
      suggestedActions: ["Explore Services", "View Selected Work", "Discuss a Project"],
    },
    {
      id: "faq-what-is-octoberstills",
      topics: ["octoberstills", "studio", "about", "what is octoberstills"],
      triggers: ["what is octoberstills", "tell me about octoberstills", "what does octoberstills do", "about the studio"],
      question: "What is Octoberstills?",
      answer:
        "Octoberstills is an editorial visual studio founded by Chaitya Shah. The studio crafts brand films, photography, and high-aesthetic UGC with a focus on sculpted natural light, timeless cadence, and purposeful commercial storytelling.",
      suggestedActions: ["Explore Services", "View Selected Work", "Discuss a Project"],
    },
    {
      id: "faq-services",
      topics: ["services", "offer", "capabilities", "what services"],
      triggers: ["what services", "services do you offer", "what do you do", "list services", "photography or video"],
      question: "What services does Octoberstills offer?",
      answer:
        "Octoberstills offers three primary creative disciplines: Editorial Photography, Films & Cinematography, and High-Aesthetic UGC & Brand Content, supported by comprehensive Creative Direction.",
      suggestedActions: ["Photography Details", "Films & Motion", "UGC Showcase", "Discuss a Project"],
    },
    {
      id: "faq-pricing",
      topics: ["pricing", "cost", "rates", "how much", "packages"],
      triggers: ["how much", "pricing", "cost", "rates", "packages", "price list", "charge"],
      question: "How much do your services cost?",
      answer:
        "Every project at Octoberstills is custom-scoped based on creative concept, production requirements, deliverables, and licensing. Share a few details about what you're planning, and we will prepare a tailored proposal.",
      suggestedActions: ["Share Project Brief", "Explore Services", "Contact Chaitya"],
    },
    {
      id: "faq-contact",
      topics: ["contact", "email", "reach", "hire", "phone"],
      triggers: ["how can i contact", "what is your email", "contact info", "how to reach", "email address"],
      question: "How can I contact the studio?",
      answer:
        "You can reach Chaitya directly at octoberstills@gmail.com, connect via Instagram (@octoberstills), or share your project brief right here in this chat.",
      suggestedActions: ["Share Project Brief", "Instagram @octoberstills", "View Selected Work"],
    },
    {
      id: "faq-collaboration",
      topics: ["collab", "collaboration", "work together", "hire", "start project"],
      triggers: ["how to collaborate", "how do i start", "work with chaitya", "hire chaitya", "book a shoot"],
      question: "How do I start a collaboration?",
      answer:
        "Starting a project is simple: share an outline of your vision, target timeline, and deliverables here in the chat or via our on-page inquiry form. Chaitya personally reviews inquiries within 24 to 48 hours.",
      suggestedActions: ["Share Project Brief", "Explore the Work", "Contact Directly"],
    },
    {
      id: "faq-portfolio",
      topics: ["portfolio", "work", "projects", "where can i see", "examples"],
      triggers: ["where can i see the portfolio", "view portfolio", "see your work", "show me work", "portfolio link"],
      question: "Where can I see the portfolio?",
      answer:
        "You can explore Chaitya's curated stories in motion and editorial still life directly in the Selected Work section (#work) on this page.",
      suggestedActions: ["View Selected Work", "Explore Services", "Discuss a Project"],
    },
    {
      id: "faq-location",
      topics: ["location", "travel", "where are you", "mumbai", "ahmedabad", "worldwide"],
      triggers: ["where are you based", "do you travel", "location", "can you shoot in", "do you travel for shoots"],
      question: "Where are you based, and do you travel?",
      answer:
        "Octoberstills is based in Ahmedabad, India, and Chaitya travels worldwide for on-location productions. The studio also accepts product shipments for remote still-life and UGC shoots.",
      suggestedActions: ["Discuss a Project", "View Selected Work", "Contact Chaitya"],
    },
    {
      id: "faq-wedding-distinction",
      topics: ["wedding", "weddings only", "just wedding"],
      triggers: ["only wedding", "just wedding", "wedding photographer only", "do you only shoot weddings"],
      question: "Is Octoberstills just a wedding photography business?",
      answer:
        "No. While Chaitya documents select intimate heritage weddings, Octoberstills is primarily an editorial visual studio dedicated to commercial brand films, still-life photography, hospitality, and creator-led brand content.",
      suggestedActions: ["Explore Services", "View Brand Work", "Discuss a Project"],
    },
  ] as VerifiedFAQ[],
};
