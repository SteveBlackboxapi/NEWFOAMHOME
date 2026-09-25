import { A } from "../lib/assets";
const ASSETS = `${A}/people-colour/story-refresh-v1`;

type Platform = "tiktok" | "instagram";
type Comment = { name: string; text: string; colour: string };
export type LiveExample = {
  talentId: string;
  platform: Platform;
  name: string;
  handle: string;
  image: string;
  alt: string;
  title: string;
  description: string;
  viewers: number;
  comments: Comment[];
};

export const creatorLiveExamples: LiveExample[] = [
  {
    talentId: "tessa-quinn",
    platform: "tiktok",
    name: "Tessa Quinn",
    handle: "tessaquinn",
    image: `${ASSETS}/tessa-live.webp`,
    alt: "Fictional creator Tessa Quinn chatting to the camera after an outdoor workout.",
    title: "The everyday moments.",
    description: "A post-workout catch-up. A few familiar faces.",
    viewers: 1248,
    comments: [
      { name: "mila.moves", text: "Made it for the cool down 🤍", colour: "#9d82ab" },
      { name: "jess", text: "This is my favourite part of the day", colour: "#728986" },
      { name: "ellie.runs", text: "What's on the playlist today?", colour: "#8c6f80" },
      { name: "nia", text: "The sunshine is everything ☀️", colour: "#716f92" },
      { name: "leah", text: "Okay, joining you tomorrow!", colour: "#847c67" },
      { name: "sofie", text: "Five minutes for ourselves. Yes.", colour: "#6d8295" },
    ],
  },
  {
    talentId: "luca-marin",
    platform: "instagram",
    name: "Luca Marin",
    handle: "lucamarin",
    image: `${ASSETS}/luca-live.webp`,
    alt: "Fictional creator Luca Marin talking to the camera from a sunny outdoor café.",
    title: "The things you know.",
    description: "Coffee, a good view, and the conversation in between.",
    viewers: 862,
    comments: [
      { name: "sammie", text: "Okay where is this place?", colour: "#8b829f" },
      { name: "james.l", text: "That view never gets old", colour: "#708c92" },
      { name: "amy", text: "Coffee and a catch-up. Perfect 🤍", colour: "#957e70" },
      { name: "theo", text: "Saved your last recommendation!", colour: "#6f7e96" },
      { name: "olivia", text: "Taking us with you, as always", colour: "#95818b" },
      { name: "ben", text: "What are we ordering today?", colour: "#7a8c75" },
    ],
  },
];

