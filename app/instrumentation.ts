import { startCronJobs } from "@/lib/cron";

export function register() {
  // runs on server boot
  startCronJobs();
}
