Here’s exactly what you need to touch to add a new page Reports with a new role reports-admin — from permissions to routes to sidebar — shown as a tree.

🎯 Goal

New section:

Page: /dashboard/reports

Role: reports-admin

Access: super-admin + reports-admin

🌳 Tree of All Required Changes

1. Permissions / Role Definition

These are the places where you “teach” the system that reports-admin is a valid role.

models/
└── User.ts
    ├── UserRole type              → Add "reports-admin" to union
    └── role enum in schema        → Add "reports-admin" to allowed values


What conceptually changes here:

The list of valid roles becomes:

super-admin

accounts-admin

managers-admin

reports-admin

2. Admin Creation / Role Selection

You must allow Super Admin to assign the new role to users.

app/
└── dashboard/
    └── admins/
        └── page.tsx
            ├── form default role          → could stay as "accounts-admin"
            └── role <select> options      → add "reports-admin"


Conceptually:

In the Admin Users page form:

Add a new option in the “Role” dropdown:

Label: Reports Admin

Value: reports-admin

Now Super Admin can create a Reports Admin user.

3. Backend Validation for New Role

The API that creates admins must accept reports-admin as a valid role.

app/
└── api/
    └── admins/
        └── route.ts
            └── role validation list       → add "reports-admin" to valid roles


Conceptually:

There is a check like “role must be one of [ ... ]”.

Extend that list to include "reports-admin".

Otherwise the API will reject new Reports Admin accounts.

4. Reports Page Route

Create the actual Reports page under the dashboard.

app/
└── dashboard/
    └── reports/
        └── page.tsx
            ├── use /api/auth/me           → get current user
            ├── check user's role          → allow if super-admin or reports-admin
            └── redirect if not allowed    → to /dashboard or /login


Conceptually:

New folder: reports

New page: page.tsx

This page:

Loads the current user (via /api/auth/me).

If role is super-admin or reports-admin → show Reports content.

Else → redirect away (so manually typing URL doesn’t bypass security).

5. Sidebar: Show “Reports” Link to Allowed Roles

You want “Reports” to appear only for allowed roles.

app/
└── dashboard/
    └── layout.tsx
        ├── knows user.role (from /api/auth/me)
        ├── isSuperAdmin flag              → already there
        ├── add isReportsAdmin flag        → user.role === "reports-admin"
        └── sidebar <ul>
            └── new "Reports" <Link>       → visible if isSuperAdmin OR isReportsAdmin


Conceptually:

Define a new boolean in your head: isReportsAdmin.

In the sidebar menu, add a new item:

Text: Reports

Link: /dashboard/reports

Only rendered when:

user.role === "super-admin" OR

user.role === "reports-admin"

Result:

Super Admin sees the Reports link.

Reports Admin sees the Reports link.

Others don’t even see it.

6. Optional: Additional Guards on Related Pages

If you want stricter separation:

app/
└── dashboard/
    └── accounts/
        └── page.tsx    → Only super-admin + accounts-admin
    └── managers/
        └── page.tsx    → Only super-admin + managers-admin
    └── reports/
        └── page.tsx    → Only super-admin + reports-admin


Conceptually:

Each page has its own access rule based on role.

Every time you add a new role + page combo, you:

Define which roles are allowed.

Implement that check at the top of the page.

7. JWT / Auth Flow (No Change Needed)

You do not need to touch these when adding a new role:

app/
└── api/
    └── auth/`  
        ├── login/route.ts        → Puts user.role into JWT automatically
        └── me/route.ts           → Reads user.role from JWT and returns it
lib/
└── auth.ts                       → signToken/verifyToken don't care what role string is


Conceptually:

As long as user.role is a string (e.g. "reports-admin"), the JWT will carry it.

/api/auth/me just returns whatever role is in the token.

So when you add new roles, these files already support them.

🧠 Mental Checklist For Any New Page + Role

When you say “I want a new page with specific permission,” think:

Add role in model & validation

User schema (User.ts)

Role validation in admin API.

Let Super Admin assign that role

Add option in admin creation form (dashboard/admins/page.tsx).

Create the page route

New folder under app/dashboard/<new-section>/page.tsx.

Protect the page

On load, check role via /api/auth/me.

Redirect if not allowed.

Update sidebar

Add menu link for this page.

Show link only for allowed roles.

Do those 5 steps, and any new “section + permission” will fit perfectly into your current system.
