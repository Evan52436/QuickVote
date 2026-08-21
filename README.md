# Quick Vote

- `public/index.html` — the voting screen (full-screen blue YES / red NO).
- `public/admin.html` — the big-screen results panel with a Clear votes button.
- `api/vote.js` — GET returns `{yes, no}`, POST `{choice: "yes"|"no"}` increments.
- `api/reset.js` — POST sets both counts back to 0.
- `lib/redis.js` — shared Redis client (`ioredis`, connects via `REDIS_URL`).

## Which Redis client this uses, and why

Vercel's own "Vercel KV" product is discontinued. Redis now comes through the **Marketplace**,
and depending which provider you pick, you get one of two credential shapes:

- **REST-style** (`KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` +
  `..._TOKEN`) — used by Upstash's REST API, paired with the `@upstash/redis` package.
- **Connection-string style** (`REDIS_URL`, e.g. `redis://` or `rediss://`) — a standard TCP
  Redis connection, paired with a normal Redis client like `ioredis`.

If your Storage tab only shows a single `REDIS_URL` variable (no REST URL/token pair), you have
the second kind — that's what this project is set up for, using `ioredis`.

## Deploy on Vercel

1. Push this folder to a GitHub repo (or run `vercel` from inside it with the Vercel CLI).
2. Import the repo in the Vercel dashboard → New Project. Framework preset: **Other** (no build step).
3. Storage tab → connect your Redis database to this project, for both **Production** and
   **Preview** environments. Confirm under Settings → Environment Variables that `REDIS_URL`
   appears there.
4. Redeploy (Deployments → ⋯ → Redeploy) so the function picks up the env var — connecting
   storage alone does not update an already-running deployment.

## URLs after deploy

- `https://your-project.vercel.app/` → voting screen, share this with voters.
- `https://your-project.vercel.app/admin.html` → the projector screen, Clear votes top-right.

## If it still fails after voting

- `/admin.html` shows a yellow error banner at the top with the real error message if the API
  call fails — screenshot that if you need to debug further.
- Check Vercel → project → Deployments → latest → **Functions** tab → `api/vote` logs. A
  "REDIS_URL is not set" message means the database still isn't connected to this project/env.
- After connecting/reconnecting storage, always **redeploy**.

## Names

Voters are asked for their name once (a popup on `index.html`), stored in that browser's
`localStorage`, and sent along with every vote from that device. The admin panel shows the
6 most recent voters under each side as chips.

- Names are capped at 40 characters and rendered with `textContent`, never `innerHTML`, so a
  typed name can't inject markup or scripts into the projected screen.
- There's no profanity filter or moderation — since this is projected live with no accounts,
  anyone can type anything as their "name." `Clear votes` wipes the whole name log along with
  the tally, but there's no way to remove a single bad entry without clearing everyone's.
- The last 200 vote+name entries are kept in Redis (`votes:log`); older ones roll off
  automatically so the list doesn't grow unbounded.

## Notes

- No accounts, no de-duplication — anyone can vote as many times as they like, by design.
- Votes are stored under the keys `votes:yes` and `votes:no`; entries in `votes:log`.
- The admin panel polls every 2 seconds — good enough for a live room, no websockets needed.
- `Clear votes` asks for confirmation before wiping the count and name log, since it resets it
  for everyone.
- The Redis connection is reused across warm serverless invocations rather than reconnecting on
  every request, to stay well under typical connection limits on small Redis plans.
