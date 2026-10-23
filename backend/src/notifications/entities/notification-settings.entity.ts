import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';

import { User } from 'src/users/entities/user.entity';

/**
 * Every switch on the app's Notifications screen, and whether ParkEasy can
 * act on it yet. The others are stored, so a choice made now still counts
 * once the feature exists.
 */
export const NOTIFICATION_SETTINGS = {
    booking_reminders: { available: false, default: true },
    expiry_alerts: { available: true, default: true },
    offers: { available: false, default: false },
    loyalty_rewards: { available: false, default: true },
    booking_receipt_emails: { available: true, default: true },
    newsletter: { available: false, default: false },
} as const;
export type NotificationSettingKey = keyof typeof NOTIFICATION_SETTINGS;

/** One row per user, created with the defaults the first time it's read. */
@Table({ tableName: 'notification_settings', timestamps: true })
export class NotificationSettings extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => User)
    @Column({ allowNull: false, unique: true })
    declare user_id: number;

    @BelongsTo(() => User)
    declare user: User;

    /** Before a booking starts (bookings start right away for now). */
    @Column({ allowNull: false, defaultValue: NOTIFICATION_SETTINGS.booking_reminders.default })
    declare booking_reminders: boolean;

    /** "Your parking ends in 15 minutes", in the app's inbox. */
    @Column({ allowNull: false, defaultValue: NOTIFICATION_SETTINGS.expiry_alerts.default })
    declare expiry_alerts: boolean;

    @Column({ allowNull: false, defaultValue: NOTIFICATION_SETTINGS.offers.default })
    declare offers: boolean;

    @Column({ allowNull: false, defaultValue: NOTIFICATION_SETTINGS.loyalty_rewards.default })
    declare loyalty_rewards: boolean;

    /** The receipt by email when a booking finishes. */
    @Column({ allowNull: false, defaultValue: NOTIFICATION_SETTINGS.booking_receipt_emails.default })
    declare booking_receipt_emails: boolean;

    @Column({ allowNull: false, defaultValue: NOTIFICATION_SETTINGS.newsletter.default })
    declare newsletter: boolean;
}
