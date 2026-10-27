import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { User } from 'src/users/entities/user.entity';
import { ParkingLot } from './parking-lot.entity';

/** A lot a user saved with the heart, for the Favorites screen. */
@Table({
  tableName: 'favorite_lots',
  timestamps: true,
  indexes: [{ unique: true, fields: ['user_id', 'parking_lot_id'] }],
})
export class FavoriteLot extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

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
}
