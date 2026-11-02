# Fitness World

A gym website with a lead pipeline, paid memberships through Razorpay, a member portal (**My Fitness**), member-only content (**The Inner Circle**), a nutrition section (**The Fuel Studio**), an AI assistant (**FITBOT**) and an admin dashboard.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lenis, PostgreSQL + Prisma 7, NextAuth v4 (credentials + JWT), Razorpay, Claude API (`@anthropic-ai/sdk`), Resend.

---

## 1. Local setup

```bash
npm install
cp .env.example .env          # then fill in values (see section 2)

# Start a local Postgres (or use a Neon/Supabase URL in DATABASE_URL)
docker run -d --name fitnessworld-pg -e POSTGRES_USER=fitness -e POSTGRES_PASSWORD=<pick-one> \
  -e POSTGRES_DB=fitness_world -p 5433:5432 -v fitnessworld-pgdata:/var/lib/postgresql/data postgres:17-alpine

npx prisma migrate deploy     # create tables
npx prisma generate           # generate the client into src/generated/prisma
npx prisma db seed            # sample plans, meals, content + your admin user
npm run dev
```

Log in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and open `/admin`.

### Changing the schema

```bash
npx prisma migrate dev --name <what-changed>   # creates + applies a migration, dev only
npx prisma generate
```

Commit the files in `prisma/migrations/`. In production, run `npx prisma migrate deploy`.

## 2. Environment variables

See `.env.example` for every variable with comments. Required to run: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. Needed for payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. Optional: `ANTHROPIC_API_KEY` (FITBOT; it shows an offline panel without it), `RESEND_API_KEY` + `EMAIL_FROM` + `ADMIN_NOTIFY_EMAIL` (emails; printed to the console in development without it), and the `NEXT_PUBLIC_*` contact details.

Secrets are read only on the server. Only `NEXT_PUBLIC_*` values reach the browser.

## 3. Payments (Razorpay)

Flow: **plan → account → review → Razorpay Checkout → server verification → membership**.

1. `/api/payments/order` creates the order. The amount comes from the database, never from the browser. A `Payment` row is stored with status `CREATED` and a snapshot of plan, cycle and price.
2. After checkout, `/api/payments/verify` does four checks: the HMAC signature, that the order belongs to the logged-in user, the payment's real status re-fetched from Razorpay (capturing it if it is only `authorized`), and that the amount matches.
3. `/api/payments/webhook` handles `payment.captured`, `order.paid` and `payment.failed`. It checks the signature against the raw body and stores each `x-razorpay-event-id` in `WebhookEvent`, so a delivery is processed once.
4. `activatePayment()` (in `src/lib/payments.ts`) runs in one transaction. An atomic `CREATED → PAID` claim makes it idempotent, whichever of the callback or the webhook arrives first. Renewing the same plan stacks days onto the current end date. Changing plan starts the new plan today.

No card or UPI data is ever stored: only order and payment IDs, amount, method and status.

**Test mode:** use `rzp_test_…` keys and [Razorpay test cards/UPI](https://razorpay.com/docs/payments/payments/test-card-details/). To receive webhooks locally, expose port 3000 (for example `ngrok http 3000`). Then add `https://<tunnel>/api/payments/webhook` in Dashboard → Webhooks with the secret from `RAZORPAY_WEBHOOK_SECRET`, and tick the three events.

There are no recurring subscriptions. Members pay each period from **My Fitness → Pay My Fee**.

## 4. Deploying (Vercel + Neon)

1. Create a Neon (or Supabase) Postgres database and copy its connection string.
2. Import the repo into Vercel. Add every variable from `.env.example`, with `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` set to your production URL.
3. Set the build command to `npx prisma generate && npx prisma migrate deploy && next build`.
4. Run `npx prisma db seed` once against production, with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set, to create plans and the first admin. Then change prices in `/admin/plans`.
5. Point the Razorpay webhook to `https://<your-domain>/api/payments/webhook`.
6. Verify a sending domain in Resend and set `EMAIL_FROM`.

**Rate limiting** (`src/lib/rate-limit.ts`) is in-memory per server instance. On multi-instance hosting, back it with Upstash Redis or similar.

## 5. Before launch: replace the placeholders

Nothing below is real business data. All of it is clearly marked on the site.

| What | Where |
|---|---|
| Address, map, hours, social links | `src/config/site.ts` |
| Phone, email, WhatsApp number | `NEXT_PUBLIC_*` env vars |
| Statistics strip (sample figures; set `isPlaceholder: false` when real) | `src/config/site.ts` → `stats` |
| Prices (sample; set `pricing.isPlaceholder: false` when final) | `/admin/plans` and `src/config/site.ts` |
| Trainer showcase on the homepage | `src/config/content.ts` → `trainers` |
| Founding story | `src/app/(site)/our-story/page.tsx` |
| Testimonials (seeded as labelled samples) | `/admin/content/testimonials`. Real stories need recorded consent |
| Privacy policy and terms (drafts) | `src/app/(site)/privacy`, `src/app/(site)/terms` |
| Photos and video (Unsplash/Pexels stock) | `src/config/media.ts` |

## 6. Security notes

- Passwords are hashed with bcrypt (cost 12). Login is rate-limited and has uniform timing. Reset tokens are single-use, hashed, and expire after 1 hour.
- `src/proxy.ts` redirects anonymous users away from `/my-fitness` and `/admin`. **Every** page, route handler and server action also re-checks the session, active membership and role on the server.
- Member-only Inner Circle fields (video URLs, full text) are never sent to non-members. For real member videos, host them on storage that issues signed URLs, so a shared link expires.
- Admins cannot create paid time. Membership time comes only from verified payments. Cancelling or reinstating requires a reason, stored on the membership.
- Lead forms collect consent, include a honeypot, and are rate-limited. They ask users not to share medical information.
- `legacy/` holds the previous version of the site, kept for reference. It is excluded from TypeScript, ESLint and git, and can be deleted.

## 7. Project map

```
src/app/(site)/        public pages (home, our-story, training, memberships, fuel-studio,
                       transformations, inner-circle, contact, consultation, join, login…)
src/app/(portal)/      /my-fitness member portal
src/app/(admin)/       /admin dashboard + server actions (actions.ts)
src/app/api/           leads, auth, payments (order/verify/webhook), fitbot, me/*, meals/saved
src/lib/               db, auth, membership, payments, razorpay, fitbot, email, validation
src/config/            site facts, content, media URLs: edit these first
prisma/                schema, migrations, seed
```
