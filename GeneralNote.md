RentHub/
│
├── app/
│   ├── layout.tsx                               ← Root layout (global UI wrapper for the whole site)
│   ├── globals.css                              ← Global CSS (Bootstrap overrides, theme, dashboard styles)
│   │
│   ├── about/
│   │   └── page.tsx                             ← Public "About" page (info about RentHub)
│   │
│   ├── blog/
│   │   └── page.tsx                             ← Public blog/news page (articles, updates, housing tips)
│   │
│   ├── contact/
│   │   └── page.tsx                             ← Public "Contact" page (contact form + contact info)
│   │
│   ├── gallery/
│   │   └── page.tsx                             ← Public gallery page (photos / dorm showcase)
│   │
│   ├── room/
│   │   ├── page.tsx                             ← Public rooms listing page (loads active dorms on server and renders modern filter + list via RoomFilterList)
│   │   └── RoomFilterList.tsx                   ← Client-side filter UI for rooms (search input, date range picker, room type select, conflict alerts with dismiss "X")
│   │
│   ├── room-details/
│   │   └── [id]/
│   │       └── page.tsx                         ← Public room details page (full info for a single dorm, main image/gallery, prices, and “Book this room” button)
│   │
│   ├── room/
│   │   └── request/
│   │       └── [id]/
│   │           └── page.tsx                     ← Client-only booking request form (react-datepicker calendar, price calculation, disabled booked dates, redirect after submit)
│   │
│   ├── client/
│   │   ├── login/
│   │   │   └── page.tsx                         ← Client login page (student/tenant login using /api/auth/login and redirect by role/next)
│   │   └── register/
│   │       └── page.tsx                         ← Client registration page (creates User with role "client")
│   │
│   ├── components/
│   │   ├── TemplateHeader.tsx                   ← Public-site header (navbar + dynamic login/register or user info depending on auth state)
│   │   └── TemplateFooter.tsx                   ← Public-site footer (links, copyright, social)
│   │
│   ├── login/
│   │   └── page.tsx                             ← Admin/Renter login page (redirects based on admin/renter roles)
│   │
│   ├── dashboard/                               ← ADMIN dashboard (super admins + admin roles)
│   │   ├── layout.tsx                           ← Admin dashboard layout (sidebar + auth check)
│   │   ├── page.tsx                             ← Admin dashboard home page
│   │   │
│   │   ├── accounts/
│   │   │   └── page.tsx                         ← Accounts admin section
│   │   │
│   │   ├── managers/
│   │   │   └── page.tsx                         ← Managers admin section
│   │   │
│   │   ├── admins/
│   │   │   └── page.tsx                         ← Super Admin page to manage users & roles (admins + renters)
│   │   │
│   │   ├── universities/
│   │   │   └── page.tsx                         ← Admin page to manage universities (CRUD + map + table)
│   │   │
│   │   └── (add admin pages here)               ← Placeholder for future admin sections
│   │
│   ├── renter/                                  ← RENTER dashboard (landlords)
│   │   ├── layout.tsx                           ← Renter layout (auth check, sidebar, topbar, theme)
│   │   ├── page.tsx                             ← Renter dashboard home
│   │   │
│   │   ├── listings/
│   │   │   ├── page.tsx                         ← Renter listings list (cards with edit links)
│   │   │   ├── new/
│   │   │   │   └── page.tsx                     ← Create new listing page (form + university dropdown + map)
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx                 ← Edit existing listing (same fields as new)
│   │   │
│   │   ├── bookings/
│   │   │   └── page.tsx                         ← Renter booking dashboard (confirmed bookings table with delete actions calling /api/renter/bookings/[id])
│   │   │
│   │   ├── requests/
│   │   │   └── page.tsx                         ← Renter requests page (pending booking requests with Accept/Reject; confirm triggers conflicts handling)
│   │   │
│   │   ├── messages/
│   │   │   └── page.tsx                         ← Messages (placeholder for future chat system)
│   │   │
│   │   └── analytics/
│   │       └── page.tsx                         ← Analytics (placeholder for future stats/insights)
│   │
│   └── api/                                     ← BACKEND API ROUTES (Next.js route handlers)
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts                     ← Login processor (verifies credentials, sets JWT cookie)
│       │   ├── me/
│       │   │   └── route.ts                     ← Returns current user (decoded from JWT in cookies)
│       │   ├── logout/
│       │   │   └── route.ts                     ← Clears JWT cookie to log the user out
│       │   └── register-client/
│       │       └── route.ts                     ← Registers a new client (User with role "client" + sets JWT)
│       │
│       ├── admins/
│       │   └── route.ts                         ← Super admin route to create/manage system users (admins + renters)
│       │
│       ├── dashboard/
│       │   └── universities/
│       │       ├── route.ts                     ← Admin-only: GET/POST universities (list + create)
│       │       └── [id]/
│       │           └── route.ts                 ← Admin-only: GET/PUT/DELETE single university
│       │
│       ├── universities/
│       │   └── route.ts                         ← Public/authorized: GET list of universities for dropdowns
│       │
│       ├── upload/
│       │   └── route.ts                         ← Generic file upload endpoint (images for dorms/universities)
│       │
│       ├── dorms/
│       │   ├── route.ts                     ← Public: GET filtered list of active dorms for /room (supports search roomType)
│       │   └── [id]/
│       │       └── route.ts                     ← Public: GET a single dorm by id (for room details / booking form)
│       │
│       ├── bookings/
│       │   ├── route.ts             ← Client-only: GET confirmed bookings for a dorm (by dormId) + POST to create a new pending booking request
│       │   └── me/
│       │       └── route.ts                     ← Client-only: GET conflict notifications for this user (used to show red spam/conflict messages on /room)
│       │
│       └── renter/
│           ├── listings/
│           │   ├── route.ts                     ← Renter-only: GET/POST listings for current renter
│           │   └── [id]/
│           │       └── route.ts                 ← Renter-only: GET/PUT/DELETE specific listing
│           │
│           ├── bookings/
│           │   ├── route.ts                     ← Renter-only: GET confirmed bookings for this renter (used in renter    bookings page table)
│           │   └── [id]/
│           │       └── route.ts                 ← Renter-only: DELETE a booking the renter owns (used when deleting bookings from dashboard)
│           │
│           └── requests/
│               └── route.ts                     ← Renter-only: GET pending booking requests + PATCH to confirm/cancel and mark overlapping requests as conflicts
│
├── lib/
│   ├── mongodb.ts                               ← MongoDB/Mongoose connection helper (cached connection with serverSelectionTimeout and reuse across requests)
│   ├── auth.ts                                  ← JWT sign/verify helpers (used by auth routes)
│   └── currentUser.ts                           ← Helper to get current user from JWT cookie inside API routes
│
├── models/
│   ├── User.ts                                  ← User schema (admins + managers + renters + clients)
│   ├── Dorm.ts                                  ← Dorm listings schema (all fields for rooms, prices, location, etc.)
│   ├── Booking.ts                               ← Booking schema (links dorm + renter + client + dates + total price + status; used for requests/confirmations/conflicts)
│   └── University.ts                            ← University schema (name + coordinates + optional image)
│
├── public/                                      ← Static assets (icons, logo, template images)
│
├── .env.local                                   ← Environment variables (Mongo URL, JWT secret, Mapbox key, etc.)
├── package.json                                 ← Dependencies + npm scripts
└── README.md                                    ← Documentation / setup instructions

