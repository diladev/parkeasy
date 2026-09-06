import { Table, Column, Model, HasMany, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';

@Table({
    tableName: 'bookings',
    timestamps: true,
    paranoid: true,
})
export class Booking extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ defaultValue: 'active' })
    declare status: string;

    @Column
    declare start_time: Date;

    @Column
    declare end_time: Date;

    @Column
    declare duration_hours: number;

    @Column(DataType.DOUBLE)
    declare total_cost: number;

    @Column({ defaultValue: 'card' })
    declare payment_method: string;

    @ForeignKey(() => User)
    @Column
    declare user_id: number;

    @BelongsTo(() => User)
    declare user: User;

    @ForeignKey(() => ParkingLot)
    @Column
    declare parking_lot_id: number;

    @BelongsTo(() => ParkingLot)
    declare parking_lot: ParkingLot;

    @ForeignKey(() => ParkingSlot)
    @Column
    declare parking_slot_id: number;

    @BelongsTo(() => ParkingSlot)
    declare parking_slot: ParkingSlot;

    @ForeignKey(() => Vehicle)
    @Column
    declare vehicle_id: number;

    @BelongsTo(() => Vehicle)
    declare vehicle: Vehicle;
}
