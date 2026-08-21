# Quick Vote

- `public/index.html` — the voting screen (full-screen blue YES / red NO).
- `public/admin.html` — the big-screen results panel with a Clear votes button.
- `api/vote.js` — GET returns `{yes, no}`, POST `{choice: "yes"|"no"}` increments.
- `api/reset.js` — POST sets both counts back to 0.
- `lib/redis.js` — shared Redis client (Upstash, via Vercel Marketplace).

## Important: Vercel KV is discontinued

Vercel sunset their own "Vercel KV" product and the `@vercel/kv` package — it no longer works.
Redis storage on Vercel now goes through the **Marketplace**, backed by Upstash. That's what
this project uses (`@upstash/redis`). If you deployed the earlier version of this project and
votes were stuck at 0, this is why — the old code was calling a dead API.

## Deploy on Vercel

1. Push this folder to a GitHub repo (or run `vercel` from inside it with the Vercel CLI).
2. Import the repo in the Vercel dashboard → New Project. Framework preset: **Other** (no build step).
3. Add storage: project → **Storage** tab → **Marketplace Database Storage** →
   search **Redis** (Upstash) → create and **connect it to this project**.
   Vercel injects the env vars automatically on deploy — no manual copy-pasting needed.
4. Redeploy (Deployments → ⋯ → Redeploy) so the function picks up the new env vars.

## URLs after deploy

- `https://your-project.vercel.app/` → voting screen, share this with voters.
- `https://your-project.vercel.app/admin.html` → the projector screen, Clear votes top-right.

## If it still shows 0 after voting

- Open the deployed `/admin.html` — a yellow error banner will now appear at the top if the
  API is failing, showing the actual error instead of failing silently.
- In Vercel → project → **Deployments** → latest → **Functions** tab, click `api/vote` and check
  the logs for the "Missing Redis env vars" message — that means the store isn't connected to
  this project/environment (Production vs Preview matters — connect it to both, or at least
  whichever one you're testing).
- After connecting or reconnecting storage, you must **redeploy** — env vars are injected at
  build/deploy time, not live.

## Notes

- No accounts, no de-duplication — anyone can vote as many times as they like, by design.
- Votes are stored under the keys `votes:yes` and `votes:no`.
- The admin panel polls every 2 seconds — good enough for a live room, no websockets needed.
- `Clear votes` asks for confirmation before wiping the count, since it resets it for everyone.