++++ app/room/request/[id]/page.tsx











1) app/room/page.tsx

English: Public rooms listing page showing all active Dorms (profile image, title, description), with links to each room’s details.

عربي:
هالصفحة بتعرض كل الغرف الموجودة بالـ MongoDB بشكل كروت.
كل كرت فيه صورة الغرفة + عنوان + Description، وبتاخدك على صفحة التفاصيل.

2) app/room-details/[id]/page.tsx

English: Room details page; fetches a dorm from /api/dorms/[id] and shows full info + “Book this room” button linking to /room/request/[id].

عربي:
صفحة تفاصيل غرفة معيّنة، بتطلب بيانات الغرفة من الـ API حسب الـ id.
بتعرض كل المعلومات المهمة + زر للحجز ينقلك على صفحة الطلب.

3) app/room/request/[id]/page.tsx

English: Protected booking request form for a specific dorm. Checks that the user is logged in as client, loads dorm info, lets the user choose dates, shows estimated price, then sends a booking request to /api/bookings.

عربي:
صفحة فورم الحجز للغرفة، بس بتشتغل إذا المستخدم عامل Login كـ client.
تختار فيها تاريخ البداية والنهاية، تحسب المدة والسعر، وبعدين تبعت طلب الحجز (Booking pending).

4) app/client/login/page.tsx

