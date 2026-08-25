import {
    Table,
    Column,
    Model,
    BelongsTo,
    ForeignKey,
    DataType,
} from 'sequelize-typescript';
import { Wallet } from './wallet.entity';

@Table({ tableName: 'wallet_transactions', timestamps: true, paranoid: true })
export class WalletTransaction extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column
    declare type: string;

    @Column(DataType.DOUBLE)
    declare amount: number;

    @Column
    declare description: string;

    @ForeignKey(() => Wallet)
    @Column
    declare wallet_id: number;

    @BelongsTo(() => Wallet)
    declare wallet: Wallet;
}
