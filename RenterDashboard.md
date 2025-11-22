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