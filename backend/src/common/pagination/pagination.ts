import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';

/** Query values to keep in the links (e.g. { status: 'active' }); empty values are skipped. */
export type LinkFilters = Record<string, string | number | boolean | undefined | null>;

export class Pagination<T> {

    protected buildMeta(totalItems: number, itemsPerPage: number, currentPage: number) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        return {
            totalItems,
            itemsPerPage,
            totalPages,
            currentPage,
        };
    }

    protected buildLinks(
        baseUrl: string,
        currentPage: number,
        pageSize: number,
        totalItems: number,
        filters: LinkFilters = {},
    ) {
        // An empty result still has one (empty) page, so `last` never points at page 0.
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        // Filters are kept, so "next" on /booking?status=active stays filtered.
        const link = (page: number) => {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
            }
            params.set('page', String(page));
            params.set('pageSize', String(pageSize));
            return `${baseUrl}?${params.toString()}`;
        };

        return {
            first: link(1),
            previous: currentPage > 1 ? link(currentPage - 1) : undefined,
            next: currentPage < totalPages ? link(currentPage + 1) : undefined,
            last: link(totalPages),
        };
    }
}

/** Paginates a list that is already in memory (e.g. results sorted by distance in code). */
export class ArrayPagination<T> extends Pagination<T> {
    constructor(private readonly basePath: string) {
        super();
    }

    paginate(items: T[], page: number, pageSize: number, filters: LinkFilters = {}): PaginationResult<T> {
        const start = (page - 1) * pageSize;
        return {
            data: items.slice(start, start + pageSize),
            meta: this.buildMeta(items.length, pageSize, page),
            links: this.buildLinks(this.basePath, page, pageSize, items.length, filters),
        };
    }
}
