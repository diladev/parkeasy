import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

/** Categories, used by the filter tabs in the app (?type=booking). */
export const NOTIFICATION_TYPES = ['booking', 'wallet'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Every event that creates a notification, and the category it belongs to. */
export const NOTIFICATION_EVENTS = {
  BOOKING_CONFIRMED: 'booking',
  BOOKING_EXTENDED: 'booking',
  BOOKING_CANCELLED: 'booking',
  BOOKING_COMPLETED: 'booking',
  WALLET_TOPPED_UP: 'wallet',
} as const satisfies Record<string, NotificationType>;
export type NotificationEvent = keyof typeof NOTIFICATION_EVENTS;

/** Values for the placeholders in the translated title and body. */
export type NotificationData = Record<string, string | number>;

/**
 * The title and body are NOT stored. They're translated when the list is read
 * (src/i18n/<lang>/notification.json), so they always follow the app's current
 * language, even for notifications created before the user switched language.
 */
@Table({
  tableName: 'notifications',
  timestamps: true,
  paranoid: true,
})
export class Notification extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false })
  declare type: NotificationType;

  @Column({ allowNull: false })
  declare event: NotificationEvent;

  // No default value: MySQL doesn't allow defaults on JSON columns.
  @Column({ type: DataType.JSON, allowNull: false })
  declare data: NotificationData;

  @Column({ allowNull: false, defaultValue: false })
  declare is_read: boolean;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;
}
