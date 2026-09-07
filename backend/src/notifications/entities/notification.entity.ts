import { Table, Column, Model, HasMany, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@Table ({
    tableName: 'notifications',
    timestamps: true,
    paranoid: true,
})
export class Notification extends Model{
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column
  declare title: string;

  @Column
  declare body: string;
  
  @Column
  declare type: string;

  @Column({ defaultValue: false })
  declare is_read: boolean;

  @ForeignKey(() => User)
  @Column
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;
}
