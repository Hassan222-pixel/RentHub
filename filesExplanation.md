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