/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/availability.ts

export type Interval = { startDate: Date; endDate: Date };

export function getDormCapacity(dorm: any): number {
  const t = dorm?.roomType;
  if (t === "private") return 1;
  if (t === "double") return 2;
  if (t === "shared") return Math.max(Number(dorm?.maxOccupants || 1), 1);
  return 1;
}

// true if [aStart, aEnd) overlaps [bStart, bEnd)
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Returns true if adding ONE more booking in [start,end) would exceed capacity at any time.
 * Existing bookings should be reserved/confirmed only.
 */
export function wouldExceedCapacity(
  existingBookings: Interval[],
  capacity: number,
  start: Date,
  end: Date
): boolean {
  if (capacity <= 1) {
    return existingBookings.some((b) =>
      overlaps(start, end, b.startDate, b.endDate)
    );
  }

  const events: { time: number; delta: number }[] = [];

  // Existing bookings (clipped to [start,end))
  for (const b of existingBookings) {
    const s = b.startDate < start ? start : b.startDate;
    const e = b.endDate > end ? end : b.endDate;
    if (s < e) {
      events.push({ time: s.getTime(), delta: +1 });
      events.push({ time: e.getTime(), delta: -1 });
    }
  }

  // The NEW booking itself
  events.push({ time: start.getTime(), delta: +1 });
  events.push({ time: end.getTime(), delta: -1 });

  // Sort by time asc; if same time => + before -
  events.sort((a, b) =>
    a.time !== b.time ? a.time - b.time : b.delta - a.delta
  );

  let count = 0;
  for (const ev of events) {
    count += ev.delta;
    if (count > capacity) return true;
  }
  return false;
}

/**
 * For DatePicker disabling: returns intervals where the dorm is FULL (count >= capacity).
 * Uses existing bookings only (reserved/confirmed).
 */
export function computeFullyBookedIntervals(
  bookings: Interval[],
  capacity: number
): Interval[] {
  if (bookings.length === 0) return [];

  if (capacity <= 1) {
    return bookings.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
    }));
  }

  const events: { time: number; delta: number }[] = [];
  for (const b of bookings) {
    events.push({ time: b.startDate.getTime(), delta: +1 });
    events.push({ time: b.endDate.getTime(), delta: -1 });
  }

  // Sort by time asc; if same time => + before -
  events.sort((a, b) =>
    a.time !== b.time ? a.time - b.time : b.delta - a.delta
  );

  const result: Interval[] = [];
  let currentCount = 0;
  let fullStart: number | null = null;

  for (const ev of events) {
    const prev = currentCount;
    currentCount += ev.delta;

    if (prev < capacity && currentCount >= capacity) {
      fullStart = ev.time;
    }

    if (prev >= capacity && currentCount < capacity && fullStart != null) {
      result.push({
        startDate: new Date(fullStart),
        endDate: new Date(ev.time),
      });
      fullStart = null;
    }
  }

  return result;
}
