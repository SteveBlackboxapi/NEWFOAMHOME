# Feed the Feed — direct-start version

Supplied by Steven Lewis on 8 October 2026 as `Feed%20the%20Feed%20copy.mp4` to replace the song with the version that starts straight away, without the earlier instrumental introduction.

The full supplied audio is retained from its first frame to its last; no extra trimming, fades, normalization or remixing were applied. Existing cover artwork remains in `../feed-the-feed-v1/`. Earlier audio versions remain unchanged in their versioned folders.

| File | Purpose | Format | Duration | Bytes |
| --- | --- | --- | ---: | ---: |
| `feed-the-feed.m4a` | Extracted audio master; original AAC packets copied without re-encoding | AAC stereo, 48 kHz, M4A | 178.350 seconds | 7337569 |
| `feed-the-feed-playback.m4a` | Browser playback derivative | AAC stereo, 48 kHz, approximately 160 kbps, M4A | 178.350 seconds | 3578813 |

Both M4A files have optimized metadata before the audio for prompt playback. Extraction and playback encoding used macOS Audio File Convert. Full decoded PCM hashes match between the supplied MP4 and extracted master. The playback derivative was decoded successfully and its first second contains audio.

`src/data/footerSong.ts` selects v3. Asset preparation also carries the unchanged v2 playback into the current media revision so tabs open during the replacement can finish playing.

## SHA-256

```text
d41fe8c0cca6bd2d78f4e25ac5406985efcfa1f91e032ae0d5f819739e4f497f  supplied MP4
0c95264fa4d35c607fb57a89881109b377ab607fc8d8c256b585443a45df3b44  feed-the-feed.m4a
d5ec21e140066722d6fd67fe49797ba4e16af21efd528b3e46e1ec82fd83f162  feed-the-feed-playback.m4a
```
