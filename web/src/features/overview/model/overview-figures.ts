import { percentChange } from '@/shared/lib/numbers'

import type { Overview } from './overview.schemas'

export type Trend = { percent: number; tone: 'up' | 'down' | 'muted' } | null

const trend = (change: number | null): Trend =>
  change === null
    ? null
    : { percent: change, tone: change > 0 ? 'up' : change < 0 ? 'down' : 'muted' }

/** How much the user base grew this month: new accounts against the count before. */
export function userGrowth(users: Overview['users']): Trend {
  return trend(percentChange(users.total, users.total - users.new_this_month, 1))
}

export function bookingsTrend(bookings: Overview['bookings_today']): Trend {
  return trend(percentChange(bookings.today, bookings.yesterday))
}

export function revenueTrend(revenue: Overview['revenue_month']): Trend {
  return trend(percentChange(revenue.to_date, revenue.previous_to_date))
}
