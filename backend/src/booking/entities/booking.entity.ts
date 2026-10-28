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
import type { PriceRules } from 'src/parking/pricing';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';

export const BOOKING_STATUSES = ['active', 'completed', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * Where a booking came from:
 * - app:     a driver booked and paid in the mobile app
 * - walk_in: a car parked without the app; the garage started it from the
 *            Garage Portal and charges at the exit (no user, a plate instead)
 */
export const BOOKING_SOURCES = ['app', 'walk_in'] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];

/**
 * Every method a stored booking can have. App bookings: 'wallet' ('card' is
 * only on older ones). Walk-ins: 'cash' or 'card', paid at the exit.
 */
export const PAYMENT_METHODS = ['card', 'wallet', 'cash'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/**
 * What a new booking or extension can be paid with. Only the wallet, which
 * is charged up front; money gets into it through a provider top-up.
 */
export const BOOKING_PAYMENT_METHODS = ['wallet'] as const;

/** How a walk-in pays when it leaves. */
export const WALK_IN_PAYMENT_METHODS = ['cash', 'card'] as const;
export type WalkInPaymentMethod = (typeof WALK_IN_PAYMENT_METHODS)[number];

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

  @Column({ allowNull: false, defaultValue: 'app' })
  declare source: BookingSource;

  @Column({ type: DataType.DATE, allowNull: false })
  declare start_time: Date;

  /**
   * The booked end. A walk-in has none while it's parked (null); it gets the
   * moment it left when it ends.
   */
  @Column({ type: DataType.DATE, allowNull: true })
  declare end_time: Date | null;

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

  /** Hours paid for. A walk-in: 0 while parked, the hours charged once it ends. */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare duration_hours: number;

  /**
   * The lot's price when the booking was made: later price changes don't
   * affect it. Whole Iraqi dinars, like every amount (see common/money.ts).
   */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare price_per_hour: number;

  /**
   * Every price rule the stay is charged by (hourly price, daily cap, date
   * overrides), saved when it starts so extensions and walk-in exits keep
   * them. null for bookings made before rules were saved: they pay the plain
   * hourly price (see bookingRules in parking/pricing.ts).
   */
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    get(this: Booking) {
      const raw = this.getDataValue('price_rules') as string | null;
      return raw ? (JSON.parse(raw) as PriceRules) : null;
    },
    set(this: Booking, rules: PriceRules | null) {
      this.setDataValue('price_rules', rules ? JSON.stringify(rules) : null);
    },
  })
  declare price_rules: PriceRules | null;

  /** A walk-in: 0 while parked, the fee once it ends. */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare total_cost: number;

  /** A walk-in: 'cash' until it ends, then how it actually paid. */
  @Column({ allowNull: false, defaultValue: 'card' })
  declare payment_method: PaymentMethod;

  /** The driver. null for a walk-in. */
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare user_id: number | null;

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

  /** The driver's saved vehicle. null for a walk-in, which has `plate` instead. */
  @ForeignKey(() => Vehicle)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare vehicle_id: number | null;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;

  /** A walk-in's license plate, typed in by the garage. null for app bookings. */
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare plate: string | null;
}

/** A booking made in the app: it always has its driver, vehicle and booked end. */
export type AppBooking = Booking & {
  source: 'app';
  user_id: number;
  vehicle_id: number;
  end_time: Date;
};

/**
 * Narrows a booking the driver flows read to an app booking. A walk-in can't
 * reach them (they look bookings up by user), so anything else is a bug.
 */
export function appBooking(booking: Booking): AppBooking {
  if (
    booking.source !== 'app' ||
    booking.user_id === null ||
    booking.vehicle_id === null ||
    booking.end_time === null
  ) {
    throw new Error(`Booking ${booking.id} is not an app booking`);
  }
  return booking as AppBooking;
}

/** Completed before its booked end: the driver ended parking early. Never for a walk-in. */
export function endedEarly(
  booking: Pick<Booking, 'status' | 'ended_at' | 'end_time'>,
): boolean {
  return (
    booking.status === 'completed' &&
    booking.ended_at !== null &&
    booking.end_time !== null &&
    booking.ended_at.getTime() < booking.end_time.getTime()
  );
}
