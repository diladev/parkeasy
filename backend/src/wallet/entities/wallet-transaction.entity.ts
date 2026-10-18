import {
    Table,
    Column,
    Model,
    BelongsTo,
    ForeignKey,
    DataType,
} from 'sequelize-typescript';
import { Booking } from 'src/booking/entities/booking.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Wallet } from './wallet.entity';

/**
 * What a transaction was for. Stored as a code instead of English text
 * ("Top up", "Booking payment"); the API adds a translated `description`.
 */
export const WALLET_TRANSACTION_CATEGORIES = [
    'TOP_UP',
    'BOOKING_PAYMENT',
    'BOOKING_EXTENSION',
    'BOOKING_REFUND',
] as const;
export type WalletTransactionCategory = (typeof WALLET_TRANSACTION_CATEGORIES)[number];

@Table({ tableName: 'wallet_transactions', timestamps: true, paranoid: true })
export class WalletTransaction extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ allowNull: false })
    declare type: 'credit' | 'debit';

    /** Always positive, in whole Iraqi dinars; `type` says which way it went. */
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare amount: number;

    @Column({ allowNull: false })
    declare category: WalletTransactionCategory;

    @ForeignKey(() => Wallet)
    @Column({ allowNull: false })
    declare wallet_id: number;

    @BelongsTo(() => Wallet)
    declare wallet: Wallet;

    /** The booking a payment or refund belongs to (null for top-ups). */
    @ForeignKey(() => Booking)
    @Column({ type: DataType.INTEGER, allowNull: true })
    declare booking_id: number | null;

    @BelongsTo(() => Booking)
    declare booking: Booking | null;

    /** The provider payment a top-up came from (null for booking payments and refunds). */
    @ForeignKey(() => Payment)
    @Column({ type: DataType.INTEGER, allowNull: true, unique: true })
    declare payment_id: number | null;

    @BelongsTo(() => Payment)
    declare payment: Payment | null;
}
