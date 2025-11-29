RentHub/
│
├── app/
│   ├── layout.tsx                               ← Root layout (global UI wrapper for entire site)
│   ├── globals.css                              ← Global CSS (bootstrap overrides, colors, theme)
│   │
│   ├── about/
│   │   └── page.tsx                             ← Public "About" page (معلومات عن RentHub)
│   │
│   ├── blog/
│   │   └── page.tsx                             ← Public blog/news page (مقالات، تحديثات، نصائح سكن)
│   │
│   ├── contact/
│   │   └── page.tsx                             ← Public "Contact" page (فورم تواصل / معلومات التواصل)
│   │
│   ├── gallery/
│   │   └── page.tsx                             ← Public gallery page (صور / showcase للدورمز أو المشروع)
│   │
│   ├── components/
│   │   ├── TemplateHeader.tsx                   ← Reusable public-site header (navbar للموقع الأساسي)
│   │   └── TemplateFooter.tsx                   ← Reusable public-site footer (روابط، حقوق، social ...)
│   │
│   ├── login/
│   │   └── page.tsx                             ← Login page UI + redirect logic
│   │
│   ├── dashboard/                               ← ADMIN dashboard (super admins + admin roles)
│   │   ├── layout.tsx                           ← Dashboard layout (sidebar + auth check)
│   │   ├── page.tsx                             ← Dashboard home page
│   │   │
│   │   ├── accounts/
│   │   │   └── page.tsx                         ← Accounts admin section
│   │   │
│   │   ├── managers/
│   │   │   └── page.tsx                         ← Managers admin section
│   │   │
│   │   ├── admins/
│   │   │   └── page.tsx                         ← Super Admin - manage users & roles (admins + renters)
│   │   │
│   │   ├── universities/
│   │   │   └── page.tsx                         ← Admin page to manage universities (CRUD + map + table)
│   │   │
│   │   └── (add admin pages here)               ← Placeholder for future admin sections (if needed)
│   │
│   ├── renter/                                  ← RENTER dashboard (landlords)
│   │   ├── layout.tsx                           ← Renter layout (sidebar + auth check + topbar)
│   │   ├── page.tsx                             ← Renter dashboard home
│   │   │
│   │   ├── listings/                            ← Manage listings
│   │   │   ├── page.tsx                         ← Listing list view (cards)
│   │   │   ├── new/
│   │   │   │   └── page.tsx                     ← Create new listing page (uses university dropdown)
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx                 ← Edit listing page (university dropdown + map + images)
│   │   │
│   │   ├── bookings/
│   │   │   └── page.tsx                         ← Renter booking dashboard (table)
│   │   │
│   │   ├── requests/
│   │   │   └── page.tsx                         ← Requests (placeholder for now)
│   │   │
│   │   ├── messages/
│   │   │   └── page.tsx                         ← Messages (placeholder for now)
│   │   │
│   │   └── analytics/
│   │       └── page.tsx                         ← Analytics (placeholder for now)
│   │
│   └── api/                                     ← BACKEND API ROUTES
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts                     ← Login processor (creates JWT cookie)
│       │   ├── me/
│       │   │   └── route.ts                     ← Return current user via JWT cookie
│       │   └── seed-super-admin/
│       │       └── route.ts                     ← Dev only — generates default super admin
│       │
│       ├── admins/
│       │   └── route.ts                         ← Super admin create/manage system users (admins + renters)
│       │
│       ├── dashboard/
│       │   └── universities/
│       │       ├── route.ts                     ← Admin-only: GET/POST universities (list + create)
│       │       └── [id]/
│       │           └── route.ts                 ← Admin-only: GET/PUT/DELETE specific university
│       │
│       ├── universities/
│       │   └── route.ts                         ← Public/authorized: GET list of universities (for dropdowns)
│       │
│       ├── upload/
│       │   └── route.ts                         ← Generic file upload endpoint (images for dorms/universities)
│       │
│       └── renter/
│           ├── listings/
│           │   ├── route.ts                     ← GET/POST listings for current renter
│           │   └── [id]/
│           │       └── route.ts                 ← GET/PUT/DELETE specific listing
│           │
│           └── bookings/
│               └── route.ts                     ← GET bookings tied to this renter
│
├── lib/
│   ├── mongodb.ts                               ← Mongoose connection handler (cached)
│   ├── auth.ts                                  ← JWT sign & verify helpers
│   └── currentUser.ts                           ← Identify logged-in user on server/API (reads JWT cookie)
│
├── models/
│   ├── User.ts                                  ← Users schema (admins + renters + clients)
│   ├── Dorm.ts                                  ← Dorm listings schema (includes `university` field as string)
│   ├── Booking.ts                               ← Booking schema
│   └── University.ts                            ← University schema (name + lat/lng + optional image)
│
├── public/                                      ← Static assets (icons, logo, images)
│
├── .env.local                                   ← Mongo URL + JWT secret + Mapbox key, etc.
├── package.json                                 ← Dependencies + scripts
└── README.md                                    ← Documentation / setup instructions
