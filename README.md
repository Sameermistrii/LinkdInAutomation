# UniSin

Schedule LinkedIn posts through the **official LinkedIn API**. You write a post, drop it in a queue, and a worker publishes it at the slot you picked. No scraping.

You (the developer) hold one Google app and one LinkedIn app. People who use your copy only sign in. They never see a client ID.

## What it does

- Sign in with Google or LinkedIn
- Connect LinkedIn once so UniSin can post as that person
- Pick interests and thought leaders (bookmarks for ideas — we cannot follow people for you)
- Set weekly time slots
- Compose, preview, queue, skip a day, or post now
- A background job publishes due posts even if the user’s laptop is off

Google login only opens the app. Publishing still needs **Connect LinkedIn**.

Until LinkedIn **reviews and approves** Share on LinkedIn, only you (and LinkedIn test users) can connect posting.

## How to use (after it is running)

1. Open the site → **Sign in**
2. Connect LinkedIn if asked
3. Finish onboarding (topics + thought leaders) or skip
4. **My posts** → **Edit post schedule** → pick times
5. **Create** / **New post** → write → **Add to queue**
6. Keep the **worker** (or Vercel cron) running so due posts go out

Posts live in the database. The browser does not need to be open at publish time. The **server** that runs the worker does.

## Local setup

You are standing up **your own copy** of UniSin: a Next.js app, a Postgres database, Google login, LinkedIn login + posting, and a small worker that publishes queued posts.

### What you need on the machine

- **Node.js 20 or newer** (`node -v`)
- **npm** (comes with Node)
- **Docker Desktop** running (for local Postgres). If you already have Postgres, you can skip Docker and point `DATABASE_URL` at that server instead.
- A **Google Cloud** project (free) for “Sign in with Google”
- A **LinkedIn Developer** app for “Sign in with LinkedIn” and **Share on LinkedIn**

Use **port 3000**. The sample `.env` and the OAuth consoles below are written for `http://localhost:3000`. If Next.js starts on 3001 because 3000 is busy, Google/LinkedIn login will fail until you fix the port or the redirect URLs.

---

### Step 1 — Get the code

```bash
git clone <your-fork-url>
cd "Linkden Automation"
npm install
```

`npm install` also runs `prisma generate` so TypeScript can see the database client in `generated/prisma`.

On Windows, if `prisma generate` fails with **EPERM** / file locked, stop `npm run dev` first, then run `npx prisma generate` again.

---

### Step 2 — Start Postgres

From the project folder:

```bash
docker compose up -d
```

That starts a Postgres 16 container:

- host: `localhost`
- port: `5432`
- user: `postgres`
- password: `postgres`
- database: `linkedin_queue`

Check it is up:

```bash
docker compose ps
```

`db` should be `running`. Data is stored in a Docker volume named `pgdata`, so it survives container restarts.

**Not using Docker?** Create a Postgres database yourself and put its URL in `.env` as `DATABASE_URL` (same shape as Neon: `postgresql://USER:PASSWORD@HOST:5432/DBNAME`).

---

### Step 3 — Create `.env`

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` in an editor. **Do not commit this file.** Fill it as follows.

#### Database

Leave this as-is if you used Docker in step 2:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/linkedin_queue"
```

If you use **Neon** (or any hosted Postgres), paste the connection string they give you, including `?sslmode=require` when they tell you to.

#### Session and cron secrets

Replace the placeholders with long random strings (two different values):

```
SESSION_SECRET=   # signs the login cookie
CRON_SECRET=      # password for GET /api/cron/publish (used on Vercel)
```

Example generator:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice; paste one into `SESSION_SECRET`, the other into `CRON_SECRET`.

#### App URL

Local:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Uploads

Leave empty on your laptop:

```
BLOB_READ_WRITE_TOKEN=
```

Images then save under `uploads/` on disk. You only need a Vercel Blob token when the app is hosted on Vercel.

#### `LINKEDIN_API_VERSION`

Leave `202608` unless LinkedIn’s docs tell you to bump it.

---

### Step 4 — Google OAuth (sign in)

This is only for **Sign in with Google**. It does not publish to LinkedIn.

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create or pick a project.
2. **APIs & Services** → **OAuth consent screen** → External (or Internal if you are on a Workspace). Add your email as a test user while the app is in Testing.
3. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID** → type **Web application**.
4. **Authorized JavaScript origins:** `http://localhost:3000`
5. **Authorized redirect URIs:**  
   `http://localhost:3000/api/auth/google/callback`  
   Copy this **exactly** (no trailing slash).
6. Create. Copy **Client ID** and **Client secret** into `.env`:

```
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-....
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

`GOOGLE_REDIRECT_URI` in `.env` must be the **same string** as the redirect you registered in Google.

---

### Step 5 — LinkedIn app (sign in + posting)

This is for **Sign in with LinkedIn** and later **Connect LinkedIn** (the token used to publish).

1. Open [LinkedIn Developers](https://www.linkedin.com/developers/apps) → **Create app**.
2. Fill name, LinkedIn Page, and logo. Create.
3. **Auth** tab → **Authorized redirect URLs for your app:**  
   `http://localhost:3000/api/auth/linkedin/callback`  
   again, exact match, no trailing slash.
