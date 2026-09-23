import { A } from "../lib/assets";

export type DiscoveryAsset = { id: string; src: string; alt: string; caption?: string };
export type DiscoverySearchExample = { id: string; query: string; assets: DiscoveryAsset[] };
const T = `${A}/talent`;
const D = `${T}/discovery-v1`;

/** The homepage examples point to these same illustrative Lab posts. */
export const discoverySearches: DiscoverySearchExample[] = [
  {
    id: "outfits", query: "Everyday outfit inspiration", assets: [
      { id: "lena-croft:0", src: `${T}/lena-croft-v2/lena-croft-outfit.webp`, alt: "Fictional creator sharing a casual mirror outfit", caption: "mirror outfit check" },
      { id: "elise-morgan:hotel-mirror-v1", src: `${T}/elise-morgan/elise-morgan-hotel-selfie.webp`, alt: "Fictional creator’s hotel mirror outfit" },
      { id: "nova-reed:3", src: `${T}/nova-reed-v2/nova-reed-walk.webp`, alt: "Fictional creator in an everyday walking outfit", caption: "out for a little reset" },
    ],
  },
  {
    id: "skincare", query: "Skincare product reviews", assets: [
      { id: "nia-brooks:skincare-review", src: `${T}/nia-brooks/nia-brooks-skincare.webp`, alt: "Fictional creator demonstrating her cleanser" },
      { id: "lena-croft:4", src: `${T}/lena-croft-v2/lena-croft-grwm.webp`, alt: "Fictional creator applying moisturiser", caption: "a very ordinary morning routine" },
      { id: "nia-brooks:discovery-skincare-shelf", src: `${D}/skincare-shelf.webp`, alt: "Illustrative everyday skincare products beside a bathroom sink", caption: "what stays by the sink" },
    ],
  },
  {
    id: "nike", query: "Posts talking about Nike", assets: [
      { id: "zane-holt:discovery-zane-shoe-chat", src: `${D}/zane-shoe-chat.webp`, alt: "Fictional runner talking about a well-used Nike shoe", caption: "the pair I keep by the door" },
      { id: "zane-holt:discovery-nike-lacing", src: `${D}/nike-lacing.webp`, alt: "Illustrative runner tying Nike trainers by a park bench", caption: "five minutes before leaving" },
      { id: "zane-holt:discovery-nike-after-run", src: `${D}/nike-after-run.webp`, alt: "Illustrative worn Nike trainers after a rainy run" },
    ],
  },
  {
    id: "cats", query: "Posts about cats", assets: [
      { id: "rue-dante:discovery-cats-sleeping", src: `${D}/cats-sleeping.webp`, alt: "Illustrative ginger cats curled up asleep on a sofa", caption: "the sofa is booked" },
      { id: "rue-dante:discovery-cat-laundry", src: `${D}/cat-laundry.webp`, alt: "Illustrative tabby cat inside a laundry basket", caption: "someone else had laundry plans" },
      { id: "rue-dante:discovery-cat-window", src: `${D}/cat-window.webp`, alt: "Illustrative tuxedo cat stretching beside a rainy window", caption: "rainy-day supervisor" },
    ],
  },
];
