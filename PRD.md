# PRD — Golf Charity Subscription Platform
**Issued By:** Digital Heroes · digitalheroes.co.in
**Version:** 1.0 · March 2026
**Stack:** React.js + TypeScript · Tailwind CSS · Node.js + Express.js · Supabase (PostgreSQL) · Razorpay · SMTP

---

## 1. Project Overview

A subscription-driven web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine. The platform must feel emotionally engaging and modern — deliberately avoiding traditional golf website aesthetics.

**Users will:**
- Subscribe to the platform (monthly or yearly)
- Enter their latest golf scores in Stableford format
- Participate in monthly draw-based prize pools
- Support a charity of their choice with a portion of their subscription

---

## 2. Core Objectives

| Objective | Description |
|-----------|-------------|
| Subscription Engine | Robust subscription and payment system via Razorpay |
| Score Experience | Simple, engaging score-entry flow |
| Custom Draw Engine | Algorithm-powered or random monthly draws |
| Charity Integration | Seamless charity contribution logic |
| Admin Control | Comprehensive admin dashboard and tools |
| Outstanding UI/UX | Design that stands out in the golf industry |

---

## 3. User Roles

### Public Visitor
- View platform concept
- Explore listed charities
- Understand draw mechanics
- Initiate subscription

### Registered Subscriber
- Manage profile and settings
- Enter and edit golf scores
- Select charity recipient
- View participation and winnings history
- Upload winner proof

### Administrator
- Manage users and subscriptions
- Configure and run draws
- Manage charity listings
- Verify winners and payouts
- Access reports and analytics

---

## 4. Subscription & Payment System

| Field | Detail |
|-------|--------|
| Plans | Monthly and Yearly (discounted rate) |
| Gateway | Razorpay (PCI-compliant) |
| Access Control | Non-subscribers get restricted access |
| Lifecycle | Handles renewal, cancellation, lapsed states |
| Validation | Real-time subscription status check on every authenticated request via Supabase |

**Subscription amounts stored in env vars:**
```
SUBSCRIPTION_MONTHLY_PRICE=  # in paise (e.g. 49900 = ₹499)
SUBSCRIPTION_YEARLY_PRICE=   # in paise
PRIZE_POOL_PERCENT_OF_SUBSCRIPTION=
```

**Payment Flow:**
1. `POST /api/subscription/create-order` → creates Razorpay order
2. Frontend opens Razorpay checkout popup
3. On success → `POST /api/subscription/verify-payment` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
4. Backend verifies HMAC signature, updates user `subscription_status` to `active`, sets `subscription_renewal_date`
5. Wallet and subscription records created in Supabase

---

## 5. Score Management System

### Input Rules
- Users must enter their last **5 golf scores**
- Score range: **1–45** (Stableford format)
- Each score must include a **date played**

### Functional Behaviour
- Only the latest 5 scores are retained at any time
- A new score **replaces the oldest** stored score automatically
- Scores displayed in **reverse chronological order** (most recent first)

### API Routes
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/scores` | Add new score (active subscribers only) |
| GET | `/api/scores` | Get current user's scores (max 5, desc order) |
| PUT | `/api/scores/:id` | Edit own score |
| DELETE | `/api/scores/:id` | Delete own score |

---

## 6. Draw & Reward System

### Draw Types
- **5-Number Match** — Jackpot
- **4-Number Match**
- **3-Number Match**

### Draw Logic Options
| Type | Description |
|------|-------------|
| Random | Standard lottery-style random number generation |
| Algorithmic | Weighted by most/least frequent user scores across all entries |

### Operational Requirements
- Monthly cadence — one draw per month
- Admin controls publishing of results
- Simulation / pre-analysis mode before official publish
- Jackpot rolls over to next month if no 5-match winner

### API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/admin/draw/simulate` | Admin | Run simulation (random or algorithmic) |
| POST | `/api/admin/draw/publish` | Admin | Publish draw, run match logic, create Winner records |
| GET | `/api/draws` | Public | Return published draws with summary |
| GET | `/api/draws/my-entries` | Subscriber | Return draw history with user's match results |

---

## 7. Prize Pool Logic

A fixed portion of each subscription contributes to the prize pool. Distribution is pre-defined and enforced automatically.

