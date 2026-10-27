import { describe, expect, it } from 'vitest'

import { bookingsTrend, revenueTrend, userGrowth } from './overview-figures'

describe('overview figures', () => {
  it('measures growth against the users there were before this month', () => {
    // 1,000 users before, 82 new: 8.2%.
    expect(userGrowth({ total: 1082, new_this_month: 82 })).toEqual({ percent: 8.2, tone: 'up' })
    expect(userGrowth({ total: 10, new_this_month: 10 })).toBeNull()
  })

  it('compares today with yesterday and this month with last month so far', () => {
    expect(bookingsTrend({ today: 9, yesterday: 12 })).toEqual({ percent: -25, tone: 'down' })
    expect(bookingsTrend({ today: 4, yesterday: 4 })).toEqual({ percent: 0, tone: 'muted' })
    expect(revenueTrend({ to_date: 5000, previous_to_date: 0 })).toBeNull()
  })
})
