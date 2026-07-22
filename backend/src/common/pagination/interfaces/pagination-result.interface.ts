export interface PaginationResult<T> {
    data: T[];
    meta: {
        totalItems: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    links: {
        first?: string;
        previous?: string;
        next?: string;
        last?: string;
    };

}