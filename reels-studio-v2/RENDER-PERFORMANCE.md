# Render optimization — 26 October 2026

Applied only to the local Studio renderer and queue. Page settings, music selection, manual rendering UI, scheduling and publishing APIs are unchanged.

## Changes

- Prove the Chrome PNG has no transparency before using a still-image fast path. The existing background pipeline remains for images with alpha or unknown PNG format. No background video decoding/scaling when it is completely hidden by the opaque full-frame screenshot.
- Decode the still at 1 fps, convert pixels before duplicating frames to the selected 24/30 fps. Keep libx264, veryfast, CRF 20, original resolution/duration, AAC 192 kbps, volume/fades and faststart.
- Two simultaneous items on machines with at least 8 logical CPUs and 12 GiB RAM; otherwise one. Cap each encoder at four CPU threads. Batches remain serialized, claims remain atomic, completed items are not redone and cancellation is respected.
- Keep full-file decode validation before promoting the .part.mp4 artifact; fail on decode errors. Do not weaken output verification for speed.

## Measured results

Read-only fixture: existing Polish story, 541 characters, 15 seconds, 30 fps, music enabled. Benchmarks write only temporary files, never insert production jobs or trigger Publisher transfer.

| Resolution | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| 1080x1920 | 3215 ms | 2233 ms | 30.5% |
| 1440x2560 | 3906 ms | 2412 ms | 38.2% |

Decoded SHA-256 hashes match for video and audio streams at both resolutions. A separate 20-video 1080p batch using two workers completed in 30142 ms; this ran while the production build was also running, so it is not a guaranteed SLA. Other templates, durations and machine load can differ.

## Verification

- `node scripts/verify-render-performance.cjs`: PNG alpha/fallback, CPU/RAM limits, 20 items exactly once, bounded workers, cancellation, wait for worker cleanup on errors.
- `node scripts/verify-render-queue.cjs`: actual queue with isolated in-memory DB/mock renderer, atomic claims, duplicate start, completed-item preservation, counts, cancel, partial failure and retry.
- `node scripts/verify-parser.cjs`: UTF-8/BOM/multiline import regression.
- `node scripts/verify-page-music.cjs`: shuffled track pools and deterministic selected tracks preserved.
- `npm run build:local`: production compilation, types and all routes passed.
- `node scripts/benchmark-render.cjs LABEL`: real isolated 1080p/2K render measurement.
- `node scripts/benchmark-render.cjs LABEL 20`: isolated two-worker batch measurement.

Files: `src/lib/renderEngine.ts`, `src/lib/renderPerformance.ts`, `src/lib/localRenderQueue.ts`; benchmark and regression scripts listed above. No production database rows were created by these tests.
