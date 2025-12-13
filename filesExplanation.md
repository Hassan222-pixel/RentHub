✅ app/api/dorms/route.ts

This file provides the list of all available dorms for the public rooms page (/room).
It:

Loads all active dorms from the database.

Checks if each dorm has any confirmed booking that has not ended yet.

Adds to every dorm:

Whether it is Available or Not available.

Until what date it is occupied.

✅ app/api/dorms/[id]/route.ts

This file provides the full details of a single dorm for the room details page.
It:

Loads all information about one dorm.

Checks if that dorm is currently blocked by a confirmed booking.

Returns whether the room is occupied or free, and the end date of the booking.

✅ app/room/page.tsx

This is the main public page where all rooms are listed.
It:

Fetches all rooms from the API.

Displays them as cards.

Shows a clear availability badge:

“Available” for free rooms.

“Not available” for occupied rooms.

Sends this status to the card component for display.

✅ app/components/RecentProperties.tsx

This is the UI component that draws each room card.
It:

Displays the room image, title, city, and price.

Shows the availability badge on the card.

Colors the badge:

Green for Available.

Red for Not available.

✅ app/room-details/[id]/page.tsx

This is the page for viewing a single room in full detail.
It:

Displays all room information.

Reads the room availability from the API.

If the room is occupied:

Shows “Occupied until …”

Disables the Book this room button.

If the room becomes free again, the button works automatically.





✅ app/api/dorms/route.ts

What it does:

Returns the list of all active dorms for the /room page.

Selects basic info: title, description, city, prices, room type, etc.

What we added/changed:

ربطناه مع Booking عشان:

يحسب هل يوجد confirmed booking لم ينتهِ بعد لكل dorm.

يرجّع لكل dorm:

isOccupiedNow → هل الغرفة محجوزة حاليًا بالكامل.

occupiedUntil → التاريخ اللي بينتهي فيه آخر حجز مؤثّر.

✅ app/api/dorms/[id]/route.ts

What it does:

Returns full details for one dorm (used in /room-details/[id]).

يجلب جميع حقول الـ Dorm من الـ DB.

What we added/changed:

استعملنا Booking عشان:

نبحث عن أي booking بحالة confirmed لنفس الغرفة، وتاريخ انتهائه أكبر من الآن.

نرجّع:

isOccupiedNow → هل الغرفة مشغولة.

occupiedUntil → آخر تاريخ حجز فعّال لهاي الغرفة.

هالمعلومات تستخدمها صفحة التفاصيل لتظهر:

"Occupied until …" + تغلق زر الحجز إذا الغرفة مليانة.

✅ app/room/page.tsx

What it does:

هذه هي صفحة /room العامة اللي بتعرض كل الغرف.

Fetches dorms from /api/dorms.

تستخدم HeroSearch للتصفية حسب city/university (من نفس الداتا).

What we added/changed:

وسّعنا الـ type DormListItem ليشمل:

roomType, maxOccupants, genderPreference.

isOccupiedNow, occupiedUntil.

أضفنا:

formatBeds(d) → يعرض كيف عدد الأسرّة حسب نوع الغرفة + maxOccupants.

formatGender(d) → يعرض “Only male / Only female / Any” بالأيموجيز.

لما نبني cards للـ RecentProperties:

نرسل:

badge = "Available" أو "Not available" حسب isOccupiedNow.

bedsLabel و genderLabel للعرض بالسطر الأسود تحت الكارد.

✅ app/components/RecentProperties.tsx

What it does:

هذا الـ component اللي يرسم الكروت نفسها للغرف.

يعرض:

صورة الغرفة، العنوان (title)، المدينة (city)، السعر (price).

What we added/changed:

أضفنا حقول اختيارية إضافية في PropertyCard:

bedsLabel?: string

genderLabel?: string

أعطينا الbadge style حسب القيمة:

