import { Table, Column, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@Table({ tableName: 'vehicles', timestamps: true, paranoid: true })
export class Vehicle extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column
    declare brand: string;

    @Column
    declare model: string;

    @Column
    declare year: number;

    @Column
    declare color: string;

    @Column({ unique: true })
    declare license_plate: string;
    
    @Column({ defaultValue: false })
    declare is_default: boolean;

    @ForeignKey(() => User)
    @Column
    declare user_id: number;

    @BelongsTo(() => User)
    declare user: User;
}