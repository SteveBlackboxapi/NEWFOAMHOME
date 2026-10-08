import type { AboutSocialPost } from "../components/AboutCommunity";
import { A } from "../lib/assets";
import { aboutCandidPhotos } from "./aboutEditorialPhotos";

/** Verified excerpts and locally retained images from Foam’s own social posts. */
export const aboutSocialPosts: readonly AboutSocialPost[] = [
  {
    id: "rooftop",
    platform: "LinkedIn",
    href: "https://www.linkedin.com/feed/update/urn:li:activity:7488638222164500480/",
    caption: "Last night we brought together some of the best people in the creator economy at Elsie Rooftop in NYC",
    image: aboutCandidPhotos[0],
  },
  {
    id: "nyfw",
    platform: "LinkedIn",
    href: "https://www.linkedin.com/feed/update/urn:li:activity:7505708096963522560/",
    caption: "Thank you to our friends at The Sociable Society for having our team to your NYFW event last week!",
    image: {
      src: `${A}/about/social-02.webp`,
      width: 1024,
      height: 1280,
      alt: "Foam’s NYFW post showing three event attendees beneath The Sociable Society title.",
      objectPosition: "50% 50%",
    },
  },
  {
    id: "creator-economy-live",
    platform: "LinkedIn",
    href: "https://www.linkedin.com/feed/update/urn:li:activity:7488951728831307776/",
    caption: "The Foam team spent this week at Creator Economy Live in NYC, and left with plenty to think about.",
    image: {
      src: `${A}/about/social-03.webp`,
      width: 1024,
      height: 1280,
      alt: "Foam’s post showing two team attendees at Creator Economy Live East in New York.",
      objectPosition: "50% 50%",
    },
  },
];
