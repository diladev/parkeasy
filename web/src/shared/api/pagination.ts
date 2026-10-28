import { z } from 'zod'

/**
 * The backend's list contract (backend/src/common/pagination): every list
 * answers `{ data, meta, links }` and takes `?page=&pageSize=`.
 */
export const paginationMetaSchema = z.object({
  totalItems: z.number().int().nonnegative(),
  itemsPerPage: z.number().int().positive(),
  /** 0 when nothing matched: the backend counts pages of results, and there are none. */
  totalPages: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
})
export type PaginationMeta = z.infer<typeof paginationMetaSchema>

/** `paginated(userSchema)` checks a page of users. `links` isn't needed by the UI. */
export function paginated<Item extends z.ZodType>(item: Item) {
  return z.object({
    data: z.array(item),
    meta: paginationMetaSchema,
  })
}

/** "Showing 11–20 of 46": the first and last item number on this page. */
export function pageRange(meta: PaginationMeta, itemsOnPage: number): { from: number; to: number } {
  if (itemsOnPage === 0) return { from: 0, to: 0 }
  const from = (meta.currentPage - 1) * meta.itemsPerPage + 1
  return { from, to: from + itemsOnPage - 1 }
}
