import { Model, ModelCtor } from 'sequelize';
import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { Pagination } from 'src/common/pagination/pagination';
import { OptionalPaginationOptions } from 'src/common/pagination/types/pagination-options';

export class ModelPagination<T extends Model> extends Pagination<T> {
    private model: ModelCtor<T>;

    constructor(model: ModelCtor<T>) {
        super();
        this.model = model;
    }

    async findAll(page: number = 1, pageSize: number = 10, options: OptionalPaginationOptions = {}): Promise<PaginationResult<T>> {
        const { rows, count } = await this.model.findAndCountAll({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            distinct: true,
            ...options,
        });
        return this.buildPaginationResult(rows, count, page, pageSize);
    }

    private buildPaginationResult(rows: T[], count: number, page: number, pageSize: number): PaginationResult<T> {
        const meta = this.buildMeta(count, page, pageSize);
        const links = this.buildLinks(
            `/${this.model.name.toLowerCase()}s`,
            page,
            pageSize,
            count
        );
        return {
            data: rows,
            meta,
            links,
        };
    }
}