# OmarHam - Premium Sweets & Catering

A full-stack web application for an online sweet shop and catering service, built with Next.js, Supabase, and Razorpay.

## Features

### Sweet Shop
- Browse sweets by category with filters (ingredients, allergens) and sorting
- View detailed product pages with ingredients, calories, and variant options
- Add to cart, manage quantities, and checkout with Razorpay payments
- Order history for registered users

### Catering Service
- Browse past catering events (weddings, corporate, birthdays, festivals)
- Multi-step quote builder:
  - Select number of days and guests
  - Pick menu items for 5 daily service times (Breakfast, Lunch, Snacks, Dinner, Late Night)
  - Choose add-ons (counter setup, service staff, decorations, crockery)
  - Get an instant estimated quote
- Quote history for registered users

### Authentication
- Email + password registration and login
- Google OAuth login
- Phone OTP login
- Role-based access (customer / admin)

### Admin Portal
- Dashboard with key metrics
- Full CRUD for products, variants, ingredients, and categories
- Full CRUD for catering menu items and add-ons
- Order management with status tracking
- Catering quote management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email, Google, Phone OTP) |
| Storage | Supabase Storage |
| Payments | Razorpay |
| State | Zustand |
| Forms | React Hook Form + Zod |

## Infrastructure & Costs

| Service | Free Tier | Monthly Cost |
|---------|-----------|-------------|
| Vercel (hosting) | 100GB bandwidth, serverless functions | $0 |
| Supabase (DB + auth + storage) | 500MB DB, 1GB storage, 50K MAU | $0 |
| Razorpay (payments) | No monthly fee | 2% + GST per transaction |

**Total fixed cost: $0/month**

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier)
- A [Razorpay](https://razorpay.com) account

### 1. Clone and Install

```bash
cd omarham
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the migration file: `supabase/migrations/001_initial.sql`
3. Optionally run the seed file for demo data: `supabase/seed.sql`
4. Go to **Settings > API** and copy your project URL and anon key

### 3. Configure Auth Providers

In Supabase Dashboard > Authentication > Providers:

- **Email**: Enabled by default
- **Google**: Add your Google OAuth credentials ([guide](https://supabase.com/docs/guides/auth/social-login/auth-google))
- **Phone**: Configure Twilio for SMS OTP ([guide](https://supabase.com/docs/guides/auth/phone-login))

### 4. Set Up Razorpay

1. Create an account at [razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings > API Keys** and generate test keys
3. For production, generate live keys

### 5. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase and Razorpay credentials.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 7. Create Admin User

1. Register a new account through the app
2. In Supabase Dashboard > Table Editor > profiles, find your user and change `role` to `admin`
3. You can now access the admin portal at `/admin`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local` to Vercel's project settings
4. Deploy

### Custom Domain

In Vercel project settings, add your custom domain. Update the Supabase auth redirect URLs to match.

## Project Structure

```
src/
  app/
    (store)/         - Sweet shop (homepage, products, cart, checkout)
    (catering)/      - Catering (events showcase, quote builder)
    (auth)/          - Login and registration
    (account)/       - Order and quote history
    admin/           - Admin portal (products, orders, quotes CRUD)
    api/             - API routes (Razorpay, quotes)
    auth/callback/   - OAuth callback handler
  components/
    ui/              - shadcn/ui components
    layout/          - Navbar, Footer
    store/           - Product cards, etc.
  lib/
    supabase/        - Supabase client/server helpers
    razorpay.ts      - Razorpay server SDK
  store/
    cart-store.ts    - Zustand cart state
  types/
    database.ts      - TypeScript types for database
supabase/
  migrations/        - SQL migration files
  seed.sql           - Sample data
```
