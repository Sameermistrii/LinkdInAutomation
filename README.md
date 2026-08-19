# UniSin

A LinkedIn post scheduler. **You** (the company) hold one Google app and one LinkedIn app. **Customers** only open your site and sign in. They never see a client ID.

## How keys work

`GOOGLE_CLIENT_ID` and `LINKEDIN_CLIENT_ID` in `.env` (or Vercel env) are **platform secrets**, same as Buffer or Notion.

1. A customer clicks Continue with Google or LinkedIn.
2. Google/LinkedIn ask **that person** for permission.
3. Your server stores **their** access token on **their** user row.
4. The publisher posts to LinkedIn as that person.

Secrets never go in GitHub. Customers never open a developer portal.

Until LinkedIn **reviews and approves** your app for Share on LinkedIn, only you (and LinkedIn test users) can connect posting. After approval, anyone who signs in can click Connect LinkedIn.

Google sign-in only opens the dashboard. Publishing still needs Connect LinkedIn once.

Free vs Premium is not implemented yet. Everyone uses the same login.

## Hosted (your startup URL)

**Vercel + Neon Postgres + Vercel Blob**.

1. Neon Postgres URL → `DATABASE_URL`
2. Vercel Blob → `BLOB_READ_WRITE_TOKEN`
3. Google Cloud OAuth (Web): localhost + `https://YOUR_DOMAIN/api/auth/google/callback`
4. LinkedIn app: **Sign In with LinkedIn** + **Share on LinkedIn**. Redirect `https://YOUR_DOMAIN/api/auth/linkedin/callback`. Request Community Management later for Company Pages.
5. Vercel env: those keys, `SESSION_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`
6. Build command: `npx prisma migrate deploy && next build`

Vercel Hobby cron may run only daily. Use Pro for every-minute publish, or run `npm run worker` on a small always-on box.

## Self-host / GitHub clone

You become the platform for your own copy. Put **your** Google and LinkedIn keys in `.env`.

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

```bash
npm run worker
```

Redirects for local:

- `http://localhost:3000/api/auth/google/callback`
- `http://localhost:3000/api/auth/linkedin/callback`
