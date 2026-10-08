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

export const aboutEditorialPhotos = [aboutCeoPhoto, ...aboutCandidPhotos] as const;
