import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';

export const BOOKING_STATUSES = ['active', 'completed', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** 'card' isn't charged yet (no payment provider); 'wallet' is paid from the in-app wallet. */
export const PAYMENT_METHODS = ['card', 'wallet'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

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

    @Column({ type: DataType.INTEGER, allowNull: false })
    declare duration_hours: number;

    /** The lot's price when the booking was made: later price changes don't affect it. */
    @Column({ type: DataType.DOUBLE, allowNull: false })
    declare price_per_hour: number;

    @Column({ type: DataType.DOUBLE, allowNull: false })
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
