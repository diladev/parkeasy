import {
    Column,
    Model,
    BelongsTo,
    ForeignKey,
    Table,
} from 'sequelize-typescript'
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';

@Table({ tableName: 'parking_slots', timestamps: true, paranoid: true })
export class ParkingSlot extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column
    declare slot_number: string;

    @Column
    declare level: string;

    @Column({ defaultValue: 'free' })
    declare status: string;

    @ForeignKey(() => ParkingLot)
    @Column
    declare parking_lot_id: number;

    @BelongsTo(() => ParkingLot)
    declare parking_lot: ParkingLot;

}
