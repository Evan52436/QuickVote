# Quick Vote

- `public/index.html` — the voting screen (full-screen blue YES / red NO).
- `public/admin.html` — the big-screen results panel with a Clear votes button.
- `api/vote.js` — GET returns `{yes, no}`, POST `{choice: "yes"|"no"}` increments.
- `api/reset.js` — POST sets both counts back to 0.

## Deploy on Vercel

1. Push this folder to a GitHub repo (or run `vercel` from inside it with the Vercel CLI).
2. Import the repo in the Vercel dashboard → New Project. Framework preset: **Other** (no build step needed).
3. Add storage: in the project → **Storage** tab → **Create Database** → **KV** (this is Vercel's
   Redis-backed key-value store, perfect for a small counter like this). Connect it to the project —
   Vercel automatically injects the `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars the code needs.
4. Deploy. That's it — no other config.

## URLs after deploy

- `https://your-project.vercel.app/` → voting screen, share this with voters.
- `https://your-project.vercel.app/admin.html` → the projector screen, with the Clear votes button
  in the top-right corner.

## Notes

- No accounts, no de-duplication — anyone can vote as many times as they like, by design.
- Votes are stored in Vercel KV under the keys `votes:yes` and `votes:no`.
- The admin panel polls every 2 seconds — good enough for a live room, no websockets needed.
- `Clear votes` asks for confirmation before wiping the count, since it resets it for everyone.