English: Client login page with same style as admin login, but redirects clients to /room (or next param) and still supports admin/renter roles.

عربي:
صفحة تسجيل الدخول للطلاب/الـ clients بواجهة مشابهة للـ admin login.
بعد تسجيل الدخول بتوجّه الـ client على صفحة الغرف أو على الرابط اللي كان جاي منه.

5) app/client/register/page.tsx

English: Registration page for clients; calls /api/auth/register-client to create a new User with role "client" and auto-login.

عربي:
صفحة عمل حساب جديد للـ client، تجمع الاسم والإيميل والباسورد.
تبعت البيانات لـ API اللي ينشئ User role=client ويدخله مباشرة.

6) app/api/auth/login/route.ts

English: Authenticates any user (super-admin, renter, client, etc.), verifies password, signs JWT with user info, and sets the token cookie.

عربي:
الـ API المسؤول عن عملية تسجيل الدخول وفحص الإيميل والباسورد.
إذا المعلومات صح، بيولّد JWT وبيحطه بكوكي عشان نعرف المستخدم بكل الطلبات.

7) app/api/auth/me/route.ts

English: Returns the current user by reading the JWT cookie and decoding it; used both in dashboards and protected pages.

عربي:
هاد الـ API يرجّع بيانات المستخدم الحالي (id, name, role) من الكوكي.
بنستعمله بكل مكان بدنا نعرف مين داخل (dashboard, renter layout, room/request).

8) app/api/auth/logout/route.ts

English: Clears the token cookie to log the user out.

عربي:
Endpoint بسيط يحذف كوكي الـ token.
يعني لما تضغط Logout، هالروت يطلّعك برا الحساب.

9) app/api/auth/register-client/route.ts

English: Creates a new User document with role "client", hashes the password, and sets a JWT cookie (auto-login after register).

عربي:
API لإنشاء حساب جديد للـ client بداخل collection User نفسها.
بيعمل hash للباسورد، يحفظ المستخدم كـ role=client، وبيسجّله دخول فورًا.

10) app/api/dorms/[id]/route.ts

English: Public API to fetch a single dorm by id (without requiring renter auth); used by /room-details/[id] and /room/request/[id].

عربي:
Endpoint عام يرجّع بيانات غرفة واحدة حسب الـ id بدون أي صلاحيات خاصة.
بنستعمله لصفحة التفاصيل وصفحة الحجز عشان نجيب معلومات الغرفة.

11) app/api/bookings/route.ts

English: Client-only endpoint to create a new booking request. Validates dates, checks dorm availability (no overlapping confirmed bookings), calculates total price, and saves a pending Booking.

عربي:
API لإنشاء حجز جديد بحالة pending، مخصّص للـ clients فقط.
بيتأكد من التواريخ، يتأكد ما في حجز confirmed بنفس الفترة، ويحسب السعر الكلّي.

12) app/api/renter/bookings/route.ts

English: Renter-only endpoint to fetch all confirmed bookings for the current renter, populated with dorm and client info.

عربي:
هاد الـ API بيرجع كل الحجوزات الـ confirmed الخاصة بصاحب البيت.
بيعمل populate لعنوان الغرفة واسم وإيميل الـ client عشان تنعرض بجدول الـ bookings.

13) app/api/renter/requests/route.ts

English: Renter-only endpoint that:

GET: returns all pending bookings (requests) for this renter

PATCH: confirms or cancels a specific booking (changes status to confirmed or cancelled)

