# Secure video player

## Why this exists

Every video used to be a plain MP4 URL: permanent, guessable, and served to
anyone whose browser happened to carry the session cookie. `curl`, IDM and
`yt-dlp` all worked. Paid course content is the product's moat, so a course that
leaks in week one costs an academy — and costs us that academy.

## What actually protects the video

The protection is a chain, and every link is required:

1. **No whole file exists.** ffmpeg splits the upload into ~6-second AES-128
   encrypted segments (`Backend/src/videos/hls/video-transcode.service.ts`).
   The original MP4 is deleted unless a lesson grants a download.
2. **The legacy route is closed.** `GET /videos/stream/:id` returns 404 once a
   lesson-linked video has a rendition, so the easy path is gone.
3. **One authenticated entry point.** `POST /videos/hls/session/:id` is the only
   place entitlement is checked, and it uses the canonical `LessonAccessService`.
4. **Tickets, not URLs.** The playlist and key links are HMAC-signed and bound to
   the viewer's session, IP and user-agent. A copied link is dead on another
   machine, and the key ticket lives two minutes.
5. **`src` is never a file.** hls.js feeds the element via MediaSource, so the
   DOM only ever holds a `blob:` URL.

## What does NOT protect it

Screen recording. Nothing in a browser stops it — only hardware DRM
(Widevine L1 / FairPlay) does, and that needs a licence server we cannot reach
from Iran. The moving watermark is the honest answer: a leak carries the name and
phone tail of the account it came from. Never describe this player as
"impossible to copy".

## Data flow

```
<SecureVideoPlayer videoId>
   └─ useSecurePlayback
        └─ POST /videos/hls/session/:id   ← entitlement checked here
             ↳ { tier, playlistUrl, watermark, poster }
        └─ hls.js → GET /videos/hls/:token/index.m3u8   (playlist, rewritten per viewer)
                      ↳ segments  → CDN, secure-link signed
                      ↳ key       → GET /videos/hls/key/:token   (2-minute ticket)
```

`tier: "legacy"` means the video has no rendition yet; the hook falls back to the
old stream route so playback never simply breaks while the worker catches up.
