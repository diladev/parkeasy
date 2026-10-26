import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { DEFAULT_FREE_CANCELLATION_MINUTES } from "src/booking/cancellation";
import { ParkingSlot } from "src/parking/entities/parking-slot.entity";
import type { GarageStatus } from "src/parking/garage-status";
import { User } from "src/users/entities/user.entity";

@Table({ tableName: 'parking_lots', timestamps: true, paranoid: true })
export class ParkingLot extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ allowNull: false })
    declare name: string;

    @Column({ allowNull: false })
    declare address: string;

    /** Shown and searched in the Admin Panel. */
    @Column({ type: DataType.STRING(100), allowNull: false })
    declare city: string;

    @Column({ type: DataType.DOUBLE, allowNull: false })
    declare latitude: number;

    @Column({ type: DataType.DOUBLE, allowNull: false })
    declare longitude: number;

    @Column({ allowNull: false, defaultValue: true })
    declare is_open_24h: boolean;

    /** "HH:mm", local time in Iraq (see opening-hours.ts). */
    @Column({ allowNull: false })
    declare opening_time: string;

    @Column({ allowNull: false })
    declare closing_time: string;

    /** Whole Iraqi dinars (see common/money.ts). */
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare price_per_hour: number;

    /**
     * How long after a booking starts it can still be cancelled with a full
     * refund (see booking/cancellation.ts). Bookings keep the window they were
     * made with.
     */
    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: DEFAULT_FREE_CANCELLATION_MINUTES })
    declare free_cancellation_minutes: number;

    @Column({ type: DataType.DOUBLE, allowNull: false, defaultValue: 0 })
    declare rating: number;

    @Column({ allowNull: false, defaultValue: false })
    declare has_cctv: boolean;

    @Column({ allowNull: false, defaultValue: false })
    declare has_ev_charging: boolean;

    @Column({ allowNull: false, defaultValue: false })
    declare is_covered: boolean;

    @Column({ allowNull: false, defaultValue: false })
    declare is_accessible: boolean;

    /**
     * False once the lot is removed from the app. The row stays, because past
     * bookings point to it.
     */
    @Column({ allowNull: false, defaultValue: true })
    declare is_available: boolean;

    /**
     * Only approved lots are listed and bookable in the app (see garage-status.ts).
     * New lots wait for an admin unless an admin created them.
     */
    @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'pending' })
    declare status: GarageStatus;

    /** The garage-owner account that manages the lot; null until one is assigned. */
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: true })
    declare owner_id: number | null;

    @BelongsTo(() => User, 'owner_id')
    declare owner: User | null;

    @HasMany(() => ParkingSlot)
    declare slots: ParkingSlot[];
}
