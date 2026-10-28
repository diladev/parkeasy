import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { pageRange, paginated } from './pagination'

describe('paginated', () => {
  const page = paginated(z.object({ id: z.number() }))

  it('accepts an empty result, which the backend sends with 0 pages', () => {
    const empty = {
      data: [],
      meta: { totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
    }
    expect(page.parse(empty)).toEqual(empty)
  })

  it('still rejects a broken page', () => {
    const broken = {
      data: [],
      meta: { totalItems: -1, itemsPerPage: 0, totalPages: 0, currentPage: 0 },
    }
    expect(page.safeParse(broken).success).toBe(false)
  })
})

describe('pageRange', () => {
  const meta = { totalItems: 23, itemsPerPage: 10, totalPages: 3, currentPage: 3 }

  it('numbers the items on the page', () => {
    expect(pageRange(meta, 3)).toEqual({ from: 21, to: 23 })
  })

  it('is 0–0 for an empty page', () => {
    expect(pageRange(meta, 0)).toEqual({ from: 0, to: 0 })
  })
})
