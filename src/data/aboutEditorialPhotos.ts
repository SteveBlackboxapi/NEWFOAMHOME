import { A } from "../lib/assets";

/** Real supplied photography; source images and edit notes remain with the assets. */
export const aboutCeoPhoto = {
  id: "simon-moss-event-edited-v1",
  src: `${A}/about/simon-moss-event-edited-v1.webp`,
  width: 1133,
  height: 1280,
  section: "CEO note",
  label: "Simon Moss · edited event photograph",
} as const;

/** Selected event photographs in collage order; attendees may include guests. */
export const aboutCandidPhotos = [
  {
    id: "candid-01",
    src: `${A}/about/candid-01.webp`,
    width: 1280,
    height: 1121,
    section: "Candid moments",
    label: "Foam gathering · Candid 01",
    alt: "Four attendees posing together at Foam and Streak’s Elsie Rooftop gathering.",
    objectPosition: "50% 28%",
  },
  {
    id: "candid-02",
    src: `${A}/about/candid-02.webp`,
    width: 853,
    height: 1280,
    section: "Candid moments",
    label: "Foam gathering · Candid 02",
    alt: "Two attendees posing behind the DJ decks at Foam and Streak’s gathering.",
    objectPosition: "50% 55%",
  },
  {
    id: "candid-03",
    src: `${A}/about/candid-03.webp`,
    width: 853,
    height: 1280,
    section: "Candid moments",
    label: "Foam gathering · Candid 03",
    alt: "Guests chatting beneath string lights at Foam and Streak’s gathering.",
    objectPosition: "50% 64%",
  },
  {
    id: "candid-04",
    src: `${A}/about/candid-04.webp`,
    width: 1280,
    height: 1108,
    section: "Candid moments",
    label: "Foam gathering · Candid 04",
    alt: "Two attendees smiling on a sofa at Foam and Streak’s gathering.",
    objectPosition: "50% 30%",
  },
  {
    id: "candid-05",
    src: `${A}/about/candid-05.webp`,
    width: 853,
    height: 1280,
    section: "Candid moments",
    label: "Foam gathering · Candid 05",
    alt: "Three attendees standing together at Foam and Streak’s Elsie Rooftop gathering.",
    objectPosition: "50% 25%",
  },
  {
    id: "candid-06",
    src: `${A}/about/candid-06.webp`,
    width: 853,
    height: 1280,
    section: "Candid moments",
    label: "Foam gathering · Candid 06",
    alt: "Guests in conversation at Foam and Streak’s gathering.",
    objectPosition: "50% 70%",
  },
  {
    id: "candid-07",
    src: `${A}/about/candid-07.webp`,
    width: 853,
    height: 1280,
    section: "Candid moments",
    label: "Foam gathering · Candid 07",
    alt: "Three attendees smiling together at Foam and Streak’s gathering.",
    objectPosition: "50% 38%",
  },
  {
    id: "candid-08",
    src: `${A}/about/candid-08.webp`,
    width: 848,
    height: 1280,
    section: "Candid moments",
    label: "Foam gathering · Candid 08",
    alt: "Two attendees beside a flower display at Foam and Streak’s gathering.",
    objectPosition: "50% 32%",
  },
] as const;

/** Supplied still previews only; permission for playable interviews is pending. */
export const aboutInterviewThumbnails = [
  {
    id: "interview-01-thumbnail",
    src: `${A}/about/interview-01-thumbnail.jpg`,
    width: 1206,
    height: 673,
    section: "Manager interviews",
    label: "Talent manager interview thumbnail 01",
    alt: "Static interview thumbnail showing a talent manager beside Foam talent-search results and the Illuminate Social logo.",
  },
  {
    id: "interview-02-thumbnail",
    src: `${A}/about/interview-02-thumbnail.jpg`,
    width: 1206,
    height: 669,
    section: "Manager interviews",
    label: "Talent manager interview thumbnail 02",
    alt: "Static interview thumbnail showing a talent manager beside Foam’s media-kit editor and the ACM Talent logo.",
  },
  {
    id: "interview-03-thumbnail",
    src: `${A}/about/interview-03-thumbnail.webp`,
    width: 1206,
    height: 672,
    section: "Manager interviews",
    label: "Talent manager interview thumbnail 03",
    alt: "Static interview thumbnail showing a talent manager beside Foam content-search results and the Honey and Ivory Talent logo.",
  },
] as const;

export const aboutEditorialPhotos = [
  aboutCeoPhoto,
  ...aboutCandidPhotos,
  ...aboutInterviewThumbnails,
] as const;
