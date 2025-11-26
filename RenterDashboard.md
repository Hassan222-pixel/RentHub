RentHub/
│
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── accounts/
│   │   │   └── page.tsx
│   │   │
│   │   ├── managers/
│   │   │   └── page.tsx
│   │   │
│   │   ├── admins/
│   │   │   └── page.tsx
│   │   │
│   │   └── (add more admin pages here)
│   │
│   ├── renter/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── listings/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── bookings/
│   │   │   └── page.tsx
│   │   │
│   │   ├── requests/
│   │   │   └── page.tsx
│   │   │
│   │   ├── messages/
│   │   │   └── page.tsx
│   │   │
│   │   └── analytics/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts
│       │   ├── me/
│       │   │   └── route.ts
│       │   └── seed-super-admin/
│       │       └── route.ts
│       │
│       ├── admins/
│       │   └── route.ts
│       │
│       └── renter/
│           ├── listings/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           │
│           └── bookings/
│               └── route.ts
│
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   └── currentUser.ts
│
├── models/
│   ├── User.ts
│   ├── Dorm.ts
│   └── Booking.ts
│
├── .env.local
├── package.json
└── README.md





🧱 app/ – UI & Routing
app/layout.tsx

Root HTML layout for the whole app.

Loads global CSS, Bootstrap, maybe sets <body> structure.

app/globals.css

Global styles including RentHub theme, colors, sidebar styles, topbar, etc.

🔐 app/login/page.tsx

Public login page.

Sends email/password → /api/auth/login.

If user.role === "renter" → redirects to /renter.

Else (super-admin, accounts-admin, managers-admin) → /dashboard.

🛠 Admin Dashboard – app/dashboard/
app/dashboard/layout.tsx

Protected layout for all admin pages.

Calls /api/auth/me, checks role is an admin.

Renders RentHub topbar + left sidebar navigation.