| Match Type | Pool Share | Rollover? |
|------------|-----------|-----------|
| 5-Number Match | 40% | ✅ Yes (Jackpot) |
| 4-Number Match | 35% | ❌ No |
| 3-Number Match | 25% | ❌ No |

- Auto-calculation of each pool tier based on active subscriber count
- Prizes split equally among multiple winners in the same tier
- 5-Match jackpot carries forward if unclaimed

---

## 8. Wallet & Withdrawal System

### Wallet
- Every user has a wallet with `balance`, `total_earned`, `total_withdrawn`
- Wallet is credited automatically when admin marks a winner as **paid**
- Balance displayed in user's selected currency using region preferences

### Withdrawal Rules
- Minimum withdrawal: **₹100** (or equivalent in user's currency)
- Methods: **Bank Transfer** or **UPI**
- Only one pending withdrawal allowed at a time
- Balance is deducted immediately on request submission
- Admin must approve → then mark as paid

### Withdrawal Statuses
`pending` → `approved` → `paid`
`pending` → `rejected` (balance refunded automatically)

### API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/wallet` | Subscriber | Get balance + last 10 withdrawals |
| POST | `/api/wallet/withdraw` | Subscriber | Submit withdrawal request |
| GET | `/api/admin/withdrawals` | Admin | List all withdrawals (filterable by status) |
| PUT | `/api/admin/withdrawals/:id/approve` | Admin | Approve withdrawal |
| PUT | `/api/admin/withdrawals/:id/reject` | Admin | Reject + refund balance |
| PUT | `/api/admin/withdrawals/:id/mark-paid` | Admin | Mark as paid |

---

## 9. Charity System

### Contribution Model
- Users select a charity at signup
- Minimum contribution: **10%** of subscription fee
- Users may voluntarily increase their charity percentage
- Independent donation option (not tied to gameplay)

### Charity Directory Features
- Listing page with search and filter
- Individual charity profiles: description, images, upcoming events (e.g. golf days)
- Featured / spotlight charity section on homepage

### API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/charities` | Public | List charities (supports `search`, `featured=true`) |
| GET | `/api/charities/:id` | Public | Single charity profile |
| POST | `/api/admin/charities` | Admin | Create charity |
| PUT | `/api/admin/charities/:id` | Admin | Edit charity |
| DELETE | `/api/admin/charities/:id` | Admin | Delete charity |
| PUT | `/api/user/charity` | Subscriber | Update selected charity and contribution % |

---

## 10. Winner Verification System

| Step | Description |
|------|-------------|
| Eligibility | Verification applies to winners only |
| Proof Upload | Screenshot of scores from golf platform |
| Admin Review | Approve or Reject submission |
| Payment States | `pending` → `paid` |

### API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/winners/my-winnings` | Subscriber | User's winnings with draw details and payment status |
| POST | `/api/winners/:id/upload-proof` | Subscriber | Upload proof URL, sets status to pending |
| GET | `/api/admin/winners` | Admin | All winners with user + draw details |
| PUT | `/api/admin/winners/:id/verify` | Admin | Approve or reject (`action: 'approve' | 'reject'`) |
| PUT | `/api/admin/winners/:id/mark-paid` | Admin | Mark as paid + credit wallet |

---

## 11. User Dashboard

Must include all of the following modules:

- ✅ Subscription status (active / inactive / lapsed + renewal date)
- ✅ Score entry and edit interface (rolling 5-score system)
- ✅ Selected charity and contribution percentage
- ✅ Participation summary (draws entered, upcoming draws)
- ✅ Winnings overview: total won and current payment status
- ✅ Wallet balance with link to withdrawal page

---

## 12. Admin Dashboard

### User Management
- View and edit user profiles
- Edit golf scores (same rolling-5 logic)
- Manage subscription status manually

### Draw Management
- Configure draw logic (random vs. algorithmic)
- Run simulations
- Publish results

### Charity Management
- Add, edit, delete charities
- Manage content and media

### Winners Management
- View full winners list
- Verify submissions (approve/reject)
- Mark payouts as completed (auto-credits wallet)

### Withdrawal Management
- View all withdrawal requests (filterable by status)
- Approve / reject / mark paid
- Rejection auto-refunds user wallet

### Reports & Analytics
- Total users
- Total active subscribers
- Total prize pool
- Charity contribution totals
- Draw statistics

### API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/stats` | Admin | Platform-wide stats |
| GET | `/api/admin/users` | Admin | Paginated user list |
| GET | `/api/admin/users/:id` | Admin | Full user profile |
| PUT | `/api/admin/users/:id/scores` | Admin | Edit user scores |
| PUT | `/api/admin/users/:id/subscription` | Admin | Manually set subscription status |

---

## 13. Region & Currency Settings

### Supported Regions
| Region | Currency | Symbol |
|--------|----------|--------|
| India | INR | ₹ |
| USA | USD | $ |
| UK | GBP | £ |
| Japan | JPY | ¥ |
| Europe | EUR | € |
| Australia | AUD | A$ |
| Canada | CAD | C$ |
| UAE | AED | د.إ |

### Behaviour
- User selects region in Settings → General
- Currency and symbol are **automatically derived server-side** from region
- Live currency preview shown before saving
- Preferences persisted in Supabase `users` table
- `useCurrency()` hook available globally for formatting prices

### API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/regions` | Public | Return all supported regions |
| PUT | `/api/user/preferences` | Subscriber | Update region (backend derives currency) |

---

## 14. Authentication System

- Custom JWT-based auth (NOT Supabase Auth)
- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWT signed with `JWT_SECRET` env var (min 32 chars)
- Token stored in `localStorage` on frontend
- Token sent as `Authorization: Bearer <token>` header
- `verifyToken` middleware applied to all protected routes
- `isAdmin` middleware applied to all admin routes
- Subscription validity checked on every protected non-auth request

### API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Register + return JWT |
| POST | `/api/auth/login` | Public | Login + return JWT |
| GET | `/api/auth/me` | Token | Fresh user from Supabase (never from JWT payload) |

---

## 15. Email Notification System (SMTP)

| Trigger | Recipient | Description |
|---------|-----------|-------------|
| Registration | User | Welcome email |
| Payment verified | User | Subscription confirmed |
| Draw published | All participants | Result email (winner or not) |
| Winner matched | Winner | Prize amount + next steps |
| Payout marked paid | Winner | Payment confirmed |

**Env vars required:**
```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

---

## 16. Supabase Database Schema

### Tables
```
users
  id, name, email, password_hash, role, subscription_status,
  subscription_plan, subscription_renewal_date,
  charity_id, charity_contribution_percent,
  region, currency, currency_symbol, created_at

charities
  id, name, description, images[], upcoming_events (jsonb),
  featured, created_at

subscriptions
  id, user_id, plan, razorpay_order_id, razorpay_payment_id,
  status, start_date, end_date, created_at

golf_scores
  id, user_id, score (1-45), date_played, created_at

draws
  id, month, year, drawn_numbers[], type, status,
  jackpot_rollover, created_at

draw_entries
  id, user_id, draw_id, scores[], match_type, created_at

winners
  id, user_id, draw_id, match_type, prize_amount,
  payment_status, proof_url, verification_status, created_at

wallets
  id, user_id, balance, total_earned, total_withdrawn,
  updated_at, created_at

withdrawals
  id, user_id, amount, status, withdrawal_method,
  bank_account_name, bank_account_number, bank_ifsc, bank_name,
  upi_id, admin_note, processed_at, created_at
```

---

## 17. UI/UX Requirements

- **Must NOT** resemble a traditional golf website
- Design must be **emotion-driven** — leading with charitable impact, not sport
- Feel: Clean, modern, motion-enhanced interface
- Avoid: Golf clichés (fairways, plaid, club imagery as primary language)

### Homepage Must Communicate
1. What the user does
2. How they win
3. Charity impact
4. Clear CTA (Subscribe button)

### Design Standards
- Subtle transitions and micro-interactions throughout
- Subscribe CTA must be prominent and persuasive
- Mobile-first, fully responsive
- Fast performance — optimised assets, minimal blocking resources

---

## 18. Technical Requirements

- **Frontend:** React.js + TypeScript + Tailwind CSS + Vite
- **Backend:** Node.js + Express.js (single `server.ts` file in `Main/` folder)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Razorpay
- **Auth:** Custom JWT + bcrypt (NOT Supabase Auth)
- **Email:** Nodemailer via SMTP
- **File Uploads:** `/uploads` folder, URL stored in DB
- **Deployment:** Vercel (new account) + Supabase (new project)
- **Security:** HTTPS enforced, CORS configured via `FRONTEND_URL` env var, rate limiting on auth routes

---

## 19. Environment Variables

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
JWT_SECRET=                         # min 32 random characters

# Razorpay
RAZORPAY_KEY_ID=                    # starts with rzp_test_ or rzp_live_
RAZORPAY_KEY_SECRET=

# Subscription Pricing (in paise)
SUBSCRIPTION_MONTHLY_PRICE=49900
SUBSCRIPTION_YEARLY_PRICE=499900
PRIZE_POOL_PERCENT_OF_SUBSCRIPTION=

# SMTP Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# App
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

## 20. Complete API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | Public | Health check |
| GET | `/api/regions` | Public | Supported regions list |
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Token | Fresh user profile |
| POST | `/api/subscription/create-order` | Token | Create Razorpay order |
| POST | `/api/subscription/verify-payment` | Token | Verify + activate subscription |
| GET | `/api/subscription/status` | Token | Current subscription details |
| POST | `/api/scores` | Subscriber | Add score |
| GET | `/api/scores` | Subscriber | Get scores |
| PUT | `/api/scores/:id` | Subscriber | Edit score |
| DELETE | `/api/scores/:id` | Subscriber | Delete score |
| GET | `/api/charities` | Public | List charities |
| GET | `/api/charities/:id` | Public | Single charity |
| PUT | `/api/user/charity` | Subscriber | Update charity selection |
| PUT | `/api/user/preferences` | Subscriber | Update region/currency |
| GET | `/api/draws` | Public | Published draws |
| GET | `/api/draws/my-entries` | Subscriber | User's draw history |
| GET | `/api/winners/my-winnings` | Subscriber | User's winnings |
| POST | `/api/winners/:id/upload-proof` | Subscriber | Upload proof |
| GET | `/api/wallet` | Subscriber | Wallet balance + history |
| POST | `/api/wallet/withdraw` | Subscriber | Request withdrawal |
| POST | `/api/admin/draw/simulate` | Admin | Simulate draw |
| POST | `/api/admin/draw/publish` | Admin | Publish draw + match users |
| GET | `/api/admin/charities` | Admin | — |
| POST | `/api/admin/charities` | Admin | Create charity |
| PUT | `/api/admin/charities/:id` | Admin | Edit charity |
| DELETE | `/api/admin/charities/:id` | Admin | Delete charity |
| GET | `/api/admin/winners` | Admin | All winners |
| PUT | `/api/admin/winners/:id/verify` | Admin | Approve/reject winner |
| PUT | `/api/admin/winners/:id/mark-paid` | Admin | Mark paid + credit wallet |
| GET | `/api/admin/withdrawals` | Admin | All withdrawals |
| PUT | `/api/admin/withdrawals/:id/approve` | Admin | Approve withdrawal |
| PUT | `/api/admin/withdrawals/:id/reject` | Admin | Reject + refund |
| PUT | `/api/admin/withdrawals/:id/mark-paid` | Admin | Mark withdrawal paid |
| GET | `/api/admin/stats` | Admin | Platform analytics |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/users/:id` | Admin | Single user profile |
| PUT | `/api/admin/users/:id/scores` | Admin | Edit user scores |
| PUT | `/api/admin/users/:id/subscription` | Admin | Edit subscription |

---

## 21. Testing Checklist

- ✅ User signup and login
- ✅ Subscription flow (monthly and yearly via Razorpay)
- ✅ Score entry — 5-score rolling logic
- ✅ Draw system logic and simulation
- ✅ Charity selection and contribution calculation
- ✅ Winner verification flow and payout tracking
- ✅ Wallet credit on mark-paid
- ✅ Withdrawal request, approval, rejection, refund
- ✅ Region selection and currency auto-update
- ✅ User Dashboard — all modules functional
- ✅ Admin Panel — full control and usability
- ✅ Data accuracy across all modules
- ✅ Responsive design on mobile and desktop
- ✅ Error handling and edge cases
- ✅ Email notifications firing correctly
- ✅ Subscription persistence after login

---

## 22. Scalability Considerations

- Architecture must support multi-country expansion
- Extensible to teams / corporate accounts
- Campaign module ready for future activation
- Codebase structured to support a mobile app version

---

*This PRD reflects the full feature set including all additions made during development: Wallet & Withdrawal system, Region & Currency preferences, Persistent Subscription status, and custom JWT Auth on Supabase.*