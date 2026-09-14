# Frontend data layer (AdminPanel & edusphere)

Both apps read data through **TanStack React Query v5**. SWR has been removed
from both. This document is the contract for new features.

## Why React Query and not hand-rolled effects

`queryFn` receives an `AbortSignal` that the library aborts automatically when
the component unmounts or the query key changes. That single fact gives us the
three things the old `useEffect` + `fetch` code kept re-implementing badly:

- pending requests are cancelled when the page changes;
- a late response can never overwrite a newer one;
- identical in-flight requests are deduped instead of fired twice.

## The rules

### 1. Read data with `useApiQuery`, never a bare `useEffect` + fetch

`AdminPanel/hooks/use-api-query.ts` and `edusphere/hooks/use-api-query.ts` wrap
`useQuery`. Pass the signal straight through:

```ts
const { data, isLoading } = useApiQuery({
  queryKey: queryKeys.courseOffers(academyId, courseId),
  queryFn: (signal) => apiClient.getCourseOffers(courseId, { signal }),
  enabled: Boolean(courseId),
});
```

If the API method you need does not accept a signal yet, add an optional
trailing `opts?: ReadOptions` and forward it. `ApiClient.request()` spreads its
options into `fetch`, so nothing else has to change.

### 2. Every AdminPanel key starts with the academy id

Build keys with `queryKeys.*` (`AdminPanel/lib/query/keys.ts`) and nowhere else.
A key without an academy prefix is a **tenant-isolation defect**, not a style
issue: two academies would share one cache entry.

`useApiQuery` refuses to run while no academy is selected, so a request can
never be issued — or cached — outside a tenant scope.

### 3. The QueryClient is created inside the tree, never at module scope

A module-scope client is shared across requests on the server, which would hand
one user's cache to the next. Both providers use
`useState(() => new QueryClient(...))`.

### 4. Clear the cache when the tenant changes

`StoreProvider.selectAcademy` and `clearAcademies` call `queryClient.clear()`.
Logout does a full `window.location` reload, which discards the in-memory cache
on its own.

### 5. Server-side caching is for anonymous GETs only

In `edusphere/lib/api/server.ts`, `baseFetch` caches a response only when
`includeAuth === false` **and** the method is GET. Anything carrying a JWT stays
`cache: "no-store"`.

Academy scope travels in the `X-Academy-ID` / `X-Academy-Slug` headers, and Next
hashes request headers into the fetch cache key, so two academies cannot collide
on one entry. Cache tags are additionally prefixed with the academy scope.

Public data is marked with `revalidate: PUBLIC_REVALIDATE_SECONDS` (60s).

> **Measured status: this caching is currently INERT.** On Next 16.0.8, five
> loads of `/courses` produced five upstream calls for a fetch explicitly marked
> `revalidate: 60`. A probe confirmed the option is passed correctly, and
> `.next/cache/fetch-cache` contained only build-time entries — nothing was
> written or read at runtime.
>
> The cause is architectural: the root layout reads `cookies()` (for language,
> session, and academy resolution) on **every** route, so every render is
> dynamic, and Next 16 does not use the fetch Data Cache during a dynamic
> render. Next 16's answer is Cache Components (`use cache` / `cacheLife` /
> `cacheTag`), which needs the cookie reads isolated behind Suspense boundaries.
>
> What the branch still buys today is **intent and safety**: authenticated
> responses are explicitly `no-store`, and if caching is ever enabled the
> anonymous-only rule and academy-scoped tags are already in place. Do not claim
> a performance win from it until the numbers move.

### 6. Defaults, and when to override them

`staleTime` 60s, `gcTime` 5min, `refetchOnWindowFocus` false, one retry (none on
4xx in AdminPanel, where a 401/403/402 is a verdict the api client already
handles).

- Near-static reference data (roles, categories): pass a longer `staleTime`.
- Paginated tables: pass `keepPrevious: true` so a page change does not blank
  the grid.
- Polling (notification bell, live-session link): pass `refetchInterval`.

### 7. After a mutation, invalidate — do not refetch everything

```ts
await queryClient.invalidateQueries({ queryKey });
```

For learning-record writes (submissions, progress), prefer re-reading from the
server over patching the cache: what the server stored is the record. The one
exception is the video heartbeat, which writes the cache directly via
`setQueryData` because it fires every 15s and must not trigger a refetch.
