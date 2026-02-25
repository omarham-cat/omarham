# Deployment Guide — Om Arham (Free Tier)

Everything runs on free tiers. Total ongoing cost: **$0**.

| Service  | Free Tier Limits                                    |
| -------- | --------------------------------------------------- |
| Vercel   | 100 GB bandwidth, unlimited deploys (hobby)         |
| Supabase | 500 MB database, 1 GB storage, 50 k monthly users   |

---

## Prerequisites

- A GitHub account
- Node.js 18+ installed locally (for testing)

---

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up / log in.
2. Click **New Project**.
3. Choose an organization (or create one), pick a name (e.g. `omarham`), set a database password, and choose a region close to your users.
4. Wait for the project to finish provisioning (~1 min).

### Copy your credentials

From the project dashboard go to **Settings → API**:

| Value              | Where to find it                    |
| ------------------ | ----------------------------------- |
| Project URL        | `Settings → API → Project URL`      |
| Anon (public) key  | `Settings → API → anon / public`    |

Keep these handy — you'll set them as environment variables later.

---

## Step 2 — Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**.
2. Click **New Query**.
3. Paste the entire contents of [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).
4. Click **Run**. All tables, triggers, and RLS policies will be created.

---

## Step 3 — Enable Authentication Providers

### Email (enabled by default)

Go to **Authentication → Providers → Email** and ensure it's enabled.
Turn off "Confirm email" during testing if you want instant signups.

### Google OAuth (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or use existing).
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**.
4. Application type: **Web application**.
5. Add authorized redirect URI:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
6. Copy **Client ID** and **Client Secret**.
7. In Supabase dashboard: **Authentication → Providers → Google** → enable and paste the Client ID and Secret.

---

## Step 4 — Create an Admin User

1. Register on your deployed site (or via Supabase dashboard: **Authentication → Users → Add User**).
2. Note the user's UUID from the Users table.
3. In **SQL Editor**, run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = '<paste-user-uuid-here>';
   ```
4. That user can now access the `/admin` panel.

---

## Step 5 — Push Code to GitHub

```bash
# From the project root
git init
git add .
git commit -m "initial commit"

# Create a repo on GitHub, then:
git remote add origin https://github.com/<your-username>/omarham.git
git branch -M main
git push -u origin main
```

---

## Step 6 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New → Project → Import** your `omarham` repo.
3. Framework preset: **Next.js** (auto-detected).
4. Set **Environment Variables**:

   | Key                             | Value                                  |
   | ------------------------------- | -------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL              |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key                 |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER`   | Your WhatsApp number (e.g. `+919876543210`) |

5. Click **Deploy**. Vercel builds and gives you a `.vercel.app` URL.

---

## Step 7 — Update Supabase Redirect URLs

After deployment, update Supabase so OAuth callbacks work with your live URL:

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel URL (e.g. `https://omarham.vercel.app`).
3. Add the same URL to **Redirect URLs**: `https://omarham.vercel.app/**`.

---

## Step 8 — Custom Domain (optional)

1. In Vercel: **Settings → Domains → Add** your domain.
2. Update DNS records as Vercel instructs (CNAME or A record).
3. Update Supabase **Site URL** and **Redirect URLs** to use the custom domain.

---

## Post-Deployment Checklist

- [ ] Register a user and promote to admin (Step 4)
- [ ] Log in to `/admin` and add categories, ingredients, and products
- [ ] Verify product calorie auto-estimation works when selecting ingredients
- [ ] Test WhatsApp checkout flow (cart → checkout → WhatsApp message)
- [ ] Test Google OAuth login (if configured)
- [ ] Add gallery images and testimonials via admin panel

---

## Updating the Site

Every `git push` to `main` triggers an automatic Vercel re-deploy. No manual steps needed.

```bash
git add .
git commit -m "your changes"
git push
```

---

## Troubleshooting

| Problem                          | Fix                                                    |
| -------------------------------- | ------------------------------------------------------ |
| "Supabase not configured" banner | Ensure env vars are set in Vercel and redeploy         |
| Google login not working         | Check redirect URIs match your live URL in both Google Cloud Console and Supabase |
| WhatsApp opens with empty number | Set `NEXT_PUBLIC_WHATSAPP_NUMBER` in Vercel env vars   |
| Admin panel returns 403          | Ensure your profile `role` is set to `admin` in DB     |
| Build fails on Vercel            | Check build logs; common fix: `npm ci` in build command|
