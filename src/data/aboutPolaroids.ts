/**
 * Octoberstills — Behind the Lens / About Chaitya Shah
 * Polaroid Photographs Data & Configuration
 * 
 * TO REPLACE PHOTOGRAPHS OR ADJUST POSITIONS:
 * 1. image: Path to photo in /public or external image URL.
 * 2. alt: Descriptive alt text for accessibility.
 * 3. caption: Optional subtle editorial caption on the Polaroid bottom chin.
 * 4. rotation: Initial angle in degrees (e.g. -7 to +6).
 * 5. desktopPosition: Inset styles around the central biography.
 */

export interface PolaroidItem {
  id: string;
  image: string;
  alt: string;
  caption?: string;
  rotation: number;
  desktopPosition: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  mobileRotation?: number;
}

export const ABOUT_POLAROIDS: PolaroidItem[] = [
  {
    id: "polaroid-chaitya",
    image: "/portfolio/about_portrait.jpg",
    alt: "Chaitya Shah seated with vintage cameras and contemplative natural light",
    caption: "Chaitya · In the Studio",
    rotation: -7,
    desktopPosition: {
      top: "2%",
      left: "1%",
    },
    mobileRotation: -4,
  },
  {
    id: "polaroid-lake-pichola",
    image: "/selected-work/sw-1-poster.jpg",
    alt: "Atmospheric stillness and architecture over Lake Pichola at twilight",
    caption: "Udaipur, Lake Pichola",
    rotation: 6,
    desktopPosition: {
      top: "4%",
      right: "1%",
    },
    mobileRotation: 5,
  },
  {
    id: "polaroid-noir-shadow",
    image: "/portfolio/bento3.jpg",
    alt: "Sculptural footwear and deep shadow study for Theater collection",
    caption: "Form & tactile shadow",
    rotation: 5,
    desktopPosition: {
      bottom: "2%",
      left: "2%",
    },
    mobileRotation: 3,
  },
  {
    id: "polaroid-botanical-ritual",
    image: "/portfolio/bento2.jpg",
    alt: "Intimate botanical skincare formulation and morning daylight",
    caption: "Quiet luxury in light",
    rotation: -6,
    desktopPosition: {
      bottom: "1%",
      right: "2%",
    },
    mobileRotation: -4,
  },
];
