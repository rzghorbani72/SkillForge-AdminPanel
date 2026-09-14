# Image optimization (edusphere)

## The problem this solves

Two separate problems, one pipeline.

1. **Every image downloaded at full size.** `next.config.ts` had
   `images: { unoptimized: true }`, so a 48px avatar and a 172px card thumbnail
   both downloaded the stored original — up to 1600px of WebP.
2. **The Next.js image cache could evict the pod.** Turning the built-in
   optimizer on would fix (1) and cause something worse: Next resizes images
   inside the pod and writes every variant to `.next/cache/images` on the pod's
   own disk. That cache has no size limit. On a long-lived pod it grows until
   Kubernetes evicts us for exceeding the container's ephemeral-storage limit,
   and the cache is rebuilt from zero on every replica and every restart.

## The shape of the fix

**The Next pod never resizes and never caches an image.** It only rewrites URLs.
The backend renders each derivative once and stores it in the same object bucket
the originals already live in.

```
<AppImage preset="avatar" />
        │  sizes="48px"
        ▼
lib/images/image-loader.ts        ← custom loader; no /_next/image, no disk cache
        │  …/images/fetch-image-by-id/<id>?w=64&q=60
        ▼
Backend GET /v1/images/fetch-image-by-id/:id
        │  hit  → variants/<id>/w64-q60.webp  (object storage)
        │  miss → sharp resize → store → serve
        ▼
Cache-Control: public, max-age=31536000, immutable
```

Consequences worth knowing:

- **Pod disk usage from images is zero.** No eviction risk, no cold cache after
  a deploy, and every replica shares the same warm cache.
- **The resize cost is paid once** per `(image, width, quality)`, not per pod.
- **Derivatives do not count against an academy's storage quota.** Quota sums
  `Image.size` rows in the database (`plan-limits.service.ts`); variants are
  bucket objects with no row.

## The pieces

| File                                             | Role                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `edusphere/components/ui/app-image.tsx`          | The component every image goes through.                                   |
| `edusphere/lib/images/image-presets.ts`          | The size/quality/priority table.                                          |
| `edusphere/lib/images/image-loader.ts`           | Rewrites `src` to `?w=&q=`. Wired in via `images.loaderFile`.             |
| `edusphere/lib/images/sized-image-url.ts`        | Escape hatch for CSS backgrounds and the few `<img>` tags that must stay. |
| `Backend/src/common/utils/image-variant.util.ts` | The width ladder, the variant key, the sharp render.                      |
| `Backend/src/images/images.service.ts`           | `fetchImageById` — variant cache, conditional GET, cache headers.         |

## Using it

```tsx
import { AppImage } from "@/components/ui/app-image";

// Fills a positioned parent.
<AppImage src={coverUrl} alt={course.title} preset="card" fill className="object-cover" />

// Fixed box — pass the real rendered size.
<AppImage src={avatarUrl} alt={name} preset="avatar" width={48} height={48} sizes="48px" />
```

`src` accepts `null`, which is the normal case for an optional cover. Pass
`fallback` to render something else in its place; the default is nothing, never
a broken-image icon.

Presets: `avatar`, `thumb`, `card`, `cover`, `banner`, `logo`. Add a preset
rather than passing one-off `sizes`/`quality` at a call site — that is the whole
point of the file.

`AppImage` is a **server component**. Do not add `"use client"` to it: the public
pages are server-rendered for SEO and an image must not drag a client boundary
up the tree.

### When you cannot use it

Two cases, both real:

- The layout depends on the browser measuring the file — `h-auto w-full`, or a
  logo of unknown aspect ratio. `fill` would collapse it and fixed
  `width`/`height` would guess the aspect ratio wrong.
- The image is a CSS `background-image`.

Use `sizedImageUrl(url, maxRenderedWidth, quality)` there, plus
`loading="lazy" decoding="async"` on the tag. It skips the srcset but still
downloads the right number of pixels.

## The invariant that will break if you ignore it

`deviceSizes` + `imageSizes` in `edusphere/next.config.ts` **must stay a subset
of** `IMAGE_VARIANT_WIDTHS` in
`Backend/src/common/utils/image-variant.util.ts`.

A width outside the ladder is snapped _up_ by the backend, so nothing errors —
the page just silently downloads more pixels than it asked for. There is no test
that can catch this across two repos; it is a review check.

## Cache headers

| Request                        | `Cache-Control`                                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Public image, `?w=` derivative | `public, max-age=31536000, immutable` — the URL is content-addressed by id + width + quality, so those bytes can never change |
| Public image, original         | `public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400`                                                        |
| Lesson-gated image             | `private, no-store`                                                                                                           |

`fetchImageById` also answers `If-None-Match` with a `304` **before** touching
object storage, so a repeat view costs one database read and no bytes. The old
code sent a strong `ETag` but never checked it, and set `Last-Modified` to
`new Date()` on every response, which made it useless for validation.
