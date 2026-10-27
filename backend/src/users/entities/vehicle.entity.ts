import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

export const VEHICLE_TYPES = ['sedan', 'suv', 'truck'] as const;

@Table({ tableName: 'vehicles', timestamps: true, paranoid: true })
export class Vehicle extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false })
  declare brand: string;

  @Column({ allowNull: false })
  declare model: string;

  @Column({ allowNull: false })
  declare year: number;

  @Column({ allowNull: false })
  declare color: string;

  // Not unique at the database level: vehicles are soft-deleted (paranoid), and a
  // deleted row would block the same plate forever. UsersService checks active
  // vehicles for duplicates instead.
  @Column({ allowNull: false })
  declare license_plate: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'sedan' })
  declare type: string;

  @Column({ allowNull: false, defaultValue: false })
  declare is_default: boolean;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;
}
