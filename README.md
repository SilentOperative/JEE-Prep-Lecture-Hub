# JEE Prep Hub — Class 11 & 12 Lecture Library

A mobile-first React + TypeScript + Vite lecture-library starter for JEE Prep Hub.

## Features

- Class 11 and Class 12 navigation
- Physics, Chemistry, Mathematics and Biology
- NCERT-aligned chapter catalogue
- Chapter-wise lecture playlists
- Search chapters and lecture titles
- Telegram public-post embeds (one Telegram post per lecture)
- Direct HTTPS video playback for media URLs you are authorised to host/use
- Mark lectures completed and track progress
- JSON import interface for adding/updating lecture records
- Responsive dark navy interface

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Production build:

```bash
npm run build
npm run preview
```

## Add lectures

Use **Import lectures** in the bottom-right corner and paste JSON. See
`public/lecture-import.example.json` for the format.

A lecture can contain:

- `telegramPostUrl`: a single public Telegram post URL, e.g. `https://t.me/channel/123`
- `videoUrl`: a direct HTTPS video URL that you own or are authorised to stream
- `duration`, `description`, `title`

Telegram post URLs must be individual message links, not just the channel URL.
The app validates Telegram post-link shape and embeds the official post widget.
A channel home link does not provide a playlist or a list of video files.

## About the supplied channel

Configured channel: https://t.me/jeeadvanced000

At the time this starter was prepared, its public preview showed the channel title
"JEE Advanced" and 1 member, but no publicly readable post list. Therefore no
lecture URLs could be reliably mapped into chapters from the channel preview.
The app is preloaded with the Class 11/12 chapter structure; lecture entries
remain empty until individual post links are added.

## Telegram playback notes

Telegram provides an official embed widget for individual public channel/group
posts. The widget renders the post on your site; it is not a general-purpose
video-hosting API. Some media can require opening Telegram or may not play inline
in every browser/device. Use the original Telegram post link as a fallback.

Official documentation:
- https://core.telegram.org/widgets/post
- https://core.telegram.org/widgets

Do not attempt to extract protected media, bypass Telegram restrictions, or
re-host third-party course videos without permission.

## Supabase integration

The app reads chapters and lecture records from Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. It also uses Supabase anonymous authentication, when enabled in the project, to sync each learner's completed lectures. If the database is unavailable or empty, the supplied local catalog remains available as a safe fallback.

Apply `supabase/migrations/20261120000000_jee_lecture_hub.sql` in the connected Supabase project, then copy `.env.example` to `.env.local` and set the two browser-safe variables. The migration creates the lecture tables, indexes, RLS policies, and seeds the 106 supplied chapters. Lecture rows should be inserted through a protected admin workflow; service-role keys must never be shipped to the browser.

## Production integration checklist

This is a working frontend starter, not a deployed production service.

1. Enable anonymous authentication if cross-session learner progress is desired.
2. Protect lecture import/edit actions with server-verified admin authentication.
   The current import control is a local demo and is not an access-control system.
3. Store progress per authenticated user in Supabase rather than localStorage. The current UI keeps a local fallback for offline use.
4. Add server-side pagination/search if the lecture library becomes large.
5. Add a consent/privacy notice for third-party Telegram embeds.
6. Configure CSP and allow only the required Telegram widget frame/script origins.
7. Add monitoring, backups, and RLS policies before opening to students.

## Data model suggestion

```sql
create table public.lecture_chapters (
  id text primary key,
  class_level int not null check (class_level in (11, 12)),
  subject text not null check (subject in ('Physics','Chemistry','Mathematics','Biology')),
  name text not null,
  sort_order int not null default 0
);

create table public.lecture_items (
  id text primary key,
  chapter_id text not null references public.lecture_chapters(id) on delete cascade,
  title text not null,
  description text,
  duration text,
  telegram_post_url text,
  video_url text,
  sort_order int not null default 0
);

create table public.lecture_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lecture_id text not null references public.lecture_items(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lecture_id)
);
```

Apply RLS policies appropriate to your existing authentication model. Do not
copy this schema into an existing JEE Prep Hub database without reviewing it.
