import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { ParkingSlot } from "src/parking/entities/parking-slot.entity";

@Table({ tableName: 'parking_lots', timestamps: true, paranoid: true })
export class ParkingLot extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column
    declare name: string;

    @Column
    declare address: string;

    @Column(DataType.DOUBLE)
    declare latitude: number;

    @Column(DataType.DOUBLE)
    declare longitude: number;

    @Column({ defaultValue: true })
    declare is_open_24h: boolean;

    @Column
    declare opening_time: string;

    @Column
    declare closing_time: string;

    @Column(DataType.DOUBLE)
    declare price_per_hour: number;

    @Column({ type: DataType.DOUBLE, defaultValue: 0 })
    declare rating: number;

    @Column({ defaultValue: false })
    declare has_cctv: boolean;

    @Column({ defaultValue: false })
    declare has_ev_charging: boolean;

    @Column({ defaultValue: false })
    declare is_covered: boolean;

    @Column({ defaultValue: false })
    declare is_accessible: boolean;

    @HasMany(() => ParkingSlot)
    declare slots: ParkingSlot[];
}