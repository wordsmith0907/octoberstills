/**
 * Octoberstills — The October Journal (Instagram Data)
 * 
 * Configurable Instagram post data and profile links.
 * 
 * TO UPDATE CONTENT:
 * 1. INSTAGRAM_PROFILE_URL: Replace with Chaitya Shah's official Instagram profile URL.
 * 2. INSTAGRAM_POSTS: Replace coverImage, videoPreview, and instagramUrl for each of the 4 cards.
 *    - coverImage: Path to high-res JPG/WebP in /public or external CDN URL.
 *    - videoPreview: Path to MP4 in /public or external CDN URL (omit for image-only posts).
 *    - instagramUrl: Direct link to the corresponding Instagram Post or Reel.
 */

export interface InstagramPost {
  id: string;
  coverImage: string;
  videoPreview?: string;
  instagramUrl: string;
  alt: string;
  caption?: string;
  location?: string;
}

/** Official Instagram profile URL */
export const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/octoberstills";

/** Four featured Instagram editorial posts / reels */
export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "journal-post-1",
    coverImage: "/portfolio/bento1.jpg",
    videoPreview: "/hero-videos/hero-1.mp4",
    instagramUrl: "https://www.instagram.com/octoberstills/",
    alt: "Morning light over textured linen and architectural ceramics",
    caption: "Quiet mornings in the studio",
    location: "Studio Inset, Bandra",
  },
  {
    id: "journal-post-2",
    coverImage: "/portfolio/bento3.jpg",
    videoPreview: "/hero-videos/hero-2.mp4",
    instagramUrl: "https://www.instagram.com/octoberstills/",
    alt: "Noir footwear and sculptural shadows campaign study",
    caption: "Tension between shadow and form",
    location: "Campaign Preview, Mumbai",
  },
  {
    id: "journal-post-3",
    coverImage: "/portfolio/bento2.jpg",
    // Image-only post (no videoPreview), demonstrates graceful image-only card behavior
    instagramUrl: "https://www.instagram.com/octoberstills/",
    alt: "Intimate botanical skincare ritual and morning dew",
    caption: "Natural daylight on botanical rituals",
    location: "Botnia Rituals",
  },
  {
    id: "journal-post-4",
    coverImage: "/portfolio/bento4.jpg",
    videoPreview: "/hero-videos/hero-4.mp4",
    instagramUrl: "https://www.instagram.com/octoberstills/",
    alt: "Architectural stillness over water at dusk",
    caption: "Where dusk dissolves the horizon",
    location: "Lake Pichola, Udaipur",
  },
];
