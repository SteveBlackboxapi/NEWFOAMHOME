import imageManifest from '../data/imageVariants.json';

// A new media directory is generated from file contents for every changed release.
// Public cache entries are immutable; the private editor keeps its protected proxy.
export const A = `${import.meta.env.BASE_URL}${import.meta.env.VITE_PRIVATE_LAB === 'true' || imageManifest.revision === 'development' ? '' : `media/${imageManifest.revision}/`}assets`;

export const img = {
  foamSymbol:   `${A}/d6571.svg`,
  foamSymbol1:  `${A}/fdb3b.svg`,
  instagram:    `${A}/20684.svg`,
  tiktok:       `${A}/8509e.svg`,
  youtube:      `${A}/d0b8e.svg`,
  briefcase:    `${A}/f1847.svg`,
  group:        `${A}/cb650.svg`,
  magnifying:   `${A}/333bb.svg`,
  shareNetwork: `${A}/a2840.svg`,
  plus:         `${A}/30501.svg`,
  caretDown:    `${A}/99668.svg`,
  talent1:      `${A}/9e849.webp`,
  talent2:      `${A}/3546d.webp`,
  talent3:      `${A}/b93cd.webp`,
  navIcons:     `${A}/db233.svg`,
  navIcons1:    `${A}/5630d.svg`,
  navIcons2:    `${A}/26407.svg`,
  navIcons3:    `${A}/5c880.svg`,
  navIconsChat: `${A}/4f583.svg`,
};

export const FG_R  = "font-founders font-normal";
export const FG_M  = "font-founders font-medium";
export const FG_SB = "font-founders font-semibold";