4. Copy **Client ID** and **Primary Client Secret** into `.env`:

```
LINKEDIN_CLIENT_ID=....
LINKEDIN_CLIENT_SECRET=....
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
```

5. **Products** tab — request / add:
   - **Sign In with LinkedIn using OpenID Connect** (login)
   - **Share on LinkedIn** (create posts)

Until LinkedIn **approves Share on LinkedIn**, only the app owner and listed **test users** can connect posting. Sign-in may work before posting does.

**Company Pages** need **Community Management** (separate product, later). Personal profile posting does not.

---

### Step 6 — Create tables

Still in the project folder, with Docker running and `.env` saved:

```bash
npx prisma migrate deploy
```

This applies every file in `prisma/migrations/` to your database. You should see migrations applied, not a connection error.

If it cannot connect: Docker is not running, port 5432 is taken by another Postgres, or `DATABASE_URL` is wrong.

---

### Step 7 — Run the website

```bash
npm run dev
```

Wait until it says it is ready, then open [http://localhost:3000](http://localhost:3000).

You should see the UniSin landing page. **Sign in** uses Google or LinkedIn from `.env`.

If the terminal says it started on **3001**, stop it, free port 3000, and start again — **or** add `http://localhost:3001/.../callback` in Google, LinkedIn, **and** change `GOOGLE_REDIRECT_URI`, `LINKEDIN_REDIRECT_URI`, and `NEXT_PUBLIC_APP_URL` in `.env` to 3001. All three places must match.

---

### Step 8 — Run the publisher (second terminal)

The site **queues** posts. It does **not** send them to LinkedIn by itself.

Open a **new** terminal in the same folder (leave `npm run dev` running):

```bash
npm run worker
```

You should see something like: `checking due posts every minute`.

That process must stay running on a machine that has internet. If you close it, queued posts wait until it starts again.

---

### Checklist: you are done locally when

- [ ] `docker compose ps` shows the db running (or Neon URL works)
- [ ] `.env` has real Google and LinkedIn ids/secrets (not empty)
- [ ] Redirect URLs in Google, LinkedIn, and `.env` are identical
- [ ] `npx prisma migrate deploy` succeeded
- [ ] Browser: `http://localhost:3000` loads UniSin
- [ ] Sign in works
- [ ] After LinkedIn sharing is approved (or you are a test user), **Connect LinkedIn** works
- [ ] `npm run worker` is running in a second terminal

---

### If something fails

| What you see | Likely cause |
| --- | --- |
| Google/LinkedIn “redirect_uri mismatch” | URL in the console ≠ `*_REDIRECT_URI` in `.env`, or you are on port 3001 |
| Sign in works, Connect LinkedIn fails | Share on LinkedIn product not added / not approved / you are not a test user |
| `migrate deploy` connection refused | Docker not running, or `DATABASE_URL` host/port wrong |
| `prisma generate` EPERM on Windows | `next dev` has the Prisma engine locked — stop it, generate, start again |
| Post stays **Queued** past the slot | Worker is not running, or that machine has no internet |
| Post goes to **Errors** | LinkedIn token expired, API rejected the post, or media upload failed |

---

## Hosted setup (Vercel)

Same app, but Postgres and files live in the cloud. Typical pieces: **Vercel** (Next.js) + **Neon** (Postgres) + **Vercel Blob** (images).

1. Create a Neon project. Copy the connection string into Vercel env as `DATABASE_URL` (with SSL as Neon documents).
2. Create a Blob store on Vercel. Copy `BLOB_READ_WRITE_TOKEN`.
3. In the **same** Google and LinkedIn apps, **add production redirects** (keep localhost too if you still develop locally):
   - `https://YOUR_DOMAIN/api/auth/google/callback`
   - `https://YOUR_DOMAIN/api/auth/linkedin/callback`
4. In Vercel → Project → Settings → Environment Variables, set:
   - all OAuth vars (ids, secrets, redirect URIs pointing at **https://YOUR_DOMAIN/...**)
   - `DATABASE_URL`
   - `BLOB_READ_WRITE_TOKEN`
   - `SESSION_SECRET` and `CRON_SECRET` (new random values, not the local ones if you can avoid sharing)
   - `NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN`
5. Build command:

```
npx prisma migrate deploy && next build
```

6. `vercel.json` hits `/api/cron/publish` every minute with `Authorization: Bearer CRON_SECRET`. **Vercel Hobby** may only run cron **once a day**. For posts that must go out on the minute, use Vercel Pro or run `npm run worker` on a cheap always-on VPS that uses the same `DATABASE_URL`.

Never put `.env` in GitHub. Vercel env is the hosted copy of those secrets.

## How keys work

Same model as Buffer or Notion: platform secrets in env, user tokens in the database.

1. Someone clicks Continue with Google or LinkedIn  
2. Google/LinkedIn ask **that person** for permission  
3. The server stores **their** token on **their** user row  
4. The worker posts to LinkedIn as that person  

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js app |
| `npm run worker` | Publish due queued posts |
| `npx prisma migrate deploy` | Apply DB migrations |
| `npx prisma generate` | Prisma client (`generated/prisma`) |

Made with 💙 by [Sameer Mistri](https://github.com/Sameermistrii).
