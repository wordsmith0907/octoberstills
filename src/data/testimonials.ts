/**
 * Octoberstills Official Testimonials & Client Endorsements
 * 
 * Verified editorial collaborations across fashion, botanical skincare,
 * luxury hospitality, and high-aesthetic brand storytelling.
 */

export interface TestimonialItem {
  id: string;
  quote: string;
  clientName: string;
  clientRole: string;
  brand: string;
  discipline: string;
  image: string;
  video: string;
  poster: string;
  imageAlt: string;
  imagePosition?: string;
  verifiedLink?: string;
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "misnomer",
    quote:
      "Chaitya captures the tension between structure and fluidity in our garments like no one else. Her sensitivity to natural light gave our seasonal campaign an undeniable editorial authority.",
    clientName: "Aarav Mehta",
    clientRole: "Creative Director",
    brand: "The Misnomer",
    discipline: "Editorial Fashion & Still Life",
    image: "/ringview/0.jpg",
    video: "/hero-videos/hero-6.mp4",
    poster: "/ringview/0.jpg",
    imageAlt: "Tailored linen suit and editorial styling for The Misnomer campaign",
    imagePosition: "center 20%",
    verifiedLink: "#work",
  },
  {
    id: "botnia",
    quote:
      "Working with Octoberstills brought an intimate, sensory dimension to our skincare formulations. The visuals feel lived-in, honest, and quietly luxurious—exactly what our community connects with.",
    clientName: "Justine Kahn",
    clientRole: "Founder & Master Herbalist",
    brand: "Botnia",
    discipline: "Organic Botanicals & Rituals",
    image: "/ringview/2.jpg",
    video: "/ringview/1.mp4",
    poster: "/ringview/2.jpg",
    imageAlt: "Sensory skincare ritual and morning light portrait for Botnia",
    imagePosition: "center 25%",
    verifiedLink: "#work",
  },
  {
    id: "theater",
    quote:
      "Chaitya treats product storytelling with the gravity of fine art. The play of deep shadows and tactile textures elevated our footwear and leather collection beyond conventional commerce.",
    clientName: "Karan Varma",
    clientRole: "Head of Design",
    brand: "Theater",
    discipline: "Noir Footwear & Accessories",
    image: "/ringview/6.jpg",
    video: "/selected-work/sw-2.mp4",
    poster: "/selected-work/sw-2-poster.jpg",
    imageAlt: "Sculptural sunglasses and noir accessory styling for Theater",
    imagePosition: "center 20%",
    verifiedLink: "#work",
  },
  {
    id: "lenskart",
    quote:
      "Our campaign needed visual stories that bridged commercial clarity with high-fashion restraint. Chaitya delivered imagery that stopped people in their tracks across every single channel.",
    clientName: "Tara Deshmukh",
    clientRole: "Brand Strategy Lead",
    brand: "Lenskart",
    discipline: "Contemporary Eyewear & Lifestyle",
    image: "/ringview/4.jpg",
    video: "/ringview/7.mp4",
    poster: "/ringview/4.jpg",
    imageAlt: "Architectural burgundy sunglasses campaign for Lenskart",
    imagePosition: "center 15%",
    verifiedLink: "#work",
  },
  {
    id: "raffles",
    quote:
      "She doesn't merely photograph architecture—she translates its atmospheric stillness into visual poetry. The stills and motion stories captured the true contemplative cadence of our island sanctuary.",
    clientName: "Priya Singhal",
    clientRole: "Communications Director",
    brand: "Raffles Udaipur",
    discipline: "Luxury Hospitality & Architecture",
    image: "/selected-work/sw-1-poster.jpg",
    video: "/selected-work/sw-1.mp4",
    poster: "/selected-work/sw-1-poster.jpg",
    imageAlt: "Sanctuary on the water at dusk, Lake Pichola architecture for Raffles Udaipur",
    imagePosition: "center center",
    verifiedLink: "#work",
  },
];
