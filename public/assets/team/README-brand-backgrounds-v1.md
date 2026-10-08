# Team background colours, version 1

On 8 October 2026 the user requested eight scattered team-portrait backgrounds in the supplied lime, pale blue, cyan and sage palette, while preserving the people. The edits were produced with Codex's built-in image-generation/editing tool from the original supplied portraits.

Updated slots and requested colours:

- team-03 and team-36: lime, `#E8F87E`.
- team-10 and team-29: pale blue, `#C1E5FF`.
- team-16 and team-49: pale sage, `#E2E5D4`.
- team-23 and team-42: cyan, `#6DDCEF`.

The original `masters/team-XX.png` and initial `team-XX.webp` files remain unchanged. The selected 1254 × 1254 generated PNG masters are retained as `masters/team-XX-brand-v1-generated.png`. Their eight versioned delivery files, `team-XX-brand-v1.webp`, are all 72 × 72 pixels and total 45,716 bytes. The 54 entry IDs, order and dimensions in `src/data/aboutTeam.ts` are unchanged; only these eight image source paths changed.

Each generated master was reduced to the existing 72-pixel display size, then encoded as lossless WebP. No code-based masking, recolouring or portrait retouching was performed. All eight delivery files decode to exactly the pixels produced by resizing their selected generated masters. Original and generated master hashes were verified after copying.

The original and edited portraits were compared side by side at 72 pixels. Recognizable portraits, clothing and framing remain consistent, but these generated edits are not pixel-identical foreground recolours. Requested background hex values are targets, not guarantees of exact output pixels. One team-49 attempt was rejected for being too dark and replaced with the recorded pale-sage retry.

`brand-backgrounds-v1-provenance.json` retains the exact selected prompts, built-in tool provenance, source and generated filenames, all source/generated/delivery SHA-256 hashes, dimensions, byte counts and validation results. The rejected team-49 prompt and filename are documented there but that rejected output is not used by the website.