Wraps all /dashboard/* pages inside a consistent layout.

app/dashboard/page.tsx

Admin dashboard home page.

Simple summary or welcome screen for admin users.

app/dashboard/accounts/page.tsx

“Accounts” section (example admin page).

Visible for admin roles with permissions related to accounts.

app/dashboard/managers/page.tsx

“Managers” section (example admin page).

Visible for managers-related admins.

app/dashboard/admins/page.tsx

Super Admin only.

List of all users (admin + renter).

Form for creating users:

super-admin

accounts-admin

managers-admin

renter ✅ (so super admin can create renter accounts)

Submits to /api/admins.

You can keep adding more admin sections under app/dashboard/....

🏠 Renter Dashboard – app/renter/
app/renter/layout.tsx

Protected layout for renter users only.

Calls /api/auth/me, checks user.role === "renter".

If not renter:

Redirects to /dashboard (if admin) or /login.

Renders:

Top RentHub bar (logo, theme toggle, profile)

Renter sidebar with:

Home

Listings

Bookings

Requests

Messages

Analytics

Handles:

Theme switching (light/dark/system)

Sidebar collapse / expand

Logout button (calls /api/auth/logout).

app/renter/page.tsx

Renter “Home” page.

Shows simple KPIs:

Total listings

Active listings

Total bookings

Fetches data from /api/renter/listings + /api/renter/bookings.

🏘 app/renter/listings/
app/renter/listings/page.tsx

“My Listings” page for the renter.

Calls /api/renter/listings to load all dorms owned by this renter.

Displays each listing as a card:

Title, city, university

Short description

Price per month / night

Status badge: Active / Inactive

Buttons:

Edit → /renter/listings/[id]/edit

Activate/Deactivate → updates isActive via PUT /api/renter/listings/[id]

app/renter/listings/new/page.tsx

“Add New Listing” page.

Form fields:

title, description

city, address, university

pricePerNight, pricePerMonth

amenities (comma separated)

images (comma separated URLs for now)

3D tour URL (optional)

On submit → POST /api/renter/listings.

On success → redirect back to /renter/listings.

app/renter/listings/[id]/edit/page.tsx

“Edit Listing” page for an existing dorm.

On load:

Fetches GET /api/renter/listings/[id].

Pre-fills form with listing data.

On submit:

Sends PUT /api/renter/listings/[id].

On success:

Redirect back to /renter/listings.

📅 app/renter/bookings/page.tsx

Shows list of bookings where this renter is the owner.

Fetches from /api/renter/bookings.

Displays table:

Dorm title

Client name & email

Dates (start → end)

Total price

Booking status (pending / confirmed / cancelled).

📝 app/renter/requests/page.tsx

Placeholder page for now.

Future: will show dorm requests posted by students that match this renter’s cities/universities.

💬 app/renter/messages/page.tsx

Placeholder page for messaging/chat.

Future: show conversations between renter and clients.

📊 app/renter/analytics/page.tsx

Placeholder analytics page.

Future: total revenue, bookings per month, occupancy rate, ratings, etc.

🌐 app/api/ – APIs
app/api/auth/login/route.ts

Validates login credentials.

On success:

Creates a JWT token with user id + role.

Sets it in an HTTP-only token cookie.

Returns { user } to the frontend.

app/api/auth/me/route.ts

Reads the token cookie.

Uses verifyToken to decode it.

Fetches the user from DB.

Returns { user } to the frontend.

Used by:

Admin layout

Renter layout

app/api/auth/seed-super-admin/route.ts

Dev helper endpoint.

Seeds a default Super Admin user into the DB when called (only for initial setup).

app/api/admins/route.ts

Super Admin–only endpoint for managing users.

GET:

Returns all users without password.

POST:

Creates new user with name, email, password, role.

Allowed roles:

super-admin

accounts-admin

managers-admin

renter ✅

Hashes password with bcrypt.

Saves user via User model.

app/api/renter/listings/route.ts

Renter-only endpoint.

Uses getCurrentUserFromApi() to validate and identify renter.

GET:

Returns all dorms where owner = current renter.

POST:

Creates a new Dorm for the current renter with fields from request body.

app/api/renter/listings/[id]/route.ts

Renter-only endpoint for a specific dorm.

GET:

Fetch listing by id and owner = current renter.

PUT:

Updates listing fields (including isActive).

DELETE:

Soft-deletes listing → sets isActive = false.

app/api/renter/bookings/route.ts

Renter-only endpoint.

GET:

Returns all bookings where renter = current renter.

Populates:

dorm (for title)

client (for name + email).

🧩 lib/ – Helpers
lib/mongodb.ts

Sets up and exports connectToDatabase().

Uses a global cached connection with Mongoose.

Reads MONGODB_URI from .env.local.

Ensures only one DB connection is reused during dev.

lib/auth.ts

JWT utilities:

signToken(payload) → create token.

verifyToken(token) → decode token, or return null if invalid.

Uses JWT_SECRET from environment (or fallback dev secret).

lib/currentUser.ts

Shared helper for API routes.

Steps:

await connectToDatabase()

Read token from cookies

verifyToken to get userId

User.findById(userId).lean()

Return the user object or null.

Used by renter API routes for auth.

🗃 models/ – Database Schemas
models/User.ts

Mongoose schema for users.

Fields:

name

email

password (hashed)

role:

"super-admin"

"accounts-admin"

"managers-admin"

"renter"

permissions (string array, used mainly for admin RBAC)

timestamps (createdAt, updatedAt).

models/Dorm.ts

Mongoose schema for renter listings.

Fields:

owner → reference to a User (renter)

title, description

city, address, university

pricePerNight, pricePerMonth

amenities (array of strings)

images (array of URLs)

tour3DUrl (optional)

isActive (boolean – for activate/inactivate)

timestamps.

Used in /api/renter/listings* and renter listings pages.

models/Booking.ts

Mongoose schema for bookings/reservations.

Fields:

dorm → reference to Dorm

renter → reference to User (the owner)

client → reference to User (the student)

startDate, endDate

totalPrice

status → "pending" | "confirmed" | "cancelled"

timestamps.

Used in /api/renter/bookings and the renter bookings page.

🔐 .env.local

Stores secrets & config:

MONGODB_URI → MongoDB connection URL.

JWT_SECRET → secret key for signing JWT.

📦 package.json

Project dependencies (Next.js, React, Mongoose, bcryptjs, react-icons, etc.).

Scripts like:

npm run dev

npm run build

npm run lint

📄 README.md

Project documentation for RentHub Admin Dashboard.

Screenshot preview, install instructions, react-icons note, and references to NOTES.md and ADDPAGE.md.


















































Now we switch hats: from Super Admin → Renter (Landlord) Dashboard.

You already have:

Auth ✅

Roles ✅ (super-admin, etc.)

Admin dashboard layout ✅

Now we want: Renter Dashboard, based on PRD.

I’ll tell you exactly what to do next, in clear steps.

0️⃣ First: What is “Renter Dashboard” in your PRD?

From your PRD, the Renter Dashboard must let dorm owners:

Create & manage dorm listings

Upload photos & 3D tours

Set pricing (daily/weekly/monthly), availability, rental terms

See and respond to booking requests

Reply to dorm requests posted by students

Chat with clients

See analytics and ratings

We won’t build everything at once. We’ll do MVP first, then grow.

1️⃣ Add a New Role: renter
a) Update your User model (Mongo)

In models/User.ts (or similar):

Add "renter" to allowed roles.

Conceptually:

export type UserRole =
  | "super-admin"
  | "accounts-admin"
  | "managers-admin"
  | "renter"
  | "client"; // (later when you do client dashboard)


And in schema enum / validation: add "renter".

b) Decide how renters register

Options:

For now: Super Admin creates renter accounts (simple, internal testing)

Later: add /register-renter public form

For now, easiest:
In your Admin area, when creating a new user, allow selecting renter as role.

2️⃣ Decide URL Structure for Renter Dashboard

You already have Admin at:

/dashboard/...

Let’s make Renter Dashboard at:

/renter/...

So renters never see admin sidebar, and admins never use renter UI.

You will create:

app/
  renter/
    layout.tsx      → Renter dashboard shell (topbar + sidebar)
    page.tsx        → Renter home (summary)
    listings/
      page.tsx      → CRUD dorms
    bookings/
      page.tsx      → See bookings
    requests/
      page.tsx      → See client dorm requests to answer
    messages/
      page.tsx      → Chat inbox (later)
    analytics/
      page.tsx      → Stats (later)

3️⃣ Protect Renter Routes (RBAC)

Just like your /dashboard layout checks for super-admin, here:

app/renter/layout.tsx should:

Call /api/auth/me

Check user.role === "renter"

If not renter → redirect to /login or /dashboard

So only users with role renter can see anything under /renter.

4️⃣ Add Renter Navigation (Sidebar)

In app/renter/layout.tsx, you’ll build a sidebar similar to admin, but with renter items:

Home – quick stats

My Listings – create and manage dorms

Bookings – manage reservations

Requests – answers to “dorm requests” students post

Messages – chat (later)

Analytics – later

Something like:

/renter → Home

/renter/listings → Manage dorms

/renter/bookings → Booking list

/renter/requests → Student requests list

The functionality comes later — for now we plan the structure.

5️⃣ Database: What You Need for Renter MVP

To start Renter Dashboard, you need minimal new Mongo models:

a) Dorm (or Listing)

Fields (simplified):

owner (ObjectId → User with role renter)

title

description

city

university

priceDaily

priceMonthly

amenities (array of strings)

photos (array of URLs)

tour3DUrl (string, optional)

availability (we can start with “active / inactive” flag, calendar later)

createdAt

b) Booking

Later you’ll connect to payments, but for now:

dorm (ObjectId → Dorm)

renter (ObjectId → User)

client (ObjectId → User)

startDate

endDate

status (pending, confirmed, cancelled, etc.)

totalPrice

c) DormRequest (for students posting “I need a dorm near X”)

createdBy (client)

city

university

budgetMin / budgetMax

message

status (open, closed)

For Renter MVP, you can even delay DormRequest and focus on Listings + Bookings.

6️⃣ API Routes Needed for Renter Dashboard (MVP)

Inside app/api:

1. /api/renter/listings (CRUD)

POST → create a new dorm (renter only)

GET → list all dorms for this renter

PUT/PATCH → update dorm

DELETE → archive/remove dorm

2. /api/renter/bookings

GET → all bookings where renter = current user

Later: PATCH → accept/reject booking

3. /api/renter/requests (optional for later)

GET → show client posted requests (filtered by city/university perhaps)

7️⃣ UI Pages to Build First

Here’s the exact order I’d do it (to keep it simple):

✅ Step 1: Renter Layout + Guard

Create app/renter/layout.tsx

Use same design system as admin (RentHub topbar + sidebar)

Add RBAC check if user.role !== "renter" redirect

Sidebar links for:

Home

My Listings

Bookings

✅ Step 2: Renter Home Page – /renter/page.tsx

Minimal for now:

“Welcome, {user.name}”

Summary cards:

“Total Listings”

“Active Bookings”

Call your APIs to get counts.

✅ Step 3: Listings Page – /renter/listings/page.tsx

Core MVP screen:

Button: Add Listing

Table or cards of current listings:

title, city, price, status

Edit / Delete buttons

Modal or separate page for:

title

description

city

university

price

amenities (multi-select or comma list)

upload photos (for now: allow entering URLs; later integrate real upload)

This fulfills big chunk of PRD: “Create and manage dorm listings”.

✅ Step 4: Bookings Page – /renter/bookings/page.tsx

List of bookings:

dorm name

client name

date range

status

Later: buttons for Accept / Reject, Message client.

8️⃣ How It Fits With Your Existing Auth

You likely have a single login at /login.

After login, you can redirect by role:

If role === "super-admin" → /dashboard

If role === "renter" → /renter

(later) if role === "client" → /client

You already have token & /api/auth/me, so you just add the redirect logic after login based on role.

9️⃣ Concrete “To-Do” List For You Right Now

If you want a super short checklist to follow in VS Code:

Update User model → add renter role

Make a test renter user in DB (seed or use admin to create)

Create folder: app/renter/

Add app/renter/layout.tsx with:

Same top bar design

New renter sidebar

Role guard: only renter

Add app/renter/page.tsx → simple “Renter Home”

Design DB Dorm model → models/Dorm.ts

Add API route: app/api/renter/listings/route.ts (GET + POST)

Create UI for /renter/listings/page.tsx to:

Show list of listings

Allow create new listing (basic form)

Add app/renter/bookings/page.tsx (for now can just show empty list or mock data until you wire real bookings model).

Once these are done → you officially have a working Renter Dashboard (MVP).


















RentHub/
│
├── app/
│   ├── layout.tsx                     ← Root layout (global UI wrapper for entire site)
│   ├── globals.css                    ← Global CSS (bootstrap overrides, colors, theme)
│   │
│   ├── login/
│   │   └── page.tsx                   ← Login page UI + redirect logic
│   │
│   ├── dashboard/                     ← ADMIN dashboard (super admins + admin roles)
│   │   ├── layout.tsx                 ← Dashboard layout (sidebar + auth check)
│   │   ├── page.tsx                   ← Dashboard home page
│   │   │
│   │   ├── accounts/
│   │   │   └── page.tsx               ← Accounts admin section
│   │   │
│   │   ├── managers/
│   │   │   └── page.tsx               ← Managers admin section
│   │   │
│   │   ├── admins/
│   │   │   └── page.tsx               ← Super Admin - manage users & roles
│   │   │
│   │   └── (add admin pages here)
│   │
│   ├── renter/                        ← RENTER dashboard (landlords)
│   │   ├── layout.tsx                 ← Renter layout (sidebar + auth check + topbar)
│   │   ├── page.tsx                   ← Renter dashboard home
│   │   │
│   │   ├── listings/                  ← Manage listings
│   │   │   ├── page.tsx               ← Listing list view (cards)
│   │   │   ├── new/
│   │   │   │   └── page.tsx           ← Create new listing page
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx       ← Edit listing page
│   │   │
│   │   ├── bookings/
│   │   │   └── page.tsx               ← Renter booking dashboard (table)
│   │   │
│   │   ├── requests/
│   │   │   └── page.tsx               ← Requests (placeholder for now)
│   │   │
│   │   ├── messages/
│   │   │   └── page.tsx               ← Messages (placeholder for now)
│   │   │
│   │   └── analytics/
│   │       └── page.tsx               ← Analytics (placeholder for now)
│   │
│   └── api/                           ← BACKEND API ROUTES
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts           ← Login processor (creates JWT cookie)
│       │   ├── me/
│       │   │   └── route.ts           ← Return current user via JWT cookie
│       │   └── seed-super-admin/
│       │       └── route.ts           ← Dev only — generates default super admin
│       │
│       ├── admins/
│       │   └── route.ts               ← Super admin create/manage system users
│       │
│       └── renter/
│           ├── listings/
│           │   ├── route.ts           ← GET/POST listings for current renter
│           │   └── [id]/
│           │       └── route.ts       ← GET/PUT/DELETE specific listing
│           │
│           └── bookings/
│               └── route.ts           ← GET bookings tied to this renter
│
├── lib/
│   ├── mongodb.ts                     ← Mongoose connection handler (cached)
│   ├── auth.ts                        ← JWT sign & verify helpers
│   └── currentUser.ts                 ← Identify logged-in user on server/API
│
├── models/
│   ├── User.ts                        ← Users schema (admins + renters + clients)
│   ├── Dorm.ts                        ← Dorm listings schema
│   └── Booking.ts                     ← Booking schema
│
├── public/                            ← static assets (icons, logo, images)
│
├── .env.local                         ← Mongo url + JWT secret
├── package.json                       ← dependencies + scripts
└── README.md                          ← documentation
