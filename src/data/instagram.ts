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

/** Four featured Instagram editorial posts / reels representing balanced disciplines */
export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "journal-post-1",
    coverImage: "/selected-work/sw-3-poster.jpg",
    videoPreview: "/selected-work/sw-3.mp4",
    instagramUrl: "https://www.instagram.com/octoberstills/",
    alt: "Chaitya Shah framing cinematography in the mountains",
    caption: "Everywhere with a camera · Travel cinematography",
    location: "Field Notes",
  },
  {
    id: "journal-post-2",
    coverImage: "/selected-work/sw-2-poster.jpg",
    videoPreview: "/selected-work/sw-2.mp4",
    instagramUrl: "https://www.instagram.com/octoberstills/",
    alt: "Noir footwear and sculptural shadows campaign study for Theater",
    caption: "Form, texture, and tactile shadow · Theater campaign",
    location: "Campaign Stills",
  },
  {
    id: "journal-post-3",
    coverImage: "/hero-images/maison-table.jpg",
    // Image-only post (no videoPreview), demonstrates graceful image-only card behavior
    instagramUrl: "https://www.instagram.com/octoberstills/",
    alt: "Curated culinary still life and table setting for Maison Twenty Seven",
    caption: "Slow afternoons & quiet gatherings · Maison Twenty Seven",
    location: "Maison Twenty Seven",
  },
  {
    id: "journal-post-4",
    coverImage: "/portfolio/bento1.jpg",
    videoPreview: "/hero-videos/hero-4.mp4",
    instagramUrl: "https://www.instagram.com/octoberstills/",
    alt: "Intimate wedding vows and timeless heritage ceremony",
    caption: "Timeless vows & intimate heritage celebrations",
    location: "Udaipur Celebrations",
  },
];
