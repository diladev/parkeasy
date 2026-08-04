import {Table, Column, Model, HasMany } from 'sequelize-typescript';
import { Vehicle } from './vehicle.entity';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model{
    @Column({primaryKey: true, autoIncrement: true})
    declare id: number;

    @Column({allowNull: false})
    declare name: string;

    @Column({allowNull: false, unique: true})
    declare username: string;

    @Column({allowNull: false, unique: true})
    declare email: string;

    @Column({allowNull: false})
    declare password: string;

    @Column({allowNull: false})
    declare data_of_birth: string;

    @Column
    declare refreshToken: string | null;

    @Column
    declare otp: string | null;

    @Column
    declare otp_expires_at: Date | null;

    @Column({allowNull: false, defaultValue: 'active'})
    declare status: string;

    @HasMany(() => Vehicle)
    declare vehicles: Vehicle[];
}