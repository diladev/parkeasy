import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { User } from 'src/users/entities/user.entity';
import type { PaymentStatus } from '../payment-status';

/** What a payment is for. Only wallet top-ups go through a provider. */
export const PAYMENT_PURPOSES = ['WALLET_TOP_UP'] as const;
export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

/**
 * One attempt to take money through a payment provider. The wallet is only
 * credited when this moves to `paid` (see payment-status.ts).
 */
@Table({
    tableName: 'payments',
    timestamps: true,
    indexes: [{ fields: ['status', 'valid_until'] }],
})
export class Payment extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => User)
    @Column({ allowNull: false })
    declare user_id: number;

    @BelongsTo(() => User)
    declare user: User;

    @Column({ allowNull: false })
    declare purpose: PaymentPurpose;

    /** Whole Iraqi dinars (see common/money.ts). */
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare amount: number;

    @Column({ allowNull: false, defaultValue: 'IQD' })
    declare currency: string;

    @Column({ allowNull: false, defaultValue: 'pending' })
    declare status: PaymentStatus;

    /** Which gateway handled it, e.g. "mock". */
    @Column({ allowNull: false })
    declare provider: string;

    /** The provider's id for it, used to match its callbacks. */
    @Column({ allowNull: false, unique: true })
    declare provider_payment_id: string;

    /** What the customer types or opens in their banking app to pay. */
    @Column({ allowNull: false })
    declare readable_code: string;

    @Column({ allowNull: false })
    declare app_link: string;

    @Column({ type: DataType.DATE, allowNull: false })
    declare valid_until: Date;

    @Column({ type: DataType.DATE, allowNull: true })
    declare paid_at: Date | null;

    /** The provider's reason, when declined or expired. */
    @Column({ type: DataType.STRING, allowNull: true })
    declare decline_reason: string | null;
}
