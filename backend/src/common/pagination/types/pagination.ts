import { Model } from 'sequelize';

export class Pagination<T extends Model> {

    protected buildMeta(totalItems: number, itemsPerPage: number, currentPage: number) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        return {
            totalItems,
            itemsPerPage,
            totalPages,
            currentPage,
        };
    }

    protected buildLinks(baseUrl: string, currentPage: number, pageSize: number, totalItems: number) {
        const totalPages = Math.ceil(totalItems / pageSize);

        return {
            first: `${baseUrl}?page=1&pageSize=${pageSize}`,
            previous: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}&pageSize=${pageSize}` : undefined,
            next: currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}&pageSize=${pageSize}` : undefined,
            last: `${baseUrl}?page=${totalPages}&pageSize=${pageSize}`,
        };
    }
}