عربي:
API خاص بالرِنتِر لعرض كل طلبات الحجز اللي لسا pending.
يقدر من خلاله يوافق عالطلب (confirm) أو يرفضه (cancel) بتغيير حالة الـ Booking.

14) app/renter/requests/page.tsx

English: Renter dashboard page that lists all pending booking requests in a table with room, client, dates, total price, and action buttons (Accept/Reject).

عربي:
صفحة داخل Dashboard صاحب البيت بتعرض كل طلبات الحجز اللي ناطرة الموافقة.
لكل طلب في أزرار Accept و Reject، والنتيجة تنعكس مباشرة على البيانات.

15) app/renter/bookings/page.tsx

English: Renter dashboard page showing current confirmed bookings in a table, using /api/renter/bookings as data source.

عربي:
صفحة بتعرض كل الحجوزات المؤكدة لصاحب البيت بجدول منظم.
كل صف فيه اسم الغرفة، اسم الـ client، المدة، والمبلغ الكلي.

16) app/renter/layout.tsx

English: Client-side layout wrapper for all /renter/* pages. Checks /api/auth/me, ensures role === "renter", shows topbar, sidebar navigation, theme switcher, and logout button.

عربي:
Layout خاص للـ Renter Dashboard، بيعمل حماية للصفحات ويتأكد إن الداخِل هو renter.
فيه Topbar مع الإيميل، Sidebar فيها الروابط (Listings, Bookings, Requests, …) وزر Logout وتغيير Theme.

17) app/components/TemplateHeader.tsx

English: Public site header with logo, main navigation links (Home, About, Our Room, etc.), and static Login/Register buttons.

عربي:
الهيدر الأساسي للموقع العام، فيه اللوجو وروابط الصفحات الأساسية.
على اليمين بيعرض أزرار Login و Register (تقدر لاحقًا تربطها بـ /client/login و /client/register).

18) lib/auth.ts

English: Helper functions to sign and verify JWT tokens used for authentication (signToken, verifyToken).

عربي:
كود مسؤول عن توليد JWT من بيانات المستخدم والتحقق منه.
كل نظام الـ Login/Logout مبني عليه لأنه يخزن الـ userId + role داخل الـ token.

19) lib/currentUser.ts

English: Server-side helper used inside API routes to read the token cookie, verify it, and fetch the full User document from MongoDB.

عربي:
فانكشن بتشتغل على الـ server، تقرأ كوكي الـ token وتفك شفرة الـ JWT.
بعدها بتجيب user من الـ DB، عشان نستخدمه بجميع الـ API اللي بدها user الحالي.

20) models/User.ts

English: Mongoose schema for users. We extended UserRole to include "client" alongside "super-admin", "accounts-admin", "managers-admin", and "renter".

عربي:
موديل المستخدمين الرئيسي، فيه كل أنواع الـ roles (super-admin, renter, client, …).
عدّلناه ليشمل role جديد اسمه client بدل ما نعمل Collection منفصلة.

21) models/Booking.ts

English: Mongoose schema for bookings linking a dorm, renter, and client with startDate, endDate, totalPrice, and status (pending, confirmed, cancelled).

عربي:
موديل الحجز اللي يربط بين غرفة معيّنة وصاحب البيت والـ client.
فيه حالة الحجز (pending = طلب، confirmed = حجز فعلي، cancelled = مرفوض/ملغي).

22) app/globals.css

English: Global CSS that defines theme tokens for dark/light modes and detailed styling for the renter dashboard (topbar, sidebar, tables, buttons).

عربي:
ملف الستايلات الأساسي اللي يضبط ألوان وثيم المشروع، خصوصًا Dashboard الـ renter.
فيه CSS للـ Topbar, Sidebar, Buttons, Tables، مع دعم Dark/Light/System.



















2️⃣ Files we worked on today + quick summary
app/room/page.tsx

What it does: Server component that connects to Mongo, loads all active dorms, and renders the public “Our Rooms” page.

What we changed: Instead of mapping rooms directly here, it now passes a clean initialDorms array to a new client component RoomFilterList which handles all the UI and filtering.

    app/room/RoomFilterList.tsx

What it does: Client-side component that shows the filter bar (search input, date-range calendar, room type selector) and the rooms grid.

What we changed:

Implemented search by text + roomType via /api/dorms.

Added date-range filter using react-datepicker and /api/bookings?dormId=... to exclude already-booked rooms.

Implemented red conflict notification (spam-like message) for clients using /api/bookings/me + an X button and localStorage so it stays dismissed even after refresh.

    app/room/request/[id]/page.tsx

What it does: Client-only booking page to request a room with start/end dates and price preview.

What we changed:

Replaced simple <input type="date"> with a react-datepicker setup.

Enforced no past dates, end > start, and disabled intervals where the room is already confirmed booked.

Kept price calculation (daily/weekly/monthly) and wired it to new date state.

Button is disabled while submitting; after success we now redirect back to /room (instead of letting user spam submit).

    app/room-details/[id]/page.tsx

What it does: Shows details of a single dorm: main image, description, city, university, and pricing, plus a “Book this room” button linking to the request page.

What we changed:

Improved how images and fields are rendered (using profileImg or fallback).

Polished the layout so that info and picture are more clearly displayed before sending user to the booking form.

    app/renter/bookings/page.tsx

What it does: Renter dashboard page that lists confirmed bookings in a table (dorm, client, dates, total price, status).

What we changed:

Added a Delete button per row that calls DELETE /api/renter/bookings/[id].

Fixed state update so deleted bookings disappear immediately without reload, and wired error handling (showing when deletion fails).

    app/api/renter/bookings/route.ts

What it does: Backend endpoint for renters to GET their own confirmed bookings (used in renter bookings table).

What we changed:

Ensured it filters by renter: currentUser._id and status: "confirmed".

Kept it lean to work nicely with the new delete logic ([id]/route.ts handles the actual removal).

    app/api/renter/bookings/[id]/route.ts

What it does: Backend endpoint to DELETE a booking by its id, restricted to the renter who owns that booking.

What we changed / added:

Implemented deletion with Booking.deleteOne({_id: bookingId, renter: currentUser._id}).

Returns a clear JSON response including deletedCount so the frontend can show correct messages.

    app/renter/requests/page.tsx

What it does: Renter dashboard page listing pending booking requests with Accept/Reject buttons.

What we changed:

Hooked it to /api/renter/requests with solid loading/error states.

After a PATCH (confirm/cancel), it removes the request from the table so the renter sees real-time updates.

    app/api/renter/requests/route.ts

What it does: Backend endpoint for renters to manage pending booking requests.

What we changed:

GET: returns only bookings where renter = currentUser and status = "pending", with populated dorm + client info.

PATCH: accepts bookingId + action ("confirm" or "cancel"), updates the booking status, and forms the basis for conflict handling when confirming overlapping requests.

    app/api/bookings/route.ts

What it does: Shared client booking API to check availability and create booking requests.

What we changed:

GET: given a dormId, returns confirmed bookings’ startDate and endDate to block these dates in calendars and filters.

POST: validates dates, checks overlap against confirmed bookings, calculates total price (daily/weekly/monthly), and creates a pending booking request.

    app/api/bookings/me/route.ts

What it does: Client-only endpoint that returns notifications for the logged-in client (e.g. "someone else already booked this room for your requested dates").

What we changed / added:

Implemented a query that finds this user’s bookings that turned into conflicts/cancelled (by our rules) and maps them to a simple notifications[] array.

Used by RoomFilterList to show the red alert message per client when they go to /room.

    app/api/dorms/route.ts

What it does: Public endpoint to list active dorms, with optional filters used by the /room page.

What we changed / added:

Added support for q (search on title/city/university) and roomType query parameters.

Returns a minimal dorm shape used by RoomFilterList (title, description, profileImg, roomType, prices, etc.) for better performance.

    models/Booking.ts

What it does: Mongoose schema for bookings (dorm, renter, client, dates, total price, status, timestamps).

What we changed:

Used consistently for requests page, bookings page, availability checks, and (in logic) for detecting overlaps when confirming a booking or creating a new one.