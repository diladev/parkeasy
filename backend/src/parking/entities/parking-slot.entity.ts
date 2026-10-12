import {
    Column,
    Model,
    BelongsTo,
    ForeignKey,
    Table,
} from 'sequelize-typescript'
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';

/**
 * free        -> can be booked
 * reserved    -> has an active booking
 * occupied    -> a car is parked (for a future gate/sensor integration)
 * unavailable -> removed by the lot manager
 */
export const SLOT_STATUSES = ['free', 'reserved', 'occupied', 'unavailable'] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

@Table({
    tableName: 'parking_slots',
    timestamps: true,
    paranoid: true,
    // The same slot number can exist on different levels (A01 on B1 and A01 on G),
    // but only once per level. The index also stops two parallel requests from
    // creating the same slot.
    indexes: [{ unique: true, fields: ['parking_lot_id', 'level', 'slot_number'] }],
})
export class ParkingSlot extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ allowNull: false })
    declare slot_number: string;

    @Column({ allowNull: false })
    declare level: string;

    @Column({ allowNull: false, defaultValue: 'free' })
    declare status: SlotStatus;

    @ForeignKey(() => ParkingLot)
    @Column({ allowNull: false })
    declare parking_lot_id: number;

    @BelongsTo(() => ParkingLot)
    declare parking_lot: ParkingLot;
}
