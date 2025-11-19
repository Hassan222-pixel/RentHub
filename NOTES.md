✅ Project Structure (Tree) With Brief Explanations
admin-dashboard-rbac/
│
├── app/
│ ├── layout.tsx → Global HTML layout (navbar, styles)
│ ├── globals.css → Global CSS
│ │
│ ├── login/
│ │ └── page.tsx → Login form UI
│ │
│ ├── dashboard/ → All protected pages
│ │ ├── layout.tsx → Dashboard layout (sidebar + auth check)
│ │ ├── page.tsx → Dashboard home page
│ │ │
│ │ ├── accounts/
│ │ │ └── page.tsx → Accounts page (visible for Accounts Admin)
│ │ │
│ │ ├── managers/
│ │ │ └── page.tsx → Managers page (visible for Managers Admin)
│ │ │
│ │ ├── admins/
│ │ │ └── page.tsx → Admin users page (Super Admin only)
│ │ │
│ │ └── (Add new pages here) → NEW_SEC/ → new sections/pages
│ │
│ └── api/
│ ├── auth/
│ │ ├── login/
│ │ │ └── route.ts → Validates login + creates JWT cookie
│ │ │
│ │ ├── me/
│ │ │ └── route.ts → Reads token, returns current user
│ │ │
│ │ └── seed-super-admin/
│ │ └── route.ts → Creates default Super Admin
│ │
│ └── admins/
│ └── route.ts → Manage admin accounts (Super Admin only)
│
├── lib/
│ ├── mongodb.ts → Connects to MongoDB
│ └── auth.ts → signToken() + verifyToken()
│
├── models/
│ └── User.ts → User schema (name, email, password, role)
│
├── .env.local → MONGODB_URI + JWT_SECRET
├── package.json → Dependencies and scripts
└── README.md → Documentation

✅ Super Short Explanation of Each Important File

🎯 app/login/page.tsx

Shows login form.

Sends POST request to /api/auth/login.

🎯 app/dashboard/layout.tsx

Runs /api/auth/me to check authentication.

If not logged in → redirects to /login.

Shows sidebar based on role.

Protects all dashboard pages.

🎯 app/dashboard/page.tsx

Dashboard home.

Shows welcome message + user info.

🎯 app/dashboard/accounts/page.tsx

Visible only for:

super-admin

accounts-admin

🎯 app/dashboard/managers/page.tsx

Visible only for:

super-admin

managers-admin

🎯 app/dashboard/admins/page.tsx

Super Admin only.

List and create admin users.

🎯 app/api/auth/login/route.ts

Checks email/password.

If correct → creates JWT token + sets cookie.

🎯 app/api/auth/me/route.ts

Reads JWT cookie.

Returns current logged user.

Used by dashboard layout for protection.

🎯 app/api/admins/route.ts

GET → returns all admins.

POST → creates new admin.

Only Super Admin can call this endpoint.

🎯 lib/mongodb.ts

Handles MongoDB connection.

🎯 lib/auth.ts

Builds JWT token with signToken().

Verifies JWT token with verifyToken().

🎯 models/User.ts

MongoDB schema for users:

name

email

password (hashed)

role

🎯 .env.local

Contains environment variables:

MongoDB URL

JWT secret key

✅ How to Add a New Page + New Role (Concept Tree)

Imagine you want to add:

Page: Reports

Role: reports-admin

URL: /dashboard/reports

Here's the tree of what you add:

app/
└── dashboard/
└── reports/
└── page.tsx → reports page

You also update:

sidebar logic → to show Reports link for super-admin + reports-admin
page.tsx (reports) → check user's role (reports-admin or super-admin)
admins form UI → add new role option "reports-admin"

And add new allowed roles conceptually:

super-admin → can see all pages
reports-admin → can see Reports page only

🎯 Summary (Everything in One Sentence)

Your admin dashboard is built with:

JWT stored in cookies

A global dashboard layout that checks login

Role-based sidebar

Server-side protected pages

Super Admin controls all other admins

Adding a new page means: create folder, add sidebar link, assign role
