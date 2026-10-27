import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';

export const BOOKING_STATUSES = ['active', 'completed', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Every method a stored booking can have. 'card' is only on older bookings. */
export const PAYMENT_METHODS = ['card', 'wallet'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/**
 * What a new booking or extension can be paid with. Only the wallet, which
 * is charged up front; money gets into it through a provider top-up.
 */
export const BOOKING_PAYMENT_METHODS = ['wallet'] as const;

@Table({
  tableName: 'bookings',
  timestamps: true,
  paranoid: true,
})
export class Booking extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false, defaultValue: 'active' })
  declare status: BookingStatus;

  @Column({ type: DataType.DATE, allowNull: false })
  declare start_time: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare end_time: Date;

  /**
   * The end of the free cancellation window: until then it can be cancelled
   * with a full refund, after that only ended early (see booking/cancellation.ts).
   */
  @Column({ type: DataType.DATE, allowNull: false })
  declare cancellable_until: Date;

  /**
   * When the driver ended the parking before end_time; null otherwise.
   * end_time stays the booked end, which is what was paid for.
   */
  @Column({ type: DataType.DATE, allowNull: true })
  declare ended_at: Date | null;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare duration_hours: number;

  /**
   * The lot's price when the booking was made: later price changes don't
   * affect it. Whole Iraqi dinars, like every amount (see common/money.ts).
   */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare price_per_hour: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare total_cost: number;

  @Column({ allowNull: false, defaultValue: 'card' })
  declare payment_method: PaymentMethod;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => ParkingLot)
  @Column({ allowNull: false })
  declare parking_lot_id: number;

  @BelongsTo(() => ParkingLot)
  declare parking_lot: ParkingLot;

  @ForeignKey(() => ParkingSlot)
  @Column({ allowNull: false })
  declare parking_slot_id: number;

  @BelongsTo(() => ParkingSlot)
  declare parking_slot: ParkingSlot;

  @ForeignKey(() => Vehicle)
  @Column({ allowNull: false })
  declare vehicle_id: number;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;
}
