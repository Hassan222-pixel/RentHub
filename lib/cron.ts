/* eslint-disable @typescript-eslint/no-explicit-any */
import cron from "node-cron";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Notification } from "@/models/Notification";

function dubaiNow() {
  // safest simple way (no extra deps)
  const s = new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" });
  return new Date(s);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function fmtMoney(v: number, currency = "USD") {
  return `${Number(v || 0).toLocaleString()} ${currency}`;
}

function fmtShortDate(d: Date) {
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

async function runDailyNotificationsJob() {
  try {
    await connectToDatabase();

    const now = dubaiNow();
    const today = startOfDay(now);
    const todayKey = dayKey(today);

    // 1) AUTO-CANCEL:
    // If deposit booking is reserved, remaining > 0, and startDate <= today => cancel (non refundable deposit)
    const toCancel = await Booking.find({
      status: "reserved",
      paymentStatus: "paid",
      paymentType: "deposit",
      remainingAmount: { $gt: 0 },
      startDate: { $lte: today },
    })
      .populate("dorm", "title")
      .select("client dorm startDate remainingAmount currency")
      .lean();

    if (toCancel.length > 0) {
      const ids = toCancel.map((b: any) => b._id);

      await Booking.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            status: "cancelled",
            cancelReason: "remaining_unpaid",
          },
        }
      );

      // Create cancellation notifications (1 per booking per day)
      for (const b of toCancel as any[]) {
        const dormTitle = b.dorm?.title || "this room";
        const start = new Date(b.startDate);

        try {
          await Notification.create({
            user: b.client,
            booking: b._id,
            dormTitle,
            type: "booking_cancelled",
            dayKey: todayKey,
            title: "Booking cancelled",
            body: `Your booking for ${dormTitle} was cancelled because the remaining amount was not paid before ${fmtShortDate(
              start
            )}. Deposit is not refundable.`,
          });
        } catch (e: any) {
          // ignore duplicate (unique index)
          if (String(e?.code) !== "11000") {
            console.error("Cancel notification create error:", e);
          }
        }
      }
    }

    // 2) REMINDERS (daily):
    // For reserved deposit bookings, create reminder notifications every day
    // during window: [startDate-5days .. startDate-1day]
    const remindCandidates = await Booking.find({
      status: "reserved",
      paymentStatus: "paid",
      paymentType: "deposit",
      remainingAmount: { $gt: 0 },
      startDate: { $gt: today }, // future only (after cancel step)
    })
      .populate("dorm", "title")
      .select("client dorm startDate remainingAmount currency")
      .lean();

    for (const b of remindCandidates as any[]) {
      const start = startOfDay(new Date(b.startDate));
      const remindFrom = startOfDay(addDays(start, -5));

      if (today >= remindFrom && today < start) {
        const dormTitle = b.dorm?.title || "this room";
        const remaining = Number(b.remainingAmount || 0);
        const cur = b.currency || "USD";

        try {
          await Notification.create({
            user: b.client,
            booking: b._id,
            dormTitle,
            type: "deposit_reminder",
            dayKey: todayKey,
            title: "Payment reminder",
            body: `Please pay the remaining ${fmtMoney(
              remaining,
              cur
            )} for ${dormTitle} before ${fmtShortDate(
              start
            )} to keep your reservation.`,
          });
        } catch (e: any) {
          // ignore duplicates for same day
          if (String(e?.code) !== "11000") {
            console.error("Reminder notification create error:", e);
          }
        }
      }
    }

    console.log(`[CRON] Done daily notifications job (${todayKey}).`);
  } catch (err) {
    console.error("[CRON] Daily notifications job failed:", err);
  }
}

export function startCronJobs() {
  const g = globalThis as any;
  if (g.__renthub_cron_started) return;
  g.__renthub_cron_started = true;

  // Run every day at 09:00 Dubai time
  cron.schedule(
    "0 9 * * *",
    () => {
      runDailyNotificationsJob();
    },
    { timezone: "Asia/Dubai" }
  );

  // Optional: run once on server start so you see it working immediately
  runDailyNotificationsJob();
}
