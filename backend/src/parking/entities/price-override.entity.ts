import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';

/**
 * A different price for some days at one lot: Eid, Newroz, a match day.
 * Dates are Iraq calendar days, both ends included (see parking/pricing.ts).
 */
@Table({ tableName: 'price_overrides', timestamps: true })
export class PriceOverride extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => ParkingLot)
  @Column({ allowNull: false })
  declare parking_lot_id: number;

  @BelongsTo(() => ParkingLot)
  declare parking_lot: ParkingLot;

  /** What drivers and the owner see, e.g. "Eid al-Adha". */
  @Column({ type: DataType.STRING(60), allowNull: false })
  declare label: string;

  /** "2026-03-20" */
  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare start_date: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare end_date: string;

  /** Whole Iraqi dinars. */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare price_per_hour: number;

  /** The most one of these days costs; null for no cap. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare daily_cap: number | null;
}
