# Pasko Planner 🎄
Mobile-first monito-monita organizer. React + Vite + Tailwind, Supabase (Auth + Postgres + Edge Functions). Everyone logs in (Google or email).

## Setup
1. Supabase SQL Editor (Run as postgres): run `supabase/schema.sql`. (It drops and recreates tables, so only re-run while testing.)
2. Authentication → Providers: **Email** is on by default (turn off "Confirm email" while testing). For **Google**: create an OAuth client in Google Cloud Console, add the redirect URI `https://YOUR_REF.supabase.co/auth/v1/callback`, then paste the Client ID/Secret into Supabase.
3. Authentication → URL Configuration: set Site URL and add `http://localhost:5173/**` plus your deployed URL to Redirect URLs.
4. Edge Functions → create `draw`, paste `supabase/functions/draw/index.ts`, deploy.
5. `cp .env.example .env`, fill URL + anon key, then `npm install && npm run dev -- --host`.
6. Optional: sign up in the app, edit your email in `supabase/seed.sql`, run it for demo groups PASKO1 and PASKO2.

## Privacy
- Anon has no table or function access. Logged-in users call `security definer` functions that use `auth.uid()`.
- RLS on `assignments`: you can read only the row where you are the giver. The organizer has no special read access.
- The draw runs in the `draw` Edge Function (verifies the caller is the organizer, random derangement, respects exclusions, friendly error if impossible).

## Status
All 6 screens done. Existing database? Run `supabase/messages.sql` once (adds chat functions and a grant the draw function needs).
