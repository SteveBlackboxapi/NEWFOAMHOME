# Supplied About team portraits

Received from the user on 8 October 2026. The set contains 54 supplied photographs and avatars, retained in received order as team-01 through team-54. No identities were inferred and no deduplication was performed. Team-54 is an intentional additional image supplied by the user.

The masters/ directory contains every original PNG byte-for-byte unchanged. The initial display assets use lossless WebP only when smaller than the supplied PNG; otherwise the display file is an unchanged PNG copy. These initial assets were not resized, upscaled, retouched, cropped, or regenerated. Source dimensions are recorded in src/data/aboutTeam.ts.

Initial delivery validation: all 54 masters match their received source SHA-256 hashes, and all 54 original display files decode to exactly the same RGBA pixels and dimensions as their sources. Originals total 1,071,636 bytes; initial display files total 610,648 bytes (43.02% smaller).

Eight current placements subsequently use versioned generated background edits. All initial assets remain available. See `README-brand-backgrounds-v1.md` and `brand-backgrounds-v1-provenance.json` for those edits, their retained generated masters, exact prompts and validation.
