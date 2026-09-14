# Academy site pages (About / Contact / social links)

Lets an academy manager write the **About** and **Contact** pages of their own
public website, and publish the contact + social channels that appear on the
Contact page and in the site footer.

## Why it is not part of the template builder

The template builder composes *layout*. This is *text a manager writes once*.
Keeping it separate means a manager can fill in their contact details without
opening a page editor, and the public pages stay plain server-rendered HTML —
which matters, because these pages exist to be found by search engines.

## Data

| Model         | Holds                                                                 |
| ------------- | --------------------------------------------------------------------- |
| `AcademyPage` | One row per `(academy_id, slug)`, slug ∈ `about` \| `contact`. Body is **Markdown**. |
| `ContactInfo` | One row per published channel (`type`, `value`, optional `label`, `sort_order`). |

`ContactInfo` already existed in the schema but was unused; this feature is its
first consumer. Both tables are scoped by `academy_id` and cascade with the
academy.

An unpublished page (`is_published = false`) is a draft: the public endpoint
never returns it and the public route 404s.

## API — `Backend/src/academy-site`

| Route                                | Access    | Purpose                          |
| ------------------------------------ | --------- | -------------------------------- |
| `GET /academy-site/public?slug=`     | public    | Published pages + channels, by academy slug |
| `GET /academy-site/pages`            | manager   | Both pages, drafts included      |
| `PUT /academy-site/pages/:slug`      | manager   | Save one page                    |
| `GET /academy-site/contact-links`    | manager   | Current channel list             |
| `PUT /academy-site/contact-links`    | manager   | Replace the whole ordered list   |

Channels are replaced as one list rather than diffed: the panel edits them as a
single ordered list, and a partial failure would leave a half-edited public site.

## Panel — `AdminPanel/app/(protected)/settings/site-pages`

One screen: two page editors (Markdown, with a publish switch) plus the channel
list. Reached from Settings → Academy.

## Public site — `edusphere`

`/about` and `/contact` now belong to whoever owns the hostname: the platform on
the root domain, the academy on its own site. Before this feature the academy
routes fell through to the platform's own About/Contact pages, so every academy
site served Mentoma's copy under the academy's brand.

The footer reads the same cached payload: it shows the academy's real social
icons (previously hardcoded `href="#"`) and hides the About/Contact links while
those pages are unpublished.

## Adding a channel

1. Add the key to `CONTACT_CHANNELS` in `Backend/src/academy-site/contact-channels.ts`
   and `AdminPanel/types/academy-site.ts`.
2. Add its icon to `CHANNEL_ICON` and, if a bare handle needs a profile URL, a
   base URL in `edusphere/lib/academy-contact.ts`.
3. Add the label under `academySite.channels` (edusphere) and
   `settings.sitePages.channels` (AdminPanel) in `fa` and `en`.