أخضر (#198754) لما يكون "Available".

أحمر (#dc3545) لما يكون "Not available".

في الفوتر الأسود للكارد:

نعرض bedsLabel بالنص (مثال: 🛏️ 2 beds أو 🛏️ 3 beds للـ shared).

نعرض genderLabel على اليمين (مثال: 👨 Only male أو 👨👩 Any).

✅ app/room-details/[id]/page.tsx

What it does:

صفحة التفاصيل الكاملة للغرفة.

تعرض:

الصور (gallery + thumbnails).

الموقع، الأسعار، القوانين، الـ amenities، إلخ.

What we added/changed:

تقرأ من /api/dorms/[id] القيم:

isOccupiedNow

occupiedUntil

أضفنا منطق للواجهة:

لو isOccupiedNow === true:

نعرض نص أحمر: Occupied until …

نعطّل زر Book this room.

لو isOccupiedNow === false:

نعرض نص أخضر: This room is available.

أضفنا كمان:

استعلام جديد لـ /api/bookings/my-dorm?dormId=...:

لو عند الـ client حجز لنفس الغرفة (pending أو confirmed):

hasMyBooking = true

نعرض رسالة: You already have a booking for this room (status).

نعطّل زر Book this room عشان ما يقدر يعمل request مرة ثانية لنفس الغرفة.

✅ app/room/request/[id]/page.tsx

What it does:

صفحة إرسال طلب الحجز للغرفة.

فيها:

datepicker لاختيار start date.

dropdown لاختيار عدد الأشهر (1–3).

حقول:

firstName

lastName

phone

What we added/changed:

غيّرنا الحجز من بالأيام → إلى بأساس شهري:

المستخدم يختار:

start date.

عدد الأشهر (1–3).

نحتسب:

endDatePreview = startDate + months.

estimatedPrice = pricePerMonth * months.

نرسل للـ API:

firstName, lastName, phone, months, startDate.

نمنع الحجز لو:

startDate بالماضي.

شهور خارج 1–3.

ما في pricePerMonth للغرفة.

ما زلنا نستخدم /api/bookings لإنشاء booking بالحالة "pending".

✅ app/api/bookings/route.ts

What it does:

GET /api/bookings?dormId=...

يرجّع لائحة bookings confirmed لنفس الغرفة عشان نستخدمها في disabled dates.

POST /api/bookings

ينشئ booking جديد بالحالة "pending".

What we added/changed:

تأكدنا:

فقط users بـ role "client" يقدروا يعملوا booking.

أضفنا التعامل مع:

الحقول الجديدة:

clientFirstName

clientLastName

clientPhone

نحسب endDate من startDate + months (من request).

نحسب totalPrice بناءً على pricePerMonth فقط (لأنك عاملها شهرية).

أضفنا حماية:

يمنع إنشاء booking لو:

فيه booking confirmed متداخل بنفس الفترة لنفس الـ dorm ويحسبه ضمن المنطق القديم (single occupancy – لاحقًا صار التحكم الحقيقي في capacity في renter requests).

يرجّع رسالة: "You already have a booking for this room." لو نفس الـ client حاول يحجز نفس الغرفة مرة ثانية (من الـ API).

لكن من الناحية العملية الآن، المستخدم ما عاد يقدر يوصل لصفحة الطلب لو عنده booking، لأننا قفلنا الزر في room-details.

✅ models/Booking.ts

What it does:

Mongoose model للـ Booking.

What يحتوي الآن:

روابط:

dorm, renter, client.

الحقول الأساسية:

startDate, endDate, totalPrice, status, cancelReason.

الحقول الإضافية للـ client:

clientFirstName: string

clientLastName: string

clientPhone: string

هذه الحقول نستخدمها:

في صفحة طلب الحجز (client يعبّيها).

في renter dashboard (يشوف اسم ورقم الطالب).

ممكن تستخدم لاحقاً في /room-details لعرض roommate info.

✅ app/api/renter/requests/route.ts

What it does:

API خاصة بالـ renter dashboard:

GET /api/renter/requests

يرجّع كل pending bookings لهذا الـ renter.

PATCH /api/renter/requests

يغيّر حالة booking واحدة:

"confirm" / "cancel" / "spam".

What we added/changed:

🔹 منطق GET (حساب hasConflict مع capacity):

نعمل populate لـ:

dorm (title, city, roomType, maxOccupants)

client (name, email)

لكل طلب pending:

نحسب capacity بناء على:

roomType:

private → 1 سرير.

double → 2 أسِرّة.

shared → maxOccupants (أو 1 default).

نعدّ عدد bookings:

status = "confirmed"

لنفس dorm

متقاطعة بنفس الفترة (start/end overlap).

إذا overlappingConfirmedCount >= capacity:

hasConflict = true (ما في مجال قبول هذا الطلب).

🔹 منطق PATCH (action = "confirm"):

قبل تأكيد الطلب:

نجلب الـ dorm من DB عشان نعرف:

roomType

maxOccupants

نعيد حساب capacity.

نعدّ عدد bookings confirmed المتقاطعة مع هذا الحجز.

لو العدد وصل أو تعدّى capacity:

نرجّع 409 برسالة:

"This room already has the maximum confirmed bookings for this period."

ما منعمل confirm.

لو أقل من capacity:

نحط booking.status = "confirmed".

🔹 actions الأخرى:

"cancel" → status = "cancelled", cancelReason = "renter_cancelled".

"spam" → status = "cancelled", cancelReason = "conflict" (لتعليمها كـ conflict).

✅ app/renter/requests/page.tsx

What it does:

واجهة renter لرؤية الـ pending requests.

What we show:

Dorm info: title + city.

Client info:

اسم العميل:

إما من clientFirstName + clientLastName

أو من client.name.

clientPhone.

client.email.

Dates:

start – end (منسقة).

عدد الأشهر المحسوبة من الفرق بين التاريخين.

Total Price.

What we added/changed:

استعمال الحقول:

clientFirstName, clientLastName, clientPhone.

استعمال hasConflict من API:

لو hasConflict === true:

زر Accept يكون disabled وعليه title يشرح السبب.

يظهر زر Mark as conflict (action = "spam").

لو hasConflict === false:

يظهر زر Accept (confirm).

وزر Reject (cancel).

بعد أي action ناجحة:

نعمل loadRequests() من جديد عشان تتحدث القيم.

✅ app/api/bookings/my-dorm/route.ts (ملف جديد)

What it does:

Endpoint بسيط للتحقق هل الـ client الحالي عنده booking على dorm معيّن ولا لا.

GET /api/bookings/my-dorm?dormId=...

المنطق:

لو المستخدم مش client → نرجع { hasBooking: false }.

لو هو client:

نبحث عن booking:

لنفس dormId

لنفس client

بحالة pending أو confirmed.

لو موجود:

{ hasBooking: true, booking: { status, startDate, endDate } }

لو مش موجود:

{ hasBooking: false }

نستخدمه في:

room-details عشان نقفل زر Book this room لو الطالب عنده booking سابق لنفس الغرفة.













Brief:

We turned the dorm booking system into a smart, capacity-based monthly booking platform for students.

Monthly booking flow

The booking is no longer by random dates or number of days.

The student chooses:

A start date.

A duration in months (1–3).

The system:

Calculates the end date automatically.

Calculates the total price using the dorm’s monthly price.

Stores extra client info: first name, last name, and phone number.

Room capacity and multiple students

Each dorm has a roomType (private, double, shared) and an optional maxOccupants.

Capacity logic:

private → 1 student.

double → 2 students.

shared → maxOccupants students.

The renter can accept multiple requests for the same room at the same time up to the capacity.

The renter requests API checks:

How many bookings are already confirmed and overlapping for that dorm.

If the number reaches the capacity:

New pending requests for that period become conflict (hasConflict = true).

In the UI the renter only sees “Mark as conflict” / “Reject”, and cannot accept more.

Availability on the public site

The public /room page:

Loads all dorms with their availability info.

Shows each dorm as a card with:

Image, title, city, monthly price.

A colored badge:

Green Available.

Red Not available.

A footer showing:

How many beds the room type has (private/double/shared converted to beds).

Gender preference with icons (only male / only female / any).

The /room-details/[id] page:

Shows detailed room info, amenities, rules, etc.

Displays:

“This room is available” when it isn’t fully booked.

Or “Occupied until …” when current confirmed bookings fill the capacity.

Shows a Book this room button only when:

The room is not fully occupied.

The student does not already have a booking for this room.

Preventing duplicate bookings by the same student

We added an API /api/bookings/my-dorm that checks if the current client already has a booking (pending or confirmed) for a given dorm.

The room details page uses this API to:

Show a warning: “You already have a booking for this room”.

Disable the Book this room button.

This means:

Even if the room has free beds (for roommates), the same student cannot spam multiple requests for the same dorm.

Renter dashboard logic

The renter sees a list of pending booking requests.

For each request, the API attaches hasConflict based on room capacity and existing confirmed bookings.

In the UI:

If hasConflict === false:

The renter can Accept or Reject.

If hasConflict === true:

The Accept button is disabled.

The renter can only Mark as conflict (cancel with a conflict reason).

Each request row shows:

Dorm title + city.

Client name, phone, email.

Start/end dates and the number of months.

Total price.