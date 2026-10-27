import { addDays, iraqDateKey } from './iraq-time';

/** Sums bookings per Iraq calendar day, with a 0 for days that had none. */
export function dailyRevenue(
  bookings: { start_time: Date; total_cost: number }[],
  firstDay: Date,
  days: number,
): { date: string; amount: number }[] {
  const amounts = new Map<string, number>();
  for (let day = 0; day < days; day++) {
    amounts.set(iraqDateKey(addDays(firstDay, day)), 0);
  }
  for (const booking of bookings) {
    const key = iraqDateKey(new Date(booking.start_time));
    if (amounts.has(key)) {
      amounts.set(key, (amounts.get(key) ?? 0) + Number(booking.total_cost));
    }
  }
  return [...amounts.entries()].map(([date, amount]) => ({ date, amount }));
}
