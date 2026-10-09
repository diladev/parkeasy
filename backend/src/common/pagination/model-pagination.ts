import { Model, ModelCtor } from 'sequelize';
import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { LinkFilters, Pagination } from 'src/common/pagination/pagination';
import { OptionalPaginationOptions } from 'src/common/pagination/types/pagination-options';

/** Upper bound for `pageSize`, so one request can't ask for the whole table. */
export const MAX_PAGE_SIZE = 100;

export class ModelPagination<T extends Model> extends Pagination<T> {
    /**
     * @param basePath the route the `links` point to, e.g. '/booking'.
     */
    constructor(
        private readonly model: ModelCtor<T>,
        private readonly basePath: string,
    ) {
        super();
    }

    async findAll(
        page: number = 1,
        pageSize: number = 10,
        options: OptionalPaginationOptions = {},
        filters: LinkFilters = {},
    ): Promise<PaginationResult<T>> {
        const safePage = Math.max(1, page);
        const safePageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);

        const { rows, count } = await this.model.findAndCountAll({
            limit: safePageSize,
            offset: (safePage - 1) * safePageSize,
            distinct: true,
            ...options,
        });

        return {
            data: rows,
            // buildMeta's parameter order is (totalItems, itemsPerPage, currentPage).
            meta: this.buildMeta(count, safePageSize, safePage),
            links: this.buildLinks(this.basePath, safePage, safePageSize, count, filters),
        };
    }
}
