import {Optional, FindAndCountOptions} from 'sequelize';

export type OptionalPaginationOptions = Optional<FindAndCountOptions, 'include'>;